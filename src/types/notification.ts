export type NotificationType =
  | "LIKE"
  | "MATCH"
  | "INTRODUCTION"
  | "COOKIE"
  | "REFERRAL"
  | "EVENT";

export type Notification = {
  notificationId: number;
  userId: number;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: Notification[];
};