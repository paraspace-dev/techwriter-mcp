// stdout carries the MCP transport, so all logging goes to stderr.

const debugOn = !!process.env.DOCS_MCP_DEBUG;

export function debug(msg: string): void {
  if (debugOn) process.stderr.write(`docs-mcp: ${msg}\n`);
}

export function warn(msg: string): void {
  process.stderr.write(`docs-mcp: ${msg}\n`);
}
