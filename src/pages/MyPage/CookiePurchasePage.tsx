import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import BankTransferModal from './BankTransferModal';
import BackConfirmModal from './BackConfirmModal';
import TransferPendingModal from './TransferPendingModal';
import CookieSuccessModal from './CookieSuccessModal';
import CookieFailureModal from './CookieFailureModal';
import { useBlocker, useLocation, useNavigate } from 'react-router-dom';
import NotLoginHeader from '../../components/NotLoginHeader';
import Button from '../../components/Button/Button';
import { ButtonVariant } from '../../components/Button/ButtonEnums';
import rightArrowBold from '../../assets/rightArrowBold.svg';
import copyIcon from '../../assets/copy.svg';
import forbiddenIcon from '../../assets/toastForbidden.svg';
import checkIcon from '../../assets/check.svg';

// TODO: API 연동 시 교체
const MOCK_ORDER = {
  billing_name: '입금A7K3Q9',
  order_amount: 2000,
};

type CookiePurchaseLocationState = {
  count: number;
  price: string;
};

type CookieModalState = 'none' | 'pending' | 'success' | 'failure';

const PAYMENT_METHODS = [
  { label: '토스페이로 송금하기' },
  { label: '계좌이체 하기' },
];

// TODO: API 연동 시 실제 함수로 교체
async function purchaseCookieAPI(): Promise<{ cookieCount: number }> {
  throw new Error('mock failure');
}

function CookiePurchasePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CookiePurchaseLocationState | null;

  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [cookieModalState, setCookieModalState] = useState<CookieModalState>('none');
  const [earnedCookieCount, setEarnedCookieCount] = useState(0);

  const blocker = useBlocker(cookieModalState !== 'success' && cookieModalState !== 'failure');

  useEffect(() => {
    if (!showCopyToast) return;
    const timerId = window.setTimeout(() => setShowCopyToast(false), 2500);
    return () => window.clearTimeout(timerId);
  }, [showCopyToast]);

  useEffect(() => {
    if (!showWarningToast) return;
    const timerId = window.setTimeout(() => setShowWarningToast(false), 2500);
    return () => window.clearTimeout(timerId);
  }, [showWarningToast]);

  // 2초 지연 후 API 호출
  useEffect(() => {
    if (cookieModalState !== 'pending') return;

    const timerId = window.setTimeout(async () => {
      try {
        const result = await purchaseCookieAPI();
        setEarnedCookieCount(result.cookieCount);
        setCookieModalState('success');
      } catch {
        setCookieModalState('failure');
      }
    }, 3000);

    return () => window.clearTimeout(timerId);
  }, [cookieModalState, state]);

  const handlePaymentMethodClick = (label: string) => {
    if (!isNameConfirmed) {
      setShowWarningToast(true);
      return;
    }
    if (label === '토스페이로 송금하기') {
      const amount = state!.price.replace(/,/g, '');
      const deepLink = `supertoss://send?bank=케이뱅크&accountNo=100140152657&amount=${amount}`;
      window.open(deepLink, '_self');
      return;
    }
    if (label === '계좌이체 하기') {
      setShowBankModal(true);
    }
  };

  useEffect(() => {
    if (!state) {
      navigate('/my/cookie', { replace: true });
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const { billing_name } = MOCK_ORDER;

  const handleTransferComplete = () => {
    setCookieModalState('pending');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(billing_name);
      setShowCopyToast(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigateToCookie = () => {
    navigate('/my/cookie', { replace: true });
  };

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="쿠키 구매" />

      <div className="px-5 pt-9 pb-[8.75rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-10">
          {/* 입금자명 섹션 */}
          <div className="flex flex-col gap-5 bg-grey-200 rounded-[0.625rem] px-2.5 py-5">
            <p className="pl-2.5 typo-button-text text-grey-900">
              <span className="text-primary-600">입금자명</span>에 아래 코드를 입력해주세요
            </p>
            <div className="flex items-center justify-between h-[3.125rem] bg-grey-100 px-2.5 py-2 rounded-[0.625rem]">
              <span className="typo-comment-1 text-grey-900">{billing_name}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 bg-primary-100 px-3.5 py-2 rounded-[0.75rem]"
              >
                <img src={copyIcon} alt="" className="w-[0.648rem] h-[0.72rem]" />
                <span className="typo-comment-2 text-primary-500">복사</span>
              </button>
            </div>
            <button
              type="button"
              aria-pressed={isNameConfirmed}
              onClick={() => setIsNameConfirmed(!isNameConfirmed)}
              className="flex items-center gap-2.5 pl-2.5"
            >
              <span
                className={`flex h-[1.09375rem] w-[1.09375rem] items-center justify-center rounded-[0.3125rem] ${
                  isNameConfirmed ? 'bg-primary-500' : 'bg-grey-400'
                }`}
              >
                <img src={checkIcon} alt="" className="w-[0.7875rem] h-[0.65625rem]" />
              </span>
              <span
                className={`typo-button-text ${
                  isNameConfirmed ? 'text-primary-600' : 'text-grey-600'
                }`}
              >
                입금자명을 확인했어요
              </span>
            </button>
          </div>

          {/* 결제 방법 */}
          <div className="flex flex-col gap-[1.875rem]">
            {PAYMENT_METHODS.map(({ label }) => (
              <button
                key={label}
                type="button"
                onClick={() => handlePaymentMethodClick(label)}
                className="relative flex items-center justify-center h-[3.4375rem] w-full bg-primary-100 border-[1.2px] border-primary-200 rounded-[1.25rem] px-5"
              >
                <span className="typo-header-3-b text-primary-500">{label}</span>
                <img
                  src={rightArrowBold}
                  alt=""
                  className="absolute right-5 w-[0.6875rem] h-[1.0625rem]"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {showCopyToast && <Toast message="복사되었습니다" />}
      {showWarningToast && <Toast message="입금자명을 확인해주세요" icon={forbiddenIcon} />}
      {showBankModal && (
        <BankTransferModal amount={state.price} onClose={() => setShowBankModal(false)} />
      )}
      {cookieModalState === 'pending' && <TransferPendingModal />}
      {cookieModalState === 'success' && (
        <CookieSuccessModal cookieCount={earnedCookieCount} onConfirm={handleNavigateToCookie} />
      )}
      {cookieModalState === 'failure' && (
        <CookieFailureModal
          onInquiry={() => {
            /* TODO: 문의하기 페이지 연결 */
          }}
          onBack={handleNavigateToCookie}
        />
      )}
      {blocker.state === 'blocked' && (
        <BackConfirmModal onConfirm={() => blocker.proceed()} onCancel={() => blocker.reset()} />
      )}

      {/* 하단 고정 영역 */}
      <section className="fixed inset-x-0 bottom-0 bg-grey-100 px-5 pt-2.5 pb-[2.75rem] flex flex-col items-center gap-2.5">
        <p className="typo-button-text text-grey-900">송금 완료 후, 아래 버튼을 눌러주세요</p>
        <div className="w-full max-w-[22.625rem]">
          <Button
            label="송금 완료"
            variant={ButtonVariant.Main}
            disabled={!isNameConfirmed}
            onClick={handleTransferComplete}
          />
        </div>
      </section>
    </div>
  );
}

export default CookiePurchasePage;
