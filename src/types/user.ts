export interface UserStatus {
    isRegistered: boolean;
    hasIntroduction: boolean;
    isProfileCompleted: boolean;
}

export interface AuthMeResponse {
    userId: number;
    cookieCount: number;
    status: UserStatus;
}
