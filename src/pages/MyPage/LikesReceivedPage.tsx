import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderTop from '../../components/HeaderTop';
import headerArrow from '../../assets/headerArrow.svg';
import loginImg from '../LoginPage/asset/loginImg.png';
import { getReceivedLikes } from '../../api/datingHome';
import type { DatingHomeCard } from '../../api/datingHome';

function ProfileCard({ fan, onClick }: { fan: DatingHomeCard; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full aspect-[85/123] bg-white rounded-[0.3125rem] flex items-center justify-center">
      <div className="w-[88.235%] aspect-[75/113] overflow-hidden">
        {fan.profile && (
          <img src={fan.profile} alt="" className="w-full h-full object-cover" />
        )}
      </div>
    </button>
  );
}

function LikesReceivedPage() {
  const navigate = useNavigate();
  const [myFans, setMyFans] = useState<DatingHomeCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    getReceivedLikes()
      .then((res) => setMyFans(res.myFans))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center pt-24">
          <div
            role="status"
            aria-label="받은 호감 확인 중"
            className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
          />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex justify-center pt-24">
          <span className="typo-header-3 text-grey-700 leading-7 text-center">
            받은 호감을 불러올 수 없어요
          </span>
        </div>
      );
    }

    if (myFans.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center pt-24">
          <span className="typo-header-3 text-grey-700 leading-7 text-center">
            아직 받은 호감이 없어요
          </span>
          <img src={loginImg} alt="" className="w-[15.36rem] h-[15.36rem] object-cover" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-4 gap-[0.625rem]">
        {myFans.map((fan) => (
          <ProfileCard key={fan.publicId} fan={fan} onClick={() => navigate(`/dating/cards/${encodeURIComponent(fan.publicId)}?viewType=FAN`)} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-grey-100">
      <div className="border-b-[0.8px] border-grey-500">
        <HeaderTop showNotificationIcon rightLabel="내정보" onRightClick={() => navigate('/my')} />
        <div className="relative mx-auto flex w-full max-w-[25.1875rem] items-center px-5 py-2.5">
          <button className="flex h-[2.375rem] w-[1.75rem] items-center justify-start" onClick={() => navigate(-1)}>
            <img src={headerArrow} alt="" className="w-[0.45rem] h-[0.9rem]" />
          </button>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 typo-subtitle-header-2 text-grey-900">
            받은 호감
          </span>
        </div>
      </div>
      <div className="flex flex-1 justify-center bg-grey-400">
        <div className="w-full max-w-[22.6875rem] px-5 pt-6 pb-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default LikesReceivedPage;
