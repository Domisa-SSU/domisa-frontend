import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import NotLoginHeader from '../../components/NotLoginHeader';
import Toast from '../../components/Toast';
import { EDIT_PROFILE_TOAST_STORAGE_KEY } from '../../constants/storageKeys';
import { useLogoutMutation } from '../../queries/auth';
import { useUserMeQuery, useUserCookiesQuery, useDeleteMeMutation } from '../../queries/users';
import ReferralSection from '../../components/ReferralSection';
import ErrorPage from '../ErrorPage/ErrorPage';
import RightArrow from '../../assets/right_arrow.svg?react';
import WithdrawConfirmModal from './WithdrawConfirmModal';
import editPencilImg from '../../assets/edit_pencil.svg';
import cookieImg from '../../assets/cookie.svg';
import dogImg from '../../assets/dogIcon.png';
import domisaHeartImg from '../../assets/domisaHeartIcon.png';
import catImg from '../../assets/catIcon.png';
import flowerImg from '../../assets/flowerIcon.svg';
import arrowIcon from '../../assets/arrowIcon.svg';
import heartIconOrange from '../../assets/heartIconOrange.svg';
import { animalProfileImageMap } from '../../constants/animalProfile';
import { isServerError } from '../../utils/apiError';

function MyPage() {
  const navigate = useNavigate();
  const { data: me, error: meError, isLoading: isMeLoading } = useUserMeQuery();
  const { data: cookies, error: cookiesError, isLoading: isCookiesLoading } = useUserCookiesQuery();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogoutMutation();
  const { mutateAsync: deleteMe, isPending: isDeleting } = useDeleteMeMutation();
  const [logoutErrorMessage, setLogoutErrorMessage] = useState('');
  const [withdrawErrorMessage, setWithdrawErrorMessage] = useState('');
  const [serverError, setServerError] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
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

  if (serverError || isServerError(meError) || isServerError(cookiesError)) {
    return <ErrorPage />;
  }

  if (isMeLoading || isCookiesLoading || !me || !cookies) {
    return (
      <div className="min-h-screen bg-grey-100">
        <NotLoginHeader title="내정보" />
      </div>
    );
  }

  const animalProfileImage = animalProfileImageMap[me.animalProfile];

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="내정보" />

      <div className="px-5 pt-[2.125rem] pb-10">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[2.125rem]">
          {/* 프로필 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-[1.875rem] bg-primary-100 overflow-hidden shrink-0">
                {animalProfileImage && (
                  <img
                    src={animalProfileImage}
                    alt={me.animalProfile}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="typo-title-header-1 text-grey-900">{me.nickname}</span>
                <span className="typo-input-text-m text-grey-700">
                  {String(me.birthYear)}년생 {me.gender ? '남성' : '여성'}
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

          <div className="flex flex-col gap-[1.875rem]">
            {/* 보유 쿠키 */}
            <div className="flex flex-col gap-3.5">
              <span className="typo-button-text text-grey-900">보유 쿠키</span>
              <span className="typo-comment-2 text-grey-700">
                호감을 보내거나 카드를 섞을 때 사용돼요
              </span>
              <button
                onClick={() => navigate('/my/cookie')}
                className="relative flex items-center justify-center h-[3.125rem] px-2.5 bg-primary-100 rounded-[0.625rem] w-full"
              >
                <div className="flex items-center gap-1">
                  <img src={cookieImg} alt="" className="w-4 h-4" />
                  <span className="typo-button-text text-primary-500">{cookies.cookieCount}개</span>
                </div>
                <div className="absolute right-2.5 flex items-center justify-center h-[2.15rem] w-[1.7rem]">
                  <RightArrow className="text-primary-500" />
                </div>
              </button>
            </div>

            {/* 소개팅 카드 */}
            {me.status.isProfileCompleted ? (
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
                  onClick={() => navigate('/dating/register')}
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
                <button
                  onClick={() => navigate('/my/mutual-match')}
                  className="flex items-center justify-between h-[3.125rem] px-2.5 border border-match-sd rounded-[0.625rem] w-full bg-match-bg"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="typo-button-text text-match-text">쌍방 매칭</span>
                    <img src={heartIconOrange} alt="" className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-center h-[2.15rem] w-[1.7rem]">
                    <RightArrow className="text-match-text" />
                  </div>
                </button>
              </div>
            </div>

            {/* 친구 소개 */}
            <div className="flex flex-col gap-3.5">
              <span className="typo-button-text text-grey-900">친구 소개</span>
              <ReferralSection />
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
                  if (isServerError(error)) {
                    setServerError(true);
                    return;
                  }

                  console.error(error);
                  setLogoutErrorMessage('로그아웃에 실패했어요. 다시 시도해주세요.');
                }
              }}
            >
              {isLoggingOut ? '로그아웃 중' : '로그아웃'}
            </button>
            <button
              className="absolute right-0 top-5 underline underline-offset-4 whitespace-nowrap"
              onClick={() => setShowWithdrawModal(true)}
            >
              탈퇴하기
            </button>
          </div>
          {logoutErrorMessage && (
            <p className="typo-comment-2 text-center text-warning">{logoutErrorMessage}</p>
          )}
        </div>
      </div>

      {showWithdrawModal && (
        <WithdrawConfirmModal
          onConfirm={async () => {
            try {
              setWithdrawErrorMessage('');
              await deleteMe();
              setShowWithdrawModal(false);
              navigate('/', { replace: true });
            } catch (error) {
              if (isServerError(error)) {
                setServerError(true);
                return;
              }

              if (isAxiosError(error)) {
                const status = error.response?.status;
                const data = error.response?.data as
                  | { code?: string; message?: string; error?: string }
                  | undefined;

                if (status === 401) {
                  navigate('/auth', { replace: true });
                  return;
                }

                if (status === 404) {
                  navigate('/', { replace: true });
                  return;
                }

                if (status === 502) {
                  setWithdrawErrorMessage(
                    data?.message || '페이액션 주문 매칭 제외에 실패했습니다. 고객센터로 문의해주세요.'
                  );
                  return;
                }

                if (data?.message) {
                  setWithdrawErrorMessage(data.message);
                  return;
                }
              }

              console.error(error);
              setWithdrawErrorMessage('회원탈퇴에 실패했어요. 다시 시도해주세요.');
            }
          }}
          onCancel={() => {
            setShowWithdrawModal(false);
            setWithdrawErrorMessage('');
          }}
          isLoading={isDeleting}
          errorMessage={withdrawErrorMessage}
        />
      )}
    </div>
  );
}

export default MyPage;
