import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotLoginHeader from '../../components/NotLoginHeader';
import Toast from '../../components/Toast';
import { EDIT_PROFILE_TOAST_STORAGE_KEY } from '../../constants/storageKeys';
import { useLogoutMutation } from '../../queries/auth';
import ReferralSection from '../../components/ReferralSection';
import RightArrow from '../../assets/right_arrow.svg?react';
import editPencilImg from '../../assets/edit_pencil.svg';
import cookieImg from '../../assets/cookie.svg';
import dogImg from '../../assets/dogIcon.svg';
import domisaHeartImg from '../../assets/domisaHeartIcon.svg';
import catImg from '../../assets/catIcon.svg';
import flowerImg from '../../assets/flowerIcon.svg';
import arrowIcon from '../../assets/arrowIcon.svg';

// TODO: API 연동 시 GET /api/users/me 응답으로 교체
const mockResponse = {
  user: {
    userId: 123,
    nickname: '콩순이짱',
    birthYear: 2003,
    gender: '여',
    profileImageUrl: null as string | null,
    contact: {
      type: 'INSTAGRAM' as 'INSTAGRAM' | 'KAKAO' | 'PHONE',
      value: '@1014.1248',
    },
    cookieCount: 10,
    referralCode: 'd9fs3k29',
  },
  status: {
    isRegistered: true,
    hasIntroduction: true,
    isProfileCompleted: false, // true면 소개팅 카드 있음
  },
};

const contactLabel: Record<'INSTAGRAM' | 'KAKAO' | 'PHONE', string> = {
  INSTAGRAM: '인스타 ID',
  KAKAO: '카카오 ID',
  PHONE: '전화번호',
};

