import { useNavigate } from "react-router-dom";
import Button from "./Button/Button";
import { ButtonVariant, ButtonSize } from "./Button/ButtonEnums";
import heartImg from "../assets/heartIcon.svg";

function ReferralSection() {
  const navigate = useNavigate();

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