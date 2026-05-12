import dayBgImg from "../assets/homePageDayBackGround.jpg";
import nightBgImg from "../assets/homePageNightBackGround.jpg";
import Header from "../components/homePageHeader";
import MessageSlider from "../components/MessageSlider";
import logo from "../assets/domisaLogo.png";
import dogImg from "../assets/dogIcon.png";
import heartImg from "../assets/domisaHeartIcon.png";
import catImg from "../assets/catIcon.png";
import dayMapImg from "../assets/dayMapIcon.png";
import nightMapImg from "../assets/nightMapIcon.png";
import arrowImg from "../assets/arrowIcon.svg";
import flowerIcon from "../assets/flowerIcon.svg";
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

function HomePage() {
  const [theme] = useState(getThemeByTime());
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
  const mapImg = theme === "day" ? dayMapImg : nightMapImg;
  const currentActiveNotificationType = activeNotificationQueue[0] ?? null;

  const themeClasses =
    theme == "day"
      ? {
          text: "text-grey-700",
          dateCard: "bg-home-date-day",
          mapCard: "bg-home-map-day",
          buttonTextColor: "text-primary-700",
          inviteCard: "bg-home-friend-day",
          coupleTextBackGround: "bg-primary-200",
        }
      : {
          text: "text-grey-500",
          dateCard: "bg-home-date-night",
          mapCard: "bg-home-map-night",
          buttonTextColor: "text-grey-100",
          inviteCard: "bg-home-friend-night",
          coupleTextBackGround: "bg-grey-100",
        };

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

  return (
    <div
      className="flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-center bg-cover bg-no-repeat
    "
      style={{
        backgroundImage: `url(${theme == `day` ? dayBgImg : nightBgImg})`,
        backgroundColor: theme == "day" ? "#f5dce7" : "#123d41",
      }}
    >
      <MessageSlider></MessageSlider>

      <section className="relative flex flex-1 flex-col">
        <Header
          dayText={themeClasses.text}
          isLoggedIn={Boolean(authMe)}
          theme={theme}
          unreadCount={notificationStatus?.unreadCount ?? 0}
        ></Header>
        <div className="mb-5"></div>
        <div className="flex flex-col items-center gap-4 mb-8">
          <img src={logo} alt="" className="w-[13.4rem]" />
          <div className="flex items-center gap-0.5">
            <span className={`${themeClasses.text} typo-comment-1`}>
              현재 매칭된 커플
            </span>
            <div className={`${themeClasses.coupleTextBackGround} inline-flex h-5 min-w-5 items-center justify-center rounded-[0.9375rem] px-[0.1875rem] typo-comment-1-b text-primary-600`}>
              {matchCount}
            </div>
            <span className={`${themeClasses.text} typo-comment-1`}>쌍!</span>
          </div>
        </div>
        <div className="flex justify-center gap-2.5 mb-12">
          <button
            type="button"
            onClick={handleDatingClick}
            className={`w-44 h-37.5 flex flex-col justify-between items-center ${themeClasses.dateCard} rounded-xl py-5 shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.25)]`}
          >
            <div className="gap-1 flex flex-col">
              <span
                className={`typo-title-header-1-b ${themeClasses.buttonTextColor} mb-1`}
              >
                소개팅 하기
              </span>
              <span className={`${themeClasses.text} typo-comment-2`}>
                이번 봄축제에 CC 되기
              </span>
            </div>
            <div className="flex items-center">
              <img src={dogImg} alt="" className="w-auto h-12" />
              <img
                src={heartImg}
                alt=""
                className="w-[1.61rem] h-[1.61rem] mr-1"
              />
              <img src={catImg} alt="" className="w-auto h-11.4" />
            </div>
          </button>
          <button onClick={() => navigate("/night-booth")} className={`w-44 h-37.5 flex flex-col justify-between items-center ${themeClasses.mapCard} rounded-xl py-5 shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.25)]`}>
            <div className="gap-1 flex flex-col">
              <span className="typo-title-header-1-b text-grey-100 mb-1">
                주점정보
              </span>
              <span className={`${themeClasses.text} typo-comment-2`}>
                부스 방문하고 쿠키 받기
              </span>
            </div>
            <img src={mapImg} alt="" className="h-[3.25rem] w-auto" />
          </button>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <div className="flex items-center justify-center gap-1">
            <span className={`${theme == 'day' ? `text-grey-700` : `text-grey-600`} typo-comment-1`}>
              친구가 가입하면 쿠키 2개 지급
            </span>
            <img src={flowerIcon} alt="" className="h-3.5 w-3.5" />
          </div>
          <button
            onClick={() => navigate("/introduce-friend")}
            className="w-90 h-12.5 flex justify-center items-center gap-[0.62rem] bg-home-friend-day border-[0.8px] border-white rounded-[1.25rem]
          shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.25)]"
          >
            <span className="text-grey-100 typo-button-text-b">
              솔로인 내 친구 소개하기
            </span>
            <img src={arrowImg} alt="" className="w-3" />
          </button>
          <p className={`typo-comment-2 ${theme === "day" ? "text-grey-900" : "text-grey-100"}`}>
            도미사럽은 5/16(토) 오전 7시까지 운영됩니다.
          </p>
        </div>
        <div className="absolute bottom-[6%] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 whitespace-nowrap">
          <div
            className={`flex items-center justify-center gap-1 typo-comment-2 ${
              theme == "day" ? "text-grey-700" : "text-grey-400"
            }`}
          >
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
      {currentActiveNotificationType ? (
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
