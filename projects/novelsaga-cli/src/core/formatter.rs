use std::path::Path;

use crate::config::NovelSagaConfig;

pub fn formatter(config: &NovelSagaConfig, content: &str, path: &str) -> String {
  let is_md = Path::new(path)
    .extension()
    .is_some_and(|ext| ext.eq_ignore_ascii_case("md"));
  let fmt = &config.fmt;
  let pangu_formatted = pangu::spacing(content).into_owned();
  let lines: Vec<&str> = pangu_formatted.lines().collect();
  if is_md && fmt.markdown_only_use_pangu {
    return pangu_formatted;
  }
  // 丢弃只有空格的行
  let mut formatted_lines: Vec<String> = Vec::new();
  for line in lines {
    if line.trim().is_empty() {
      continue;
    }
    let indented_line = format!("{}{}", " ".repeat(fmt.indent_spaces), line.trim());
    formatted_lines.push(indented_line);
  }
  // 在段落之间添加空行
  let mut result_lines: Vec<String> = Vec::new();
  for (i, line) in formatted_lines.iter().enumerate() {
    result_lines.push(line.clone());
    if i < formatted_lines.len() - 1 {
      for _ in 0..fmt.blank_lines_between_paragraphs {
        result_lines.push(String::new());
      }
    }
  }
  result_lines.join("\n")
}
