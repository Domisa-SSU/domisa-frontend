import { useEffect, useRef, useState } from 'react';
import Toast from '../../components/Toast';
import ErrorPage from '../ErrorPage/ErrorPage';
import BankTransferModal from './BankTransferModal';
import BackConfirmModal from './BackConfirmModal';
import TransferPendingModal from './TransferPendingModal';
import CookieSuccessModal from './CookieSuccessModal';
import CookieFailureModal from './CookieFailureModal';
import AlreadyProcessedModal from './AlreadyProcessedModal';
import CanceledModal from './CanceledModal';
import { useBlocker, useLocation, useNavigate } from 'react-router-dom';
import NotLoginHeader from '../../components/NotLoginHeader';
import Button from '../../components/Button/Button';
import { ButtonVariant } from '../../components/Button/ButtonEnums';
import rightArrowBold from '../../assets/rightArrowBold.svg';
import copyIcon from '../../assets/copy.svg';
import forbiddenIcon from '../../assets/toastForbidden.svg';
import checkIcon from '../../assets/check.svg';
import { useCancelCookieOrderMutation, useCreateCookieOrderMutation } from '../../queries/orders';
import { useUserCookiesQuery } from '../../queries/users';
import type { CookieProductCode } from '../../api/orders';
import { getCookieOrderStatus } from '../../api/orders';
import { isServerError } from '../../utils/apiError';
import { reportGlobalErrorIfNeeded } from '../../stores/globalErrorStore';

type CookiePurchaseLocationState = {
  count: number;
  price: string;
  productCode: CookieProductCode;
  returnTo?: string;
};

type CookieModalState = 'none' | 'pending' | 'success' | 'failure' | 'already_processed' | 'canceled';

const MAX_POLL_COUNT = 3; // 3초마다 호출. 최대 3번. (최대 9초 대기)

const PAYMENT_METHODS = [{ label: '토스페이로 송금하기' }, { label: '계좌이체 하기' }];

function CookiePurchasePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CookiePurchaseLocationState | null;

  const {
    mutate: createOrder,
    data: order,
    error: orderError,
    isPending: isOrderPending,
    isError: isOrderError,
  } = useCreateCookieOrderMutation();
  const { mutateAsync: cancelOrder, isPending: isCancelPending } = useCancelCookieOrderMutation();

  useEffect(() => {
    if (!state) return;
    createOrder({ productCode: state.productCode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [cookieModalState, setCookieModalState] = useState<CookieModalState>('none');
  const [serverError, setServerError] = useState(false);
  const [pollTick, setPollTick] = useState(0);

  const { data: cookiesData, error: cookiesError, isSuccess: isCookiesLoaded } = useUserCookiesQuery({ enabled: cookieModalState === 'success' });
  const pollCountRef = useRef(0);

  const blocker = useBlocker(
    cookieModalState !== 'success' &&
    cookieModalState !== 'failure' &&
    cookieModalState !== 'already_processed' &&
    cookieModalState !== 'canceled' &&
    !isOrderError
  );

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

  useEffect(() => {
    if (cookieModalState !== 'pending' || !order) return;

    const timerId = window.setTimeout(async () => {
      try {
        const result = await getCookieOrderStatus({
          billingName: order.billingName,
          orderAmount: order.orderAmount,
        });
        if (result.status === 'PAID' || result.status === 'ALREADY_PROCESSED') {
          setCookieModalState(result.status === 'PAID' ? 'success' : 'already_processed');
        } else if (result.status === 'PENDING') {
          if (pollCountRef.current >= MAX_POLL_COUNT) {
            setCookieModalState('failure');
            return;
          }
          pollCountRef.current += 1;
          setPollTick((t) => t + 1);
        } else if (result.status === 'CANCELED') {
          setCookieModalState('canceled');
        } else {
          setCookieModalState('failure');
        }
      } catch (error) {
        if (reportGlobalErrorIfNeeded(error)) {
          return;
        }

        if (isServerError(error)) {
          setServerError(true);
          return;
        }

        setCookieModalState('failure');
      }
    }, 3000);

    return () => window.clearTimeout(timerId);
  }, [cookieModalState, order, pollTick]);

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

  if (serverError || isServerError(orderError) || isServerError(cookiesError)) {
    return <ErrorPage />;
  }

  if (isOrderError) {
    return (
      <div className="min-h-screen bg-grey-100">
        <NotLoginHeader title="쿠키 구매" />
        <div className="flex items-center justify-center px-5 pt-20">
          <p className="typo-button-text text-grey-600">
            주문 생성에 실패했어요. 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  const billingName = order?.billingName;

  const handleTransferComplete = () => {
    pollCountRef.current = 0;
    setCookieModalState('pending');
  };

  const handleCopy = async () => {
    if (!billingName) return;
    try {
      await navigator.clipboard.writeText(billingName);
      setShowCopyToast(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigateToCookie = () => {
    navigate(state.returnTo ?? '/my/cookie', { replace: true });
  };

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="쿠키 구매" />

      <div className="px-5 pt-9 pb-[8.75rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-10">
          {/* 입금자명 섹션 */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-5 bg-grey-200 rounded-[0.625rem] px-2.5 py-5">
              <p className="pl-2.5 typo-button-text text-grey-900">
                <span className="text-primary-600">입금자명</span>에 아래 코드를 입력해주세요
              </p>
              <div className="flex items-center justify-between h-[3.125rem] bg-grey-100 px-2.5 py-2 rounded-[0.625rem]">
                <span className="typo-comment-1 text-grey-900">
                  {isOrderPending ? '불러오는 중...' : billingName}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={isOrderPending || !billingName}
                  className="flex items-center gap-1 bg-primary-100 px-3.5 py-2 rounded-[0.75rem] disabled:opacity-40"
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
            <p className="pl-2.5 text-center typo-button-text text-grey-700">예금주: 오영록</p>
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
        <BankTransferModal amount={state.price} billingName={billingName} onClose={() => setShowBankModal(false)} />
      )}
      {(cookieModalState === 'pending' || (cookieModalState === 'success' && !isCookiesLoaded)) && (
        <TransferPendingModal />
      )}
      {cookieModalState === 'success' && isCookiesLoaded && (
        <CookieSuccessModal cookieCount={cookiesData.cookieCount} onConfirm={handleNavigateToCookie} />
      )}
      {cookieModalState === 'failure' && (
        <CookieFailureModal
          onBack={handleNavigateToCookie}
          onClose={() => setCookieModalState('none')}
        />
      )}
      {cookieModalState === 'already_processed' && (
        <AlreadyProcessedModal onConfirm={handleNavigateToCookie} />
      )}
      {cookieModalState === 'canceled' && (
        <CanceledModal onClose={() => setCookieModalState('none')} />
      )}
      {blocker.state === 'blocked' && (
        <BackConfirmModal
          isConfirming={isCancelPending}
          onConfirm={async () => {
            if (order) {
              try {
                await cancelOrder({
                  billing_name: order.billingName,
                  order_amount: order.orderAmount,
                });
              } catch (error) {
                if (reportGlobalErrorIfNeeded(error)) {
                  return;
                }

                if (isServerError(error)) {
                  setServerError(true);
                  return;
                }

                console.error(error);
              }
            }
            blocker.proceed();
          }}
          onCancel={() => blocker.reset()}
        />
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
