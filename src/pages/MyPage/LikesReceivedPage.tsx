import { useNavigate } from 'react-router-dom';
import HeaderTop from '../../components/HeaderTop';
import headerArrow from '../../assets/headerArrow.svg';
import loginImg from '../LoginPage/asset/loginImg.png';

interface Fan {
  userId: string;
  profile: string;
}

// TODO: API 연동 시 GET /api/likes/received 응답으로 교체
const mockData: { myFanNumber: number; myFans: Fan[] } = {
  myFanNumber: 8,
  myFans: [],
};

function ProfileCard({ fan }: { fan: Fan }) {
  return (
    <div className="w-full aspect-[85/123] bg-white rounded-[0.3125rem] flex items-center justify-center">
      <div className="w-[88.235%] aspect-[75/113] overflow-hidden">
        <img src={fan.profile} alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

function LikesReceivedPage() {
  const navigate = useNavigate();
  const { myFans } = mockData;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-grey-100 border-b-[0.8px] border-grey-500">
        <HeaderTop showNotificationIcon rightLabel="내정보" onRightClick={() => navigate('/my')} />
        <div className="relative flex items-center px-5 py-2.5">
          <button className="p-[0.62rem]" onClick={() => navigate(-1)}>
            <img src={headerArrow} alt="" className="w-[0.45rem] h-[0.9rem]" />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 typo-subtitle-header-2 text-grey-900">
            받은 호감
          </span>
        </div>
      </div>
      <div className="flex flex-1 justify-center">
        <div className="w-full max-w-[22.6875rem] bg-grey-400 px-5 pt-6 pb-10">
          {myFans.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-24">
              <span className="typo-header-3 text-grey-700 leading-7 text-center">
                아직 받은 호감이 없어요
              </span>
              <img src={loginImg} alt="" className="w-[15.36rem] h-[15.36rem] object-cover" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-[0.625rem]">
              {myFans.map((fan) => (
                <ProfileCard key={fan.userId} fan={fan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LikesReceivedPage;
