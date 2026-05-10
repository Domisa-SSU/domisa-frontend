type AlreadyProcessedModalProps = {
  onConfirm: () => void;
};

function AlreadyProcessedModal({ onConfirm }: AlreadyProcessedModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-[calc(100%-2.5rem)] max-w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-white pb-5 pt-10">
        <p className="typo-subtitle-header-2 text-grey-900 text-center">
          이미 처리된 주문입니다
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="flex h-[3.125rem] w-[18.75rem] items-center justify-center rounded-[0.875rem] bg-grey-400 typo-button-text-b text-grey-800"
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default AlreadyProcessedModal;