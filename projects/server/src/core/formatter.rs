use crate::config::NovelSagaConfig;

pub fn formatter(_config: &NovelSagaConfig, content: &str) -> String {
  pangu::spacing(content).into_owned()
}
