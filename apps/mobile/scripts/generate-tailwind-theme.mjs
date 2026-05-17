import { dirname, join } from 'node:path';
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, '..');
const tokensEntry = join(pkgRoot, '../../packages/tokens/dist/index.js');

const { tokens } = await import(pathToFileURL(tokensEntry).href);
const payload = `${JSON.stringify(tokens.colors, null, 2)}\n`;

writeFileSync(join(pkgRoot, 'tailwind.theme.generated.cjs'), `module.exports = ${payload}`);
