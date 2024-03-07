import { provideVSCodeDesignSystem, vsCodeButton } from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton());
const vscode = acquireVsCodeApi();

interface ValidatorAssertion {
  isValid: boolean,
  message: string,
  htmlElement: HTMLElement
}

enum LoginPageIDs {
  username = "username-input",
  password = "password-input",
  apiHost = "api-host-input",
  loginButton = "login-button"
}

const LoginPage = {
  getUsername: (): HTMLInputElement => { return document.getElementById(LoginPageIDs.username) as HTMLInputElement },
  getPassword: (): HTMLInputElement => { return document.getElementById(LoginPageIDs.password) as HTMLInputElement },
  getApiHost: (): HTMLInputElement => { return document.getElementById(LoginPageIDs.apiHost) as HTMLInputElement },
  getLoginButton: (): HTMLButtonElement => { return document.getElementById(LoginPageIDs.loginButton) as HTMLButtonElement }
}


window.addEventListener("load", main);

function main() {
  try {
    const submitButton = LoginPage.getLoginButton();

    submitButton?.addEventListener("click", handleLoginSubmit)
    LoginPage.getUsername().addEventListener("change", validateLogin);
    LoginPage.getPassword().addEventListener("change", validateLogin);
    LoginPage.getApiHost().addEventListener("change", validateLogin);

  } catch (error: any) {
    console.error(error);
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
    /*else {
      vscode.postMessage({
        command: "login",
        text: `${username.value} ${password.value} ${apiHost.value} NOT PASS`,
      });
    }*/
  } catch (error: any) {
    console.error(error);
    sendError(error);
    throw error;
  }
}


const Validators = {
  minChars: (htmlElement: HTMLInputElement, min: number, fieldName: string | null = null): ValidatorAssertion => {
    let message = `Field '${fieldName || htmlElement.id}' should contain minimum ${min} chars.`
    let isValid = true;
    isValid = htmlElement.value.length >= min;
    return { isValid, message, htmlElement };
  },
  maxChars: (htmlElement: HTMLInputElement, max: number, fieldName: string | null = null): ValidatorAssertion => {
    let message = `Field '${fieldName || htmlElement.id}' should contain maximum ${max} chars.`
    let isValid = true;
    isValid = htmlElement.value.length <= max;
    return { isValid, message, htmlElement };
  },
  validUrl: (htmlElement: HTMLInputElement, fieldName: string | null = null): ValidatorAssertion => {
    let message = `Field '${fieldName || htmlElement.id}' should be a valid URL.`
    let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol (optional)
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // or IP address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path (optional)
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // anchor (optional)
    let isValid = pattern.test(htmlElement.value);
    return { isValid, message, htmlElement };
  }

}


function createErrorMessages(assertions: ValidatorAssertion[]) {
  try {
    assertions.forEach((assertion: ValidatorAssertion, i: number) => {
      let { htmlElement } = assertion;
      htmlElement.classList.remove("input-error");
      htmlElement.classList.add("input-success");

      let oldErrorMessageElements = Array.from(document.getElementsByClassName("error-message"));
      oldErrorMessageElements.forEach((errorMessageElement) => {
        if (errorMessageElement.id === `${htmlElement.id}-error-${i + 1}`) errorMessageElement.remove();
      })
    });

    assertions.filter(a => !a.isValid).forEach((assertion: ValidatorAssertion, i: number) => {
      let { htmlElement, message } = assertion;
      htmlElement.classList.add("input-error");
      htmlElement.classList.remove("input-success");

      let errorMessageElement = document.createElement("small");
      errorMessageElement.id = `${htmlElement.id}-error-${i + 1}`;
      errorMessageElement.classList.add("error-message");

      errorMessageElement.textContent = message;
      htmlElement.parentNode?.insertBefore(errorMessageElement, htmlElement);
    })
  } catch (error: any) {
    sendError(error);
    throw error;
  }
}

function validateUsername() {
  try {
    let fieldName = "Username";
    let input = LoginPage.getUsername();
    let assertions = [];
    let isNotEmpty = Validators.minChars(input, 1, fieldName);
    // let shouldBeMax12 = Validators.maxChars(input, 12, fieldName);
    assertions.push(isNotEmpty);
    // assertions.push(shouldBeMax12);
    createErrorMessages(assertions);
    return assertions.filter(a => !a.isValid).length === 0;
  } catch (error: any) {
    sendError(error);
    throw error;
  }

}

function validatePassword() {
  try {
    let fieldName = "Password";
    let input = LoginPage.getPassword();
    let assertions = [];
    let isNotEmpty = Validators.minChars(input, 1, fieldName);
    // let shouldBeMax30 = Validators.maxChars(input, 30, fieldName);
    assertions.push(isNotEmpty);
    // assertions.push(shouldBeMax30);
    createErrorMessages(assertions);
    return assertions.filter(a => !a.isValid).length === 0;
  } catch (error: any) {
    sendError(error);
    throw error;
  }
}

function validateApiHost() {
  try {
    let fieldName = "Api Host";
    let input = LoginPage.getApiHost();
    let assertions = [];
    let isNotEmpty = Validators.minChars(input, 1, fieldName);
    /*if(shouldBeUrl.isValid && !/^https?:\/\//i.test(input.value)){
        input.value = "https://" + input.value;
    }*/
    assertions.push(isNotEmpty);
    createErrorMessages(assertions);
    return assertions.filter(a => !a.isValid).length === 0;
  } catch (error: any) {
    sendError(error);
    throw error;
  }

}

function validateLogin() {
  try {
    const loginSubmitButton = LoginPage.getLoginButton();
    let isUsernameValid = validateUsername();
    let isPasswordValid = validatePassword();
    let isApiHostValid = validateApiHost();

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
    text: `Si è verificato un errore: ${error.toString()}`,
  });
}