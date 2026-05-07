import cookieIcon from "../../assets/cookie.svg";
import letterIcon from "../../assets/letter.svg";

type CookieSuccessModalProps = {
  cookieCount: number;
  onConfirm: () => void;
};

function CookieSuccessModal({ cookieCount, onConfirm }: CookieSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-[calc(100%-2.5rem)] max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-white pb-5 pt-10">
        <div className="flex flex-col items-center gap-[0.9375rem]">
          <div className="flex items-start gap-1">
            <p className="typo-subtitle-header-2 text-grey-900">쿠키 지급 완료</p>
            <img src={cookieIcon} alt="" className="w-[1.125rem] h-[1.125rem]" />
            <img src={letterIcon} alt="" className="w-[1.125rem] h-[1.125rem]" />
          </div>
          <p className="typo-input-text-m text-grey-700">보유 쿠키 : {cookieCount}개</p>
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="flex h-[3.125rem] w-[18.75rem] items-center justify-center rounded-[0.875rem] bg-primary-500 typo-button-text-b text-grey-100"
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default CookieSuccessModal;