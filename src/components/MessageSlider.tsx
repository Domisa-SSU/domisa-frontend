import flowerIcon from "../assets/flowerIcon.svg";
import heartIcon from "../assets/heartIcon.svg";
import heartFaceIcon from "../assets/heartFaceIcon.svg";
import wingIcon from "../assets/wingIcon.svg";


function MessageCard({ sliderIcon }: { sliderIcon: string }) {
  return (
    <div className="gap-0.5 flex items-center shrink-0">
      <div className="text-[#FFFB82] typo-comment-2 whitespace-nowrap">
        도미사는 연장 운영중
      </div>
      <img src={sliderIcon} alt="" className="w-3" />
    </div>
  );
}

function MessageSlider() {
  const messageImgs = [flowerIcon, heartIcon, heartFaceIcon, wingIcon];
  const tmpImgs = [...messageImgs, ...messageImgs, ...messageImgs];
  const repeatedImgs = [
   ...tmpImgs, ...tmpImgs, ...tmpImgs
  ];

  return (
    <div className="bg-grey-900 py-1.25 px-2.5 flex overflow-hidden">
      <div className="flex gap-2.5 animate-marquee">
        {repeatedImgs.map((icon) => {
          return <MessageCard sliderIcon={icon}></MessageCard>;
        })}
      </div>
    </div>
  );
}

export default MessageSlider;
