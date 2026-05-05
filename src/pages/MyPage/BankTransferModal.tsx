import XIcon from '../../assets/X.svg';

type BankTransferModalProps = {
  amount: string;
  onClose: () => void;
};

function BankTransferModal({ amount, onClose }: BankTransferModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative flex w-[calc(100%-2.5rem)] max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-white pb-5 pt-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 X 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2.5 top-5 flex p-2.5"
          aria-label="닫기"
        >
          <img src={XIcon} alt="닫기" width={16} height={17} />
        </button>

        {/* 계좌 정보 */}
        <div className="flex flex-col items-center gap-[0.9375rem]">
          <span className="typo-input-text-m text-primary-400">계좌번호</span>
          <div className="flex flex-col items-center gap-[0.3125rem]">
            <span className="typo-subtitle-header-2 text-grey-900">
              케이뱅크 1001-4015-2657
            </span>
            <span className="typo-input-text-m text-grey-700">
              예금주 : 도미사(DOMISA)
            </span>
          </div>
          <span className="typo-header-3-b text-primary-600">
            금액 : {amount}원
          </span>
        </div>

        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-[3.125rem] w-[18.75rem] shrink-0 items-center justify-center rounded-[0.875rem] bg-grey-400 typo-button-text-b text-grey-800"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default BankTransferModal;