export interface UserStatus {
    isRegistered: boolean;
    hasIntroduction: boolean;
    isProfileCompleted: boolean;
}

export interface AuthMeResponse {
    userId: string;
    cookies: number;
    status: UserStatus;
}
