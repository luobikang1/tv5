export async function onRequest(context: any) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Type, Accept-Ranges',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(context.request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing target url param' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  try {
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
    Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));
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
          ...corsHeaders,
        },
      }
    );
  }
}
