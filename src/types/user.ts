export interface UserStatus {
    isRegistered: boolean;
    hasIntroduction: boolean;
    isProfileCompleted: boolean;
}

export interface AuthMeResponse {
    userId: number;
    status: UserStatus;
}
