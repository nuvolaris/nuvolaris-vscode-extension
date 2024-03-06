import { Button, provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton());


const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  // To get improved type annotations/IntelliSense the associated class for
  // a given toolkit component can be imported and used to type cast a reference
  // to the element (i.e. the `as Button` syntax)
  const submitButton = document.getElementById("login-submit") as Button;

  submitButton?.addEventListener("click", handleLoginSubmit)
}

function handleLoginSubmit() {
  const username = document.getElementById('username') as HTMLInputElement;
  const password = document.getElementById('password') as HTMLInputElement;
  const apiHost = document.getElementById('apiHost') as HTMLInputElement;

  let credentials = {
    username: username,
    password: password,
    apiHost: apiHost
  }
  if (username.value && password.value && apiHost.value) {
    vscode.postMessage({
      command: "login",
      username: `${username.value}`,
      password: `${password.value}`,
      apiHost: `${apiHost.value}`,
      text: `${username.value} ${password.value} ${apiHost.value} PASS`,
    });
  } else {
    vscode.postMessage({
      command: "login",
      text: `${username.value} ${password.value} ${apiHost.value} NOT PASS`,
    });
  }

}