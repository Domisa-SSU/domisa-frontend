import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomActionBar from "../../components/BottomActionBar";
import NotLoginHeader from "../../components/NotLoginHeader";
import letterIcon from "../../assets/letter.svg";
import {
    EMPTY_INTRODUCTION_ANSWERS,
    hasCompleteIntroductionAnswers,
    INTRODUCTION_QUESTION_IDS,
    INTRODUCTION_QUESTIONS,
    type IntroductionAnswers,
    type IntroductionQuestionId,
} from "../../constants/introductionQuestions";
import {
    getIntroduceFriendDraft,
    saveIntroduceFriendDraft,
} from "../../utils/introduceFriendDraftStorage";
import letterCorner from "../../assets/letterCorner.svg";
import introModalArrow from "./assets/introModalArrow.svg";
import { track } from "../../utils/mixpanel";

const INTRODUCE_FRIEND_GENERATING_PATH = "/introduce-friend/generating";

function IntroduceFriendIntroModal({ onStart }: { onStart: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-grey-900/70 px-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="introduce-friend-intro-title"
            aria-describedby="introduce-friend-intro-description"
        >
            <div className="flex w-full max-w-[21.25rem] flex-col items-center rounded-[0.875rem] bg-grey-100 px-5 pb-5 pt-10">
                <div className="flex flex-col items-center gap-[0.9375rem]">
                    <div className="text-center typo-subtitle-header-2 text-grey-900">
                        <p>사람들이 읽게 될</p>
                        <p id="introduce-friend-intro-title">
                            <span className="text-primary-700">친구의 소개서</span>
                            입니다
                        </p>
                    </div>
                    <p
                        id="introduce-friend-intro-description"
                        className="text-center typo-button-text text-grey-700"
                    >
                        작성 후 친구에게 보내주세요
                    </p>
                </div>

                <div
                    className="relative mt-[0.9375rem] h-[11.5rem] w-full max-w-[18rem] overflow-hidden rounded-[0.1rem] bg-[#f2f0ea]"
                    aria-hidden="true"
                >
                    <div className="absolute inset-[0.3rem] border border-[#d0c2b5]" />
                    <div className="absolute inset-x-[0.8125rem] inset-y-[0.5rem] rounded-[1.625rem] border border-[#d0c2b5]" />
                    <img
                        src={letterCorner}
                        alt=""
                        className="absolute left-[0.6875rem] top-2 h-[0.625rem] w-[0.625rem]"
                    />
                    <img
                        src={letterCorner}
                        alt=""
                        className="absolute right-[0.625rem] top-2 h-[0.625rem] w-[0.625rem] rotate-90"
                    />
                    <img
                        src={letterCorner}
                        alt=""
                        className="absolute bottom-2 left-[0.6875rem] h-[0.625rem] w-[0.625rem] -rotate-90"
                    />
                    <img
                        src={letterCorner}
                        alt=""
                        className="absolute bottom-2 right-[0.625rem] h-[0.625rem] w-[0.625rem] rotate-180"
                    />
                    <p className="absolute left-[1.9375rem] top-[1.84375rem] font-[family:var(--font-laundry-gothic)] text-[0.75rem] font-normal leading-[0.875rem] tracking-[-0.015rem] text-[#be4d3c]">
                        To. 내 친구의 미래 여자친구에게
                    </p>
                    <p className="absolute left-[1.9375rem] top-[3.375rem] typo-letter-answer text-grey-900/80">
                        저희 슝슝이는요
                        <br />
                        3년째 솔로입니다.
                        <br />
                        하지만 서강준을 닮았고
                        <br />
                        누구보다 다정하고 섬세해요
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onStart}
                    className="mt-[0.9375rem] flex h-[3.125rem] w-full max-w-[18.75rem] items-center justify-center gap-1 rounded-[0.875rem] bg-primary-500 px-2.5 py-2.5 typo-button-text-b text-grey-100"
                >
                    <span>쓰러 가기</span>
                    <img src={letterIcon} alt="" aria-hidden="true" className="h-4 w-4" />
                    <img
                        src={introModalArrow}
                        alt=""
                        aria-hidden="true"
                        className="h-[0.8125rem] w-3 rotate-90"
                    />
                </button>
            </div>
        </div>
    );
}

function IntroduceFriendPage() {
    const navigate = useNavigate();
    const [answers, setAnswers] = useState<IntroductionAnswers>(() => ({
        ...EMPTY_INTRODUCTION_ANSWERS,
        ...getIntroduceFriendDraft(),
    }));
    const [isIntroModalOpen, setIsIntroModalOpen] = useState(true);

    const handleLimitedChange = (
        questionId: IntroductionQuestionId,
        value: string,
    ) => {
        if (value.length <= INTRODUCTION_QUESTIONS[questionId].maxLength) {
            setAnswers((prevAnswers) => ({
                ...prevAnswers,
                [questionId]: value,
            }));
        }
    };

    const handleNext = () => {
        track("introduce_friend_submitted");
        saveIntroduceFriendDraft(answers);
        navigate(INTRODUCE_FRIEND_GENERATING_PATH);
    };

    useEffect(() => {
        saveIntroduceFriendDraft(answers);
    }, [answers]);

    const isFormValid = useMemo(() => {
        return hasCompleteIntroductionAnswers(answers);
    }, [answers]);
    return (
        <div className="min-h-screen bg-grey-100">
            <NotLoginHeader title="솔로인 내 친구 소개하기"></NotLoginHeader>
            <div className="px-5 pt-[1.72rem] pb-[7.5625rem]">
                <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-5">
                    {INTRODUCTION_QUESTION_IDS.map((questionId) => {
                        const question = INTRODUCTION_QUESTIONS[questionId];
                        const answer = answers[questionId];
                        const isShortAnswer = questionId === "q1";

                        return (
                            <section key={questionId} className="flex flex-col gap-4">
                                <h2 className="typo-subtitle-header-2 text-grey-900">
                                    {question.title}
                                </h2>
                                <div className="flex flex-col items-end gap-[0.3125rem]">
                                    <textarea
                                        value={answer}
                                        maxLength={question.maxLength}
                                        onChange={(event) =>
                                            handleLimitedChange(questionId, event.target.value)
                                        }
                                        rows={isShortAnswer ? 2 : 3}
                                        className={`${
                                            isShortAnswer ? "h-[3.4375rem]" : "h-[5.0625rem]"
                                        } w-full resize-none overflow-y-auto rounded-[0.625rem] px-[0.625rem] py-2 placeholder:text-grey-600 focus:bg-primary-100 focus:text-primary-500 focus:placeholder:text-transparent focus:outline-none ${
                                            answer.length > 0
                                                ? "bg-primary-100 typo-input-text text-primary-500"
                                                : "bg-grey-300 typo-input-text text-grey-600"
                                        }`}
                                        placeholder={question.placeholder}
                                    />
                                    {question.helperText ? (
                                        <p className="w-full typo-comment-2 text-primary-300">
                                            {question.helperText}
                                        </p>
                                    ) : null}
                                    <span className="typo-comment-1-m text-grey-600">
                                        {`${answer.length}/${question.maxLength}`}
                                    </span>
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>

            <BottomActionBar
                label="다음"
                disabled={!isFormValid}
                onClick={handleNext}
            />

            {isIntroModalOpen ? (
                <IntroduceFriendIntroModal
                    onStart={() => setIsIntroModalOpen(false)}
                />
            ) : null}
        </div>
    );
}

export default IntroduceFriendPage;
