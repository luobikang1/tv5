export interface D1Config {
  endpoint: string;
}

export async function syncToD1(key: string, value: any, d1Endpoint: string = '/api/d1/sync'): Promise<boolean> {
  try {
    const res = await fetch(d1Endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.warn('Cloudflare D1 sync error:', err);
    return false;
  }
}

export async function fetchFromD1(key: string, d1Endpoint: string = '/api/d1/sync'): Promise<any | null> {
  try {
    const res = await fetch(`${d1Endpoint}?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    if (data.success && data.value) {
      try {
        return JSON.parse(data.value);
      } catch {
        return data.value;
      }
    }
    return null;
  } catch (err) {
    console.warn('Cloudflare D1 fetch error:', err);
    return null;
  }
}
