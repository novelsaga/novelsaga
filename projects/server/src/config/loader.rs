use crate::config::NovelSagaConfig;

use super::schema::{CONFIG_FILE_EXTENSIONS, CONFIG_FILE_NAMES};
use once_cell::sync::Lazy;
use std::{
  collections::HashMap,
  path::{Path, PathBuf},
  sync::RwLock,
};

/// 全局配置加载器实例
pub static GLOBAL_CONFIG_LOADER: Lazy<RwLock<ConfigLoader>> =
  Lazy::new(|| RwLock::new(ConfigLoader::new()));

/// 配置文件加载器
#[derive(Debug)]
pub struct ConfigLoader {
  /// 配置缓存：路径 -> 配置
  config_tree_cache: HashMap<PathBuf, NovelSagaConfig>,
}

impl ConfigLoader {
  /// 创建新的配置加载器
  pub fn new() -> Self {
    Self {
      config_tree_cache: HashMap::new(),
    }
  }

  /// 从指定路径向上搜索最近的配置文件并加载配置
  /// 返回加载的配置对象，使用缓存机制提升性能
  ///
  /// # 搜索规则
  /// 1. 从起始路径（如果是文件则从其父目录）开始向上搜索
  /// 2. 在每个目录中，按配置文件名和扩展名的字母表顺序选择第一个
  /// 3. 找到第一个配置文件后立即返回，不继续向上搜索
  /// 4. 配置会按照"文件所在目录"进行缓存
  ///
  /// # 示例
  /// ```text
  /// /project/src/module/file.txt       -> 搜索点
  /// /project/src/module/.novelsaga.json <- 找到后返回并缓存到 /project/src/module
  /// ```
  pub fn find_config_file_nearest<P: AsRef<Path>>(
    &mut self,
    start_path: P,
  ) -> Option<NovelSagaConfig> {
    let start_path = start_path.as_ref();

    // 规范化起始路径
    let mut current_path = if start_path.is_file() {
      start_path.parent().unwrap_or(start_path)
    } else {
      start_path
    };

    // 向上搜索直到找到第一个配置文件
    loop {
      // 检查缓存
      if let Some(cached_config) = self.config_tree_cache.get(current_path) {
        return Some(cached_config.clone());
      }

      // 在当前目录查找配置文件（按字母表顺序）
      if let Some(config_file) = self.find_config_in_directory(current_path) {
        // 读取并解析配置文件
        match self.load_config_file(&config_file) {
          Ok(config) => {
            // 缓存到当前目录
            self
              .config_tree_cache
              .insert(current_path.to_path_buf(), config.clone());
            return Some(config);
          }
          Err(e) => {
            eprintln!("Failed to load config file {:?}: {}", config_file, e);
            return None;
          }
        }
      }

      // 尝试移动到父目录
      match current_path.parent() {
        Some(parent) => current_path = parent,
        None => break, // 已到达根目录
      }
    }

    None
  }

  /// 加载并解析配置文件
  fn load_config_file(&self, path: &Path) -> Result<NovelSagaConfig, config::ConfigError> {
    let config = config::Config::builder()
      .add_source(config::File::from(path))
      .build()?;

    config.try_deserialize::<NovelSagaConfig>()
  }

  /// 在指定目录中查找第一个配置文件（按字母表顺序）
  fn find_config_in_directory(&self, dir: &Path) -> Option<PathBuf> {
    let mut candidates = Vec::new();

    // 收集所有可能的配置文件路径
    for file_name in CONFIG_FILE_NAMES {
      for extension in CONFIG_FILE_EXTENSIONS {
        let config_path = dir.join(format!("{}.{}", file_name, extension));
        if config_path.exists() && config_path.is_file() {
          candidates.push(config_path);
        }
      }
    }

    // 按字母表顺序排序
    candidates.sort();

    // 返回第一个（字母表最前的）
    candidates.into_iter().next()
  }
}
