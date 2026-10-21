# Ballast MCP Server

[![Smithery](https://img.shields.io/badge/Smithery-Listed-brightgreen.svg)](https://smithery.ai)
[![Glama](https://img.shields.io/badge/Glama-MCP_Server-blue.svg)](https://glama.ai/mcp/servers)
[![Protocol](https://img.shields.io/badge/MCP-Protocol_2026-orange.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server connector for **[Ballast](https://ballast.to)** — cold email platform with dedicated egress relays, automated bounce circuit breakers, warmup placement monitor, and unified inbox (Unibox).

Connect **Claude**, **Cursor**, **ChatGPT**, **Claude Code**, **Windsurf**, or **Zed** directly to your Ballast workspace. Let your AI agent inspect domain health, draft and launch sequences, read replies, and track campaigns.

---

## Quick Start

### 1. Get your API Key
Sign in to [ballast.to](https://ballast.to) and copy an API key from **[Settings > API Keys](https://ballast.to/settings/api-keys)** (starts with `bl_`).

### 2. Connect your AI Client

#### Claude Code
```bash
claude mcp add --transport http ballast https://ballast.to/api/mcp \
  --header "Authorization: Bearer YOUR_BALLAST_API_KEY"
```

To load all 92 tools (the full set):
```bash
claude mcp add --transport http ballast "https://ballast.to/api/mcp?toolset=full" \
  --header "Authorization: Bearer YOUR_BALLAST_API_KEY"
```

---

#### Cursor
Add the following to `~/.cursor/mcp.json` (or your project's `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "ballast": {
      "url": "https://ballast.to/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_BALLAST_API_KEY"
      }
    }
  }
}
```

*Tip: Cursor works best with ~40 tools across all connected servers. Ballast serves 30 core tools by default. If you need the full 92 tools, add `"x-ballast-toolset": "full"` to the headers or use `"url": "https://ballast.to/api/mcp?toolset=full"`.*

---

#### Claude Desktop
Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ballast": {
      "command": "npx",
      "args": ["-y", "ballast-mcp", "--key", "YOUR_BALLAST_API_KEY"]
    }
  }
}
```

Or via environment variable:
```json
{
  "mcpServers": {
    "ballast": {
      "command": "npx",
      "args": ["-y", "ballast-mcp"],
      "env": {
        "BALLAST_API_KEY": "YOUR_BALLAST_API_KEY"
      }
    }
  }
}
```

---

#### Claude.ai & ChatGPT (OAuth Sign-in)
Apps that support web connectors open Ballast directly:
1. In Claude.ai or ChatGPT, add a custom connector with URL: `https://ballast.to/api/mcp`
2. You will be redirected to Ballast to sign in, pick the workspace, and approve access.
3. Access tokens automatically refresh and can be revoked at any time from **Settings > API Keys > Connected Apps**.

---

## Safety: Two-Step Confirmations

Ballast guards your domain reputation: **no emails are ever sent by accident**.

Any destructive or sending operation (e.g., `launch_campaign`, `send_reply`, `import_leads`, `delete_*`) requires two steps:
1. **Preview call**: The server returns a human-readable summary of what will happen (e.g., *"Will email 312 leads from 6 mailboxes starting Tue 09:00"*) alongside a 10-minute HMAC confirmation token.
2. **Execution call**: Your AI shows the preview to you and only executes the second call once you say **yes**.

---

## Available Tools

### Core Toolset (30 tools — enabled by default)

| Group | Tools | Description |
| :--- | :--- | :--- |
| **Workspace & Billing** | `whoami`, `get_billing`, `get_overview` | Workspace status, plan tier, sent emails, reply rates, bounce rates. |
| **Domains & Mailboxes** | `check_domain`, `list_domains`, `add_domain`, `list_mailboxes`, `add_mailbox` | Verify SPF, DKIM, DMARC, blacklist status, and connected mailboxes. |
| **Leads & Lists** | `import_leads`, `list_leads`, `list_lead_lists`, `add_suppressions` | Manage recipient lists, clean leads, and domain suppression. |
| **Campaigns & Sequences** | `list_campaigns`, `create_campaign`, `get_campaign`, `update_campaign`, `set_sequence`, `write_sequence`, `add_leads_to_campaign`, `preview_campaign`, `get_launch_checklist`, `launch_campaign`, `pause_campaign`, `get_campaign_stats`, `get_campaign_analytics` | End-to-end cold email sequence creation, launch checklist, circuit breakers, and step stats. |
| **Unibox & Replies** | `get_unibox_filters`, `list_threads`, `get_thread`, `send_reply`, `label_thread` | Unified inbox management, thread sentiment classification, and safe replies. |

### Full Toolset (92 tools)
Includes detailed relay pool management, proxy IP assignment, custom CNAME tracking domains, webhook subscriptions, lead export, and per-variant step analytics.

To switch to the full set, pass `?toolset=full` on the URL or the HTTP header `x-ballast-toolset: full`.

---

## Example Prompts

Here are examples of what you can ask your AI:

- *"Check the deliverability of our domains and tell me if any SPF or DMARC record is missing."*
- *"Which of our mailboxes had the highest bounce rate over the last 7 days?"*
- *"Draft a 3-step cold email sequence for our B2B agency campaign and show me the preview."*
- *"Are there any new positive replies in Unibox this morning that need a response?"*
- *"Pause campaign 'Outreach Q4' if the bounce rate exceeded 4%."*

---

## Architecture & Endpoints

- **Live MCP Endpoint**: `https://ballast.to/api/mcp`
- **Full Toolset URL**: `https://ballast.to/api/mcp?toolset=full`
- **Protocol**: Model Context Protocol (MCP) HTTP / SSE / JSON-RPC 2.0
- **Authentication**: Bearer API Key (`Authorization: Bearer bl_...`) or OAuth 2.0
- **Documentation**: [https://ballast.to/docs/mcp](https://ballast.to/docs/mcp)
- **REST API Specs**: [https://ballast.to/docs/api](https://ballast.to/docs/api)

---

## License

MIT © [Ballast](https://ballast.to)
