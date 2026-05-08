import ArrowIcon from '../assets/arrowIcon.svg';
import HeartIcon from '../assets/heartIcon.svg';
import XIcon from '../assets/X.svg';
import CookieIcon from '../pages/NotificationPage/assets/cookiesImg.png';
import EyeIcon from '../pages/SignupPage/asset/eyeIcon.svg';
import type { NotificationType } from '../types/notification';

type AlarmModalProps = {
  type: NotificationType;
  onClose: () => void;
  onConfirm: () => void;
};

const modalTitleByType: Record<NotificationType, string> = {
  LIKE: '누군가 나에게 호감을 보냈어요!',
  MATCH: '쌍방 매칭이 이뤄졌어요!',
  SIGNUP: '가입 보상으로\n쿠키 3개 지급해드려요',
  REFERRAL: '내 친구가 가입했어요!\n쿠키 2개 지급 완료',
};

const rewardNotificationTypes: readonly NotificationType[] = ['SIGNUP', 'REFERRAL'];

function ModalTitle({ type }: { type: NotificationType }) {
  if (type === 'SIGNUP') {
    return (
      <div className="typo-subtitle-header-2 flex flex-col items-center text-center text-grey-900">
        <span>가입 보상으로</span>
        <span className="flex items-center justify-center gap-1">
          쿠키 3개 지급해드려요
          <img src={HeartIcon} alt="" className="size-[1.125rem]" />
          <img src={CookieIcon} alt="" className="size-4" />
        </span>
      </div>
    );
  }

  return (
    <p className="typo-subtitle-header-2 whitespace-pre-line text-center text-grey-900">
      {modalTitleByType[type]}
    </p>
  );
}

function AlarmModal({ type, onClose, onConfirm }: AlarmModalProps) {
  const isRewardNotification = rewardNotificationTypes.includes(type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={isRewardNotification ? undefined : onClose}
    >
      <div
        className="relative flex w-[calc(100%-2.5rem)] max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-grey-100 pb-5 pt-10"
        onClick={(e) => e.stopPropagation()}
      >
        {!isRewardNotification ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2.5 top-5 flex p-2.5"
            aria-label="닫기"
          >
            <img src={XIcon} alt="닫기" width={16} height={17} />
          </button>
        ) : null}

        <div className="flex flex-col items-center gap-[0.9375rem]">
          <span className="typo-input-text-m text-grey-700">알람</span>
          <ModalTitle type={type} />
        </div>

        {isRewardNotification ? (
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[3.125rem] w-[18.75rem] shrink-0 items-center justify-center rounded-[0.875rem] bg-grey-400 typo-button-text-b text-grey-800"
          >
            확인했어요
          </button>
        ) : (
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[3.125rem] w-[18.75rem] shrink-0 items-center justify-center gap-1 rounded-[0.875rem] bg-primary-500 typo-button-text-b text-grey-100"
          >
            <span>확인하러 가기</span>
            <img src={EyeIcon} alt="" className="size-[1.125rem]" />
            <img src={ArrowIcon} alt="" width={13} height={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export default AlarmModal;
