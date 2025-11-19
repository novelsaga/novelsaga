use clap::Parser;

mod args;
mod config;
mod core;
mod lsp;

use args::Cli;

#[tokio::main(flavor = "current_thread")]
async fn main() {
  let cli = Cli::parse();
  cli.validate();
  if cli.lsp {
    lsp::start().await;
  }
}
