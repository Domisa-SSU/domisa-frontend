import ArrowIcon from "../../assets/arrowIcon.svg?react";
import XIcon from "../../assets/X.svg";

const INQUIRY_URL = "https://open.kakao.com/o/sHQFocui";

type CookieFailureModalProps = {
  onBack: () => void;
  onClose: () => void;
};

function CookieFailureModal({ onBack, onClose }: CookieFailureModalProps) {
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
          <p className="typo-title-header-1-b text-warning text-center">쿠키 지급 실패</p>
          <p className="typo-subtitle-header-2 text-grey-900 text-center">이런 경우에 실패할 수 있어요</p>
          <div className="typo-input-text-m text-grey-700 text-center">
            <ol className="list-decimal text-left pl-[1.3125rem] space-y-0">
              <li>입금자명 혹은 금액을 잘못 입력한 경우</li>
              <li>계좌번호를 잘못 입력한 경우</li>
            </ol>
            <p className="mt-0">(토스의 경우 해당 없음)</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <a
            href={INQUIRY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[3.125rem] w-[18.75rem] items-center justify-center rounded-[0.875rem] bg-[#fff5c4] text-[#ff8250] typo-button-text-b"
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

export default CookieFailureModal;