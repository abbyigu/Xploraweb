import { supabase } from './supabase';

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

  let fileData: string;
  try {
    fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => reject(new Error('Could not read the image file.'));
      reader.readAsDataURL(file);
    });
  } catch (e: any) {
    return { url: null, error: e?.message || 'Could not read the image file.' };
  }

  let res: Response;
  try {
    res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ fileData, fileName: file.name, fileType: file.type }),
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
  if (!res.ok || !json.url) {
    return { url: null, error: json.error || `Image upload failed (HTTP ${res.status}).` };
  }
  return { url: json.url, error: null };
}
