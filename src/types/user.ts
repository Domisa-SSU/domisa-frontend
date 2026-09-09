export interface UserStatus {
    isRegistered: boolean;
    hasIntroduction: boolean;
    isProfileCompleted?: boolean;
}

export interface AuthMeResponse {
    publicId: string;
    cookies: number;
    status: UserStatus;
}
