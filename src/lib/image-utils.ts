export async function imageUrlToDataUrl(url: string): Promise<string> {
  // As a mitigation for CORS issues when running in a browser environment,
  // we use a simple proxy. In a production environment, you'd want to use a
  // more robust solution.
  const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read blob as data URL.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
