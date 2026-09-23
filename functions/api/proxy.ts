export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing target url param' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const env = context.env || {};
    const r2Bucket = env.R2_BUCKET || env.BUCKET || env.WHITEFOX_R2;

    // Generate a simple hash/key for R2 Object Storage Caching
    const cleanKey = btoa(targetUrl).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);

    // If R2 Bucket is bound and target is a media segment, attempt to serve from R2 cache
    if (r2Bucket && (targetUrl.includes('.ts') || targetUrl.includes('.m4s') || targetUrl.includes('.mp4'))) {
      try {
        const cachedObject = await r2Bucket.get(cleanKey);
        if (cachedObject) {
          const cachedHeaders = new Headers();
          cachedObject.writeHttpMetadata(cachedHeaders);
          cachedHeaders.set('Access-Control-Allow-Origin', '*');
          cachedHeaders.set('X-R2-Cache', 'HIT');
          return new Response(cachedObject.body, {
            status: 200,
            headers: cachedHeaders,
          });
        }
      } catch (r2Err) {
        console.warn('R2 get cache attempt failed:', r2Err);
      }
    }

    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
    };

    const range = context.request.headers.get('range');
    if (range) {
      headers['Range'] = range;
    }

    const response = await fetch(targetUrl, {
      method: context.request.method,
      headers,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type');
    responseHeaders.set('Cache-Control', 'public, max-age=300');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Proxy request failed' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
