import logo from "../assets/domisaLogo.png";
import icon from "../assets/domisaHeartIcon.png";
import existNotificationIcon from "../assets/existNotificationHeartIcon.png";
import { useNavigate } from "react-router-dom";
import { useAuthMeQuery } from "../queries/auth";
import { useNotificationStatusQuery } from "../queries/notifications";

type HeaderTopProps = {
  rightLabel?: string;
  onRightClick?: () => void;
  showNotificationIcon?: boolean;
};

function Header({
  rightLabel,
  onRightClick,
  showNotificationIcon = false,
}: HeaderTopProps) {
  const navigate = useNavigate();
  const { data: authMe } = useAuthMeQuery();
  const { data: notificationStatus } = useNotificationStatusQuery(
    showNotificationIcon && Boolean(authMe),
  );
  const unreadCount = notificationStatus?.unreadCount ?? 0;
  const hasUnreadNotification = unreadCount > 0;
  const notificationCountLabel = Math.min(unreadCount, 99);

  return (
    <div className="relative flex justify-center py-2.5">
      {showNotificationIcon && (
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="absolute left-5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center"
          aria-label="알림"
        >
          <img
            src={hasUnreadNotification ? existNotificationIcon : icon}
            alt=""
            className="size-11"
          />
          {hasUnreadNotification ? (
            <span className="absolute left-[1.625rem] top-[1.625rem] flex size-[1.125rem] items-center justify-center rounded-[0.525rem] bg-warning pt-px typo-comment-1-b text-grey-100">
              {notificationCountLabel}
            </span>
          ) : null}
        </button>
      )}
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="메인 화면으로 이동"
      >
        <img src={logo} alt="" className="h-[1.971rem] w-[3.35rem]" />
      </button>
      {rightLabel && (
        <button
          type="button"
          onClick={onRightClick}
          className="absolute right-5 top-1/2 -translate-y-1/2 typo-comment-1 text-grey-700"
        >
          {rightLabel}
        </button>
      )}
    </div>
  );
}

export default Header;
