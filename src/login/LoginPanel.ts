
import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export class LoginPanel {
  public static currentPanel: LoginPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._setWebviewMessageListener(this._panel.webview);
    // this._panel.webview.onDidReceiveMessage(message => {
    //   switch (message.command) {
    //     case 'login':
    //       // Handle login form submission
    //       const { username, password, apiHost } = message;
    //       console.log('Submitted login details:', username, password, apiHost);
    //       // Pass the login details back to the extension
    //       if (this._onLoginCallback) {
    //         this._onLoginCallback(username, password, apiHost);
    //       }
    //       break;
    //   }
    // }, undefined, this._disposables);
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;

        switch (command) {
          case "login":
            // Handle login form submission
            const { username, password, apiHost } = message;
            // Pass the login details back to the extension
            if (this._onLoginCallback && username && password && apiHost) {
              this._onLoginCallback(username, password, apiHost);
            }
            break;
        }
      },
      undefined,
      this._disposables
    );
  }
  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    const webviewUri = getUri(webview, extensionUri, ["out", "login.js"]);
    const nonce = getNonce();
    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'self';">-->
        <title>Nuvolaris - Login!</title>
        <style>
            body {
              font-family: Arial, sans-serif;
              background-color: transparent;
              padding: 20px;
            }
            .login-container {
              max-width: 400px;
              margin: 0 auto;
              background-color: #1da1ce;
              border-radius: 5px;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .login-container h2 {
              text-align: center;
            }
            .login-form {
              display: flex;
              flex-direction: column;
            }
            .login-form input {
              margin-bottom: 10px;
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 3px;
            }
            .login-form vscode-button {
              padding: 10px;
              background-color: #ffa944;
              color: #fff;
              border: none;
              border-radius: 3px;
              cursor: pointer;
              font-weight: bolder;
            }
            .logo-img {
              background-color: #1da1ce;
            }
            .input-error {
              border: 2px solid red !important;
            }
            .input-success {
              border: 2px solid green !important;
            }
            .error-message {
              color: #ffa944;
              font-size: 0.8em;
              font-weight: 900;
            }
          </style>
      </head>
      <body> 
        <div class="login-container">
        <img src="https://assets-global.website-files.com/64b64691257b91236b0e7482/64bfcab6bd343008e30e5d06_Nuvolaris%20logo%20white.png" class="logo-img"></img>
        <h2>Login</h2>
        <form class="login-form" id="login-form">
          <input type="text" id="username-input" placeholder="Username">
          <input type="password" id="password-input" placeholder="Password">
          <input type="text" id="api-host-input" placeholder="API Host URL" value="https://nuvolaris.dev">
          <vscode-button id="login-button" type="submit" > L O G I N </vscode-button>
        </form>
        </div>
        <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
      </body>
    </html>
  `;
  }
  private _onLoginCallback: ((username: string, password: string, apiHost: string) => void) | undefined;
  public static render(onLogin: (username: string, password: string, apiHost: string) => void, extensionUri: vscode.Uri) {
    if (LoginPanel.currentPanel) {
      LoginPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel("login-panel", "Login", vscode.ViewColumn.One, {
        enableScripts: true,
        // Restrict the webview to only load resources from the `out` directory
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'out')]
      });
      LoginPanel.currentPanel = new LoginPanel(panel, extensionUri);
    }
    LoginPanel.currentPanel._onLoginCallback = onLogin;
  }

  public dispose() {
    LoginPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
