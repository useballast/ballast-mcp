import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tools = JSON.parse(readFileSync(join(__dirname, "tools.json"), "utf8"));

export function createServer(options = {}) {
  const endpoint = options.endpoint || process.env.BALLAST_MCP_URL || "https://ballast.to/api/mcp";
  const apiKey = options.apiKey || process.env.BALLAST_API_KEY;

  const server = new Server(
    {
      name: "ballast-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Expose the tool definitions to MCP clients
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: {
          type: "object",
          ...t.inputSchema,
        },
      })),
    };
  });

  // Handle tool execution by calling Ballast API
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = tools.find((t) => t.name === name);
    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Tool '${name}' not found.`);
    }

    if (!apiKey) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "BALLAST_API_KEY is not configured. Set the BALLAST_API_KEY environment variable or pass --key."
      );
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name,
            arguments: args ?? {},
          },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        return {
          content: [
            {
              type: "text",
              text: `Error from Ballast API (HTTP ${response.status}): ${text}`,
            },
          ],
          isError: true,
        };
      }

      const json = await response.json();
      if (json.error) {
        return {
          content: [
            {
              type: "text",
              text: `Ballast Error: ${json.error.message || JSON.stringify(json.error)}`,
            },
          ],
          isError: true,
        };
      }

      const result = json.result;
      if (result && Array.isArray(result.content)) {
        return result;
      }

      return {
        content: [
          {
            type: "text",
            text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to execute ${name}: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

export async function runStdio() {
  const apiKey =
    process.env.BALLAST_API_KEY ||
    process.argv.find((a) => a.startsWith("--key="))?.split("=")[1] ||
    (process.argv.indexOf("--key") !== -1 ? process.argv[process.argv.indexOf("--key") + 1] : undefined);

  const server = createServer({ apiKey });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
