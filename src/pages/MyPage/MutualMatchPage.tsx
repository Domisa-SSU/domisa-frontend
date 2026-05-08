import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderTop from '../../components/HeaderTop';
import headerArrow from '../../assets/headerArrow.svg';
import heartIconOrange from '../../assets/heartIconOrange.svg';
import loginImg from '../LoginPage/asset/loginImg.png';
import { getDatingMatches } from '../../api/datingHome';
import type { DatingMatch } from '../../api/datingHome';

function ProfileCard({ match, onClick }: { match: DatingMatch; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full aspect-[85/123] bg-white rounded-[0.3125rem] flex items-center justify-center"
    >
      <div className="w-[88.235%] aspect-[75/113] overflow-hidden">
        {match.profile && (
          <img src={match.profile} alt="" className="w-full h-full object-cover" />
        )}
      </div>
    </button>
  );
}

function MutualMatchPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<DatingMatch[]>([]);

  useEffect(() => {
    getDatingMatches()
      .then((res) => setMatches(res.matches))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-grey-100">
      <div className="border-b-[0.8px] border-grey-500">
        <HeaderTop showNotificationIcon rightLabel="내정보" onRightClick={() => navigate('/my')} />
        <div className="relative flex items-center px-5 py-2.5">
          <button className="p-[0.62rem]" onClick={() => navigate(-1)}>
            <img src={headerArrow} alt="" className="w-[0.45rem] h-[0.9rem]" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            <span className="typo-subtitle-header-2 text-grey-900">쌍방 매칭</span>
            <img src={heartIconOrange} alt="" className="w-4 h-4" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 justify-center bg-grey-400">
        <div className="w-full max-w-[22.6875rem] px-5 pt-6 pb-10">
          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-24">
              <span className="typo-header-3 text-grey-700 leading-7 text-center">
                아직 쌍방 매칭이 없어요
              </span>
              <img src={loginImg} alt="" className="w-[15.36rem] h-[15.36rem] object-cover" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-[0.625rem]">
              {matches.map((match) => (
                <ProfileCard
                  key={match.publicId}
                  match={match}
                  onClick={() => navigate(`/dating/cards/${match.publicId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MutualMatchPage;