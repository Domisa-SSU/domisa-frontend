import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomActionBar from "../../components/BottomActionBar";
import { INTRODUCE_FRIEND_DRAFT_STORAGE_KEY } from "../../constants/storageKeys";
import NotLoginHeader from "../../components/NotLoginHeader";
import { useAuthMeQuery } from "../../queries/auth";
import {
    EMPTY_INTRODUCTION_ANSWERS,
    hasCompleteIntroductionAnswers,
    INTRODUCTION_QUESTION_IDS,
    INTRODUCTION_QUESTIONS,
    type IntroductionAnswers,
    type IntroductionQuestionId,
} from "../../constants/introductionQuestions";

function IntroduceFriendPage() {
    const navigate = useNavigate();
    const { data: authMe } = useAuthMeQuery();
    const [answers, setAnswers] = useState<IntroductionAnswers>({
        ...EMPTY_INTRODUCTION_ANSWERS,
    });

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
        navigate(authMe ? "/introduce-friend/generating" : "/auth?flow=introduce-friend");
    };

    useEffect(() => {
        sessionStorage.setItem(INTRODUCE_FRIEND_DRAFT_STORAGE_KEY, JSON.stringify(answers));
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
                        const isShortAnswer = questionId === "q2";

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
                                        rows={isShortAnswer ? 3 : 4}
                                        className={`${
                                            isShortAnswer ? "h-[5.5rem]" : "h-[6.75rem]"
                                        } w-full resize-none overflow-y-auto rounded-[0.625rem] px-[0.625rem] py-2 placeholder:text-grey-600 focus:bg-primary-100 focus:text-primary-500 focus:placeholder:text-transparent focus:outline-none ${
                                            answer.length > 0
                                                ? "bg-primary-100 typo-input-text text-primary-500"
                                                : "bg-grey-300 typo-input-text-m text-grey-600"
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
        </div>
    );
}

export default IntroduceFriendPage;
