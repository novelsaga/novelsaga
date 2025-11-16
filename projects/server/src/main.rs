use novelflow_server::*;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    eprintln!("NovelFlow LSP Server starting...");

    // Get stdin/stdout for LSP communication
    let stdin = tokio::io::stdin();
    let stdout = tokio::io::stdout();

    // Create the LSP service
    let (service, socket) = tower_lsp::LspService::new(|client| Backend::new(client));

    eprintln!("Starting LSP server...");

    // Run the server
    tower_lsp::Server::new(stdin, stdout, socket)
        .serve(service)
        .await;

    eprintln!("LSP server finished");
}