function MyPage() {
  const { user, status } = mockResponse;
  const navigate = useNavigate();
  const {
    mutateAsync: logout,
    isPending: isLoggingOut,
  } = useLogoutMutation();
  const [logoutErrorMessage, setLogoutErrorMessage] = useState('');
  const [showEditProfileToast, setShowEditProfileToast] = useState(() => {
    const shouldShow = sessionStorage.getItem(EDIT_PROFILE_TOAST_STORAGE_KEY) === 'true';
    if (shouldShow) {
      sessionStorage.removeItem(EDIT_PROFILE_TOAST_STORAGE_KEY);
    }
    return shouldShow;
  });

  useEffect(() => {
    if (!showEditProfileToast) return;
    const timer = setTimeout(() => setShowEditProfileToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showEditProfileToast]);

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="내정보" />

      <div className="px-5 pt-[2.125rem] pb-10">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[2.125rem]">
          {/* 프로필 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-[1.875rem] bg-grey-300 overflow-hidden shrink-0">
                {user.profileImageUrl && (
                  <img
                    src={user.profileImageUrl}
                    alt="프로필"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="typo-title-header-1 text-grey-900">{user.nickname}</span>
                <span className="typo-input-text-m text-grey-700">
                  {String(user.birthYear).slice(2)}년생 {user.gender}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/my/edit-profile')}
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
              <span className="typo-comment-1 text-grey-600 shrink-0">
                {contactLabel[user.contact.type]}
              </span>
              <div className="flex-1 flex items-center h-10 px-2.5 rounded-[0.625rem] bg-grey-100">
                <span className="typo-comment-1-b text-primary-500">{user.contact.value}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[1.875rem]">
            {/* 보유 쿠키 */}
            <div className="flex flex-col gap-3.5">
              <span className="typo-button-text text-grey-900">보유 쿠키</span>
              <button
                onClick={() => navigate('/my/cookie')}
                className="relative flex items-center justify-center h-[3.125rem] px-2.5 bg-primary-100 rounded-[0.625rem] w-full"
              >
                <div className="flex items-center gap-1">
                  <img src={cookieImg} alt="" className="w-4 h-4" />
                  <span className="typo-button-text text-primary-500">{user.cookieCount}개</span>
                </div>
                <div className="absolute right-2.5 flex items-center justify-center h-[2.15rem] w-[1.7rem]">
                  <RightArrow className="text-primary-500" />
                </div>
              </button>
            </div>

            {/* 소개팅 카드 */}
            {status.isProfileCompleted ? (
              <button
                onClick={() => navigate('/my/dating-card')}
                className="relative flex flex-col gap-1 h-[10.25rem] p-2.5 rounded-[0.625rem] overflow-hidden w-full text-left"
                style={{ background: 'linear-gradient(to bottom, #ff98b5, #ff5a99)' }}
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
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-[11.257rem] h-[3.95rem]"
                  style={{ top: '82px' }}
                >
                  <img
                    src={dogImg}
                    alt=""
                    className="absolute left-0 top-0 w-[4.542rem] h-[3.95rem]"
                  />
                  <img
                    src={domisaHeartImg}
                    alt=""
                    className="absolute rounded-[0.69rem] object-cover size-[2.123rem]"
                    style={{ left: '72.68px', top: '14.22px' }}
                  />
                  <img
                    src={catImg}
                    alt=""
                    className="absolute w-[4.345rem] h-[3.752rem]"
                    style={{ left: '110.6px', top: '1.58px' }}
                  />
                </div>
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2.5 h-[7.25rem] px-2.5 bg-grey-200 rounded-[0.625rem]">
                <span className="typo-comment-1-m text-grey-700">등록된 프로필이 없어요</span>
                <button
                  onClick={() => navigate('/my/dating-card/register')}
                  className="flex items-center justify-center gap-2.5 h-[3.125rem] px-5 rounded-[0.875rem] w-full"
                  style={{ background: 'linear-gradient(to bottom, #ff98b5, #ff5a99)' }}
                >
                  <span className="typo-button-text-b text-grey-100">등록하러 가기</span>
                  <img src={flowerImg} alt="" className="w-4 h-4" />
                  <img src={arrowIcon} alt="" className="shrink-0 h-3 w-3" />
                </button>
              </div>
            )}

            {/* 소개팅 */}
            <div className="flex flex-col gap-2.5">
              <span className="typo-button-text text-grey-900">소개팅</span>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => navigate('/my/friend-intro')}
                  className="flex items-center justify-between h-[3.125rem] px-2.5 border border-grey-400 rounded-[0.875rem] w-full"
                >
                  <span className="typo-button-text text-grey-700">친구 소개서</span>
                  <div className="flex items-center justify-center h-[2.15rem] w-[1.7rem]">
                    <RightArrow />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/my/likes-received')}
                  className="flex items-center justify-between h-[3.125rem] px-2.5 border border-grey-400 rounded-[0.625rem] w-full"
                >
                  <span className="typo-button-text text-grey-700">받은 호감</span>
                  <div className="flex items-center justify-center h-[2.15rem] w-[1.7rem]">
                    <RightArrow />
                  </div>
                </button>
                <button
                  onClick={() => navigate('/my/likes-sent')}
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
              <ReferralSection referralCode={user.referralCode} />
            </div>
          </div>

          {showEditProfileToast && <Toast message="정보가 수정되었어요!" />}

          {/* 로그아웃 / 탈퇴하기 */}
          <div className="relative h-[3.5625rem] w-full typo-comment-1 text-grey-600">
            <button
              disabled={isLoggingOut}
              className="absolute left-1/2 -translate-x-1/2 top-5 underline underline-offset-4"
              onClick={async () => {
                try {
                  setLogoutErrorMessage('');
                  await logout();
                  navigate('/', { replace: true });
                } catch (error) {
                  console.error(error);
                  setLogoutErrorMessage('로그아웃에 실패했어요. 다시 시도해주세요.');
                }
              }}
            >
              {isLoggingOut ? '로그아웃 중' : '로그아웃'}
            </button>
            <button
              className="absolute right-0 top-5 underline underline-offset-4 whitespace-nowrap"
              onClick={() => {
                // TODO: 회원 탈퇴 확인 모달 표시 후 탈퇴 API 호출
              }}
            >
              탈퇴하기
            </button>
          </div>
          {logoutErrorMessage && (
            <p className="typo-comment-2 text-center text-warning">
              {logoutErrorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
