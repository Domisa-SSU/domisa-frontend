import HeaderTop from "./HeaderTop";
import headerArrow from "../assets/headerArrow.svg";
import { useNavigate } from "react-router-dom";

function NotLoginHeader({title = "default"} : {title ?: string}) {
    const navigate = useNavigate();

    return (
        <div>
            <HeaderTop></HeaderTop>
            <div className="relative px-5 py-2.5 flex items-center border-b-[0.8px] border-grey-500">
                <button className="p-[0.62rem]" onClick={() => {navigate(-1)}}>
                    <img src={headerArrow} alt="" className="w-[0.45rem] h-[0.9rem]"/>
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 text-grey-700 typo-subtitle-header-2">{title}</span>
                <div></div>
            </div>
        </div>
    );
}

export default NotLoginHeader;