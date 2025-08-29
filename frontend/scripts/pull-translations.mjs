// Pull translations from the backend and write them to ./src/locales/{lng}/{ns}.json
// Usage: npm run i18n:pull

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FRONTEND_ROOT = path.resolve(__dirname, '..')
const OUT_DIR = path.join(FRONTEND_ROOT, 'src', 'locales')
const BACKEND_BASE = process.env.I18N_BACKEND_BASE || 'http://localhost:8080'

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed ${res.status}: ${url}`)
  return res.json()
}

async function main() {
  const manifestUrl = `${BACKEND_BASE}/locales/manifest.json`
  console.log(`[i18n] Fetching manifest: ${manifestUrl}`)
  const manifest = await fetchJSON(manifestUrl)
  const { languages = [], namespaces = [] } = manifest

  if (!languages.length || !namespaces.length) {
    throw new Error(`Manifest missing languages/namespaces: ${JSON.stringify(manifest)}`)
  }

  for (const lng of languages) {
    for (const ns of namespaces) {
      const url = `${BACKEND_BASE}/locales/${encodeURIComponent(lng)}/${encodeURIComponent(ns)}.json`
      const data = await fetchJSON(url)
      const outDir = path.join(OUT_DIR, lng)
      const outFile = path.join(outDir, `${ns}.json`)
      await mkdir(outDir, { recursive: true })
      await writeFile(outFile, JSON.stringify(data, null, 2) + '\n', 'utf8')
      console.log(`[i18n] Wrote ${path.relative(FRONTEND_ROOT, outFile)}`)
    }
  }

  console.log('\n[i18n] Done. You can now update TS interfaces: npm run i18n:types')
}

main().catch((err) => {
  console.error('[i18n] Failed:', err)
  process.exitCode = 1
})
