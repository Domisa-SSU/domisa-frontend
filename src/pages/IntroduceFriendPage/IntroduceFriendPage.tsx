import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomActionBar from "../../components/BottomActionBar";
import { INTRODUCE_FRIEND_DRAFT_STORAGE_KEY } from "../../constants/storageKeys";
import NotLoginHeader from "../../components/NotLoginHeader";
import { useAuthMeQuery } from "../../queries/auth";

function IntroduceFriendPage() {
    const navigate = useNavigate();
    const { data: authMe } = useAuthMeQuery();
    const [shortIntro, setShortIntro] = useState("");
    const [charmPoint, setCharmPoint] = useState("");
    const [funnyEpisode, setFunnyEpisode] = useState("");

    const handleLimitedChange = (
        value: string,
        limit: number,
        setter: (nextValue: string) => void,
    ) => {
        if (value.length <= limit) {
            setter(value);
        }
    };

    const handleNext = () => {
        navigate(authMe ? "/introduce-friend/generating" : "/auth?flow=introduce-friend");
    };

    useEffect(() => {
        const draft = {
            shortIntro,
            charmPoint,
            funnyEpisode,
        };

        sessionStorage.setItem(INTRODUCE_FRIEND_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }, [charmPoint, funnyEpisode, shortIntro]);

    const isFormValid = useMemo(() => {
        return (
            shortIntro.trim().length > 0 &&
            charmPoint.trim().length > 0 &&
            funnyEpisode.trim().length > 0
        );
    }, [charmPoint, funnyEpisode, shortIntro]);

    return (
        <div className="min-h-screen bg-grey-100">
            <NotLoginHeader title="친구 소개하기"></NotLoginHeader>
            <div className="px-5 pt-[1.72rem] pb-[7.5625rem]">
                <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-5">
                    <section className="flex flex-col gap-4">
                        <h2 className="typo-subtitle-header-2 text-grey-900">
                            친구에 대한 간단한 소개를 적어주세요
                        </h2>
                        <div className="flex flex-col items-end gap-[0.3125rem]">
                            <textarea
                                value={shortIntro}
                                maxLength={35}
                                onChange={(event) =>
                                    handleLimitedChange(event.target.value, 35, setShortIntro)
                                }
                                rows={3}
                                className={`h-[5.5rem] w-full resize-none overflow-y-auto rounded-[0.625rem] px-[0.625rem] py-2 placeholder:text-grey-600 focus:outline-none ${
                                    shortIntro.length > 0
                                        ? "bg-primary-100 typo-input-text text-primary-500"
                                        : "bg-grey-300 typo-input-text-m text-grey-600"
                                }`}
                                placeholder="친구를 한 줄로 소개해주세요"
                            />
                            <span className="typo-comment-1-m text-grey-600">{`${shortIntro.length}/35`}</span>
                        </div>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h2 className="typo-subtitle-header-2 text-grey-900">
                            온 세상이 알아야 하는 친구의 매력 포인트
                        </h2>
                        <div className="flex flex-col items-end gap-[0.3125rem]">
                            <textarea
                                value={charmPoint}
                                maxLength={75}
                                onChange={(event) =>
                                    handleLimitedChange(event.target.value, 75, setCharmPoint)
                                }
                                rows={4}
                                className={`h-[6.75rem] w-full resize-none overflow-y-auto rounded-[0.625rem] px-[0.625rem] py-2 placeholder:text-grey-600 focus:outline-none ${
                                    charmPoint.length > 0
                                        ? "bg-primary-100 typo-input-text text-primary-500"
                                        : "bg-grey-300 typo-input-text-m text-grey-600"
                                }`}
                                placeholder="친구의 매력 포인트를 적어주세요"
                            />
                            <p className="w-full typo-comment-2 text-primary-300">
                                * 수많은 솔로 중 내 친구를 선택해야 되는 이유를 어필해주세요
                            </p>
                            <span className="typo-comment-1-m text-grey-600">{`${charmPoint.length}/75`}</span>
                        </div>
                    </section>

                    <section className="flex flex-col gap-4">
                        <h2 className="typo-subtitle-header-2 text-grey-900">
                            친구와 있었던 가장 웃긴 에피소드
                        </h2>
                        <div className="flex flex-col items-end gap-[0.3125rem]">
                            <textarea
                                value={funnyEpisode}
                                maxLength={75}
                                onChange={(event) =>
                                    handleLimitedChange(event.target.value, 75, setFunnyEpisode)
                                }
                                rows={4}
                                className={`h-[6.75rem] w-full resize-none overflow-y-auto rounded-[0.625rem] px-[0.625rem] py-2 placeholder:text-grey-600 focus:outline-none ${
                                    funnyEpisode.length > 0
                                        ? "bg-primary-100 typo-input-text text-primary-500"
                                        : "bg-grey-300 typo-input-text-m text-grey-600"
                                }`}
                                placeholder={"물고기가 먹고 싶어서 한강에서 낚시를 한 적이 있어요\n회 떠먹었습니다.."}
                            />
                            <span className="typo-comment-1-m text-grey-600">{`${funnyEpisode.length}/75`}</span>
                        </div>
                    </section>
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
