import { useRef, useState } from "react";
import NotLoginHeader from "../../components/NotLoginHeader";
import Toast from "../../components/Toast";
import editPencilImg from "../../assets/edit_pencil.svg";
import toastCheckIcon from "../../assets/toastCheckIcon.svg";
import profileChangeIcon from "../../assets/profile_change.svg";
import photoUploadIcon from "../../assets/photo_upload.svg";

type DatingCardData = {
  mbti: string;
  tendency: string;
  romanticAnswer: string;
  idealTypeAnswer: string;
  photoUrl: string | null;
};

// TODO: API 연동 시 교체
const mockDatingCard: DatingCardData = {
  mbti: "INFJ",
  tendency: "에겐",
  romanticAnswer:
    "요거바라 사먹고 돌계에서 수다 떨며 하루를 마무리 하는 연애가 하고 싶습니다.",
  idealTypeAnswer:
    "물고기가 먹고 싶어서 한강에서 낚시를 할 만한 사람.\n회 떠먹어요",
  photoUrl: null,
};

const MAX_LENGTH = 75;

const textareaClass = (value: string) =>
  `h-[5.0625rem] w-full resize-none overflow-hidden rounded-[0.625rem] px-2.5 py-2 typo-input-text-m leading-5 focus:outline-none ${
    value.trim()
      ? "bg-primary-100 text-primary-500 placeholder:text-primary-300"
      : "bg-grey-300 text-grey-600 placeholder:text-grey-600"
  }`;

function DatingCardEditPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editingTag, setEditingTag] = useState<"mbti" | "tendency" | null>(null);

  // 뷰 모드에서 보여주는 저장된 값
  const [saved, setSaved] = useState<DatingCardData>(mockDatingCard);
  // 수정 모드에서 편집 중인 임시 값
  const [draft, setDraft] = useState<DatingCardData>(mockDatingCard);

  const handleStartEdit = () => {
    setDraft(saved); // saved 기준으로 draft 초기화
    setIsEditing(true);
  };

  const handleBack = () => {
    // draft 버리고 뷰 모드로 (saved는 그대로)
    setEditingTag(null);
    setIsEditing(false);
  };

  const handleComplete = () => {
    // TODO: API 연동 시 교체
    setSaved(draft); // draft를 saved로 커밋
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleTagConfirm = (field: "mbti" | "tendency") => {
    if (!draft[field].trim()) {
      setDraft((prev) => ({ ...prev, [field]: saved[field] })); // 비어있으면 원래 값으로 복원
    }
    setEditingTag(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDraft((prev) => ({
        ...prev,
        photoUrl: URL.createObjectURL(file),
      }));
    }
  };

  const card = isEditing ? draft : saved;
  const isFormValid =
    draft.romanticAnswer.trim().length > 0 &&
    draft.idealTypeAnswer.trim().length > 0;

  const renderTag = (field: "mbti" | "tendency") => {
    if (isEditing && editingTag === field) {
      return (
        <input
          autoFocus
          value={draft[field]}
          onChange={(e) => setDraft((prev) => ({ ...prev, [field]: e.target.value }))}
          onBlur={() => handleTagConfirm(field)}
          onKeyDown={(e) => { if (e.key === "Enter") handleTagConfirm(field); }}
          className="w-24 rounded-[0.9375rem] bg-primary-100 px-4 py-1.5 typo-button-text text-primary-500 focus:outline-none"
        />
      );
    }
    return (
      <div className="flex items-center gap-1.5 rounded-[0.9375rem] bg-primary-100 px-5 py-1.5">
        <span className="typo-button-text text-primary-500">{card[field]}</span>
        {isEditing && (
          <button
            type="button"
            onClick={() => setEditingTag(field)}
            aria-label={`${field} 변경`}
            className="flex items-center justify-center"
          >
            <img src={profileChangeIcon} alt="" className="h-[0.6875rem] w-[0.875rem]" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader
        title={isEditing ? "소개팅 카드 수정" : "소개팅 카드"}
        onBack={isEditing ? handleBack : undefined}
      />

      <div className="px-5 pt-6 pb-10">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[1.875rem]">
          {/* MBTI / 성향 */}
          <section className="flex flex-col gap-4">
            <h2 className="typo-subtitle-header-2 text-grey-900">
              MBTI / 성향
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {renderTag("mbti")}
              {renderTag("tendency")}
            </div>
          </section>

          {/* 어떤 연애가 하고 싶나요? */}
          <section className="flex flex-col gap-4">
            <h2 className="typo-subtitle-header-2 text-grey-900">
              어떤 연애가 하고 싶나요?
            </h2>
            <div className="flex flex-col gap-[0.3125rem]">
              {isEditing ? (
                <textarea
                  value={draft.romanticAnswer}
                  maxLength={MAX_LENGTH}
                  placeholder="어떤 연애를 하고 싶은지 적어주세요"
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      romanticAnswer: e.target.value,
                    }))
                  }
                  className={textareaClass(draft.romanticAnswer)}
                />
              ) : (
                <div className="h-[5.0625rem] w-full overflow-hidden rounded-[0.625rem] border border-grey-500 bg-grey-100 px-2.5 py-2">
                  <p className="typo-input-text-m leading-5 text-grey-700">
                    {saved.romanticAnswer}
                  </p>
                </div>
              )}
              <p className="typo-comment-1-m text-right text-grey-600">
                {card.romanticAnswer.length}/{MAX_LENGTH}
              </p>
            </div>
          </section>

          {/* 이상형을 한 줄로 표현해주세요 */}
          <section className="flex flex-col gap-4">
            <h2 className="typo-subtitle-header-2 text-grey-900">
              이상형을 한 줄로 표현해주세요
            </h2>
            <div className="flex flex-col gap-[0.3125rem]">
              {isEditing ? (
                <textarea
                  value={draft.idealTypeAnswer}
                  maxLength={MAX_LENGTH}
                  placeholder="이상형을 한 줄로 표현해주세요"
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      idealTypeAnswer: e.target.value,
                    }))
                  }
                  className={textareaClass(draft.idealTypeAnswer)}
                />
              ) : (
                <div className="h-[5.0625rem] w-full overflow-hidden rounded-[0.625rem] border border-grey-500 bg-grey-100 px-2.5 py-2">
                  <p className="typo-input-text-m leading-5 text-grey-700">
                    {saved.idealTypeAnswer}
                  </p>
                </div>
              )}
              <p className="typo-comment-1-m text-right text-grey-600">
                {card.idealTypeAnswer.length}/{MAX_LENGTH}
              </p>
            </div>
          </section>

          {/* 나를 표현하는 사진 */}
          <section className="flex flex-col gap-4">
            <h2 className="typo-subtitle-header-2 text-grey-900">
              나를 표현하는 사진
            </h2>
            <div className="relative w-full overflow-hidden rounded-[0.875rem] bg-grey-300 aspect-[363/271]">
              {card.photoUrl && (
                <img
                  src={card.photoUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {isEditing && (
                <>
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-[1.25rem] bg-grey-100 px-5 py-2"
                    >
                      <span className="typo-button-text-b text-primary-500">
                        다른 사진 선택하기
                      </span>
                      <img src={photoUploadIcon} alt="" className="h-[0.875rem] w-[0.875rem]" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </>
              )}
            </div>
          </section>

          {/* 하단 버튼 */}
          {isEditing ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={!isFormValid}
              className={`flex h-[3.125rem] w-full items-center justify-center gap-2 rounded-[0.875rem] ${
                isFormValid
                  ? "bg-primary-500"
                  : "cursor-not-allowed bg-grey-400"
              }`}
            >
              <span className="typo-button-text-b text-grey-100">
                수정 완료
              </span>
              <img
                src={toastCheckIcon}
                alt=""
                className="h-[0.875rem] w-[0.875rem]"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex h-[3.125rem] w-full items-center justify-center gap-2 rounded-[0.875rem] bg-grey-200"
            >
              <span className="typo-button-text-b text-grey-700">수정하기</span>
              <img src={editPencilImg} alt="" className="h-3 w-3" />
            </button>
          )}

          {/* 프로필 삭제하기 */}
          <button
            type="button"
            className="typo-comment-1 self-end text-right text-grey-600 underline underline-offset-4"
          >
            프로필 삭제하기
          </button>
        </div>
      </div>

      {showToast && <Toast message="수정 완료되었습니다" />}
    </div>
  );
}

export default DatingCardEditPage;