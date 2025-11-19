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
    nixpkgs-nodejs.url = "github:NixOS/nixpkgs/85a6c4a07faa12aaccd81b36ba9bfc2bec974fa1"; # 24.11.1
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs = inputs @ {
    flake-parts,
    devenv-root,
    ...
  }: let
    inherit (inputs.nixpkgs) lib;
    devenv-root-path = builtins.readFile devenv-root;
  in
    flake-parts.lib.mkFlake {inherit inputs;} {
      imports = [
        inputs.devenv.flakeModule
      ];
      systems = with lib;
        subtractLists platforms.freebsd (
          subtractLists platforms.power (subtractLists platforms.riscv systems.flakeExposed)
        );
      perSystem = {
        config,
        self',
        inputs',
        system,
        pkgs,
        ...
      }: let
        pkgs-for-nodejs = import inputs.nixpkgs-nodejs {
          inherit system;
        };
      in {
        devenv.shells.default = {
          name = "novelsaga";
          env = {
            COREPACK_INTEGRITY_KEYS = "0";
            NODE_OPTIONS = "--experimental-strip-types";
          };
          files = {
            ".vscode/settings.json".json = import ./.vscode/settings.nix {
              inherit
                devenv-root-path
                pkgs
                pkgs-for-nodejs
                lib
                ;
            };
          };
          packages =
            (with pkgs; [
              shfmt
              cargo-zigbuild
            ])
            ++ (with pkgs.pkgsCross; [
              mingwW64.stdenv.cc
              ucrtAarch64.stdenv.cc
              aarch64-multiplatform.stdenv.cc
            ]);
          languages = {
            javascript = {
              enable = true;
              package = pkgs-for-nodejs.nodejs-slim_24;
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
                "aarch64-pc-windows-gnullvm"
                "x86_64-pc-windows-gnu"
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
