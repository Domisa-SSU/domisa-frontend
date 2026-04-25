import { useEffect, useRef, useState } from "react";
import BottomActionBar from "../../components/BottomActionBar";
import NotLoginHeader from "../../components/NotLoginHeader";
import alphacaImg from "./asset/alphacaImg.png";
import bearImg from "./asset/bearImg.png";
import bottomArrow from "./asset/bottomArrow.svg";
import capibaraImg from "./asset/capibaraImg.png";
import catImg from "./asset/catImg.png";
import deerImg from "./asset/deerImg.png";
import dogImg from "./asset/dogImg.png";
import eyeIcon from "./asset/eyeIcon.svg";
import foxImg from "./asset/foxImg.png";
import hamsterImg from "./asset/hamsterImg.png";
import namuneulboImg from "./asset/namuneulboImg.png";
import rabbitImg from "./asset/rabbitImg.png";
import sudalImg from "./asset/sudalImg.png";
import wolfImg from "./asset/wolfImg.png";

const animalOptions = [
    { name: "강아지", image: dogImg },
    { name: "고양이", image: catImg },
    { name: "곰", image: bearImg },
    { name: "나무늘보", image: namuneulboImg },
    { name: "햄스터", image: hamsterImg },
    { name: "늑대", image: wolfImg },
    { name: "토끼", image: rabbitImg },
    { name: "사슴", image: deerImg },
    { name: "수달", image: sudalImg },
    { name: "알파카", image: alphacaImg },
    { name: "여우", image: foxImg },
    { name: "카피바라", image: capibaraImg },
];

function SignupCharacterSelectPage() {
    const [selectedAnimal, setSelectedAnimal] = useState("수달");
    const [showScrollHint, setShowScrollHint] = useState(false);
    const [bottomBarHeight, setBottomBarHeight] = useState(0);
    const bottomBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateScrollHint = () => {
            const documentHeight = document.documentElement.scrollHeight;
            const hasScrollableArea = documentHeight > window.innerHeight + 1;
            const isAtTop = window.scrollY <= 1;

            setShowScrollHint(hasScrollableArea && isAtTop);
        };

        updateScrollHint();

        window.addEventListener("scroll", updateScrollHint, { passive: true });
        window.addEventListener("resize", updateScrollHint);

        return () => {
            window.removeEventListener("scroll", updateScrollHint);
            window.removeEventListener("resize", updateScrollHint);
        };
    }, []);

    useEffect(() => {
        const bottomBar = bottomBarRef.current;

        if (!bottomBar) {
            return;
        }

        const updateBottomBarHeight = () => {
            setBottomBarHeight(bottomBar.offsetHeight);
        };

        updateBottomBarHeight();

        const resizeObserver = new ResizeObserver(updateBottomBarHeight);
        resizeObserver.observe(bottomBar);

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-grey-100">
            <div className="fixed inset-x-0 top-0 z-40 bg-grey-100">
                <NotLoginHeader title="회원가입"></NotLoginHeader>
            </div>
            <div className="px-5 pt-[9.5rem] pb-[9.5rem]">
                <div className="mx-auto flex w-full max-w-[22.5625rem] flex-col gap-5">
                    <h1 className="typo-title-header-1 text-grey-900">
                        본인과 닮은 동물을 선택해주세요
                    </h1>

                    <div className="grid grid-cols-3 gap-x-[1.875rem] gap-y-5">
                        {animalOptions.map((animal) => {
                            const isSelected = selectedAnimal === animal.name;

                            return (
                                <button
                                    key={animal.name}
                                    type="button"
                                    onClick={() => setSelectedAnimal(animal.name)}
                                    className="flex flex-col items-center gap-0.5"
                                >
                                    <div
                                        className={`flex h-[6.25rem] w-[6.25rem] items-center justify-center rounded-[1.875rem] ${
                                            isSelected ? "bg-primary-500" : "bg-grey-300"
                                        }`}
                                    >
                                        <img
                                            src={animal.image}
                                            alt={animal.name}
                                            className={`h-[6.25rem] w-[6.25rem] object-cover ${
                                                isSelected ? "animate-animal-swing" : ""
                                            }`}
                                        />
                                    </div>
                                    <span
                                        className={`typo-input-text ${
                                            isSelected ? "text-primary-500" : "text-grey-900"
                                        }`}
                                    >
                                        {animal.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            {showScrollHint && (
                <img
                    src={bottomArrow}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none fixed left-1/2 z-30 h-[2.5rem] w-[2.5rem] -translate-x-1/2 opacity-80"
                    style={{ bottom: `calc(${bottomBarHeight}px + 1.2rem)` }}
                />
            )}
            <BottomActionBar
                ref={bottomBarRef}
                label="다음"
                disabled={false}
                topContent={
                    <p className="flex items-center typo-button-text text-primary-500">
                        {`저는 ${selectedAnimal}상`}
                        <img src={eyeIcon} alt="" aria-hidden="true" className="h-[1em] w-[1em]" />
                        이에요
                    </p>
                }
            />
        </div>
    );
}

export default SignupCharacterSelectPage;
