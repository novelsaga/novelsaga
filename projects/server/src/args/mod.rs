use clap::Parser;

#[derive(Parser)]
#[command(name = "novelsaga_server")]
#[command(about = "NovelSaga Language Server", long_about = None)]
pub struct Cli {
  /// Start as LSP server (communicates via stdin/stdout)
  #[arg(long)]
  pub lsp: bool,
}

impl Cli {
  /// 验证并处理命令行参数
  pub fn validate(&self) {}
}
