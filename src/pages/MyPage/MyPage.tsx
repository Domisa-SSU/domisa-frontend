import { useNavigate } from "react-router-dom";
import NotLoginHeader from "../../components/NotLoginHeader";
import Button from "../../components/Button/Button";
import { ButtonVariant, ButtonSize } from "../../components/Button/ButtonEnums";
import RightArrow from "../../assets/right_arrow.svg?react";
import editPencilImg from "../../assets/edit_pencil.svg";
import cookieImg from "../../assets/cookie.svg";
import dogImg from "../../assets/dogIcon.svg";
import domisaHeartImg from "../../assets/domisaHeartIcon.svg";
import catImg from "../../assets/catIcon.svg";
import heartImg from "../../assets/heartIcon.svg";
import flowerImg from "../../assets/flowerIcon.svg";

// TODO: API 연동 시 교체
const mockUser = {
  nickname: "콩순이짱",
  age: 24,
  gender: "여",
  instagramId: "@1014.1248",
  cookieCount: 10,
  referralCode: "d9fs3k29",
  profileImageUrl: null as string | null,
};

interface MyPageProps {
  hasDateCard?: boolean;
}

function MyPage({ hasDateCard = true }: MyPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="내정보" />

      <div className="px-5 pt-[2.125rem] pb-10">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[2.125rem]">

        {/* 프로필 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-[1.875rem] bg-grey-300 overflow-hidden shrink-0">
              {mockUser.profileImageUrl && (
                <img
                  src={mockUser.profileImageUrl}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="typo-title-header-1 text-grey-900">{mockUser.nickname}</span>
              <span className="typo-input-text-m text-grey-700">
                {mockUser.age}살 {mockUser.gender}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/my/edit-profile")}
            className="flex items-center gap-2 h-10 px-3.5 bg-grey-200 rounded-[0.625rem] shrink-0"
          >
            <span className="typo-comment-1-m text-grey-700">정보 수정</span>
            <img src={editPencilImg} alt="" />
          </button>
        </div>

        {/* 연락처 */}
        <div className="flex flex-col gap-2.5">
          <span className="typo-button-text text-grey-900">연락처</span>
          <div className="flex items-center gap-5">
            <span className="typo-comment-1 text-grey-600 shrink-0">인스타 ID</span>
            <div className="flex-1 flex items-center h-10 px-2.5 rounded-[0.625rem] bg-grey-100">
              <span className="typo-comment-1-b text-primary-500">{mockUser.instagramId}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[1.875rem]">

          {/* 보유 쿠키 */}
          <div className="flex flex-col gap-3.5">
            <span className="typo-button-text text-grey-900">보유 쿠키</span>
            <button
              onClick={() => navigate("/my/cookie")}
              className="relative flex items-center justify-center h-[3.125rem] px-2.5 bg-primary-100 rounded-[0.625rem] w-full"
            >
              <div className="flex items-center gap-1">
                <img src={cookieImg} alt="" className="w-4 h-4" />
                <span className="typo-button-text text-primary-500">{mockUser.cookieCount}개</span>
              </div>
              <div className="absolute right-2.5 flex items-center justify-center h-[2.15rem] w-[1.7rem]">
                <RightArrow className="text-primary-500" />
              </div>
            </button>
          </div>

          {/* 소개팅 카드 */}
          {hasDateCard ? (
            <button
              onClick={() => navigate("/my/dating-card")}
              className="relative flex flex-col gap-1 h-[10.25rem] p-2.5 rounded-[0.625rem] overflow-hidden w-full text-left"
              style={{ background: "linear-gradient(to bottom, #ff98b5, #ff5a99)" }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="typo-header-3-b text-grey-100">소개팅 카드</span>
                <div className="flex items-center justify-center h-[2.15rem] w-[1.7rem]">
                  <RightArrow className="text-grey-100" />
                </div>
              </div>
              <span className="typo-comment-1-m text-grey-300">
                내가 적은 소개와 이상형 정보가 담겨있어요
              </span>
              <div className="absolute left-1/2 -translate-x-1/2 w-[11.257rem] h-[3.95rem]" style={{ top: "82px" }}>
                <img src={dogImg} alt="" className="absolute left-0 top-0 w-[4.542rem] h-[3.95rem]" />
                <img src={domisaHeartImg} alt="" className="absolute rounded-[0.69rem] object-cover size-[2.123rem]" style={{ left: "72.68px", top: "14.22px" }} />
                <img src={catImg} alt="" className="absolute w-[4.345rem] h-[3.752rem]" style={{ left: "110.6px", top: "1.58px" }} />
              </div>
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2.5 h-[7.25rem] px-2.5 bg-grey-200 rounded-[0.625rem]">
              <span className="typo-comment-1-m text-grey-700">등록된 프로필이 없어요</span>
              <button
                onClick={() => navigate("/my/dating-card/register")}
                className="flex items-center justify-center gap-2.5 h-[3.125rem] px-5 rounded-[0.875rem] w-full"
                style={{ background: "linear-gradient(to bottom, #ff98b5, #ff5a99)" }}
              >
                <span className="typo-button-text-b text-grey-100">등록하러 가기</span>
                <img src={flowerImg} alt="" className="w-4 h-4" />
                <RightArrow className="shrink-0 text-grey-100" />
              </button>
            </div>
          )}

          {/* 소개팅 */}
          <div className="flex flex-col gap-2.5">
            <span className="typo-button-text text-grey-900">소개팅</span>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate("/my/friend-intro")}
                className="flex items-center justify-between h-[3.125rem] px-2.5 border border-grey-400 rounded-[0.875rem] w-full"
              >
                <span className="typo-button-text text-grey-700">친구 소개서</span>
                <div className="flex items-center justify-center h-[2.15rem] w-[1.7rem]">
                  <RightArrow />
                </div>
              </button>
              <button
                onClick={() => navigate("/my/likes-received")}
                className="flex items-center justify-between h-[3.125rem] px-2.5 border border-grey-400 rounded-[0.625rem] w-full"
              >
                <span className="typo-button-text text-grey-700">받은 호감</span>
                <div className="flex items-center justify-center h-[2.15rem] w-[1.7rem]">
                  <RightArrow />
                </div>
              </button>
              <button
                onClick={() => navigate("/my/likes-sent")}
                className="flex items-center justify-between h-[3.125rem] px-2.5 border border-grey-400 rounded-[0.625rem] w-full"
              >
                <span className="typo-button-text text-grey-700">보낸 호감</span>
                <div className="flex items-center justify-center h-[2.15rem] w-[1.7rem]">
                  <RightArrow />
                </div>
              </button>
            </div>
          </div>

          {/* 친구 소개 */}
          <div className="flex flex-col gap-3.5">
            <span className="typo-button-text text-grey-900">친구 소개</span>
            <div className="flex flex-col items-center justify-center gap-2.5 h-[7.5rem] px-2.5 py-5 bg-grey-200 rounded-[0.625rem]">
              <div className="flex items-center gap-1">
                <span className="typo-button-text text-grey-900">
                  친구 소개하고{" "}
                  <span className="text-primary-500">쿠키 20개</span>
                  {" "}받기
                </span>
                <img src={heartImg} alt="" className="w-4 h-4" />
              </div>
              <Button
                label="친구 소개하기"
                variant={ButtonVariant.Main}
                size={ButtonSize.Small}
                onClick={() => navigate("/introduce-friend")}
              />
            </div>
          </div>
        </div>

        {/* 추천인 코드 */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="typo-button-text text-grey-900">추천인 코드</span>
            <span className="typo-comment-2 text-grey-600">
              *친구가 추천인을 입력하면 200쿠키를 받아요
            </span>
          </div>
          <div className="flex items-center justify-center h-10 px-2.5 bg-primary-100 rounded-[0.625rem]">
            <span className="typo-comment-1 text-primary-500">{mockUser.referralCode}</span>
          </div>
        </div>

        {/* 로그아웃 / 탈퇴하기 */}
        <div className="relative h-[3.5625rem] w-full typo-comment-1 text-grey-600">
          <button className="absolute left-1/2 -translate-x-1/2 top-5 underline underline-offset-4">
            로그아웃
          </button>
          <button className="absolute left-[21.156rem] -translate-x-1/2 top-5 underline underline-offset-4 whitespace-nowrap">
            탈퇴하기
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

export default MyPage;