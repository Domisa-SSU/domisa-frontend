export interface UserStatus {
    isRegistered: boolean;
    hasIntroduction: boolean;
}

export interface AuthMeResponse {
    publicId: string;
    cookies: number;
    status: UserStatus;
}
