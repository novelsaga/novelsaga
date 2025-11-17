{
  description = "workspace flake for NovelSaga project";

  inputs = {
    devenv-root = {
      url = "file+file:///dev/null";
      flake = false;
    };
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
    devenv.url = "github:cachix/devenv";
    nix2container = {
      url = "github:nlewo/nix2container";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    mk-shell-bin.url = "github:rrbutani/nix-mk-shell-bin";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs =
    inputs@{ flake-parts, devenv-root, ... }:
    let
      inherit (inputs.nixpkgs) lib;
    in
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.devenv.flakeModule
      ];
      systems =
        with lib;
        subtractLists platforms.freebsd (
          subtractLists platforms.power (subtractLists platforms.riscv systems.flakeExposed)
        );

      perSystem =
        {
          config,
          self',
          inputs',
          pkgs,
          system,
          ...
        }:
        {
          devenv.shells.default = {
            name = "novelsaga";
            env = {
              COREPACK_INTEGRITY_KEYS = "0";
            };
            languages = {
              javascript = {
                enable = true;
                corepack.enable = true;
              };
              nix = {
                enable = true;
                lsp.package = pkgs.nil;
              };
              rust = {
                enable = true;
                channel = "nightly";
                components = [
                  "rustc"
                  "cargo"
                  "clippy"
                  "rustfmt"
                  "rust-analyzer"
                  "miri"
                ];
                targets = [
                  "aarch64-apple-darwin"
                  "aarch64-pc-windows-msvc"
                  "aarch64-unknown-linux-gnu"
                  "x86_64-pc-windows-msvc"
                  "x86_64-unknown-linux-gnu"
                  "wasm32-unknown-unknown"
                  "wasm32-wasip1"
                ];
              };
            };
          };
        };
    };
}
