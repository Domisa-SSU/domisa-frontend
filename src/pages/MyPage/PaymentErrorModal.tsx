import ArrowIcon from '../../assets/arrowIcon.svg?react';
import XIcon from '../../assets/X.svg';
import { CUSTOMER_SUPPORT_KAKAO_URL } from '../../constants/customerSupport';

type PaymentErrorModalProps = {
  onBack: () => void;
  onClose: () => void;
};

/**
 * 정상 플로우에서는 거의 발생하지 않는 오류(400 / 401 / 404 / 503 등).
 * 원인을 유저가 알 수 없으므로 문의로 안내한다.
 */
function PaymentErrorModal({ onBack, onClose }: PaymentErrorModalProps) {
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
          오류가 발생했어요
          <br />
          잠시 후 다시 시도해주세요
        </p>
        <div className="flex flex-col gap-2.5">
          <a
            href={CUSTOMER_SUPPORT_KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[3.125rem] w-[18.75rem] items-center justify-center rounded-[0.875rem] bg-[#fff5c4] typo-button-text-b text-[#ff8250]"
          >
            문의하기
          </a>
          <button
            type="button"
            onClick={onBack}
            className="flex h-[3.125rem] w-[18.75rem] items-center justify-center gap-1 rounded-[0.875rem] bg-grey-400 typo-button-text-b text-grey-800"
          >
            쿠키함으로 돌아가기
            <ArrowIcon className="[&_path]:fill-[#585858]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentErrorModal;
