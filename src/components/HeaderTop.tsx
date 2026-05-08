import logo from "../assets/domisaLogo.png";
import icon from "../assets/domisaHeartIcon.png";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="relative flex justify-center py-2.5">
      {showNotificationIcon && (
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="absolute left-5 top-1/2 -translate-y-1/2"
          aria-label="알림"
        >
          <img src={icon} alt="" className="w-10.5" />
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
