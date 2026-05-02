import icon from "../assets/domisaHeartIcon.svg"
import { useNavigate } from "react-router-dom";

type HeaderProps = {
    dayText: string;
    isLoggedIn: boolean;
};

function Header({dayText, isLoggedIn} : HeaderProps) {
    const festivalDate = 3;
    const navigate = useNavigate();
    const rightLabel = isLoggedIn ? "내정보" : "로그인";
    const rightPath = isLoggedIn ? "/my" : "/auth";

    return (
        <div className="px-5 py-2.5 flex justify-between items-center">
            <button onClick={() => navigate("/notifications")}>
                <img src={icon} alt="알림" className="w-10.5"/>
            </button>
            <h1 className="text-primary-500 typo-button-text-b">{`축제 ${festivalDate}일차 낮`}</h1>
            <button className={`typo-comment-1 ${dayText}`} onClick={() => {navigate(rightPath)}}>{rightLabel}</button>
        </div>
    );
}

export default Header;
