import HeaderTop from "./HeaderTop";
import headerArrow from "../assets/headerArrow.svg";
import { useNavigate } from "react-router-dom";

function NotLoginHeader({
    title = "default",
    onBack,
    hideBackButton = false,
    titleClassName = "text-grey-900",
} : {title ?: string; onBack?: () => void; hideBackButton?: boolean; titleClassName?: string}) {
    const navigate = useNavigate();

    return (
        <div>
            <HeaderTop></HeaderTop>
            <div className="border-b-[0.8px] border-grey-500">
                <div className="relative mx-auto flex w-full max-w-[25.1875rem] items-center px-5 py-2.5">
                    {hideBackButton ? (
                        <div className="h-[2.375rem] w-[1.75rem]" aria-hidden="true" />
                    ) : (
                        <button className="flex h-[2.375rem] w-[1.75rem] items-center justify-start" onClick={() => onBack ? onBack() : navigate(-1)}>
                            <img src={headerArrow} alt="" className="w-[0.45rem] h-[0.9rem]"/>
                        </button>
                    )}
                    <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 typo-subtitle-header-2 ${titleClassName}`}>{title}</span>
                    {/* 타이틀 중앙 정렬을 위한 왼쪽 버튼 대칭 스페이서 */}
                    <div></div>
                </div>
            </div>
        </div>
    );
}

export default NotLoginHeader;
