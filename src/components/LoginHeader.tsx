import icon from "../assets/domisaHeartIcon.png";
import { useNavigate } from "react-router-dom";

function LoginHeader() {
  const navigate = useNavigate();

  return (
    <div className="px-5 py-2.5 flex justify-between items-center">
      <img src={icon} alt="" className="w-10.5" />
      <img src="" alt="" />
      <button
        className={`typo-comment-1 text-gey-700`}
        onClick={() => {
          navigate("/auth");
        }}
      >
        로그인
      </button>
    </div>
  );
}

export default LoginHeader;
