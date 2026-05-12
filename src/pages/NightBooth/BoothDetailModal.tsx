import type { Booth } from "./types";
import useDragToClose from "./useDragToClose";

type Props = {
  booth: Booth;
  onClose: () => void;
};

function BoothDetailModal({ booth, onClose }: Props) {
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
        {/* 드래그 핸들 — 스크롤 밖 고정 */}
        <div
          className="flex shrink-0 justify-center pt-2.5 pb-5 cursor-grab active:cursor-grabbing touch-none"
          {...dragHandleProps}
        >
          <div className="h-[5px] w-[100px] rounded-full bg-grey-400" />
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-5">
          <div className="flex flex-col gap-5 items-center pb-5">
            {/* 주점명 + 위치 */}
            <div className="flex flex-col gap-2.5 w-full">
              <p className="typo-title-header-1 text-grey-900 text-center">
                {booth.name}
              </p>
              <div className="flex flex-col typo-input-text-m text-grey-700">
                {booth.locations.map((loc, i) => (
                  <p key={i}>{loc}</p>
                ))}
              </div>
            </div>

            {/* 메뉴/포스터 이미지 */}
            {booth.menuImages && booth.menuImages.length > 0 && (
              <div className="flex gap-[5px] w-full">
                {booth.menuImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`${booth.name} 메뉴 이미지 ${i + 1}`}
                    className={`max-h-[15.625rem] w-auto ${
                      booth.menuImages!.length === 1
                        ? "max-w-full"
                        : "max-w-[calc(50%-2.5px)]"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* 메뉴 목록 */}
            {booth.menuItems.length > 0 && (
              <div className="flex flex-col gap-3.5 w-full">
                <p className="typo-input-text-m text-grey-700">대표 메뉴:</p>
                {booth.menuItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="typo-button-text-b text-grey-900 whitespace-pre-line">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="typo-comment-1 text-grey-700">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-center rounded-[10px] bg-[#ebffff] px-2.5 py-[5px] shrink-0">
                      <p className="typo-button-text text-[#00afbf] whitespace-nowrap">
                        {item.price}
                      </p>
                    </div>
                  </div>
                ))}

                {/* 특이사항 안내 */}
                {booth.note && (
                  <p className="typo-comment-1 text-[#3ecad4] whitespace-pre-line">
                    {booth.note}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 닫기 버튼 — 스크롤 밖 고정 */}
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

export default BoothDetailModal;