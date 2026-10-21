#!/usr/bin/env node

/**
 * Ballast MCP Server — CLI & Stdio Proxy
 * Connects MCP clients to Ballast's live endpoint at https://ballast.to/api/mcp
 */

const ENDPOINT = process.env.BALLAST_MCP_URL || "https://ballast.to/api/mcp";
const toolset = process.env.BALLAST_TOOLSET || "core";
const targetUrl = toolset === "full" ? `${ENDPOINT}?toolset=full` : ENDPOINT;

const apiKey =
  process.env.BALLAST_API_KEY ||
  process.argv
    .find((arg) => arg.startsWith("--key="))
    ?.split("=")[1] ||
  (process.argv.indexOf("--key") !== -1
    ? process.argv[process.argv.indexOf("--key") + 1]
    : undefined);

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Ballast MCP Server (Model Context Protocol)
Connect Claude, Cursor, ChatGPT, and AI agents to your Ballast cold email workspace.

Usage:
  Direct HTTP / SSE (Recommended):
    URL:     ${ENDPOINT}
    Header:  Authorization: Bearer <BALLAST_API_KEY>

  Claude Code:
    claude mcp add --transport http ballast ${ENDPOINT} --header "Authorization: Bearer <BALLAST_API_KEY>"

  Cursor (~/.cursor/mcp.json):
    {
      "mcpServers": {
        "ballast": {
          "url": "${ENDPOINT}",
          "headers": {
            "Authorization": "Bearer <BALLAST_API_KEY>"
          }
        }
      }
    }

  Stdio Mode:
    BALLAST_API_KEY=bl_... npx ballast-mcp

Documentation: https://ballast.to/docs/mcp
API Keys:      https://ballast.to/settings/api-keys
`);
  process.exit(0);
}

if (!apiKey) {
  console.error("Error: BALLAST_API_KEY is required to run Ballast MCP.");
  console.error("Obtain an API key from: https://ballast.to/settings/api-keys");
  console.error("");
  console.error("Usage: BALLAST_API_KEY=bl_... npx ballast-mcp");
  console.error("   or: npx ballast-mcp --key bl_...");
  process.exit(1);
}

// Forward JSON-RPC stdin lines to Ballast MCP HTTP endpoint and write responses to stdout
import { createInterface } from "node:readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const payload = JSON.parse(trimmed);
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "x-ballast-toolset": toolset,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.log(
        JSON.stringify({
          jsonrpc: "2.0",
          id: payload.id ?? null,
          error: {
            code: -32603,
            message: `Ballast server responded with HTTP ${res.status}: ${errText}`,
          },
        })
      );
      return;
    }

    const data = await res.json();
    console.log(JSON.stringify(data));
  } catch (err) {
    console.log(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: err instanceof Error ? err.message : String(err),
        },
      })
    );
  }
});
