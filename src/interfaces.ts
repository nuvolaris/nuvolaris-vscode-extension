export interface NuvolarisLoginParams {
    nuvUser: string | undefined,
    nuvApiHost: string | undefined,
    nuvPassword: string | undefined
}

export interface ValidatorAssertion {
    isValid: boolean,
    message: string,
    htmlElement: HTMLElement
}