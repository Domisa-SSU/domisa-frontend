import cryIcon from '../../assets/cryIcon.svg';

type WithdrawConfirmModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

function WithdrawConfirmModal({ onConfirm, onCancel, isLoading }: WithdrawConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={isLoading ? undefined : onCancel}
    >
      <div
        className="flex w-[calc(100%-2.5rem)] max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-white pb-5 pt-[1.875rem]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 내용 */}
        <div className="flex flex-col items-center gap-[0.9375rem]">
          <p className="typo-subtitle-header-2 text-grey-900">정말 탈퇴하시겠어요?</p>
          <div className="flex flex-col items-center gap-1">
            <p className="typo-input-text-m text-warning-ac">탈퇴 시 내정보와 소개팅 카드,</p>
            <p className="typo-input-text-m text-warning-ac flex items-center gap-1">
              주고받은 호감이 모두 사라져요
              <img src={cryIcon} alt="" className="w-3.5 h-3.5" />
            </p>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex w-[18.75rem] gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex flex-1 h-[3.125rem] items-center justify-center rounded-[0.875rem] bg-grey-400 typo-button-text-b text-grey-800 disabled:opacity-50"
          >
            {isLoading ? '탈퇴 중' : '탈퇴할래요'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex flex-1 h-[3.125rem] items-center justify-center rounded-[0.875rem] bg-primary-500 typo-button-text-b text-grey-100 disabled:opacity-50"
          >
            안 할래요
          </button>
        </div>
      </div>
    </div>
  );
}

export default WithdrawConfirmModal;