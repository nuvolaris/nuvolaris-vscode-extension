import * as vscode from "vscode";
import { NuvolarisTerminalName } from "./constants";
import { LoginPanel } from "./login/LoginPanel";
import { CliCommands } from "./enumerators";
import { execSync } from "child_process";

let context: vscode.ExtensionContext;

export async function activate(ctx: vscode.ExtensionContext) {
  try {
    // Necessary for Theia compatibility of welcome screen. See https://github.com/eclipse-theia/theia/issues/9361
    vscode.window.registerTreeDataProvider(
      "command-palette",
      new EmptyTreeDataProvider()
    );
    //

    context = ctx;
    if (!isLoggedIn()) {
      LoginPanel.render(handleLogin, context.extensionUri);
    }

    Object.entries(CliCommands).forEach(([name, command]) =>
      context.subscriptions.push(
        vscode.commands.registerCommand(
          `nuvolaris.${name.toLowerCase()}`,
          () => {
            if (!isLoggedIn()) {
              LoginPanel.render(handleLogin, context.extensionUri);
              return;
            }
            launchTerminal(command);
          }
        )
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("nuvolaris.login", () => {
        LoginPanel.render(handleLogin, context.extensionUri);
      })
    );
  } catch (error: any) {
    printError(error);
    throw error;
  }
}

function isLoggedIn(): boolean {
  try {
    execSync("nuv -wsk namespace list");
    return true;
  } catch (error) {
    return false;
  }
}

function handleLogin(username: string, password: string, apiHost: string) {
  const loginOutput = vscode.window.createOutputChannel("Nuvolaris Login");
  loginOutput.show();
  try {
    loginOutput.appendLine("Launching login script...");
    const execLogin = execSync(
      `nuv ide login  "${username}" "${
        apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost
      }"`,
      {
        env: { ...process.env, NUV_PASSWORD: password },
      }
    );
    loginOutput.appendLine(execLogin.toString());
    printInfo(
      "You successfully logged in. You can now use the Nuvolaris command palette."
    );
  } catch (error: any) {
    loginOutput.appendLine(error);
    printError(
      "An error occurred in the login process. Check the output window for further details."
    );
    throw error;
  }
}

function launchTerminal(command: string): void {
  try {
    const terminal = vscode.window.createTerminal(NuvolarisTerminalName);
    terminal.show();
    terminal.sendText(command, true);
  } catch (error) {
    printError(error);
    throw error;
  }
}

function printError(error: any) {
  return vscode.window.showErrorMessage(error.toString());
}
function printInfo(info: string) {
  return vscode.window.showInformationMessage(info);
}

export function deactivate() {}

// Necessary for Theia compatibility of welcome screen. See https://github.com/eclipse-theia/theia/issues/9361
export class EmptyTreeDataProvider implements vscode.TreeDataProvider<any> {
  constructor() {}

  getTreeItem(element: any): vscode.TreeItem {
    return {};
  }

  getChildren(element?: any): Thenable<any[]> {
    return new Promise((resolve) => resolve([]));
  }
}
