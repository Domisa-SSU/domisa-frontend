import { useState } from "react";
import icon from "../assets/domisaHeartIcon.svg"


function Header({dayText} : {dayText : string}) {
    const [festivalDate] = useState(3);

    return (
        <div className="px-5 py-2.5 flex justify-between items-center">
            <img src={icon} alt="" className="w-10.5"/>
            <h1 className="text-primary-500 typo-button-text-b">{`축제 ${festivalDate}일차 낮`}</h1>
            <button className={`typo-comment-1 ${dayText}`}>로그인</button>
        </div>
    );
}

export default Header;
