import icon from "../assets/domisaHeartIcon.svg"
import { useNavigate } from "react-router-dom";

const festivalStart = { year: 2026, month: 5, day: 13 };
const festivalEnd = { year: 2026, month: 5, day: 15 };
const millisecondsPerDay = 24 * 60 * 60 * 1000;

type HomeTheme = "day" | "night";

type HeaderProps = {
    dayText: string;
    isLoggedIn: boolean;
    theme: HomeTheme;
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

function Header({dayText, isLoggedIn, theme} : HeaderProps) {
    const navigate = useNavigate();
    const rightLabel = isLoggedIn ? "내정보" : "로그인";
    const rightPath = isLoggedIn ? "/my" : "/auth";
    const timeLabel = theme === "day" ? "낮" : "밤";
    const festivalLabel = getFestivalLabel();
    const headerLabel = festivalLabel.showTimeLabel
        ? `${festivalLabel.label} ${timeLabel}`
        : festivalLabel.label;

    return (
        <div className="px-5 py-2.5 flex justify-between items-center">
            <button onClick={() => navigate("/notifications")}>
                <img src={icon} alt="알림" className="w-10.5"/>
            </button>
            <h1 className="text-primary-500 typo-button-text-b">{headerLabel}</h1>
            <button className={`typo-comment-1 ${dayText}`} onClick={() => {navigate(rightPath)}}>{rightLabel}</button>
        </div>
    );
}

export default Header;
