use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types::*;
use tower_lsp::{Client, LanguageServer};

use crate::config::GLOBAL_CONFIG_LOADER;
use crate::core::formatter;

#[derive(Debug)]
pub struct Backend {
  client: Client,
  documents: Arc<RwLock<HashMap<Url, String>>>,
}

impl Backend {
  pub fn new(client: Client) -> Self {
    Self {
      client,
      documents: Arc::new(RwLock::new(HashMap::new())),
    }
  }
}

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
  async fn initialize(&self, params: InitializeParams) -> Result<InitializeResult> {
    eprintln!("NovelSaga LSP Server initializing...");

    // Log workspace information
    if let Some(root_uri) = params.root_uri {
      eprintln!("Workspace root: {}", root_uri);
    }

    Ok(InitializeResult {
      capabilities: ServerCapabilities {
        text_document_sync: Some(TextDocumentSyncCapability::Kind(TextDocumentSyncKind::FULL)),
        document_formatting_provider: Some(OneOf::Left(true)),
        ..Default::default()
      },
      server_info: Some(ServerInfo {
        name: "NovelSaga Language Server".to_string(),
        version: Some("0.1.0".to_string()),
      }),
    })
  }

  async fn initialized(&self, _: InitializedParams) {
    eprintln!("NovelSaga LSP Server initialized!");

    self
      .client
      .log_message(MessageType::INFO, "NovelSaga server initialized")
      .await;
  }

  async fn shutdown(&self) -> Result<()> {
    eprintln!("NovelSaga LSP Server shutting down...");
    Ok(())
  }

  async fn did_open(&self, params: DidOpenTextDocumentParams) {
    eprintln!("Document opened: {}", params.text_document.uri);

    // 存储文档内容
    let mut documents = self.documents.write().await;
    documents.insert(params.text_document.uri.clone(), params.text_document.text);

    self
      .client
      .log_message(
        MessageType::INFO,
        format!("Opened document: {}", params.text_document.uri),
      )
      .await;
  }

  async fn did_change(&self, params: DidChangeTextDocumentParams) {
    eprintln!("Document changed: {}", params.text_document.uri);

    // 更新文档内容（FULL sync）
    if let Some(change) = params.content_changes.into_iter().next() {
      let mut documents = self.documents.write().await;
      documents.insert(params.text_document.uri, change.text);
    }
  }

  async fn did_close(&self, params: DidCloseTextDocumentParams) {
    eprintln!("Document closed: {}", params.text_document.uri);

    // 清理文档内容
    let mut documents = self.documents.write().await;
    documents.remove(&params.text_document.uri);
  }

  async fn formatting(&self, params: DocumentFormattingParams) -> Result<Option<Vec<TextEdit>>> {
    eprintln!("Formatting requested for {:?}", params.text_document.uri);

    // 使用全局配置加载器查找配置文件（需要写锁以支持缓存）
    let config = {
      let mut loader = GLOBAL_CONFIG_LOADER.write().unwrap();
      loader.find_config_file_nearest(params.text_document.uri.path())
    };
    dbg!("Loaded config for formatting:", &config);

    // 获取文档内容
    let documents = self.documents.read().await;
    let Some(content) = documents.get(&params.text_document.uri) else {
      return Ok(None);
    };

    // 使用 pangu 格式化文本（在中英文之间添加空格）
    let formatted = formatter(config.as_ref().unwrap_or(&Default::default()), content);

    // 如果内容没有变化，返回 None
    if formatted == *content {
      return Ok(None);
    }

    // 计算文档的结束位置
    let line_count = content.lines().count() as u32;
    let last_line = content.lines().last().unwrap_or("");
    let last_char = last_line.chars().count() as u32;

    // 返回替换整个文档的 TextEdit
    Ok(Some(vec![TextEdit {
      range: Range {
        start: Position {
          line: 0,
          character: 0,
        },
        end: Position {
          line: line_count.saturating_sub(1),
          character: last_char,
        },
      },
      new_text: formatted,
    }]))
  }
}
