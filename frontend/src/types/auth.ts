export interface IRegisterData {
    login: string,
    email: string,
    password: string,
    confirmPassword: string
}

export interface ISignInData {
    loginOrEmail: string,
    password: string,
}


export interface IAuthState {
    user: IUserInfo | null,
    error: object | string | null,
    status: 'loading' | 'fulfilled' | 'rejected' | null,
    silentLoginStatus: 'loading' | 'fulfilled' | 'rejected' | null,
}

export interface ISignInResult {
    message: string,
    data: IUserInfo
}

export interface IUserInfo {
    email: string, 
    login: string,
    profilePicture: string,
    emailVerified: boolean
}

export interface IRestorePasswordData {
    newPassword: string;
    confirmPassword: string;
}
