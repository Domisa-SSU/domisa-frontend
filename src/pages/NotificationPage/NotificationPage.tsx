import { useState } from "react";
import { useNavigate } from "react-router-dom";

import cookieIcon from "./assets/cookiesImg.png";
import NotLoginHeader from "../../components/NotLoginHeader";
import {
  animalNameByProfile,
  animalProfileImageMap,
} from "../../constants/animalProfile";
import {
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
} from "../../queries/notifications";
import type {
  Notification,
  RewardNotification,
  UserNotification,
} from "../../types/notification";

type NotificationGroup = {
  dateKey: string;
  dateLabel: string;
  items: Notification[];
};

const userNotificationSuffixByType: Record<UserNotification["type"], string> = {
  LIKE: "님이 나에게 호감을 보냈어요!",
  MATCH: "님과 쌍방 매칭 됐어요",
};

const rewardNotificationTextByType: Record<RewardNotification["type"], string> = {
  SIGNUP: "가입 보상으로 쿠키 3개 지급해드려요",
  REFERRAL: "내 친구가 가입했어요! 쿠키 2개 지급 완료",
};

const isUserNotification = (
  notification: Notification,
): notification is UserNotification =>
  notification.type === "LIKE" || notification.type === "MATCH";

const userNotificationDetailViewTypeByType: Record<UserNotification["type"], string> = {
  LIKE: "FAN",
  MATCH: "NORMAL",
};

const getDatingCardDetailPath = (notification: UserNotification) => {
  const searchParams = new URLSearchParams({
    viewType: userNotificationDetailViewTypeByType[notification.type],
  });

  return `/dating/cards/${encodeURIComponent(notification.targetUserId)}?${searchParams.toString()}`;
};

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const getDateKey = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const groupByDate = (notifications: Notification[]): NotificationGroup[] => {
  const sortedNotifications = [...notifications].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
  const groups: NotificationGroup[] = [];
  const seen = new Map<string, number>();

  for (const notification of sortedNotifications) {
    const dateKey = getDateKey(notification.createdAt);
    const groupIndex = seen.get(dateKey);

    if (groupIndex !== undefined) {
      groups[groupIndex].items.push(notification);
    } else {
      seen.set(dateKey, groups.length);
      groups.push({
        dateKey,
        dateLabel: formatDateLabel(notification.createdAt),
        items: [notification],
      });
    }
  }

  return groups;
};

function NewBadge() {
  return (
    <div className="flex size-[1.125rem] shrink-0 items-center justify-center rounded-[0.525rem] bg-warning pb-px">
      <span className="typo-comment-2 text-grey-100">n</span>
    </div>
  );
}

type UserNotificationItemProps = {
  notification: UserNotification;
  isPending: boolean;
  onClick: (notification: UserNotification) => void;
};

function UserNotificationItem({
  notification,
  isPending,
  onClick,
}: UserNotificationItemProps) {
  const textColor = notification.isRead ? "text-grey-900" : "text-primary-600";
  const animalName = animalNameByProfile[notification.animalProfile];

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => onClick(notification)}
      className={`flex h-[4.0625rem] w-full items-center gap-2.5 border-b border-grey-500 px-5 text-left disabled:cursor-default ${
        notification.isRead ? "bg-grey-100" : "bg-primary-100"
      }`}
    >
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[0.9375rem] bg-grey-300">
        <img
          src={animalProfileImageMap[notification.animalProfile]}
          alt={animalName}
          className="size-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <p className={`min-w-0 flex-1 truncate ${textColor}`}>
          <span className="typo-comment-1-b">{notification.personNickname}</span>
          <span className="typo-comment-1-m">
            {userNotificationSuffixByType[notification.type]}
          </span>
        </p>

        {!notification.isRead && <NewBadge />}
      </div>
    </button>
  );
}

type RewardNotificationItemProps = {
  notification: RewardNotification;
};

function RewardNotificationItem({ notification }: RewardNotificationItemProps) {
  return (
    <div className="flex h-[4.0625rem] items-center gap-[0.3125rem] border-b border-grey-500 bg-grey-100 px-5">
      <p className="min-w-0 truncate typo-comment-1-m text-grey-900">
        {rewardNotificationTextByType[notification.type]}
      </p>
      <img src={cookieIcon} alt="쿠키" className="size-[0.875rem] shrink-0" />
    </div>
  );
}

type NotificationStateMessageProps = {
  children: string;
};

function NotificationStateMessage({ children }: NotificationStateMessageProps) {
  return (
    <div className="flex min-h-[12rem] items-center justify-center px-5 text-center typo-comment-1-m text-grey-700">
      {children}
    </div>
  );
}

function NotificationPage() {
  const navigate = useNavigate();
  const [pendingNotificationId, setPendingNotificationId] = useState<number | null>(null);
  const { data, isPending, isError } = useNotificationsQuery();
  const markNotificationAsReadMutation = useMarkNotificationAsReadMutation();
  const groups = data ? groupByDate(data.notifications) : [];

  const handleUserNotificationClick = async (notification: UserNotification) => {
    if (pendingNotificationId !== null) {
      return;
    }

    const detailPath = getDatingCardDetailPath(notification);
    setPendingNotificationId(notification.notificationId);

    try {
      await markNotificationAsReadMutation.mutateAsync(notification.notificationId);
    } catch {
      // The detail page should still open even if marking as read fails.
    } finally {
      navigate(detailPath);
    }
  };

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="알림" />

      <div className="flex w-full flex-col gap-2.5 pt-2.5 sm:mx-auto sm:max-w-[25.1875rem]">
        {isPending && (
          <NotificationStateMessage>
            알림을 불러오고 있어요
          </NotificationStateMessage>
        )}

        {isError && (
          <NotificationStateMessage>
            알림을 불러올 수 없어요
          </NotificationStateMessage>
        )}

        {!isPending && !isError && groups.length === 0 && (
          <NotificationStateMessage>
            아직 도착한 알림이 없어요
          </NotificationStateMessage>
        )}

        {!isPending &&
          !isError &&
          groups.map(({ dateKey, dateLabel, items }) => (
            <div key={dateKey} className="flex flex-col">
              <div className="px-5 py-2.5">
                <span className="typo-comment-2 text-grey-700">{dateLabel}</span>
              </div>

              {items.map((notification) =>
                isUserNotification(notification) ? (
                  <UserNotificationItem
                    key={notification.notificationId}
                    notification={notification}
                    isPending={pendingNotificationId === notification.notificationId}
                    onClick={handleUserNotificationClick}
                  />
                ) : (
                  <RewardNotificationItem
                    key={notification.notificationId}
                    notification={notification}
                  />
                ),
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default NotificationPage;
