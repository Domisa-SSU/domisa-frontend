import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button/Button";
import { ButtonVariant, ButtonSize } from "./Button/ButtonEnums";
import heartImg from "../assets/heartIcon.svg";

type ReferralSectionProps = {
  referralCode: string;
};

function ReferralSection({ referralCode }: ReferralSectionProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center gap-2.5 px-2.5 py-5 bg-grey-200 rounded-[0.625rem]">
      <div className="flex items-center gap-1">
        <span className="typo-button-text text-grey-900">
          친구 소개하고{" "}
          <span className="text-primary-500">쿠키 2개</span>
          {" "}받기
        </span>
        <img src={heartImg} alt="" className="w-4 h-4" />
      </div>
      <div className="flex items-center justify-between w-full h-[3.125rem] px-2.5 py-2 bg-grey-100 rounded-[0.625rem]">
        <span className="typo-comment-1">
          <span className="text-grey-600">추천인 코드: </span>
          <span className="text-grey-900">{referralCode}</span>
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 px-3.5 py-2 bg-primary-100 rounded-full"
        >
          <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="8" rx="1.5" stroke="#FF6C9D" strokeWidth="1.2"/>
            <path d="M1 8.5V2C1 1.17157 1.67157 0.5 2.5 0.5H7" stroke="#FF6C9D" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="typo-comment-2 text-primary-500">
            {copied ? "복사됨!" : "코드 복사"}
          </span>
        </button>
      </div>
      <Button
        label="친구 소개하기"
        variant={ButtonVariant.Main}
        size={ButtonSize.Small}
        onClick={() => navigate("/introduce-friend")}
      />
    </div>
  );
}

export default ReferralSection;