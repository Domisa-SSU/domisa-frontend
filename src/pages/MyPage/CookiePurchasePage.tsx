import { useEffect, useState } from 'react';
import Toast from '../../components/Toast';
import BankTransferModal from './BankTransferModal';
import BackConfirmModal from './BackConfirmModal';
import TransferPendingModal from './TransferPendingModal';
import CookieSuccessModal from './CookieSuccessModal';
import CookieFailureModal from './CookieFailureModal';
import DuplicatedPaymentModal from './DuplicatedPaymentModal';
import PaymentErrorModal from './PaymentErrorModal';
import { useBlocker, useLocation, useNavigate } from 'react-router-dom';
import NotLoginHeader from '../../components/NotLoginHeader';
import Button from '../../components/Button/Button';
import { ButtonVariant } from '../../components/Button/ButtonEnums';
import RightArrowBold from '../../assets/rightArrowBold.svg?react';
import CheckIcon from '../../assets/check.svg?react';
import forbiddenIcon from '../../assets/toastForbidden.svg';
import { ACCOUNT_NUMBER_PLAIN, BANK_NAME } from '../../constants/bankAccount';
import {
  isDuplicatedPaymentError,
  isLoginRequiredError,
  isPaymentConfirmDelayInterruptedError,
  type ConfirmCookiePaymentResponse,
  type CookieProductCode,
} from '../../api/cookiePayment';
import { useConfirmCookiePaymentMutation } from '../../queries/cookiePayment';
import { track } from '../../utils/mixpanel';
import { clearGlobalError, reportGlobalErrorIfNeeded } from '../../stores/globalErrorStore';

type CookiePurchaseLocationState = {
  count: number;
  price: string;
  productCode: CookieProductCode;
  returnTo?: string;
};

type CookieModalState = 'none' | 'success' | 'failure' | 'duplicated' | 'error';

/**
 * 결제 수단. code 가 동작과 지표의 기준이고 label 은 화면 문구일 뿐이다.
 * 문구로 분기하면 카피를 다듬는 순간 딥링크도 지표도 조용히 깨진다.
 */
const PAYMENT_METHODS = [
  { code: 'toss', label: '토스로 송금하기' },
  { code: 'bank_transfer', label: '계좌이체 하기' },
] as const;

type PaymentMethodCode = (typeof PAYMENT_METHODS)[number]['code'];

const PAYMENT_METHOD_GRADIENT =
  'linear-gradient(97.05deg, rgb(255, 66, 129) 5.942%, rgb(255, 115, 162) 95.332%)';

/**
 * WAITING(202) 응답을 받으면 곧바로 재요청한다.
 * 서버가 응답을 약 1초 지연시키므로 별도 대기 없이 이 횟수만큼 확인하고 실패로 넘긴다.
 */
const MAX_CONFIRM_ATTEMPTS = 8;

function CookiePurchasePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CookiePurchaseLocationState | null;

  const { mutateAsync: confirmPayment } = useConfirmCookiePaymentMutation();

  const [depositorName, setDepositorName] = useState('');
  const [confirmedName, setConfirmedName] = useState<string | null>(null);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [cookieModalState, setCookieModalState] = useState<CookieModalState>('none');
  const [paymentResult, setPaymentResult] = useState<ConfirmCookiePaymentResponse | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const isNameConfirmed = confirmedName !== null && confirmedName === depositorName.trim();

  // 결제가 끝난 뒤에는 이탈을 막지 않는다. (blocker가 navigate를 가로채지 않도록)
  // state가 없으면 아래 effect가 쿠키함으로 되돌리므로 그 이동도 막으면 안 된다.
  const blocker = useBlocker(state !== null && cookieModalState === 'none');

  useEffect(() => {
    if (!showWarningToast) return;
    const timerId = window.setTimeout(() => setShowWarningToast(false), 2500);
    return () => window.clearTimeout(timerId);
  }, [showWarningToast]);

  useEffect(() => {
    if (!state) {
      navigate('/my/cookie', { replace: true });
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const handleConfirmName = () => {
    const trimmed = depositorName.trim();
    if (!trimmed) return;
    setConfirmedName(trimmed);
  };

  const handlePaymentMethodClick = (code: PaymentMethodCode) => {
    if (!isNameConfirmed) {
      setShowWarningToast(true);
      return;
    }

    track('cookie_payment_method_clicked', { method: code });

    if (code === 'toss') {
      const amount = state.price.replace(/,/g, '');
      const deepLink = `supertoss://send?bank=${BANK_NAME}&accountNo=${ACCOUNT_NUMBER_PLAIN}&amount=${amount}`;
      window.open(deepLink, '_self');
      return;
    }

    if (code === 'bank_transfer') {
      setShowBankModal(true);
    }
  };

  const handleTransferComplete = async () => {
    if (!isNameConfirmed || !confirmedName || isConfirming) {
      if (!isConfirming) setShowWarningToast(true);
      return;
    }

    track('cookie_transfer_reported', {
      product_code: state.productCode,
      cookie_count: state.count,
    });

    setCookieModalState('none');
    setIsConfirming(true);

    try {
      for (let attempt = 0; attempt < MAX_CONFIRM_ATTEMPTS; attempt += 1) {
        let result: ConfirmCookiePaymentResponse;

        try {
          result = await confirmPayment({
            depositorName: confirmedName,
            cookieType: state.productCode,
          });
        } catch (error) {
          if (!isPaymentConfirmDelayInterruptedError(error)) {
            throw error;
          }
          // 서버 대기가 끊겼을 뿐이라 결과를 모르는 상태다.
          // axios 인터셉터가 이미 켠 전역 에러 화면을 되돌리고 다시 확인한다.
          clearGlobalError();
          continue;
        }

        if (result.status === 'PAID') {
          // 실제 구매 완료. 구매 수와 남녀 비율은 이 이벤트로 센다.
          track('cookie_purchase_completed', {
            product_code: state.productCode,
            cookie_count: state.count,
            order_amount: Number(state.price.replace(/,/g, '')),
          });
          setPaymentResult(result);
          setCookieModalState('success');
          return;
        }
        // WAITING: 서버가 응답을 지연시키므로 바로 다시 확인한다.
      }

      // 끝까지 입금이 확인되지 않았다. 유저가 직접 다시 시도할 수 있게 둔다.
      track('cookie_purchase_failed', { reason: 'waiting_timeout' });
      setCookieModalState('failure');
    } catch (error) {
      if (isDuplicatedPaymentError(error)) {
        track('cookie_purchase_failed', { reason: 'duplicated_payment' });
        setCookieModalState('duplicated');
        return;
      }

      if (isLoginRequiredError(error)) {
        // 전역 인증 처리에 맡긴다. 결제 실패 모달을 띄우면 원인을 오해하게 된다.
        return;
      }

      if (reportGlobalErrorIfNeeded(error)) {
        return;
      }

      // 400 / 404 등 정상 플로우에서는 거의 없는 케이스.
      // 입금 문제로 오해하지 않게 별도 모달로 안내하고 문의 경로를 준다.
      track('cookie_purchase_failed', { reason: 'unexpected_error' });
      setCookieModalState('error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleNavigateToCookie = () => {
    navigate(state.returnTo ?? '/my/cookie', { replace: true });
  };

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="보유 쿠키" />

      <div className="px-5 pt-9 pb-[8.75rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[1.875rem]">
          {/* 입금자명 입력 */}
          <div className="flex flex-col gap-5 bg-grey-200 rounded-[0.625rem] px-2.5 py-5">
            <p className="pl-2.5 typo-subtitle-header-2 text-grey-900">
              입금할 <span className="text-primary-600">입금자명</span>을 입력해주세요
            </p>
            <div className="flex items-center justify-between gap-2.5 h-[3.125rem] bg-grey-100 px-2.5 py-2 rounded-[0.625rem] overflow-hidden">
              <input
                type="text"
                value={depositorName}
                onChange={(e) => setDepositorName(e.target.value)}
                placeholder="김숭실"
                maxLength={20}
                className="min-w-0 flex-1 bg-transparent typo-input-text-m text-grey-900 placeholder:text-grey-600 outline-none"
              />
              <button
                type="button"
                onClick={handleConfirmName}
                disabled={isNameConfirmed || !depositorName.trim()}
                className={`flex shrink-0 w-[4.5625rem] items-center justify-center gap-1 px-3.5 py-2 rounded-[0.75rem] typo-comment-2 disabled:opacity-100 ${
                  isNameConfirmed
                    ? 'bg-primary-100 text-primary-500'
                    : 'bg-primary-600 text-grey-100'
                }`}
              >
                확인
                {isNameConfirmed && (
                  <CheckIcon className="w-[0.6875rem] h-[0.53125rem] [&_path]:fill-primary-500" />
                )}
              </button>
            </div>
          </div>

          {/* 결제 방법 */}
          <div className="flex flex-col gap-[1.875rem]">
            {PAYMENT_METHODS.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => handlePaymentMethodClick(code)}
                className={`relative flex items-center justify-center h-[3.4375rem] w-full border-[1.2px] rounded-[1.25rem] px-5 ${
                  isNameConfirmed
                    ? 'border-grey-100 text-grey-100'
                    : 'bg-grey-200 border-grey-500 text-grey-600'
                }`}
                style={isNameConfirmed ? { backgroundImage: PAYMENT_METHOD_GRADIENT } : undefined}
              >
                <span className="typo-header-3">{label}</span>
                <RightArrowBold
                  className={`absolute right-5 w-[0.6875rem] h-[1.0625rem] ${
                    isNameConfirmed ? '[&_path]:fill-grey-100' : '[&_path]:fill-grey-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {showWarningToast && <Toast message="입금자명을 확인해주세요" icon={forbiddenIcon} />}
      {showBankModal && (
        <BankTransferModal
          amount={state.price}
          billingName={confirmedName ?? undefined}
          onClose={() => setShowBankModal(false)}
        />
      )}
      {isConfirming && <TransferPendingModal />}
      {cookieModalState === 'success' && paymentResult && (
        <CookieSuccessModal
          cookieCount={paymentResult.currentCookieCount}
          onConfirm={handleNavigateToCookie}
        />
      )}
      {cookieModalState === 'failure' && (
        <CookieFailureModal
          onBack={handleNavigateToCookie}
          onClose={() => setCookieModalState('none')}
        />
      )}
      {cookieModalState === 'duplicated' && (
        <DuplicatedPaymentModal
          onBack={handleNavigateToCookie}
          onClose={() => setCookieModalState('none')}
        />
      )}
      {cookieModalState === 'error' && (
        <PaymentErrorModal
          onBack={handleNavigateToCookie}
          onClose={() => setCookieModalState('none')}
        />
      )}
      {blocker.state === 'blocked' && (
        <BackConfirmModal
          onConfirm={() => blocker.proceed()}
          onCancel={() => blocker.reset()}
        />
      )}

      {/* 하단 고정 영역 */}
      <section className="fixed bottom-0 left-1/2 w-full frame-max-w -translate-x-1/2 bg-grey-100 px-5 pt-2.5 pb-[2.75rem] flex flex-col items-center gap-2.5">
        <p className="typo-button-text text-grey-900">송금 완료 후, 아래 버튼을 눌러주세요</p>
        <div className="w-full max-w-[22.625rem]">
          <Button
            label="송금 완료"
            variant={ButtonVariant.Main}
            disabled={!isNameConfirmed || isConfirming}
            onClick={handleTransferComplete}
          />
        </div>
      </section>
    </div>
  );
}

export default CookiePurchasePage;
