use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types::*;
use tower_lsp::{Client, LanguageServer};

#[derive(Debug)]
pub struct Backend {
    client: Client,
}

impl Backend {
    pub fn new(client: Client) -> Self {
        Self { client }
    }
}
#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(&self, params: InitializeParams) -> Result<InitializeResult> {
        eprintln!("NovelFlow LSP Server initializing...");

        // Log workspace information
        if let Some(root_uri) = params.root_uri {
            eprintln!("Workspace root: {}", root_uri);
        }

        Ok(InitializeResult {
            capabilities: ServerCapabilities {
                text_document_sync: Some(TextDocumentSyncCapability::Kind(
                    TextDocumentSyncKind::FULL,
                )),
                completion_provider: Some(CompletionOptions {
                    resolve_provider: Some(false),
                    trigger_characters: Some(vec![".".to_string()]),
                    ..Default::default()
                }),
                hover_provider: Some(HoverProviderCapability::Simple(true)),
                ..Default::default()
            },
            server_info: Some(ServerInfo {
                name: "NovelFlow Language Server".to_string(),
                version: Some("0.1.0".to_string()),
            }),
        })
    }

    async fn initialized(&self, _: InitializedParams) {
        eprintln!("NovelFlow LSP Server initialized!");

        self.client
            .log_message(MessageType::INFO, "NovelFlow server initialized")
            .await;
    }

    async fn shutdown(&self) -> Result<()> {
        eprintln!("NovelFlow LSP Server shutting down...");
        Ok(())
    }

    async fn did_open(&self, params: DidOpenTextDocumentParams) {
        eprintln!("Document opened: {}", params.text_document.uri);

        self.client
            .log_message(
                MessageType::INFO,
                format!("Opened document: {}", params.text_document.uri),
            )
            .await;
    }

    async fn did_change(&self, params: DidChangeTextDocumentParams) {
        eprintln!("Document changed: {}", params.text_document.uri);
    }

    async fn did_close(&self, params: DidCloseTextDocumentParams) {
        eprintln!("Document closed: {}", params.text_document.uri);
    }

    async fn completion(&self, params: CompletionParams) -> Result<Option<CompletionResponse>> {
        eprintln!("Completion requested at {:?}", params.text_document_position);

        // Simple example completions
        let completions = vec![
            CompletionItem {
                label: "hello".to_string(),
                kind: Some(CompletionItemKind::KEYWORD),
                detail: Some("A greeting keyword".to_string()),
                ..Default::default()
            },
            CompletionItem {
                label: "world".to_string(),
                kind: Some(CompletionItemKind::KEYWORD),
                detail: Some("The world".to_string()),
                ..Default::default()
            },
        ];

        Ok(Some(CompletionResponse::Array(completions)))
    }

    async fn hover(&self, params: HoverParams) -> Result<Option<Hover>> {
        eprintln!("Hover requested at {:?}", params.text_document_position_params);

        Ok(Some(Hover {
            contents: HoverContents::Scalar(MarkedString::String(
                "NovelFlow Language Server - Hover information".to_string(),
            )),
            range: None,
        }))
    }
}

