import { supabase } from './supabase';

/**
 * Downscale + re-encode an image in the browser so it fits under the serverless
 * function's ~4.5 MB request-body limit (the image is sent base64-encoded, which
 * inflates it ~33%). Photos are capped at maxDim on the long edge and re-encoded
 * as JPEG. Returns the original file unchanged if it's already small, not an
 * image, or if anything goes wrong.
 */
async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  try {
    if (!file.type.startsWith('image/')) return file;
    // Small files don't need it; GIFs would lose animation if re-encoded.
    if (file.size <= 1_200_000 || file.type === 'image/gif') return file;

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('read failed'));
      reader.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('decode failed'));
      i.src = dataUrl;
    });

    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file; // no win → keep original
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

/**
 * Uploads an image through the /api/upload-image serverless function, which
 * writes to Supabase Storage with the service-role key (bypassing storage RLS).
 *
 * We go server-side because this project's Storage service does not validate the
 * browser's JWT (it treats authenticated client uploads as anonymous and RLS
 * rejects them), so a direct supabase.storage.upload() from the client fails.
 *
 * NOTE: the /api route only exists on the deployed host or under `vercel dev`.
 * Plain `npm run dev` (Vite) has no /api, so image upload won't work there.
 */
export async function uploadViaApi(file: File): Promise<{ url: string | null; error: string | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { url: null, error: 'You must be signed in to upload images.' };

  // Shrink large photos so the base64 payload stays under the function body limit.
  const upload = await compressImage(file);

  let fileData: string;
  try {
    fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => reject(new Error('Could not read the image file.'));
      reader.readAsDataURL(upload);
    });
  } catch (e: any) {
    return { url: null, error: e?.message || 'Could not read the image file.' };
  }

  let res: Response;
  try {
    res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ fileData, fileName: upload.name, fileType: upload.type }),
    });
  } catch {
    return { url: null, error: 'Could not reach the upload service. Run the app with `vercel dev` for local uploads.' };
  }

  // Guard against non-JSON / empty responses (e.g. a 404 from `vite` with no /api).
  const text = await res.text();
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch { /* leave json empty */ }

  if (res.status === 404) {
    return { url: null, error: 'Upload endpoint not found — run the app with `vercel dev` for local image uploads.' };
  }
  if (res.status === 413) {
    return { url: null, error: 'That image is too large even after resizing. Please use an image under ~10 MB.' };
  }
  if (!res.ok || !json.url) {
    return { url: null, error: json.error || `Image upload failed (HTTP ${res.status}).` };
  }
  return { url: json.url, error: null };
}
