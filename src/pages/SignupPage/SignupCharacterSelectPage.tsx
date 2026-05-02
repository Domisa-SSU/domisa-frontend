import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import BottomActionBar from "../../components/BottomActionBar";
import NotLoginHeader from "../../components/NotLoginHeader";
import type { AnimalProfile } from "../../api/users";
import { useRegisterUserMutation } from "../../queries/users";
import { useSignupFlow } from "./useSignupFlow";
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

const animalProfileMap: Record<string, AnimalProfile> = {
    강아지: "DOG",
    고양이: "CAT",
    곰: "BEAR",
    나무늘보: "SLOTH",
    햄스터: "HAMSTER",
    늑대: "WOLF",
    토끼: "RABBIT",
    사슴: "DEER",
    수달: "OTTER",
    알파카: "ALPACA",
    여우: "FOX",
    카피바라: "CAPYBARA",
};

const getRegisterErrorMessage = (error: unknown) => {
    if (isAxiosError(error)) {
        const message = (error.response?.data as { message?: unknown } | undefined)?.message;

        if (typeof message === "string") {
            return message;
        }
    }

    return "회원가입에 실패했어요. 다시 시도해주세요.";
};

const getSafeReturnTo = (value: string | null) => {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
        return null;
    }

    return value;
};

function SignupCharacterSelectPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {
        signupFormData,
        selectedAnimal,
        setSelectedAnimal,
        resetSignupFlow,
    } = useSignupFlow();
    const [showScrollHint, setShowScrollHint] = useState(false);
    const [bottomBarHeight, setBottomBarHeight] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const bottomBarRef = useRef<HTMLDivElement>(null);
    const {
        mutateAsync: registerUser,
        isPending: isRegistering,
    } = useRegisterUserMutation();

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

    const handleCompleteSignup = async () => {
        const gender =
            signupFormData.gender === "남성"
                ? true
                : signupFormData.gender === "여성"
                  ? false
                  : null;
        const animalProfile = animalProfileMap[selectedAnimal];

        if (gender === null || !animalProfile) {
            setErrorMessage("입력 정보를 다시 확인해주세요.");
            return;
        }

        try {
            setErrorMessage("");

            await registerUser({
                nickname: signupFormData.nickname.trim(),
                gender,
                birthYear: Number(signupFormData.birthYear),
                animalProfile,
            });

            const isIntroduceFriendFlow =
                searchParams.get("flow") === "introduce-friend";
            const returnTo = getSafeReturnTo(searchParams.get("returnTo"));

            resetSignupFlow();
            navigate(
                returnTo
                    ? returnTo
                    : isIntroduceFriendFlow
                    ? "/introduce-friend/generating"
                    : "/dating/require-introduce",
                { replace: true },
            );
        } catch (error) {
            setErrorMessage(getRegisterErrorMessage(error));
        }
    };

    return (
        <div className="min-h-screen bg-grey-100">
            <div className="fixed inset-x-0 top-0 z-40 bg-grey-100">
                <NotLoginHeader title="회원가입"></NotLoginHeader>
            </div>
            <div className="px-5 pt-[9.5rem] pb-[9.5rem]">
                <div className="mx-auto flex w-full max-w-[22.5625rem] flex-col gap-5">
                    <h1 className="typo-title-header-1 text-grey-900">
                        <span className="text-primary-600">본인과 닮은 동물</span>을 선택해주세요
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
                label={isRegistering ? "가입 중..." : "다음"}
                disabled={isRegistering}
                onClick={handleCompleteSignup}
                topContent={
                    <div className="flex flex-col items-center gap-1">
                        {errorMessage && (
                            <p className="typo-comment-2 text-warning">
                                {errorMessage}
                            </p>
                        )}
                        <p className="flex items-center typo-button-text text-primary-500">
                            {`저는 ${selectedAnimal}상`}
                            <img src={eyeIcon} alt="" aria-hidden="true" className="h-[1em] w-[1em]" />
                            이에요
                        </p>
                    </div>
                }
            />
        </div>
    );
}

export default SignupCharacterSelectPage;
