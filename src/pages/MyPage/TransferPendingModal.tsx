import { useEffect, useState } from "react";
import requireIcon from "../IntroduceFriendPage/assets/requireIcon.png";

function TransferPendingModal() {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-[calc(100%-2.5rem)] max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-white py-10">
        <div className="flex flex-col items-center gap-[0.3125rem] text-center">
          <p className="typo-subtitle-header-2 text-grey-900">
            쿠키 지급 중{".".repeat(dotCount)}
          </p>
          <p className="typo-input-text-m text-grey-700">도미사가 쿠키를 굽고 있어요</p>
        </div>
        <img src={requireIcon} alt="쿠키 지급 중" className="w-[12.288rem] h-[12.288rem] object-cover" />
      </div>
    </div>
  );
}

export default TransferPendingModal;