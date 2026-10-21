#!/usr/bin/env node
import { runStdio } from "../src/index.mjs";

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Ballast MCP Server
Model Context Protocol implementation for Ballast (https://ballast.to)

Usage:
  BALLAST_API_KEY=bl_... npx ballast-mcp
  npx ballast-mcp --key=bl_...

Claude Desktop configuration (claude_desktop_config.json):
  {
    "mcpServers": {
      "ballast": {
        "command": "npx",
        "args": ["-y", "ballast-mcp"],
        "env": {
          "BALLAST_API_KEY": "YOUR_API_KEY"
        }
      }
    }
  }

Docs: https://ballast.to/docs/mcp
`);
  process.exit(0);
}

runStdio().catch((err) => {
  console.error("Fatal error running Ballast MCP server:", err);
  process.exit(1);
});
