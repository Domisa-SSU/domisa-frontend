import bgImage from "../assets/homePageBackground.png";
import Header from "../components/Header";
import MessageSlider from "../components/MessageSlider";
import logo from "../assets/domisaLogo.svg";
import dogImg from "../assets/dogIcon.svg";
import heartImg from "../assets/domisaHeartIcon.svg";
import catImg from "../assets/catIcon.svg";
import mapImg from "../assets/mapIcon.svg";
import arrowImg from "../assets/arrowIcon.svg"

function HomePage() {
  return (
    <div
      className="min-h-screen bg-center bg-cover bg-no-repeat flex flex-col justify-between
    "
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <MessageSlider></MessageSlider>

      <section className="flex-1">
        <Header></Header>
        <div className="mb-5"></div>
        <div className="flex flex-col items-center gap-4 mb-8">
          <img src={logo} alt="" className="w-[13.4rem]" />
          <div className="flex items-center gap-0.5">
            <span className="text-[#7F8080] typo-comment-1">
              오늘 매칭된 커플
            </span>
            <div className="text-primary-500 px-[0.12rem] py-[0.09rem] bg-white rounded-[0.93rem]">
              21
            </div>
            <span className="text-[#7F8080] typo-comment-1">쌍!</span>
          </div>
        </div>
        <div className="flex justify-center gap-2.5 mb-12">
          <button className="w-44 h-37.5 flex flex-col justify-between items-center bg-home-date-day rounded-xl py-5 shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.25)]">
            <div className="gap-1 flex flex-col">
              <span className="typo-title-header-1-b text-primary-700 mb-1">
                소개팅
              </span>
              <span className="text-[#99828C] typo-comment-2">
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
          <button className="w-44 h-37.5 flex flex-col items-center bg-home-map-day  rounded-xl py-5 shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.25)]">
            <div className="gap-1 flex flex-col">
              <span className="typo-title-header-1-b text-grey-100 mb-1">
                주점지도
              </span>
              <span className="text-[#99828C] typo-comment-2">
                부스 방문하고 쿠키 받기
              </span>
              <img src={mapImg} alt="" className="h-17 w-auto" />
            </div>
          </button>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <span className="text-[#7F8080] text-comment-1">
            제 친구가 연애했으면 좋겠어요
          </span>
          <button
            className="w-90 h-12.5 flex justify-center items-center gap-[0.62rem] bg-home-friend-day border-[0.8px] border-white rounded-[1.25rem]
          shadow-[inset_0_-4px_4px_0_rgba(0,0,0,0.25)]"
          >
            <span className="text-grey-100 typo-button-text-b">친구 소개하기</span>
            <img src={arrowImg} alt="" className="w-3"/>
          </button>
        </div>
      </section>
      <MessageSlider></MessageSlider>
    </div>
  );
}

export default HomePage;
