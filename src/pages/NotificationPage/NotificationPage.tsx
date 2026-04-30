import cookieIllerst from "../../assets/cookieIllerst.png";
import NotLoginHeader from "../../components/NotLoginHeader";
import type { Notification, NotificationType } from "../../types/notification";

// TODO: API 연동 시 교체
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    notificationId: 1,
    userId: 1,
    type: "LIKE",
    title: "새로운 호감이 도착했어요",
    content: "개구쟁이님이 나에게 호감을 보냈어요!",
    isRead: false,
    createdAt: "2026-04-29T14:30:00",
  },
  {
    notificationId: 2,
    userId: 1,
    type: "MATCH",
    title: "쌍방 매칭이 됐어요",
    content: "코개구리님과 쌍방 매칭 됐어요",
    isRead: false,
    createdAt: "2026-04-29T13:00:00",
  },
  {
    notificationId: 3,
    userId: 1,
    type: "COOKIE",
    title: "쿠키 지급",
    content: "친구가 추천인 코드로 가입했어요! 쿠키 10개 지급 완료",
    isRead: true,
    createdAt: "2026-04-29T10:00:00",
  },
  {
    notificationId: 4,
    userId: 1,
    type: "EVENT",
    title: "이벤트 쿠키 지급",
    content: "축제 이벤트 쿠키 1개 지급 완료",
    isRead: true,
    createdAt: "2026-04-29T09:00:00",
  },
  {
    notificationId: 5,
    userId: 1,
    type: "LIKE",
    title: "새로운 호감이 도착했어요",
    content: "레모나셔님이 나에게 호감을 보냈어요!",
    isRead: true,
    createdAt: "2026-04-28T18:00:00",
  },
  {
    notificationId: 6,
    userId: 1,
    type: "INTRODUCTION",
    title: "소개서가 도착했어요",
    content: "금보리차님이 나에게 호감을 보냈어요!",
    isRead: true,
    createdAt: "2026-04-28T15:00:00",
  },
  {
    notificationId: 7,
    userId: 1,
    type: "REFERRAL",
    title: "가입 보상",
    content: "가입 보상으로 쿠키 3개 지급해드려요",
    isRead: true,
    createdAt: "2026-04-28T12:00:00",
  },
];

const USER_NOTIFICATION_TYPES: NotificationType[] = ["LIKE", "MATCH", "INTRODUCTION"];

const isUserNotification = (type: NotificationType) =>
  USER_NOTIFICATION_TYPES.includes(type);

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const getDateKey = (dateStr: string) => dateStr.slice(0, 10); // "YYYY-MM-DD"

const groupByDate = (notifications: Notification[]) => {
  const groups: { dateLabel: string; items: Notification[] }[] = [];
  const seen = new Map<string, number>();

  for (const n of notifications) {
    const key = getDateKey(n.createdAt);
    if (seen.has(key)) {
      groups[seen.get(key)!].items.push(n);
    } else {
      seen.set(key, groups.length);
      groups.push({ dateLabel: formatDateLabel(n.createdAt), items: [n] });
    }
  }

  return groups;
};

type UserNotificationItemProps = {
  notification: Notification;
};

function UserNotificationItem({ notification }: UserNotificationItemProps) {
  const { content, isRead } = notification;

  return (
    <div
      className={`flex h-[4.0625rem] items-center gap-2.5 border-b border-grey-500 px-5 ${
        isRead ? "bg-grey-100" : "bg-primary-100"
      }`}
    >
      {/* 아바타 플레이스홀더 */}
      <div className="size-12 shrink-0 rounded-[0.9375rem] bg-grey-300" />

      <div className="flex flex-1 items-center justify-between">
        <span
          className={`typo-comment-1-m ${
            isRead ? "text-grey-900" : "text-primary-600"
          }`}
        >
          {content}
        </span>

        {!isRead && (
          <div className="flex size-[1.125rem] shrink-0 items-center justify-center rounded-[0.525rem] bg-warning">
            <span className="typo-comment-2 text-grey-100">N</span>
          </div>
        )}
      </div>
    </div>
  );
}

type SystemNotificationItemProps = {
  notification: Notification;
};

function SystemNotificationItem({ notification }: SystemNotificationItemProps) {
  const { content, isRead } = notification;

  return (
    <div
      className={`flex h-[4.0625rem] items-center justify-between gap-[0.3125rem] border-b border-grey-500 px-5 ${
        isRead ? "bg-grey-100" : "bg-primary-100"
      }`}
    >
      <span className={`typo-comment-1-m ${isRead ? "text-grey-900" : "text-primary-600"}`}>
        {content}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <img src={cookieIllerst} alt="쿠키" className="size-[0.9rem]" />
        {!isRead && (
          <div className="flex size-[1.125rem] items-center justify-center rounded-[0.525rem] bg-warning">
            <span className="typo-comment-2 text-grey-100">N</span>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationPage() {
  const groups = groupByDate(MOCK_NOTIFICATIONS);

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="알림" />

      <div className="mx-auto w-full max-w-[22.6875rem] flex flex-col gap-2.5 pt-2.5">
        {groups.map(({ dateLabel, items }) => (
          <div key={dateLabel} className="flex flex-col">
            <div className="px-5 py-2.5">
              <span className="typo-comment-2 text-grey-700">{dateLabel}</span>
            </div>

            {items.map((notification) =>
              isUserNotification(notification.type) ? (
                <UserNotificationItem
                  key={notification.notificationId}
                  notification={notification}
                />
              ) : (
                <SystemNotificationItem
                  key={notification.notificationId}
                  notification={notification}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationPage;
