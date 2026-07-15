import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const excluded = new Set(['.env.example', 'pnpm-lock.yaml']);
const patterns = [
  /(?:api[_-]?key|secret|private[_-]?key)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{20,}/i,
  /https:\/\/[^\s/]+\/(?:v1|v2)\/?\?api-key=[A-Za-z0-9_\-]{16,}/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  encoding: 'utf8',
})
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !excluded.has(file));

const findings = [];
for (const file of files) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  if (patterns.some((pattern) => pattern.test(content))) {
    findings.push(file);
  }
}

if (findings.length > 0) {
  console.error(`Potential secrets found in: ${findings.join(', ')}`);
  process.exit(1);
}

console.log(`Secret scan passed for ${files.length} tracked files.`);
