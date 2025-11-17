# NovelSaga Language Server

A multi-workspace Language Server Protocol implementation using Tower-LSP compiled to WebAssembly with WASI support.

## Architecture

```
novelsaga/
├── projects/
│   ├── client/          # TypeScript VSCode client
│   │   └── src/
│   │       └── extension.ts
│   └── server/          # Rust Tower-LSP server (WASM)
│       ├── src/
│       │   └── lib.rs
│       └── Cargo.toml
├── package.json         # Root package (extension manifest)
├── pnpm-workspace.yaml
└── flake.nix           # Nix development environment
```

## Features

- **Multi-Server Architecture**: One LSP server instance per workspace folder
- **WASI Support**: Server runs as WebAssembly with WASI
- **Tower-LSP**: Full Rust implementation using tower-lsp
- **Workspace-Aware**: Each folder gets isolated server instance

## Development Setup

### Prerequisites

1. **Nix with flakes** (recommended):
   ```bash
   nix develop
   ```

2. **Or manually**:
   - Node.js 20+
   - pnpm 8+
   - Rust nightly with wasm32-wasip1 target
   - VSCode

### Build

```bash
# Install dependencies
pnpm install

# Build everything (client + server)
pnpm run compile

# Or build individually
pnpm --filter client compile
pnpm run build:server
```

### Run/Debug

1. Open the project in VSCode
2. Press `F5` to start debugging
3. A new VSCode window will open with the extension loaded
4. Create a test file with `.nf` extension
5. Check the Output panel for "NovelSaga LSP" logs

## Project Structure

### Client (TypeScript)

The client (`projects/client/`) handles:
- Extension activation
- Loading the WASM WASI API
- Managing multiple server instances (one per workspace folder)
- Creating WASI processes for each server
- LSP client communication

Key files:
- `src/extension.ts`: Main extension logic with multi-server support

### Server (Rust)

The server (`projects/server/`) implements:
- Tower-LSP server with basic capabilities
- WASI entry point (`_start`)
- Basic LSP features: completion, hover, document sync

Key files:
- `src/lib.rs`: LSP server implementation
- `Cargo.toml`: Dependencies and build configuration
- `build.sh`: Build script for wasm32-wasip1 target

## Extension Points

The extension depends on:
- `ms-vscode.wasm-wasi-core`: Microsoft's official WASI runtime for VSCode

## Configuration

Configure in VSCode settings:

```json
{
  "novelsaga.trace.server": "verbose"  // Enable detailed logging
}
```

## Testing

Create a test workspace:

```bash
mkdir test-workspace
cd test-workspace
echo "hello world" > test.nf
```

Then open this folder in the Extension Development Host.

## Building for Production

```bash
# Full build with optimizations
pnpm run vscode:prepublish

# Package as VSIX
vsce package
```

## Architecture Notes

### Multi-Server Pattern

Each workspace folder gets its own:
1. WASI process running the LSP server
2. Language client instance
3. Pseudoterminal for stdio communication
4. Isolated file system mount

This ensures:
- No cross-contamination between workspaces
- Separate state per project
- Independent lifecycle management

### WASI Integration

The server compiles to `wasm32-wasip1` and uses:
- `tokio` runtime for async I/O
- stdin/stdout for LSP JSON-RPC
- File system access through WASI

## Troubleshooting

### Server not starting

Check:
1. WASM file exists: `projects/server/target/wasm32-wasip1/release/novelsaga_server.wasm`
2. Build completed: `pnpm run build:server`
3. WASI extension installed: `ms-vscode.wasm-wasi-core`

### No completions appearing

- Check Output panel for "NovelSaga LSP" logs
- Verify `.nf` file is in workspace
- Enable verbose tracing in settings

## License

MIT
