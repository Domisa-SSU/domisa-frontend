import dayBgImg from "../assets/homePageDayBackGround.jpg";
import nightBgImg from "../assets/homePageNightBackGround.jpg";
import Header from "../components/homePageHeader";
import MessageSlider from "../components/MessageSlider";
import logo from "../assets/domisaLogo.svg";
import dogImg from "../assets/dogIcon.svg";
import heartImg from "../assets/domisaHeartIcon.svg";
import catImg from "../assets/catIcon.svg";
import mapImg from "../assets/mapIcon.svg";
import arrowImg from "../assets/arrowIcon.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

const getThemeByTime = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? `day` : `night`;
};

function HomePage() {
  const [theme] = useState(getThemeByTime());
  const navigate = useNavigate();
  const status = useUserStore((state) => state.status);

  const themeClasses =
    theme == "day"
      ? {
          text: "text-grey-700",
          dateCard: "bg-home-date-day",
          mapCard: "bg-home-map-day",
          buttonTextColor: "text-primary-700",
          inviteCard: "bg-home-friend-day",
          coupleTextBackGround: "bg-primary-200",
        }
      : {
          text: "text-grey-500",
          dateCard: "bg-home-date-night",
          mapCard: "bg-home-map-night",
          buttonTextColor: "text-grey-100",
          inviteCard: "bg-home-friend-night",
          coupleTextBackGround: "bg-grey-100",
        };

  const handleDatingClick = () => {
    if (status?.isProfileCompleted !== true) {
      navigate("/dating/register");
    }
  };

  return (
    <div
      className="flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-center bg-cover bg-no-repeat
    "
      style={{
        backgroundImage: `url(${theme == `day` ? dayBgImg : nightBgImg})`,
        backgroundColor: theme == "day" ? "#f5dce7" : "#123d41",
      }}
    >
      <MessageSlider></MessageSlider>

      <section className="flex-1">
        <Header dayText={themeClasses.text}></Header>
        <div className="mb-5"></div>
        <div className="flex flex-col items-center gap-4 mb-8">
          <img src={logo} alt="" className="w-[13.4rem]" />
          <div className="flex items-center gap-0.5">
            <span className={`${themeClasses.text} typo-comment-1`}>
              오늘 매칭된 커플
            </span>
            <div className={`${themeClasses.coupleTextBackGround} px-[0.12rem] typo-comment-1-b py-[0.09rem] text-primary-500 rounded-[0.93rem]`}>
              21
            </div>
            <span className={`${themeClasses.text} typo-comment-1`}>쌍!</span>
          </div>
        </div>
        <div className="flex justify-center gap-2.5 mb-12">
          <button
            type="button"
            onClick={handleDatingClick}
            className={`w-44 h-37.5 flex flex-col justify-between items-center ${themeClasses.dateCard} rounded-xl py-5 shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.25)]`}
          >
            <div className="gap-1 flex flex-col">
              <span
                className={`typo-title-header-1-b ${themeClasses.buttonTextColor} mb-1`}
              >
                소개팅
              </span>
              <span className={`${themeClasses.text} typo-comment-2`}>
                이번 봄축제에서 CC 되기
              </span>
            </div>
            <div className="flex items-center">
              <img src={dogImg} alt="" className="w-auto h-12" />
              <img
                src={heartImg}
                alt=""
                className="w-[1.61rem] h-[1.61rem] mr-1"
              />
              <img src={catImg} alt="" className="w-auto h-11.4" />
            </div>
          </button>
          <button className={`w-44 h-37.5 flex flex-col items-center ${themeClasses.mapCard} rounded-xl py-5 shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.25)]`}>
            <div className="gap-1 flex flex-col">
              <span className="typo-title-header-1-b text-grey-100 mb-1">
                주점지도
              </span>
              <span className={`${themeClasses.text} typo-comment-2`}>
                부스 방문하고 쿠키 받기
              </span>
              <img src={mapImg} alt="" className="h-17 w-auto" />
            </div>
          </button>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <span className={`${theme == 'day' ? `text-grey-700` : `text-grey-600`} text-comment-1"`}>
            제 친구가 연애했으면 좋겠어요
          </span>
          <button
            onClick={() => navigate("/introduce-friend")}
            className="w-90 h-12.5 flex justify-center items-center gap-[0.62rem] bg-home-friend-day border-[0.8px] border-white rounded-[1.25rem]
          shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.25)]"
          >
            <span className="text-grey-100 typo-button-text-b">
              친구 소개하기
            </span>
            <img src={arrowImg} alt="" className="w-3" />
          </button>
        </div>
      </section>
      <MessageSlider></MessageSlider>
    </div>
  );
}

export default HomePage;
