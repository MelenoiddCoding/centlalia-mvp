import { rootNodeFromAnchor } from '@codama/nodes-from-anchor';
import renderVisitor from '@codama/renderers-js';
import { createFromRoot } from 'codama';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const idlPath = resolve(packageRoot, 'src/idl/centlalia_ticketing.json');
const anchorIdl = JSON.parse(await readFile(idlPath, 'utf8'));
const codama = createFromRoot(rootNodeFromAnchor(anchorIdl));

await codama.accept(
  renderVisitor(packageRoot, {
    generatedFolder: 'src/generated',
    kitImportStrategy: 'rootOnly',
    syncPackageJson: false,
  }),
);

console.log('Generated @solana/kit client from the Centlalia Anchor IDL.');
