export enum COMMANDS {
    DEPLOY = "nuv ide deploy",
    DEVEL = "nuv ide devel"
}

export interface NuvolarisLoginParams {
    nuvUser: string | undefined,
    nuvApiHost: string | undefined,
    nuvPassword: string | undefined
}