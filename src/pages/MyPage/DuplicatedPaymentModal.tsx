import ArrowIcon from '../../assets/arrowIcon.svg?react';
import XIcon from '../../assets/X.svg';
import { CUSTOMER_SUPPORT_KAKAO_URL } from '../../constants/customerSupport';

type DuplicatedPaymentModalProps = {
  onBack: () => void;
  onClose: () => void;
};

/**
 * 같은 입금자명 + 금액 조합이 10분 안에 2건 이상이라 서버가 건을 특정하지 못한 경우.
 * (동명이인이거나 중복 입금) 자동 처리가 불가능해 문의로 안내한다.
 */
function DuplicatedPaymentModal({ onBack, onClose }: DuplicatedPaymentModalProps) {
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

        <div className="flex flex-col items-center gap-[0.9375rem]">
          <p className="typo-subtitle-header-2 text-grey-900 text-center">
            입금 내역이 여러 건 확인돼요
          </p>
          <p className="typo-input-text-m text-grey-700 text-center">
            같은 입금자명과 금액으로 입금된 내역이 있어
            <br />
            자동으로 쿠키를 지급할 수 없어요.
            <br />
            문의해주시면 확인 후 지급해드릴게요.
          </p>
        </div>
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

export default DuplicatedPaymentModal;
