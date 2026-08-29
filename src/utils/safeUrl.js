// Article links reach us from third-party RSS feeds and from share payloads
// that anyone can mint via the shortener API, so they are untrusted input.
// Anything that isn't a plain http(s) link — javascript:, data:, vbscript:,
// relative paths, '#' placeholders, malformed strings — comes back as null so
// callers render a non-clickable fallback instead.
export function safeExternalUrl(raw) {
  if (!raw || typeof raw !== 'string') return null

  try {
    const { protocol } = new URL(raw)
    return protocol === 'http:' || protocol === 'https:' ? raw : null
  } catch {
    return null
  }
}
