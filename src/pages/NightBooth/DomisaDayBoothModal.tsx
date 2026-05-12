import useDragToClose from "./useDragToClose";

type Props = {
  onClose: () => void;
};

function DomisaDayBoothModal({ onClose }: Props) {
  const { panelRef, dragHandleProps } = useDragToClose(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="flex w-full max-w-[26.875rem] flex-col rounded-t-[14px] bg-grey-100 max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div
          className="flex shrink-0 justify-center pt-2.5 pb-5 cursor-grab active:cursor-grabbing touch-none"
          {...dragHandleProps}
        >
          <div className="h-[5px] w-[100px] rounded-full bg-grey-400" />
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-5">
          <div className="flex flex-col gap-5 pb-5">
            {/* 제목 + 위치 */}
            <div className="flex flex-col gap-2.5 w-full">
              <p className="typo-title-header-1 text-grey-900">
                도미사 낮 부스
              </p>
              <p className="typo-input-text-m text-grey-700">
                1~3일차 진리관 앞
              </p>
            </div>

            {/* 설명 */}
            <p className="typo-button-text-b text-grey-900 whitespace-pre-line leading-[1.5]">
              {"부스 방문 시 뽑기를 통해 "}
              <span className="text-[#ff3d7e]">귀여운 키링</span>
              {"과 \n도미사럽에서 사용 가능한 "}
              <span className="text-[#ff3d7e]">쿠키 2개</span>
              {"를 얻을 수 있어요 !\n"}
              {"부스 와서 "}
              <span className="text-[#ff3d7e]">솔로개발자</span>
              {" 응원해주세요 >.<"}
            </p>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="shrink-0 flex justify-center px-5 pt-2.5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[3.125rem] w-full items-center justify-center rounded-[0.875rem] bg-grey-400"
          >
            <span className="typo-button-text-b text-grey-800">닫기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DomisaDayBoothModal;