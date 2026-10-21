# Ballast MCP Server

[![Glama](https://glama.ai/mcp/servers/useballast/ballast-mcp/badge)](https://glama.ai/mcp/servers/useballast/ballast-mcp)
[![Protocol](https://img.shields.io/badge/MCP-Protocol_2026-orange.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server implementation for **[Ballast](https://ballast.to)** — cold email software with dedicated egress relays, automated bounce circuit breakers, warmup placement monitor, and unified inbox (Unibox).

This repository contains the standalone MCP server package that runs locally via standard I/O (stdio) and connects AI assistants (Claude Desktop, Cursor, Claude Code, Zed, etc.) to your Ballast workspace.

---

## Features

- **Deliverability & DNS Diagnostics**: Inspect secondary domains for SPF, DKIM, DMARC alignment, MX configuration, and blacklist health.
- **Campaign & Sequence Management**: Build multi-step outbound sequences, set A/B variants, configure sending delays, and verify launch checklists.
- **Automated Bounce Circuit Breakers**: Monitor campaign placement rates and pause sends if bounce rate thresholds are crossed.
- **Unified Inbox (Unibox)**: Read and summarize customer email threads, check sentiment classification, and draft human-confirmed replies.
- **Safe by Default**: Destructive operations (launching campaigns, sending emails, deleting data) require explicit two-step confirmation with a 10-minute HMAC token.

---

## Installation & Setup

### Requirements
- Node.js >= 18.0.0
- A Ballast workspace API key from **[Settings > API Keys](https://ballast.to/settings/api-keys)** (starts with `bl_`).

### Run via npx (Recommended)
You can run the server directly without manual installation:
```bash
BALLAST_API_KEY="bl_your_key_here" npx -y ballast-mcp
```

### Install from Source
```bash
git clone https://github.com/useballast/ballast-mcp.git
cd ballast-mcp
npm install
npm start
```

---

## Client Configuration

### Claude Desktop
Add Ballast to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ballast": {
      "command": "npx",
      "args": ["-y", "ballast-mcp"],
      "env": {
        "BALLAST_API_KEY": "bl_your_api_key_here"
      }
    }
  }
}
```

---

### Cursor
Add to `~/.cursor/mcp.json` (or your project's `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "ballast": {
      "command": "npx",
      "args": ["-y", "ballast-mcp"],
      "env": {
        "BALLAST_API_KEY": "bl_your_api_key_here"
      }
    }
  }
}
```

---

### Claude Code
```bash
claude mcp add --transport stdio ballast -- npx -y ballast-mcp --key=bl_your_api_key_here
```

*(Note: For clients that support remote Streamable HTTP directly, you can also use `--transport http ballast https://ballast.to/api/mcp --header "Authorization: Bearer bl_..."`)*

---

## Tools Reference

The server implements 30 core tools organized by functional area:

| Tool | Category | Description |
| :--- | :--- | :--- |
| `whoami` | Workspace | Get authenticated user, active workspace, and permission role. |
| `get_overview` | Workspace | High-level workspace analytics (emails sent, replies, positive sentiment, bounce rates). |
| `get_billing` | Workspace | Plan details, sending allowances, dedicated IPs, and usage limits. |
| `check_domain` | Domains | Run real-time DNS check (SPF, DKIM, DMARC, MX) and blacklist scans. |
| `list_domains` | Domains | List configured sending domains and their verification status. |
| `add_domain` | Domains | Add a new secondary domain to the workspace. |
| `list_mailboxes` | Mailboxes | List connected Google Workspace and Microsoft 365 mailboxes with daily limits. |
| `add_mailbox` | Mailboxes | Connect an external mailbox for outbound outreach. |
| `list_leads` | Leads | Search and filter contacts in your workspace. |
| `import_leads` | Leads | Import lead contacts with custom variables and tag assignment. |
| `list_lead_lists` | Leads | List organized lead segments and member counts. |
| `add_suppressions` | Leads | Add email addresses or root domains to workspace-wide do-not-contact lists. |
| `list_campaigns` | Campaigns | List outbound sequences with sending schedules and statuses. |
| `create_campaign` | Campaigns | Create a new cold email campaign. |
| `get_campaign` | Campaigns | Retrieve campaign settings, step variants, and assigned mailboxes. |
| `update_campaign` | Campaigns | Update campaign schedule, daily quotas, or track settings. |
| `set_sequence` | Campaigns | Configure sequence steps, delays, subject lines, and body copy. |
| `write_sequence` | Campaigns | Generate or polish multi-step sequence copy using AI. |
| `add_leads_to_campaign` | Campaigns | Enroll lead segments into an active sequence. |
| `preview_campaign` | Campaigns | Preview lead send distribution across mailboxes and first send timings. |
| `get_launch_checklist` | Campaigns | Check domain alignment, sender warmup, and lead hygiene before launch. |
| `launch_campaign` | Campaigns | Launch sequence sending (*requires confirm token*). |
| `pause_campaign` | Campaigns | Immediately pause sending for a campaign. |
| `get_campaign_stats` | Campaigns | Performance counters (sent, open, click, bounce, reply rates). |
| `get_campaign_analytics` | Campaigns | Detailed performance broken down by mailbox provider, step, and variant. |
| `get_unibox_filters` | Unibox | Retrieve unified inbox filter presets and label counts. |
| `list_threads` | Unibox | List incoming recipient replies and conversation threads. |
| `get_thread` | Unibox | Inspect full thread message history, headers, and lead details. |
| `send_reply` | Unibox | Send an email reply from the thread's assigned mailbox (*requires confirm token*). |
| `label_thread` | Unibox | Apply sentiment labels (Interested, Meeting Booked, Not Interested, Out of Office). |

---

## Safety: Two-Step Confirmations

To prevent inadvertent mass sends or data deletion:
1. When calling `launch_campaign`, `send_reply`, or deletion tools without a `confirm_token`, the server generates a dry-run preview describing the exact outcome (e.g. *"Will send 320 emails across 6 mailboxes"*) and issues an HMAC token.
2. The AI presents the preview to the user.
3. The action executes only when the user approves and the AI passes the `confirm_token`.

---

## Development

```bash
git clone https://github.com/useballast/ballast-mcp.git
cd ballast-mcp
npm install
npm test # or npm start
```

## License

MIT © [Ballast](https://ballast.to)
