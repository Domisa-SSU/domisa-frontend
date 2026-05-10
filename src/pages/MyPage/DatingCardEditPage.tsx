import { useEffect, useRef, useState } from 'react';
import ErrorPage from '../ErrorPage/ErrorPage';
import NotLoginHeader from '../../components/NotLoginHeader';
import Toast from '../../components/Toast';
import { PhotoCropModal } from '../../components/PhotoCropModal';
import editPencilImg from '../../assets/edit_pencil.svg';
import ProfileChangeIcon from '../../assets/profile_change.svg?react';
import PhotoUploadIcon from '../../assets/photo_upload.svg?react';
import CheckIcon from '../../assets/check.svg?react';
import xIcon from '../../assets/X.svg';
import forbiddenIcon from '../SignupPage/asset/forbiddenIcon.svg';
import selectArrow from '../SignupPage/asset/selectArrow.svg';
import { useDatingProfileQuery, useUpdateDatingProfileMutation } from '../../queries/datingProfile';
import type { DatingProfileResponse, DatingProfileContactType } from '../../api/datingProfile';
import { createProfileImageUploadUrl, uploadProfileImageToS3, completeProfileImageUpload } from '../../api/s3';
import { isServerError } from '../../utils/apiError';
import { reportGlobalErrorIfNeeded } from '../../stores/globalErrorStore';

type ContactMethodType = 'INSTAGRAM' | 'KAKAO';

const contactMethods: { value: ContactMethodType; label: string }[] = [
  { value: 'INSTAGRAM', label: '인스타 ID' },
  { value: 'KAKAO', label: '카카오톡ID' },
];

const selectClassName =
  'h-10 w-full appearance-none rounded-[0.625rem] bg-primary-100 px-[0.875rem] pr-9 typo-input-text-m focus:outline-none';

