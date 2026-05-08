import { apiClient } from "./client";
import type { AnimalProfile } from "./users";
import type {
  ActiveNotificationsResponse,
  Notification,
  NotificationType,
  NotificationsResponse,
  RewardNotificationType,
  UserNotificationType,
} from "../types/notification";

const userNotificationTypes: readonly UserNotificationType[] = ["LIKE", "MATCH"];
const rewardNotificationTypes: readonly RewardNotificationType[] = ["SIGNUP", "REFERRAL"];
const notificationTypes: readonly NotificationType[] = [
  ...userNotificationTypes,
  ...rewardNotificationTypes,
];

const animalProfiles: readonly AnimalProfile[] = [
  "DOG",
  "CAT",
  "BEAR",
  "SLOTH",
  "HAMSTER",
  "WOLF",
  "RABBIT",
  "DEER",
  "OTTER",
  "ALPACA",
  "FOX",
  "CAPYBARA",
];

const isNotificationType = (value: unknown): value is NotificationType =>
  typeof value === "string" && notificationTypes.includes(value as NotificationType);

const isUserNotificationType = (type: NotificationType): type is UserNotificationType =>
  userNotificationTypes.includes(type as UserNotificationType);

const isAnimalProfile = (value: unknown): value is AnimalProfile =>
  typeof value === "string" && animalProfiles.includes(value as AnimalProfile);

const isNullableString = (value: unknown): value is string | null =>
  typeof value === "string" || value === null;

const isValidDateString = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value));

const isNotification = (value: unknown): value is Notification => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const notification = value as Record<string, unknown>;

  if (
    typeof notification.notificationId !== "number" ||
    typeof notification.publicId !== "string" ||
    !isNotificationType(notification.type) ||
    typeof notification.isRead !== "boolean" ||
    !isValidDateString(notification.createdAt)
  ) {
    return false;
  }

  if (isUserNotificationType(notification.type)) {
    return (
      typeof notification.targetUserId === "string" &&
      isAnimalProfile(notification.animalProfile) &&
      typeof notification.personNickname === "string"
    );
  }

  return (
    isNullableString(notification.targetUserId) &&
    (isAnimalProfile(notification.animalProfile) || notification.animalProfile === null) &&
    isNullableString(notification.personNickname)
  );
};

const isNotificationsResponse = (value: unknown): value is NotificationsResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return Array.isArray(response.notifications) && response.notifications.every(isNotification);
};

const isActiveNotificationsResponse = (
  value: unknown,
): value is ActiveNotificationsResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.signup === "boolean" &&
    typeof response.referralCount === "number" &&
    Number.isInteger(response.referralCount) &&
    response.referralCount >= 0 &&
    typeof response.like === "boolean" &&
    typeof response.match === "boolean"
  );
};

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const { data } = await apiClient.get<unknown>("/api/notifications");

  if (!isNotificationsResponse(data)) {
    throw new Error("Invalid notifications response");
  }

  return data;
};

export const getActiveNotifications =
  async (): Promise<ActiveNotificationsResponse> => {
    const { data } = await apiClient.get<unknown>("/api/notifications/active");

    if (!isActiveNotificationsResponse(data)) {
      throw new Error("Invalid active notifications response");
    }

    return data;
  };

export const markNotificationAsRead = async (notificationId: number) => {
  await apiClient.post<void>(
    `/api/notifications/${encodeURIComponent(notificationId)}`,
  );
};
