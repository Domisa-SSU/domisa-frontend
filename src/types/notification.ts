import type { AnimalProfile } from "../api/users";

export type UserNotificationType = "LIKE" | "MATCH";

export type RewardNotificationType = "SIGNUP" | "REFERRAL";

export type NotificationType = UserNotificationType | RewardNotificationType;

type NotificationBase = {
  notificationId: number;
  publicId: string;
  isRead: boolean;
  createdAt: string;
};

export type UserNotification = NotificationBase & {
  type: UserNotificationType;
  targetUserId: string;
  animalProfile: AnimalProfile;
  personNickname: string;
};

export type RewardNotification = NotificationBase & {
  type: RewardNotificationType;
  targetUserId: string | null;
  animalProfile: AnimalProfile | null;
  personNickname: string | null;
};

export type Notification = UserNotification | RewardNotification;

export type NotificationsResponse = {
  notifications: Notification[];
};

export type ActiveNotificationsResponse = {
  signup: boolean;
  referralCount: number;
  like: boolean;
  match: boolean;
};
