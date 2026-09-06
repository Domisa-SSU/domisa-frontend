import dayBgImg from "../assets/homePageDayBackGround.jpg";
import nightBgImg from "../assets/homePageNightBackGround.jpg";
import Header from "../components/homePageHeader";
import MessageSlider from "../components/MessageSlider";
import logo from "../assets/domisaLogo.png";
import dogCatCoupleImg from "../assets/dogCatCoupleIcon.png";
import introduceLetterImg from "../assets/IntroduceLetterIcon.png";
import cookieOneImg from "../assets/cookieIconOne.png";
import cookieTwoImg from "../assets/cookieIconTwo.png";
import CardArrowIcon from "../assets/cardArrowIcon.svg?react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatingMatchCount } from "../api/datingHome";
import AlarmModal from "../components/AlarmModal";
import { useAuthMeQuery } from "../queries/auth";
import {
  useActiveNotificationsQuery,
  useNotificationStatusQuery,
} from "../queries/notifications";
import { useIsBlacklistedUser } from "../stores/blacklistedUserStore";
import type {
  ActiveNotificationsResponse,
  NotificationType,
} from "../types/notification";

const datingMatchCountQueryKey = ["dating", "count"] as const;
const fallbackMatchCount = 21;
const homeServiceClosingNoticeStorageKey =
  "domisa-home-service-closing-notice-seen";

type HomeOneTimeNoticeType = "serviceClosing";

type HomeTheme = "day" | "night";

const getThemeByTime = (): HomeTheme => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? `day` : `night`;
};

const buildActiveNotificationQueue = (
  activeNotifications: ActiveNotificationsResponse,
): NotificationType[] => {
  const queue: NotificationType[] = [];

  if (activeNotifications.signup) {
    queue.push("SIGNUP");
  }

  for (let index = 0; index < activeNotifications.referralCount; index += 1) {
    queue.push("REFERRAL");
  }

  if (activeNotifications.like) {
    queue.push("LIKE");
  }

  if (activeNotifications.match) {
    queue.push("MATCH");
  }

  return queue;
};

const userNotificationModalTypes: readonly NotificationType[] = [
  "LIKE",
  "MATCH",
];

const homeOneTimeNoticeStorageKeys: Record<HomeOneTimeNoticeType, string> = {
  serviceClosing: homeServiceClosingNoticeStorageKey,
};

const homeOneTimeNoticeOrder: readonly HomeOneTimeNoticeType[] = [
  "serviceClosing",
];

const hasSeenHomeOneTimeNotice = (type: HomeOneTimeNoticeType) => {
  try {
    return localStorage.getItem(homeOneTimeNoticeStorageKeys[type]) === "true";
  } catch {
    return false;
  }
};

const storeHomeOneTimeNoticeSeen = (type: HomeOneTimeNoticeType) => {
  try {
    localStorage.setItem(homeOneTimeNoticeStorageKeys[type], "true");
  } catch {
    // Ignore storage failures so the modal can still be dismissed in memory.
  }
};

const getNextHomeOneTimeNotice = () =>
  homeOneTimeNoticeOrder.find((type) => !hasSeenHomeOneTimeNotice(type)) ?? null;

const getNextHomeOneTimeNoticeAfter = (currentType: HomeOneTimeNoticeType) => {
  const currentIndex = homeOneTimeNoticeOrder.indexOf(currentType);
  return (
    homeOneTimeNoticeOrder
      .slice(currentIndex + 1)
      .find((type) => !hasSeenHomeOneTimeNotice(type)) ?? null
  );
};

type HomeOneTimeNoticeModalProps = {
  type: HomeOneTimeNoticeType;
  onConfirm: () => void;
};

function HomeOneTimeNoticeModal({
  type,
  onConfirm,
}: HomeOneTimeNoticeModalProps) {
  const titleId = `home-${type}-notice-title`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-[calc(100%-2.5rem)] max-w-[21.25rem] flex-col items-center justify-center gap-[1.875rem] rounded-[0.875rem] bg-grey-100 pb-5 pt-10"
      >
        <div className="flex flex-col items-center gap-[0.9375rem]">
          <p className="typo-input-text-m text-center text-grey-700">
            공지
          </p>
          <div
            id={titleId}
            className="typo-subtitle-header-2 text-center text-grey-900"
          >
            서비스가 곧 종료돼요
          </div>
          <div className="typo-button-text text-center text-warning-ac">
            <p>5/17(일) 오전 0시 이후</p>
            <p>운영이 종료되어 이용이 불가능해요</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="flex h-[3.125rem] w-[calc(100%-2.5rem)] max-w-[18.75rem] shrink-0 items-center justify-center rounded-[0.875rem] bg-grey-400 typo-button-text-b text-grey-800"
        >
          확인했어요
        </button>
      </div>
    </div>
  );
}

