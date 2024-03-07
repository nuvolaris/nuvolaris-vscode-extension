import { ValidatorAssertion } from "../interfaces";

export const Validators = {
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
  },
  isNotNullOrUndefined: (htmlElement: HTMLInputElement, fieldName: string | null = null): ValidatorAssertion => {
    let message = `Field '${fieldName || htmlElement.id}' should not be null or undefined.`;
    let isValid = htmlElement.value !== null && htmlElement.value !== undefined;
    return { isValid, message, htmlElement }
  },
  isNot: (htmlElement: HTMLInputElement, value: any, fieldName: string | null = null): ValidatorAssertion => {
    let message = `Field '${fieldName || htmlElement.id}' should not be ${value}.`;
    let isValid = htmlElement.value !== value;
    return { isValid, message, htmlElement }
  }

}

export function validateUsername(input: HTMLInputElement) {
  try {
    let fieldName = "Username";
    let assertions = [];
    let isNotEmpty = Validators.minChars(input, 1, fieldName);
    // let shouldBeMax12 = Validators.maxChars(input, 12, fieldName);
    assertions.push(isNotEmpty);
    // assertions.push(shouldBeMax12);
    createErrorMessages(assertions);
    return assertions.filter(a => !a.isValid).length === 0;
  } catch (error: any) {
    throw error;
  }

}

export function validatePassword(input: HTMLInputElement) {
  try {
    let fieldName = "Password";
    let assertions = [];
    let isNotEmpty = Validators.minChars(input, 1, fieldName);
    // let shouldBeMax30 = Validators.maxChars(input, 30, fieldName);
    assertions.push(isNotEmpty);
    // assertions.push(shouldBeMax30);
    createErrorMessages(assertions);
    return assertions.filter(a => !a.isValid).length === 0;
  } catch (error: any) {
    throw error;
  }
}

export function validateApiHost(input: HTMLInputElement) {
  try {
    let fieldName = "Api Host";
    let assertions = [];
    let isNotEmpty = Validators.minChars(input, 1, fieldName);
    /*if(shouldBeUrl.isValid && !/^https?:\/\//i.test(input.value)){
        input.value = "https://" + input.value;
    }*/
    assertions.push(isNotEmpty);
    createErrorMessages(assertions);
    return assertions.filter(a => !a.isValid).length === 0;
  } catch (error: any) {
    throw error;
  }
}


export function createErrorMessages(assertions: ValidatorAssertion[]) {
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
    throw error;
  }
}