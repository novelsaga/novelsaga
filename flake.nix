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
    nixpkgs-nodejs.url = "github:NixOS/nixpkgs/e1ebeec86b771e9d387dd02d82ffdc77ac753abc"; # 22.20.0
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs =
    inputs@{
      flake-parts,
      devenv-root,
      nixpkgs-nodejs,
      ...
    }:
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
        let
          pkgs-for-nodejs = import nixpkgs-nodejs {
            inherit system;
          };
        in
        {
          devenv.shells.default = {
            name = "novelsaga";
            env = {
              COREPACK_INTEGRITY_KEYS = "0";
            };
            packages = with pkgs; [
              pkgsCross.aarch64-multiplatform.stdenv.cc
            ];
            languages = {
              javascript = {
                enable = true;
                package = pkgs-for-nodejs.nodejs-slim;
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
                  "x86_64-apple-darwin"
                  "aarch64-unknown-linux-gnu"
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
