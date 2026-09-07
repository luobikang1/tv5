// Vercel Serverless Function for CORS & Video Stream Proxy
export default async function handler(req, res) {
  // Always set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type, Accept-Ranges');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target url parameter' });
  }

  try {
    const fetchHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
    };

    if (req.headers.range) {
      fetchHeaders['Range'] = req.headers.range;
    }

    const response = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers: fetchHeaders,
    });

    res.setHeader('Cache-Control', 'public, max-age=300');

    // Forward crucial headers for video streaming and 206 Partial Content
    const forwardHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
    forwardHeaders.forEach((header) => {
      const val = response.headers.get(header);
      if (val) {
        res.setHeader(header, val);
      }
    });

    const buffer = await response.arrayBuffer();
    return res.status(response.status).send(Buffer.from(buffer));
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Proxy request failed' });
  }
}
