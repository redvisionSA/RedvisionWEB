/**
 * copy-draco.mjs
 * -----------------------------------------------------------------------
 * Copia el decodificador Draco que trae el paquete `three` a public/draco/.
 *
 * Dahua_Robot_Replica.glb esta comprimido con KHR_draco_mesh_compression, asi
 * que el navegador necesita el decodificador. Sirviendolo desde el propio
 * dominio evitamos depender de un CDN externo en tiempo de ejecucion.
 *
 * Corre solo en `npm install` (script postinstall). Tambien podes ejecutarlo
 * a mano: `npm run copy-draco`.
 */
import { cp, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const origen = join(raiz, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'draco')
const destino = join(raiz, 'public', 'draco')

if (!existsSync(origen)) {
  console.warn('[copy-draco] No se encontro el decodificador en node_modules/three. Ejecutá npm install primero.')
  process.exit(0)
}

await mkdir(destino, { recursive: true })
await cp(origen, destino, { recursive: true })

const archivos = await readdir(destino)
console.log(`[copy-draco] ${archivos.length} archivos copiados a public/draco/`)
