import { Button, provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton());
const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

function main() {
  try {
    const submitButton = document.getElementById("login-submit") as Button;
    submitButton?.addEventListener("click", handleLoginSubmit)
    breakpoint("1");
  } catch (error: any) {
    breakpoint(error.toString());
    console.error(error);
    throw error;
  }
  // To get improved type annotations/IntelliSense the associated class for
  // a given toolkit component can be imported and used to type cast a reference
  // to the element (i.e. the `as Button` syntax)

}

function breakpoint(title: string) {
  const submitButton = document.getElementById("login-submit") as Button;
  submitButton.textContent = "Breakpoint " + title;
}

function handleLoginSubmit() {
  try {
    breakpoint("2");
    const username = document.getElementById('username') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const apiHost = document.getElementById('api-host') as HTMLInputElement;

    breakpoint("3");

    if (username.value.trim() && password.value.trim() && apiHost.value.trim()) {
      breakpoint("4A");
      vscode.postMessage({
        command: "login",
        username: `${username.value}`,
        password: `${password.value}`,
        apiHost: `${apiHost.value}`,
        text: `${username.value} ${password.value} ${apiHost.value} PASS`,
      });
      breakpoint("5A");
    } else {
      breakpoint("4B");
      vscode.postMessage({
        command: "login",
        text: `${username.value} ${password.value} ${apiHost.value} NOT PASS`,
      });
      breakpoint("5B");
    }
  } catch (error: any) {
    breakpoint(error?.toString());
    console.error(error);
    throw error;
  }
}