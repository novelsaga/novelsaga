import * as vscode from 'vscode';
import * as path from 'path';
import {
    LanguageClient,
    LanguageClientOptions,
    Executable,
} from 'vscode-languageclient/node';

interface ServerInstance {
    client: LanguageClient;
    folder: vscode.WorkspaceFolder;
}

let serverInstances: Map<string, ServerInstance> = new Map();

export async function activate(context: vscode.ExtensionContext) {
    console.log('NovelSaga extension activating...');

    // Start servers for existing workspace folders
    if (vscode.workspace.workspaceFolders) {
        for (const folder of vscode.workspace.workspaceFolders) {
            await startServerForFolder(context, folder);
        }
    }

    // Watch for workspace folder changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
            // Start servers for new folders
            for (const folder of event.added) {
                await startServerForFolder(context, folder);
            }

            // Stop servers for removed folders
            for (const folder of event.removed) {
                await stopServerForFolder(folder);
            }
        })
    );

    console.log('NovelSaga extension activated');
}

async function startServerForFolder(
    context: vscode.ExtensionContext,
    folder: vscode.WorkspaceFolder
): Promise<void> {
    const folderKey = folder.uri.toString();

    if (serverInstances.has(folderKey)) {
        console.log(`Server already running for ${folder.name}`);
        return;
    }

    console.log(`Starting server for workspace folder: ${folder.name}`);

    try {
        // Path to the native server binary
        const serverBinaryPath = path.join(
            context.extensionPath,
            'target/release/novelsaga_server'
        );

        // Run the native server directly
        const run: Executable = {
            command: serverBinaryPath,
            args: [],
            options: {
                cwd: folder.uri.fsPath,
                env: {
                    ...process.env,
                    WORKSPACE_FOLDER: folder.uri.fsPath,
                    RUST_LOG: 'debug',
                },
            },
        };

        // Client options - support txt and markdown files
        const clientOptions: LanguageClientOptions = {
            documentSelector: [
                {
                    scheme: 'file',
                    language: 'plaintext',
                    pattern: `${folder.uri.fsPath}/**/*.txt`,
                },
                {
                    scheme: 'file',
                    language: 'markdown',
                    pattern: `${folder.uri.fsPath}/**/*.md`,
                },
            ],
            workspaceFolder: folder,
            outputChannelName: `NovelSaga LSP (${folder.name})`,
        };

        // Create and start the language client
        const client = new LanguageClient(
            'novelsaga',
            `NovelSaga Language Server (${folder.name})`,
            run,
            clientOptions
        );

        await client.start();

        serverInstances.set(folderKey, { client, folder });
        console.log(`Server started successfully for ${folder.name}`);
    } catch (error) {
        console.error(`Failed to start server for ${folder.name}:`, error);
        void vscode.window.showErrorMessage(
            `Failed to start NovelSaga server for ${folder.name}: ${error}`
        );
    }
}

async function stopServerForFolder(
    folder: vscode.WorkspaceFolder
): Promise<void> {
    const folderKey = folder.uri.toString();
    const instance = serverInstances.get(folderKey);

    if (instance) {
        console.log(`Stopping server for ${folder.name}`);
        await instance.client.stop();
        serverInstances.delete(folderKey);
    }
}

export async function deactivate(): Promise<void> {
    console.log('NovelSaga extension deactivating...');

    // Stop all server instances
    const stopPromises: Promise<void>[] = [];
    for (const [, instance] of serverInstances) {
        stopPromises.push(instance.client.stop());
    }

    await Promise.all(stopPromises);
    serverInstances.clear();

    console.log('NovelSaga extension deactivated');
}
