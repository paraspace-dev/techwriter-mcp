// stdout carries the MCP transport, so all logging goes to stderr.

const debugOn = !!process.env.TECHWRITER_MCP_DEBUG;

export function debug(msg: string): void {
  if (debugOn) process.stderr.write(`techwriter-mcp: ${msg}\n`);
}

export function warn(msg: string): void {
  process.stderr.write(`techwriter-mcp: ${msg}\n`);
}
