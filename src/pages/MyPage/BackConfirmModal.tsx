import XIcon from '../../assets/X.svg';

type BackConfirmModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
};

function BackConfirmModal({ onConfirm, onCancel, isConfirming }: BackConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={isConfirming ? undefined : onCancel}
    >
      <div
        className="relative flex w-[calc(100%-2.5rem)] max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-white pb-5 pt-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 X 버튼 */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isConfirming}
          className="absolute right-2.5 top-5 flex p-2.5 disabled:opacity-40"
          aria-label="닫기"
        >
          <img src={XIcon} alt="닫기" width={16} height={17} />
        </button>

        {/* 내용 */}
        <div className="flex flex-col items-center gap-[0.3125rem]">
          <p className="typo-subtitle-header-2 text-center text-grey-900">
            페이지를 나가면<br />
            진행 중인 결제가 취소돼요!
          </p>
          <p className="typo-input-text-m text-grey-700">
            입금 완료 후, 송금 완료 버튼을 눌러주세요
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex w-[18.75rem] gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex flex-1 h-[3.125rem] items-center justify-center rounded-[0.875rem] bg-grey-400 typo-button-text-b text-grey-800 disabled:opacity-40"
          >
            {isConfirming ? '처리 중...' : '취소하고 나가기'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="flex flex-1 h-[3.125rem] items-center justify-center rounded-[0.875rem] bg-primary-500 typo-button-text-b text-grey-100 disabled:opacity-40"
          >
            결제 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default BackConfirmModal;
