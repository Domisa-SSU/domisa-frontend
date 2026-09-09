import { useNavigate } from "react-router-dom";

import arrowIcon from "../assets/arrowIcon.svg";
import autumnLeafIcon from "../assets/autumnLeaf.svg";
import XIcon from "../assets/X.svg";

type DatingAccessModalProps = {
  type: "signup" | "introduction";
  onProceed: () => void;
};

const modalCopy = {
  signup: {
    title: ["3초 만에 회원가입 하고", "내 인연을 만나보세요"],
    description: "도미사럽은 가을 축제 동안 운영돼요",
    action: "도미사럽 시작하기",
  },
  introduction: {
    title: ["앗! 친구소개서가 아직 없어요"],
    description: "친구에게 소개서를 받아 시작해보세요",
    action: "친구한테 소개받기",
  },
} as const;

function DatingAccessModal({ type, onProceed }: DatingAccessModalProps) {
  const navigate = useNavigate();
  const copy = modalCopy[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-grey-900/70 px-[1.9375rem]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dating-access-modal-title"
        className="relative flex w-full max-w-[21.25rem] flex-col items-center justify-center gap-5 rounded-[0.875rem] bg-grey-100 pb-5 pt-10"
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute right-5 top-5 flex p-2.5"
          aria-label="홈으로 이동"
        >
          <img src={XIcon} alt="" className="h-[1.0625rem] w-4" />
        </button>

        <div className="flex flex-col items-center gap-[0.9375rem]">
          <div
            id="dating-access-modal-title"
            className="typo-subtitle-header-2 text-center text-grey-900"
          >
            {copy.title.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <p className="flex items-center gap-1 typo-input-text-m text-center text-grey-700">
            {copy.description}
            <img src={autumnLeafIcon} alt="" className="size-4" />
          </p>
        </div>

        <button
          type="button"
          onClick={onProceed}
          className="flex h-[3.125rem] w-[18.75rem] items-center justify-center gap-1 rounded-[0.875rem] bg-primary-500 typo-button-text-b text-grey-100 active:opacity-90"
        >
          <span>{copy.action}</span>
          <img src={arrowIcon} alt="" className="h-3 w-[0.8125rem]" />
        </button>
      </section>
    </div>
  );
}

export default DatingAccessModal;
