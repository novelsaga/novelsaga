use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct FmtConfig {
  /// 段落前的空格数
  pub indent_spaces: usize,
  /// 段落之间的空行数
  pub blank_lines_between_paragraphs: usize,
  /// 是否忽略 Markdown 文件的缩进设置
  pub markdown_only_use_pangu: bool,
}
// 默认格式化配置实现
impl Default for FmtConfig {
  fn default() -> Self {
    Self {
      indent_spaces: 4,
      blank_lines_between_paragraphs: 1,
      markdown_only_use_pangu: true,
    }
  }
}