function HomePage() {
  const [theme] = useState(getThemeByTime());
  const [currentHomeOneTimeNotice, setCurrentHomeOneTimeNotice] = useState(
    getNextHomeOneTimeNotice,
  );
  const [activeNotificationQueue, setActiveNotificationQueue] = useState<
    NotificationType[]
  >([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: authMe, isPending: isAuthMePending } = useAuthMeQuery();
  const isBlacklistedUser = useIsBlacklistedUser();
  const { data: activeNotifications } = useActiveNotificationsQuery(
    Boolean(authMe),
  );
  const { data: notificationStatus } = useNotificationStatusQuery(
    Boolean(authMe),
  );
  const { data: matchCountData } = useQuery({
    queryKey: datingMatchCountQueryKey,
    queryFn: getDatingMatchCount,
    enabled: !isAuthMePending && !isBlacklistedUser,
    retry: false,
  });
  const status = authMe?.status;
  const matchCount = matchCountData?.matchCount ?? fallbackMatchCount;
  const currentActiveNotificationType = activeNotificationQueue[0] ?? null;
  const backgroundImg = theme === "day" ? dayBgImg : nightBgImg;

  useEffect(() => {
    const nextQueue =
      authMe && activeNotifications
        ? buildActiveNotificationQueue(activeNotifications)
        : [];
    const frameId = window.requestAnimationFrame(() => {
      setActiveNotificationQueue(nextQueue);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeNotifications, authMe]);

  const handleDatingClick = () => {
    const flowOrigin = {
      from: `${location.pathname}${location.search}${location.hash}`,
    };
    const searchParams = new URLSearchParams({
      returnTo: "/dating/register",
    });

    if (!authMe) {
      navigate(`/auth?${searchParams.toString()}`, { state: flowOrigin });
      return;
    }

    if (status?.isRegistered === false) {
      navigate(`/auth/signup?${searchParams.toString()}`, { state: flowOrigin });
      return;
    }

    if (status?.isProfileCompleted !== true) {
      navigate("/dating/register", { state: flowOrigin });
      return;
    }

    if (status?.hasIntroduction !== true) {
      navigate("/dating/require-introduce");
      return;
    }

    navigate("/dating");
  };
  const dismissActiveNotification = () => {
    setActiveNotificationQueue((queue) => queue.slice(1));
  };

  const handleActiveNotificationConfirm = () => {
    if (!currentActiveNotificationType) {
      return;
    }

    dismissActiveNotification();

    if (userNotificationModalTypes.includes(currentActiveNotificationType)) {
      navigate("/notifications");
    }
  };

  const handleHomeOneTimeNoticeConfirm = () => {
    if (!currentHomeOneTimeNotice) {
      return;
    }

    storeHomeOneTimeNoticeSeen(currentHomeOneTimeNotice);
    setCurrentHomeOneTimeNotice(
      getNextHomeOneTimeNoticeAfter(currentHomeOneTimeNotice),
    );
  };

  return (
    <div
      className="flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundColor: theme === "day" ? "#bfe3f7" : "#f7cfd6",
      }}
    >
      <MessageSlider></MessageSlider>

      <section className="relative flex flex-1 flex-col">
        <Header
          dayText="text-grey-700"
          isLoggedIn={Boolean(authMe)}
          theme={theme}
          unreadCount={notificationStatus?.unreadCount ?? 0}
        ></Header>

        <div className="mt-[1.1875rem] flex flex-col items-center gap-4">
          <img src={logo} alt="도미사럽" className="w-[14.1875rem]" />
          <div className="flex items-center gap-0.5">
            <span className="typo-comment-1 text-grey-900/50">
              현재 매칭된 커플
            </span>
            <div className="inline-flex h-5 min-w-5 items-center justify-center rounded-[0.9375rem] bg-[#fffcf0] px-[0.1875rem] typo-comment-1-b text-[#ad221e]">
              {matchCount}
            </div>
            <span className="typo-comment-1 text-grey-900/50">쌍!</span>
          </div>
        </div>

        <div className="mt-[1.875rem] flex flex-col items-center gap-2.5 px-5">
          <button
            type="button"
            onClick={handleDatingClick}
            className="bg-home-dating-card relative flex h-[6.375rem] w-full items-center justify-between rounded-[1.875rem] px-[1.5625rem]"
          >
            <span className="flex flex-col items-start gap-1.5 whitespace-nowrap">
              <span className="typo-card-title text-[#ec1479]">소개팅 하기</span>
              <span className="typo-comment-1 leading-[0.875rem] text-[#fe77b0]">
                이번 가을 축제에 CC 되기
              </span>
            </span>
            <CardArrowIcon className="shrink-0 text-[#e7718f]" />
            <span className="pointer-events-none absolute right-[4.375rem] top-[1.375rem] block h-[4.875rem] w-[6.625rem] overflow-hidden">
              <img
                src={dogCatCoupleImg}
                alt=""
                className="absolute left-[-2.05%] top-[-16.77%] h-[138.06%] w-[102.05%] max-w-none"
              />
            </span>
            <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-4px_4px_0_rgba(255,144,195,0.8),inset_0_0_0_2px_#ffe9f1]" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/introduce-friend")}
            className="bg-home-friend-card relative flex h-[6.375rem] w-full items-center justify-between rounded-[1.875rem] px-[1.5625rem]"
          >
            <span className="flex flex-col items-start gap-1.5 whitespace-nowrap">
              <span className="typo-card-title text-[#217bb3]">친구 소개하기</span>
              <span className="typo-comment-1 leading-[0.875rem] text-[#4cb3f2]">
                친구가 가입하면 쿠키 2개 지급
              </span>
            </span>
            <CardArrowIcon className="shrink-0 text-[#83b9d3]" />
            <span className="pointer-events-none absolute right-[3.1875rem] top-[0.25rem] block h-24 w-[7.4375rem]">
              <span className="absolute left-0 top-0 block h-24 w-[7.4375rem] overflow-hidden">
                <img
                  src={introduceLetterImg}
                  alt=""
                  className="absolute left-[-80.36%] top-[1.48%] h-[137.46%] w-[188.42%] max-w-none"
                />
              </span>
              <span className="absolute left-[4.1875rem] top-[2.8125rem] block h-[2.25rem] w-[2.125rem] overflow-hidden">
                <img
                  src={cookieOneImg}
                  alt=""
                  className="absolute left-[-12.82%] top-[-22.42%] h-[145.16%] w-[126.76%] max-w-none"
                />
              </span>
              <img
                src={cookieTwoImg}
                alt=""
                className="absolute left-[5.25rem] top-[3.625rem] h-[2.0625rem] w-[1.9375rem] rotate-180"
              />
            </span>
            <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-4px_4px_0_rgba(91,184,224,0.8),inset_0_0_0_2px_#d3f1ff]" />
          </button>
        </div>

        <div className="mt-auto flex flex-col items-center gap-2 pb-[6%] whitespace-nowrap">
          <div className="flex items-center justify-center gap-1 typo-comment-2 text-grey-700">
            <a
              href="https://jungle-friend-b65.notion.site/35a755591c5c80abbde1c17845ec516f"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              이용약관
            </a>
            <span>・</span>
            <a
              href="https://jungle-friend-b65.notion.site/35a755591c5c80008b96e1b0805a5619?pvs=73"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              개인정보처리방침
            </a>
          </div>
        </div>
      </section>
      {currentHomeOneTimeNotice ? (
        <HomeOneTimeNoticeModal
          type={currentHomeOneTimeNotice}
          onConfirm={handleHomeOneTimeNoticeConfirm}
        />
      ) : currentActiveNotificationType ? (
        <AlarmModal
          type={currentActiveNotificationType}
          onClose={dismissActiveNotification}
          onConfirm={handleActiveNotificationConfirm}
        />
      ) : null}
      <MessageSlider></MessageSlider>
    </div>
  );
}

export default HomePage;
