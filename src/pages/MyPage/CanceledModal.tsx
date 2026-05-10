import XIcon from '../../assets/X.svg';

const INQUIRY_URL = 'https://open.kakao.com/o/sHQFocui';

type CanceledModalProps = {
  onClose: () => void;
};

function CanceledModal({ onClose }: CanceledModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative flex w-[calc(100%-2.5rem)] max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-white pb-5 pt-10">
        {/* 닫기 X 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2.5 top-5 flex p-2.5"
          aria-label="닫기"
        >
          <img src={XIcon} alt="닫기" width={16} height={17} />
        </button>

        <p className="typo-subtitle-header-2 text-grey-900 text-center">
          만료된 주문입니다<br />
          문의해주세요
        </p>
        <a
          href={INQUIRY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[3.125rem] w-[18.75rem] items-center justify-center rounded-[0.875rem] bg-[#fff5c4] typo-button-text-b text-[#ff8250]"
        >
          문의하기
        </a>
      </div>
    </div>
  );
}

export default CanceledModal;