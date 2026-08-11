// Drives the built server over stdio with raw JSON-RPC and asserts the three
// tools register. No network, no API key.
import { spawn } from 'node:child_process';

const child = spawn('node', ['dist/main.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
});
const timer = setTimeout(() => {
  console.error('smoke: timed out');
  child.kill();
  process.exit(1);
}, 10_000);

const send = (msg) => child.stdin.write(JSON.stringify(msg) + '\n');
let buf = '';
child.stdout.on('data', (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (line) handle(JSON.parse(line));
  }
});

send({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'smoke', version: '0.0.0' },
  },
});

function handle(msg) {
  if (msg.id === 1) {
    send({ jsonrpc: '2.0', method: 'notifications/initialized' });
    send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  }
  if (msg.id === 2) {
    clearTimeout(timer);
    child.kill();
    const names = msg.result.tools.map((t) => t.name).sort();
    const expected = ['create', 'edit', 'review'];
    if (JSON.stringify(names) !== JSON.stringify(expected)) {
      console.error(`smoke: expected ${expected}, got ${names}`);
      process.exit(1);
    }
    console.log(`smoke: ok, tools ${names.join(', ')}`);
    process.exit(0);
  }
}
