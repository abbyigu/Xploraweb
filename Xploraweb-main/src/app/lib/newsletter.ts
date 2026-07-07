const KIT_API_KEY = 'pqpO04D1U_oq3KhLMmB87w';
const KIT_FORM_UID = '361503f84f';

export async function subscribeToNewsletter(email: string, firstName = '') {
  try {
    const formData = new FormData();
    formData.append('email_address', email);
    if (firstName) formData.append('first_name', firstName.split(' ')[0]);
    formData.append('api_key', KIT_API_KEY);
    await fetch(`https://app.kit.com/forms/${KIT_FORM_UID}/subscriptions`, {
      method: 'POST',
      body: formData,
      mode: 'no-cors',
    });
  } catch {
    // Silently fail
  }
}
