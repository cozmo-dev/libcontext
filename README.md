# LibContext

**Local, Private, and AI-Ready Code Documentation Server**

LibContext is a local-first, privacy-focused tool to build AI-friendly context for any library based on its documentation files — including private repositories. Extract, index, and serve documentation for AI coding assistants, IDEs, and LLM workflows. Get better results.

---

## Overview

LibContext MCP pulls up-to-date, version-specific, relevant documentation and code examples from a GitHub repository and makes it available to your IDE.

Add `use libcontext` to your prompt in Cursor:

```
Add a collapsible sidebar shadcn to the base layout of the app. use shadcn-ui, use libcontext
```

LibContext fetches up-to-date code examples and documentation right into your LLM's context.

1. Write your prompt
2. Tell the LLM to use LibContext
3. Get working code answers

No tab-switching, no hallucinated APIs that don't exist, no outdated code generations.

## How it works

1. **Add a Library:**  
   Use the CLI to fetch documentation files (Markdown/MDX) from the specified repo/branch/tag/folders.  
   For private repos, supply a GitHub token.

2. **AI Extraction:**  
   Each documentation file is processed by a LLM to extract code snippets, titles, and descriptions optimized for LLM retrieval.

3. **Local Indexing:**  
   All extracted data is stored in a local libSQL database in your user data directory.

4. **Query & Serve:**  
   Use the CLI to query docs/snippets, or start the MCP server to integrate with AI tools.

## Features

- **CLI:** Add, list and remove documentation of your tech stack using our CLI.
- **MCP Server:** Exposes a Model Context Protocol (MCP) server for integration with AI tools (Cursor, Windsurf, etc.).
- **Local and Private:** All data is stored locally using [libSQL](https://github.com/tursodatabase/libsql). No cloud or third-party storage required.
- **Customizable:** Choose which folders/files to index, and control which branches/tags to use.
- **Internal Library Support:** Add documentation from private GitHub repositories using a personal access token.
- **Cross-Platform:** Works on Linux, macOS, and Windows.

---

## Installation

You can install LibContext globally via npm:

```bash
npm install -g libcontext
```

Or use it directly with `npx` (no installation required):

```bash
npx -y libcontext <command>
```

---

## Environment Setup

**You must set the `OPENAI_API_KEY` environment variable for LibContext to work.**

```bash
export OPENAI_API_KEY=sk-...
```

You can get your API key from [OpenAI's dashboard](https://platform.openai.com/api-keys).

---

## Usage

### CLI Overview

All commands are available via the `libcontext` CLI (or `npx -y libcontext <command>`).

#### Add a Library

Index documentation from a GitHub repository (public or private):

```bash
libcontext add <owner/repo> [--branch <branch>] [--tag <tag>] [--folders <folder1> <folder2> ...] [--token <github_token>]
```

- `--branch <branch>`: Git branch to index (default: repo default branch)
- `--tag <tag>`: Git tag to index (mutually exclusive with `--branch`)
- `--folders <folder1> <folder2> ...`: Only index documentation in these folders (default: all)
- `--token <github_token>`: GitHub token for private repo access

**Examples:**

Add up-to-date LibContext documentation:

```bash
libcontext add cozmo-dev/libcontext --branch main
```

Add documentation of a specific ShadCN UI version:

```bash
libcontext add shadcn-ui/ui --tag shadcn-ui@0.9.4
```

Add documentation of a private repo of your GitHub org:

```bash
libcontext add myorg/myrepo --branch main --folders docs src/guides --token ghp_xxx
```

#### List Indexed Libraries

```bash
libcontext list
```

#### Get Documentation

Fetch up-to-date documentation for a library, optionally filtered by topic:

```bash
libcontext get <owner/repo> [topic] [--k <number_of_snippets>]
```

- `topic`: (optional) Focus on a specific topic (e.g., "hooks", "routing")
- `--k`: Number of top snippets to return (default: 10)

**Example:**

```bash
libcontext get shadcn-ui/ui "Select"
```

#### Remove a Library

```bash
libcontext rm <owner/repo>
```

#### Start the MCP Server

Expose the documentation server for AI tools (Cursor, Windsurf, etc.):

```bash
libcontext start [--transport stdio|httpStream] [--port <port>]
```

- `--transport`: Communication method (`stdio` for local, `httpStream` for HTTP API, default: `stdio`)
- `--port`: Port for HTTP transport (default: 3000)

---

## IDE & Tool Integration

LibContext exposes a Model Context Protocol (MCP) server, making it easy to integrate with popular AI coding tools and IDEs.

### Cursor

Go to: `Settings` -> `Cursor Settings` -> `MCP` -> `Add new global MCP server`

Pasting the following configuration into your Cursor `~/.cursor/mcp.json` file is the recommended approach. You may also install in a specific project by creating `.cursor/mcp.json` in your project folder. See [Cursor MCP docs](https://docs.cursor.com/context/model-context-protocol) for more info.

```json
{
  "mcpServers": {
    "libcontext": {
      "command": "libcontext",
      "args": ["start"],
      "env": {
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

<details>
<summary>Alternative: Without global installation</summary>

Or if you have not installed globally:

```json
{
  "mcpServers": {
    "libcontext": {
      "command": "npx",
      "args": ["-y", "libcontext", "start"],
      "env": {
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

</details>

<details>
<summary>Alternative: Using with Bun runtime</summary>

```json
{
  "mcpServers": {
    "libcontext": {
      "command": "bunx",
      "args": ["-y", "libcontext", "start"],
      "env": {
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

</details>

### Windsurf

Add this to your Windsurf MCP config file. See [Windsurf MCP docs](https://docs.windsurf.com/windsurf/mcp) for more info.

```json
{
  "mcpServers": {
    "libcontext": {
      "command": "libcontext",
      "args": ["start"],
      "env": {
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

---

## Tips

### Add a Rule

> If you don’t want to add `use libcontext` to every prompt, you can define a simple rule in your `.windsurfrules` file in Windsurf or from `Cursor Settings > Rules` section in Cursor (or the equivalent in your MCP client) to auto-invoke LibContext on any code-related question:
>
> ```toml
> [[calls]]
> match = "when the user requests code examples, setup or configuration steps, or library/API documentation"
> tool  = "libcontext"
> ```
>
> From then on you’ll get LibContext’s docs in any related conversation without typing anything extra. You can add your use cases to the match part.

---

## Data Storage

- **Database:**  
  Uses your OS's standard data directory (e.g., `~/.local/share/libcontext/libcontext.db` on Linux).
- **No Cloud:**  
  All data remains on your machine unless you explicitly share it.

---

## Security & Privacy

- **Private by Default:**  
  All indexes are stored locally.  
  ⚠️  During the *AI Extraction* step the selected documentation is sent to the OpenAI API (or whichever LLM you configure).  
  If you need zero-egress processing, self-host the model or disable extraction.
- **Private Repo Support:**  
  Your GitHub token is only used locally to fetch documentation.
---

## Contributing

- **Run in development mode:**
  ```bash
  bun dev
  ```

---

## Troubleshooting

- **Permission Errors:**  
  Ensure the data directory is writable (see error message for path).
- **Private Repo Issues:**  
  Double-check your GitHub token and repo access.
- **OpenAI Errors:**  
  Ensure your `OPENAI_API_KEY` environment variable is set.

---

## License

MIT

---

**Build your own private, AI-ready documentation server—locally.**
