export const DEFAULT_POSTER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400" fill="%231e293b"><rect width="300" height="400" fill="%231e293b"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="20" font-family="sans-serif">白狐5 影视</text><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-size="14" font-family="sans-serif">暂无海报</text></svg>`;

export function getProxyPosterUrl(url: string | undefined): string {
  if (!url || !url.startsWith('http')) {
    return DEFAULT_POSTER;
  }
  return url;
}
