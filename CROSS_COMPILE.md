# 交叉编译指南

本项目使用 **cargo-zigbuild** + **Zig** 实现跨平台交叉编译，无需安装目标平台的完整工具链。

## 支持的目标平台

- ✅ Linux (x86_64, aarch64)
- ✅ macOS (x86_64, aarch64/Apple Silicon)
- ✅ Windows (x86_64, aarch64)
- ✅ WebAssembly (wasm32-unknown-unknown, wasm32-wasip1)

## 前置要求

使用 Nix flake 开发环境（推荐）：

```bash
nix develop
# 或使用 direnv
direnv allow
```

这会自动安装：

- Rust nightly 工具链（包含所有目标平台）
- Zig 编译器
- cargo-zigbuild
- 交叉编译工具链

## 编译命令

### macOS 目标

```bash
# Intel macOS (x86_64)
cargo zigbuild --release --target=x86_64-apple-darwin

# Apple Silicon (ARM64)
cargo zigbuild --release --target=aarch64-apple-darwin
```

### Linux 目标

```bash
# x86_64 Linux
cargo build --release --target=x86_64-unknown-linux-gnu

# ARM64 Linux
cargo zigbuild --release --target=aarch64-unknown-linux-gnu
```

### Windows 目标

```bash
# x86_64 Windows (Intel/AMD 64位)
cargo zigbuild --release --target=x86_64-pc-windows-gnu

# ARM64 Windows (ARM64 桌面，如 Surface Pro X)
cargo zigbuild --release --target=aarch64-pc-windows-gnullvm
```

**注意**：Windows 目标也完全无需 Visual Studio 或 Windows SDK，Zig 会自动处理所有依赖。

### WebAssembly

```bash
# 纯 WASM
cargo build --release --target=wasm32-unknown-unknown

# WASI (带系统接口)
cargo build --release --target=wasm32-wasip1
```

## 输出位置

编译产物位于：`target/<目标平台>/release/novelsaga_server`

例如：

- `target/x86_64-apple-darwin/release/novelsaga_server` - Intel macOS
- `target/aarch64-apple-darwin/release/novelsaga_server` - Apple Silicon
- `target/x86_64-pc-windows-gnu/release/novelsaga_server.exe` - Windows

## 验证二进制文件

```bash
# 查看文件类型
file target/x86_64-apple-darwin/release/novelsaga_server

# 查看依赖的动态库
ldd target/x86_64-unknown-linux-gnu/release/novelsaga_server  # Linux
otool -L target/x86_64-apple-darwin/release/novelsaga_server  # macOS
```

## 注意事项

1. **macOS 交叉编译**：必须使用 `cargo zigbuild` 而不是 `cargo build`
2. **警告消息**：编译 macOS 目标时会出现 SDK 警告，这是正常的，不影响最终二进制
3. **Zig 自动化**：Zig 会自动下载并缓存必要的系统库，首次编译可能需要更长时间

## 故障排查

### 找不到 cargo-zigbuild

```bash
# 重新加载 Nix 环境
direnv reload
# 或
nix develop
```

### 编译失败

```bash
# 清理构建缓存
cargo clean

# 更新 Rust 工具链
rustup update nightly
```

## 相关资源

- [Zig 交叉编译](https://actually.fyi/posts/zig-makes-rust-cross-compilation-just-work/)
- [cargo-zigbuild](https://github.com/rust-cross/cargo-zigbuild)
- [Rust 平台支持](https://doc.rust-lang.org/nightly/rustc/platform-support.html)
