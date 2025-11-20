use std::{path::PathBuf, sync::LazyLock};

use clap::Parser;

/// 全局 CLI 参数实例
pub static GLOBAL_CLI: LazyLock<Cli> = LazyLock::new(|| {
  let cli = Cli::parse();
  cli.validate();
  cli
});

#[derive(Parser)]
#[command(name = "novelsaga_server")]
#[command(about = "NovelSaga Language Server", long_about = None)]
pub struct Cli {
  /// Start as LSP server (communicates via stdin/stdout)
  #[arg(long)]
  pub lsp: bool,
  /// Path to the configuration file
  #[arg(long, short = 'c')]
  pub config: Option<PathBuf>,
}

impl Cli {
  /// 验证并处理命令行参数
  pub fn validate(&self) {
    if let Some(ref config_path) = self.config {
      if !config_path.exists() {
        eprintln!("Warning: Config file {} does not exist.", config_path.display());
      }
    }
  }
}