const formatPhoneNumber = (phone: string) => {
  const digits = phone.replace(/[^0-9]/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

type DatingCardData = {
  mbti: string;
  romanticAnswer: string;
  idealTypeAnswer: string;
  photoUrl: string | null;
  contactMethod: ContactMethodType | '';
  contactValue: string;
  notifPhone: string;
  isSmsOptedOut: boolean;
};

const profileToDraftData = (profile: DatingProfileResponse): DatingCardData => ({
  mbti: profile.mbti,
  romanticAnswer: profile.datingStyle,
  idealTypeAnswer: profile.idealType,
  photoUrl: profile.imageUrl,
  contactMethod: profile.contactType,
  contactValue: profile.contact,
  notifPhone: profile.notificationPhone ?? '',
  isSmsOptedOut: profile.notificationPhone === null,
});

const MAX_LENGTH = 75;

const MBTI_PAIRS: [string, string][] = [
  ['E', 'I'],
  ['N', 'S'],
  ['T', 'F'],
  ['P', 'J'],
];

const textareaClass = (value: string) =>
  `h-[5.0625rem] w-full resize-none overflow-hidden rounded-[0.625rem] px-2.5 py-2 typo-input-text-m leading-5 focus:outline-none ${
    value.trim()
      ? 'bg-primary-100 text-primary-500 placeholder:text-primary-300'
      : 'bg-grey-300 text-grey-600 placeholder:text-grey-600'
  }`;

type MbtiModalProps = {
  mbti: string;
  onConfirm: (mbti: string) => void;
  onCancel: () => void;
};

function MbtiModal({ mbti, onConfirm, onCancel }: MbtiModalProps) {
  const [draft, setDraft] = useState(mbti);

  const select = (rowIndex: number, letter: string) => {
    setDraft((prev) => {
      const chars = prev.split('');
      chars[rowIndex] = letter;
      return chars.join('');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-grey-900/70" onClick={onCancel} />
      <div className="relative z-10 flex w-[21.25rem] flex-col items-center gap-5 rounded-[0.875rem] bg-white pt-10 pb-5">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-[0.625rem] top-5 flex items-center justify-center p-2.5"
          aria-label="닫기"
        >
          <img src={xIcon} alt="" className="h-[1.0625rem] w-4" />
        </button>

        <p className="typo-subtitle-header-2 text-grey-900">MBTI 수정</p>

        <div className="flex w-[18.75rem] flex-col gap-[1.1rem]">
          {MBTI_PAIRS.map(([left, right], rowIndex) => (
            <div key={rowIndex} className="flex gap-[1.1rem]">
              {[left, right].map((letter) => {
                const isSelected = draft[rowIndex] === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => select(rowIndex, letter)}
                    className={`flex h-[3.0625rem] flex-1 items-center justify-center rounded-[0.75rem] ${
                      isSelected
                        ? 'bg-primary-400 typo-button-text-b text-grey-100'
                        : 'bg-primary-100 typo-button-text text-grey-600'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onConfirm(draft)}
          className="flex h-[3.125rem] w-[18.75rem] items-center justify-center rounded-[0.875rem] bg-grey-400"
        >
          <span className="typo-button-text-b text-grey-800">완료</span>
        </button>
      </div>
    </div>
  );
}

type DatingCardEditFormProps = {
  profile: DatingProfileResponse;
};

function DatingCardEditForm({ profile }: DatingCardEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [toast, setToast] = useState<{ message: string; icon?: string } | null>(null);
  const [showMbtiModal, setShowMbtiModal] = useState(false);

  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState('');

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const closeCropModal = () => {
    if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    setCropSourceFile(null);
    setCropSourceUrl('');
  };

  const initialData = profileToDraftData(profile);
  const [saved, setSaved] = useState<DatingCardData>(initialData);
  const [draft, setDraft] = useState<DatingCardData>(initialData);
  const photoFileRef = useRef<File | null>(null);

  const { mutateAsync: updateDatingProfile, isPending: isUpdating } =
    useUpdateDatingProfileMutation();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleStartEdit = () => {
    setDraft(saved);
    setIsEditing(true);
  };

  const handleBack = () => {
    setShowMbtiModal(false);
    setIsEditing(false);
  };

  const handleComplete = async () => {
    try {
      setIsUploading(true);
      if (photoFileRef.current) {
        const uploadInfo = await createProfileImageUploadUrl({
          contentType: photoFileRef.current.type,
          fileSize: photoFileRef.current.size,
        });
        await uploadProfileImageToS3({ presignedUrl: uploadInfo.presignedUrl, file: photoFileRef.current });
        await completeProfileImageUpload({ uploadKey: uploadInfo.objectKey });
      }
      setIsUploading(false);
      await updateDatingProfile({
        mbti: draft.mbti,
        datingStyle: draft.romanticAnswer,
        idealType: draft.idealTypeAnswer,
        contactType: draft.contactMethod as DatingProfileContactType,
        contact: draft.contactValue,
        notificationPhone: draft.isSmsOptedOut ? null : draft.notifPhone,
      });
      setSaved({ ...draft });
      photoFileRef.current = null;
      setIsEditing(false);
      setToast({ message: '수정 완료되었습니다' });
    } catch (error) {
      if (reportGlobalErrorIfNeeded(error)) {
        setIsUploading(false);
        return;
      }

      if (isServerError(error)) {
        setIsUploading(false);
        setServerError(true);
        return;
      }

      console.error(error);
      setIsUploading(false);
      setToast({ message: '수정에 실패했어요. 다시 시도해주세요.', icon: forbiddenIcon });
    }
  };

  if (serverError) {
    return <ErrorPage />;
  }

  const handleMbtiModalClose = (newMbti: string) => {
    setDraft((prev) => ({ ...prev, mbti: newMbti.trim() }));
    setShowMbtiModal(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    setCropSourceFile(file);
    setCropSourceUrl(URL.createObjectURL(file));
  };

  const handleCropConfirm = (croppedFile: File) => {
    photoFileRef.current = croppedFile;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const previewUrl = URL.createObjectURL(croppedFile);
    objectUrlRef.current = previewUrl;
    setDraft((prev) => ({ ...prev, photoUrl: previewUrl }));
    closeCropModal();
  };

  const card = isEditing ? draft : saved;
  const isContactMethodSelected = draft.contactMethod.length > 0;
  const isFormValid =
    draft.romanticAnswer.trim().length > 0 &&
    draft.idealTypeAnswer.trim().length > 0 &&
    draft.contactMethod.length > 0 &&
    draft.contactValue.trim().length > 0 &&
    (draft.isSmsOptedOut || draft.notifPhone.length === 11);

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader
        title={isEditing ? '소개팅 카드 수정' : '소개팅 카드'}
        onBack={isEditing ? handleBack : undefined}
      />

      <div className="px-5 pt-6 pb-10">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-[1.875rem]">
          {/* MBTI */}
          <section className="flex flex-col gap-4">
            <h2 className="typo-subtitle-header-2 text-grey-900">MBTI</h2>
            <div className="flex flex-wrap gap-2.5">
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => setShowMbtiModal(true)}
                  aria-label="MBTI 변경"
                  className="flex items-center gap-1.5 rounded-[0.9375rem] bg-primary-100 px-5 py-1.5"
                >
                  <span className="typo-button-text text-primary-500">{card.mbti}</span>
                  <ProfileChangeIcon className="h-[0.6875rem] w-[0.875rem] text-primary-300" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 rounded-[0.9375rem] bg-primary-100 px-5 py-1.5">
                  <span className="typo-button-text text-primary-500">{card.mbti}</span>
                </div>
              )}
            </div>
          </section>

          {/* 어떤 연애가 하고 싶나요? */}
          <section className="flex flex-col gap-4">
            <h2 className="typo-subtitle-header-2 text-grey-900">어떤 연애가 하고 싶나요?</h2>
            <div className="flex flex-col gap-[0.3125rem]">
              {isEditing ? (
                <textarea
                  value={draft.romanticAnswer}
                  maxLength={MAX_LENGTH}
                  placeholder="어떤 연애를 하고 싶은지 적어주세요"
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, romanticAnswer: e.target.value }))
                  }
                  className={textareaClass(draft.romanticAnswer)}
                />
              ) : (
                <div className="h-[5.0625rem] w-full overflow-hidden rounded-[0.625rem] border border-grey-500 bg-grey-100 px-2.5 py-2">
                  <p className="typo-input-text-m leading-5 text-grey-700">{saved.romanticAnswer}</p>
                </div>
              )}
              <p className="typo-comment-1-m text-right text-grey-600">
                {card.romanticAnswer.length}/{MAX_LENGTH}
              </p>
            </div>
          </section>

          {/* 이상형을 한 줄로 표현해주세요 */}
          <section className="flex flex-col gap-4">
            <h2 className="typo-subtitle-header-2 text-grey-900">이상형을 한 줄로 표현해주세요</h2>
            <div className="flex flex-col gap-[0.3125rem]">
              {isEditing ? (
                <textarea
                  value={draft.idealTypeAnswer}
                  maxLength={MAX_LENGTH}
                  placeholder="이상형을 한 줄로 표현해주세요"
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, idealTypeAnswer: e.target.value }))
                  }
                  className={textareaClass(draft.idealTypeAnswer)}
                />
              ) : (
                <div className="h-[5.0625rem] w-full overflow-hidden rounded-[0.625rem] border border-grey-500 bg-grey-100 px-2.5 py-2">
                  <p className="typo-input-text-m leading-5 text-grey-700">{saved.idealTypeAnswer}</p>
                </div>
              )}
              <p className="typo-comment-1-m text-right text-grey-600">
                {card.idealTypeAnswer.length}/{MAX_LENGTH}
              </p>
            </div>
          </section>

          {/* 나를 표현하는 사진 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="typo-subtitle-header-2 text-grey-900">나를 표현하는 사진</h2>
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-[1.25rem] bg-primary-500 px-5 py-2"
                  >
                    <span className="typo-button-text-b text-grey-100">다시 올리기</span>
                    <PhotoUploadIcon className="h-[0.9rem] w-[0.9rem] text-grey-100" />
                  </button>
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
            <div className="relative mx-auto flex aspect-[71/109] w-full max-w-[13.3125rem] items-center justify-center overflow-hidden rounded-[0.625rem] bg-grey-300">
              {card.photoUrl && (
                <img src={card.photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
          </section>

          {/* 공유할 연락처 */}
          <section className="flex flex-col gap-[0.875rem]">
            <h2 className="typo-button-text text-grey-900">공유할 연락처</h2>
            {isEditing ? (
              <div className="grid grid-cols-[7.75rem_minmax(0,1fr)] gap-2.5">
                <div className="relative">
                  <select
                    value={draft.contactMethod}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        contactMethod: e.target.value as ContactMethodType,
                        contactValue: '',
                      }))
                    }
                    className={`${selectClassName} text-grey-600`}
                  >
                    <option value="">선택</option>
                    {contactMethods.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-[0.875rem] top-1/2 -translate-y-1/2">
                    <img src={selectArrow} alt="" className="h-[0.3125rem] w-[0.625rem]" />
                  </span>
                </div>
                <div
                  className={`flex h-10 w-full items-center gap-0.5 rounded-[0.625rem] border-[1.2px] border-transparent bg-primary-100 px-[0.875rem] ${isContactMethodSelected ? '' : 'opacity-50'}`}
                >
                  {draft.contactMethod === 'INSTAGRAM' && (
                    <span className="typo-input-text-m text-primary-500">@</span>
                  )}
                  <input
                    value={draft.contactValue}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        contactValue: e.target.value.replace(/^@+/, ''),
                      }))
                    }
                    disabled={!isContactMethodSelected}
                    className="min-w-0 flex-1 bg-transparent typo-input-text-m text-primary-500 placeholder:text-grey-600 focus:outline-none"
                    placeholder={
                      draft.contactMethod === 'INSTAGRAM'
                        ? '인스타 ID를 입력해주세요'
                        : draft.contactMethod === 'KAKAO'
                          ? '카카오톡 ID를 입력해주세요'
                          : ''
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <div className="flex h-10 w-[6.75rem] shrink-0 items-center justify-between rounded-[0.625rem] border border-grey-500 bg-grey-100 px-[0.875rem]">
                  <span className="typo-input-text-m text-grey-600">
                    {contactMethods.find((m) => m.value === saved.contactMethod)?.label ?? '선택'}
                  </span>
                  <img src={selectArrow} alt="" className="h-[0.3125rem] w-[0.625rem]" />
                </div>
                <div className="flex h-10 flex-1 items-center rounded-[0.625rem] border border-grey-500 bg-grey-100 px-[0.875rem]">
                  <span className="typo-input-text-m text-grey-700">
                    {saved.contactMethod === 'INSTAGRAM' ? `@${saved.contactValue}` : saved.contactValue}
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* 알림문자 받을 전화번호 */}
          <section className="flex flex-col gap-[0.875rem]">
            <h2 className="typo-button-text text-grey-900">알림문자 받을 전화번호</h2>
            {isEditing ? (
              <>
                <input
                  value={formatPhoneNumber(draft.notifPhone)}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, notifPhone: e.target.value.replace(/[^0-9]/g, '').slice(0, 11) }))
                  }
                  disabled={draft.isSmsOptedOut}
                  inputMode="numeric"
                  maxLength={13}
                  placeholder="010-0000-0000"
                  className={`h-9 w-full border-b-[1.8px] bg-transparent typo-input-text focus:outline-none ${
                    draft.isSmsOptedOut
                      ? 'border-grey-400 text-grey-400 placeholder:text-grey-400'
                      : 'border-primary-200 text-primary-500 placeholder:text-grey-600'
                  }`}
                />
                <button
                  type="button"
                  aria-pressed={draft.isSmsOptedOut}
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, isSmsOptedOut: !prev.isSmsOptedOut, notifPhone: '' }))
                  }
                  className="flex items-center gap-2.5 self-start"
                >
                  <span
                    className={`flex h-[1.5625rem] w-[1.5625rem] items-center justify-center rounded-[0.3125rem] ${
                      draft.isSmsOptedOut ? 'bg-primary-500' : 'bg-grey-400'
                    }`}
                  >
                    <CheckIcon className="w-[1.125rem] h-[0.9375rem]" />
                  </span>
                  <span
                    className={`typo-comment-1-m ${
                      draft.isSmsOptedOut ? 'text-primary-600' : 'text-grey-600'
                    }`}
                  >
                    문자 알림 안 받을래요
                  </span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-[0.625rem]">
                <p className="typo-input-text text-grey-700">
                  {saved.isSmsOptedOut ? '문자 알림 없음' : formatPhoneNumber(saved.notifPhone)}
                </p>
                <div className="h-px w-full bg-grey-500" />
              </div>
            )}
          </section>

          {/* 하단 버튼 */}
          {isEditing ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={!isFormValid || isUploading || isUpdating}
              className={`flex h-[3.125rem] w-full items-center justify-center gap-2 rounded-[0.875rem] ${
                isFormValid && !isUploading && !isUpdating ? 'bg-primary-500' : 'cursor-not-allowed bg-grey-400'
              }`}
            >
              <span className="typo-button-text-b text-grey-100">
                {isUploading ? '업로드 중' : isUpdating ? '수정 중' : '수정 완료'}
              </span>
              {!isUploading && !isUpdating && <CheckIcon className="h-3 w-3 text-grey-100" />}
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
        </div>
      </div>

      {showMbtiModal && (
        <MbtiModal
          mbti={draft.mbti}
          onConfirm={handleMbtiModalClose}
          onCancel={() => setShowMbtiModal(false)}
        />
      )}

      {cropSourceFile && cropSourceUrl && (
        <PhotoCropModal
          sourceFile={cropSourceFile}
          imageUrl={cropSourceUrl}
          onCancel={closeCropModal}
          onConfirm={handleCropConfirm}
        />
      )}

      {toast && <Toast message={toast.message} icon={toast.icon} />}
    </div>
  );
}

function DatingCardEditPage() {
  const { data: profile, error, isLoading, isError } = useDatingProfileQuery();

  if (isServerError(error)) {
    return <ErrorPage />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-grey-100">
        <NotLoginHeader title="소개팅 카드" />
        <p className="mt-10 text-center typo-input-text-m text-grey-600">소개팅 카드를 불러오지 못했어요.</p>
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-grey-100">
        <NotLoginHeader title="소개팅 카드" />
      </div>
    );
  }

  return <DatingCardEditForm profile={profile} />;
}

export default DatingCardEditPage;
