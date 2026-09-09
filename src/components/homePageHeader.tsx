import icon from "../assets/domisaHeartIcon.png"
import existNotificationIcon from "../assets/existNotificationHeartIcon.png"
import { useNavigate } from "react-router-dom";

const festivalStart = { year: 2026, month: 9, day: 15 };
const festivalEnd = { year: 2026, month: 9, day: 16 };
const millisecondsPerDay = 24 * 60 * 60 * 1000;

type HomeTheme = "day" | "night";

type HeaderProps = {
    dayText: string;
    isLoggedIn: boolean;
    theme: HomeTheme;
    unreadCount?: number;
};

type DateParts = {
    year: number;
    month: number;
    day: number;
};

const getKoreaDateParts = (date: Date): DateParts => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const getPart = (type: Intl.DateTimeFormatPartTypes) => {
        const value = parts.find((part) => part.type === type)?.value;

        if (!value) {
            throw new Error(`Missing date part: ${type}`);
        }

        return Number(value);
    };

    return {
        year: getPart("year"),
        month: getPart("month"),
        day: getPart("day"),
    };
};

const toUtcDateValue = ({ year, month, day }: DateParts) =>
    Date.UTC(year, month - 1, day);

const getFestivalLabel = (date = new Date()) => {
    const today = getKoreaDateParts(date);
    const todayValue = toUtcDateValue(today);
    const startValue = toUtcDateValue(festivalStart);
    const endValue = toUtcDateValue(festivalEnd);
    const dayFromStart = Math.round((todayValue - startValue) / millisecondsPerDay);

    if (dayFromStart >= 0 && todayValue <= endValue) {
        return {
            label: `축제 ${dayFromStart + 1}일차`,
            showTimeLabel: true,
        };
    }

    if (todayValue < startValue) {
        return {
            label: `축제 D${dayFromStart}`,
            showTimeLabel: false,
        };
    }

    const dayFromEnd = Math.round((todayValue - endValue) / millisecondsPerDay);

    return {
        label: `축제 D+${dayFromEnd}`,
        showTimeLabel: false,
    };
};

function Header({dayText, isLoggedIn, theme, unreadCount = 0} : HeaderProps) {
    const navigate = useNavigate();
    const rightLabel = isLoggedIn ? "내정보" : "로그인";
    const rightPath = isLoggedIn ? "/my" : "/auth";
    const timeLabel = theme === "day" ? "낮" : "밤";
    const festivalLabel = getFestivalLabel();
    const headerLabel = festivalLabel.showTimeLabel
        ? `${festivalLabel.label} ${timeLabel}`
        : festivalLabel.label;
    const hasUnreadNotification = unreadCount > 0;
    const notificationCountLabel = Math.min(unreadCount, 99);

    return (
        <div className="px-5 py-2.5 flex justify-between items-center">
            {isLoggedIn ? (
                <button
                    type="button"
                    onClick={() => navigate("/notifications")}
                    className="relative flex size-11 items-center justify-center"
                >
                    <img
                        src={hasUnreadNotification ? existNotificationIcon : icon}
                        alt="알림"
                        className="size-11"
                    />
                    {hasUnreadNotification ? (
                        <span className="absolute left-[1.625rem] top-[1.625rem] flex size-[1.125rem] items-center justify-center rounded-[0.525rem] bg-warning pt-px typo-comment-1-b text-grey-100">
                            {notificationCountLabel}
                        </span>
                    ) : null}
                </button>
            ) : (
                <span className="size-11" aria-hidden="true" />
            )}
            <h1 className="text-autumn-brown typo-button-text-b">{headerLabel}</h1>
            <button className={`typo-comment-1 ${dayText}`} onClick={() => {navigate(rightPath)}}>{rightLabel}</button>
        </div>
    );
}

export default Header;
