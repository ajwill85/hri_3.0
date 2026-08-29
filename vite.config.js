import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Content-Security-Policy for the built app. Build-only: the dev server needs
// the inline react-refresh preamble that `script-src 'self'` would block.
// 'unsafe-inline' is required for style-src because React renders inline style
// attributes; connect-src stays broad so a custom API endpoint set in Settings
// still works. Serving this as a real header from CloudFront is preferable to
// the meta tag (a header can also carry frame-ancestors, which meta ignores).
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ')

const cspPlugin = {
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`
    )
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cspPlugin],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
})
