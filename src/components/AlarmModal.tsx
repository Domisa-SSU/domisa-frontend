import ArrowIcon from '../assets/arrowIcon.svg';
import XIcon from '../assets/X.svg';
import type { Notification } from '../types/notification';

type AlarmModalProps = {
  notification: Notification;
  onClose: () => void;
  onConfirm: () => void;
};

const modalTitleByType: Record<string, string | undefined> = {
  LIKE: '누군가 나에게 호감을 보냈어요!',
  MATCH: '쌍방 매칭이 이뤄졌어요!',
  COOKIE: '내 친구가 등록했어요!\n쿠키 2개 지급 완료',
};

function AlarmModal({ notification, onClose, onConfirm }: AlarmModalProps) {
  const title = modalTitleByType[notification.type] ?? notification.title;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative flex w-[calc(100%-2.5rem)] max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-grey-100 pb-5 pt-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2.5 top-5 flex p-2.5"
          aria-label="닫기"
        >
          <img src={XIcon} alt="닫기" width={16} height={17} />
        </button>

        {/* 내용 */}
        <div className="flex flex-col items-center gap-[0.9375rem]">
          <span className="typo-input-text-m text-grey-700">알람</span>
          <p className="typo-subtitle-header-2 whitespace-pre-line text-center text-grey-900">
            {title}
          </p>
        </div>

        {/* 확인 버튼 */}
        {notification.type === 'COOKIE' ? (
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
            <span className="text-[1.125rem] leading-none">👀</span>
            <img src={ArrowIcon} alt="" width={13} height={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export default AlarmModal;
