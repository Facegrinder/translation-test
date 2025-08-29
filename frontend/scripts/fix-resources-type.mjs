// Convert generated default type export in src/@types/resources.ts
// into a named type export to satisfy TS verbatimModuleSyntax.
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const file = path.resolve(process.cwd(), 'src/@types/resources.ts')
const src = await readFile(file, 'utf8')

let out = src
// Ensure the interface is exported
out = out.replace(/\binterface\s+Resources\b/, 'export interface Resources')
// Remove default export of a type (avoid conflicting re-exports)
out = out.replace(/\n?export\s+default\s+Resources\s*;?\s*$/m, '')

await writeFile(file, out, 'utf8')
console.log('[i18n] Fixed generated resources type to named export')
