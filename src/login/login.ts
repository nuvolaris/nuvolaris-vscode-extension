import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";
import { LoginPageIDs } from "../enumerators";
import { validateApiHost, validatePassword, validateUsername } from "../utilities/validate";
provideVSCodeDesignSystem().register(vsCodeButton());
const vscode = acquireVsCodeApi();
window.addEventListener("load", main);

const LoginPage = {
  getUsername: (): HTMLInputElement => { return document.getElementById(LoginPageIDs.Username) as HTMLInputElement },
  getPassword: (): HTMLInputElement => { return document.getElementById(LoginPageIDs.Password) as HTMLInputElement },
  getApiHost: (): HTMLInputElement => { return document.getElementById(LoginPageIDs.ApiHost) as HTMLInputElement },
  getLoginButton: (): HTMLButtonElement => { return document.getElementById(LoginPageIDs.LoginButton) as HTMLButtonElement }
}

function main() {
  try {
    LoginPage.getLoginButton()
      .addEventListener("click", handleLoginSubmit);

    LoginPage.getUsername()
      .addEventListener("input", validateLogin);

    LoginPage.getPassword()
      .addEventListener("input", validateLogin)
      
    LoginPage.getApiHost()
      .addEventListener("input", validateLogin);

  } catch (error: any) {
    sendError(error);
    throw error;
  }
}

function handleLoginSubmit() {
  try {
    const username = LoginPage.getUsername();
    const password = LoginPage.getPassword();
    const apiHost = LoginPage.getApiHost();

    validateLogin();
    if (validateLogin()) {
      vscode.postMessage({
        command: "login",
        username: `${username.value}`,
        password: `${password.value}`,
        apiHost: `${apiHost.value}`,
        text: `${username.value} ${password.value} ${apiHost.value} PASS`,
      });
    }
    else {
      vscode.postMessage({
        command: "login",
        text: `${username.value} ${password.value} ${apiHost.value} NOT PASS`,
      });
    }
  } catch (error: any) {
    sendError(error);
    throw error;
  }
}


function validateLogin() {
  try {
    const loginSubmitButton = LoginPage.getLoginButton();
    let isUsernameValid = validateUsername(LoginPage.getUsername());
    let isPasswordValid = validatePassword(LoginPage.getPassword());
    let isApiHostValid = validateApiHost(LoginPage.getApiHost());
    let isValid = isUsernameValid && isPasswordValid && isApiHostValid;
    loginSubmitButton.disabled = !isValid;
    return isValid;
  } catch (error: any) {
    sendError(error);
    throw error;
  }

}

function sendError(error: any) {
  return vscode.postMessage({
    type: "error",
    text: `Error occurred: ${error.toString()}`,
  });
}