import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomActionBar from '../../components/BottomActionBar';
import ErrorPage from '../ErrorPage/ErrorPage';
import NotLoginHeader from '../../components/NotLoginHeader';
import Toast from '../../components/Toast';
import { PhotoCropModal } from '../../components/PhotoCropModal';
import { EDIT_PROFILE_TOAST_STORAGE_KEY } from '../../constants/storageKeys';
import { useCheckNicknameMutation, useUserMeQuery, useUpdateMeMutation } from '../../queries/users';
import type { ContactType, UserMeResponse } from '../../api/users';
import {
  getNicknameFilterMessage,
  isValidNickname,
  NICKNAME_MAX_LENGTH,
  normalizeNickname,
} from '../../utils/nickname';
import {
  completeProfileImageUpload,
  createProfileImageUploadUrl,
  uploadProfileImageToS3,
} from '../../api/s3';
import ProfileChangeIcon from '../../assets/profile_change.svg?react';
import PhotoUploadIcon from '../../assets/photo_upload.svg?react';
import CheckIcon from '../../assets/check.svg?react';
import sumnailIcon from '../DatingPage/assets/sumnailIcon.png';
import uploadIcon from '../DatingPage/assets/uploadIcon.svg';
import xIcon from '../../assets/X.svg';
import forbiddenIcon from '../SignupPage/asset/forbiddenIcon.svg';
import pinkCheckIcon from '../SignupPage/asset/pinkCheckIcon.svg';
import selectArrow from '../SignupPage/asset/selectArrow.svg';
import {
  ANIMAL_OPTIONS,
  animalImageMap,
  animalNameByProfile,
  animalProfileByName,
} from '../../constants/animalProfile';
import { isServerError } from '../../utils/apiError';
import { reportGlobalErrorIfNeeded } from '../../stores/globalErrorStore';

const birthYears = Array.from({ length: 21 }, (_, index) => `${2008 - index}`);

const fieldClassName =
  'h-10 w-full rounded-[0.625rem] border-[1.2px] border-transparent bg-primary-100 px-[0.875rem] typo-input-text-m text-primary-500 placeholder:text-grey-600 focus:outline-none';
const selectClassName =
  'h-10 w-full appearance-none rounded-[0.625rem] bg-primary-100 px-[0.875rem] pr-9 typo-input-text-m focus:outline-none';

const CONTACT_METHODS: { value: ContactType; label: string }[] = [
  { value: 'INSTAGRAM', label: '인스타 ID' },
  { value: 'KAKAO', label: '카카오톡ID' },
];

const MBTI_PAIRS: [string, string][] = [
  ['E', 'I'],
  ['N', 'S'],
  ['T', 'F'],
  ['P', 'J'],
];

const formatPhoneNumber = (phone: string) => {
  const digits = phone.replace(/[^0-9]/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

type AnimalSelectModalProps = {
  current: string;
  onConfirm: (animal: string) => void;
  onClose: () => void;
};

function AnimalSelectModal({ current, onConfirm, onClose }: AnimalSelectModalProps) {
  const [draft, setDraft] = useState(current);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-grey-900/70" onClick={onClose} />
      <div className="relative z-10 flex w-[21.25rem] flex-col items-center gap-[1.875rem] rounded-[0.875rem] bg-white pt-10 pb-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[0.625rem] top-5 flex items-center justify-center p-2.5"
          aria-label="닫기"
        >
          <img src={xIcon} alt="" className="h-[1.0625rem] w-4" />
        </button>

        <p className="typo-subtitle-header-2 text-grey-900">프로필 수정</p>

        <div className="grid grid-cols-[repeat(3,5rem)] gap-x-6 gap-y-4">
          {ANIMAL_OPTIONS.map((animal) => {
            const isSelected = draft === animal.name;
            return (
              <button
                key={animal.name}
                type="button"
                onClick={() => setDraft(animal.name)}
                className="flex flex-col items-center gap-0.5"
              >
                <div
                  className={`size-20 overflow-hidden rounded-[1.5rem] ${
                    isSelected ? 'bg-primary-500' : 'bg-grey-300'
                  }`}
                >
                  <img src={animal.image} alt={animal.name} className="size-full object-cover" />
                </div>
                <span
                  className={`typo-comment-2 ${isSelected ? 'text-primary-500' : 'text-grey-900'}`}
                >
                  {animal.name}
                </span>
              </button>
            );
          })}
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

type MbtiModalProps = {
  mbti: string;
  onConfirm: (mbti: string) => void;
  onClose: () => void;
};

function MbtiModal({ mbti, onConfirm, onClose }: MbtiModalProps) {
  const [draft, setDraft] = useState(mbti);

  const select = (rowIndex: number, letter: string) => {
    setDraft((prev) => {
      const chars = prev.padEnd(4, ' ').split('');
      chars[rowIndex] = letter;
      return chars.join('').trimEnd();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-grey-900/70" onClick={onClose} />
      <div className="relative z-10 flex w-[21.25rem] flex-col items-center gap-5 rounded-[0.875rem] bg-white pt-10 pb-5">
        <button
          type="button"
          onClick={onClose}
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

type EditProfileFormProps = {
  me: UserMeResponse;
  isPhotoProcessing: boolean;
};

function EditProfileForm({ me, isPhotoProcessing }: EditProfileFormProps) {
  const navigate = useNavigate();
  const [selectedAnimal, setSelectedAnimal] = useState(animalNameByProfile[me.animalProfile]);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [nickname, setNickname] = useState(me.nickname);
  const [isNicknameChecked, setIsNicknameChecked] = useState(true);
  const [nicknameErrorMessage, setNicknameErrorMessage] = useState('');
  const gender = me.gender ? '남성' : '여성';
  const [birthYear, setBirthYear] = useState(String(me.birthYear));
  const [mbti, setMbti] = useState(me.mbti ?? '');
  const [showMbtiModal, setShowMbtiModal] = useState(false);
  const [contactType, setContactType] = useState<ContactType | ''>(me.contactType ?? '');
  const [contact, setContact] = useState(me.contact ?? '');
  const [notifPhone, setNotifPhone] = useState(me.notificationPhone ?? '');
  const [isSmsOptedOut, setIsSmsOptedOut] = useState(!me.notificationPhone);
  // 사용자가 새로 고른 사진. 없으면 서버가 준 imageUrl 을 그대로 보여준다.
  // 처리 중이라 null 로 오던 imageUrl 이 뒤늦게 도착해도 파생값이라 자동 반영된다
  const [pickedPhotoUrl, setPickedPhotoUrl] = useState<string | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoFileRef = useRef<File | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const { mutateAsync: checkNicknameAvailability, isPending: isCheckingNickname } =
    useCheckNicknameMutation();
  const { mutateAsync: updateMe, isPending: isUpdating } = useUpdateMeMutation();
  const [toastMessage, setToastMessage] = useState('');
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(''), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);


  const photoUrl = pickedPhotoUrl ?? me.imageUrl ?? null;

  const isFormValid = useMemo(() => {
    return (
      isValidNickname(nickname) &&
      isNicknameChecked &&
      gender.length > 0 &&
      birthYear.length > 0 &&
      mbti.length === 4 &&
      contactType.length > 0 &&
      contact.trim().length > 0 &&
      (isSmsOptedOut || notifPhone.length === 11)
    );
  }, [
    birthYear,
    contact,
    contactType,
    gender,
    isNicknameChecked,
    isSmsOptedOut,
    mbti,
    nickname,
    notifPhone,
  ]);

  if (serverError) {
    return <ErrorPage />;
  }

  const closeCropModal = () => {
    if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    setCropSourceFile(null);
    setCropSourceUrl('');
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    setCropSourceFile(file);
    setCropSourceUrl(URL.createObjectURL(file));
  };

  const handleCropConfirm = (croppedFile: File) => {
    photoFileRef.current = croppedFile;
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = URL.createObjectURL(croppedFile);
    previewUrlRef.current = nextPreviewUrl;
    setPickedPhotoUrl(nextPreviewUrl);
    closeCropModal();
  };

  const handleNicknameInputChange = (value: string) => {
    /**
     * 타이핑 중에는 값을 건드리지 않는다. 조합 중인 한글(ㅎ, 하)은 허용 문자가 아니라
     * 여기서 걸러내면 글자가 완성되기 전에 사라진다. compositionstart 를 늦게 주거나
     * 주지 않는 키보드가 있어서 조합 여부로 판단하는 것도 믿을 수 없다.
     *
     * 형식 검증은 확인을 눌렀을 때만 한다.
     */
    setNickname(value);
    setIsNicknameChecked(value === me.nickname);
    setNicknameErrorMessage('');
  };

  const handleCheckNickname = async () => {
    if (!isValidNickname(nickname)) {
      setIsNicknameChecked(false);
      setNicknameErrorMessage(
        nickname
          ? getNicknameFilterMessage(nickname, normalizeNickname(nickname))
          : '닉네임을 입력해주세요'
      );
      return;
    }

    if (nickname === me.nickname) {
      setIsNicknameChecked(true);
      setNicknameErrorMessage('');
      return;
    }

    try {
      const { isAvailable } = await checkNicknameAvailability(nickname);

      setIsNicknameChecked(isAvailable);
      setNicknameErrorMessage(isAvailable ? '' : '이미 사용 중인 닉네임입니다');
    } catch (error) {
      if (isServerError(error)) {
        setServerError(true);
        return;
      }

      console.error(error);
      setIsNicknameChecked(false);
      setNicknameErrorMessage('닉네임 확인에 실패했어요. 다시 시도해주세요');
    }
  };

  const handleSubmit = async () => {
    if (!contactType) {
      return;
    }

    try {
      // 사진은 S3 3단계로 먼저 반영한 뒤 나머지 정보를 PUT 한다.
      // 업로드가 끝나면 ref 를 비워, PUT 이 실패해 재시도하더라도 다시 올리지 않는다.
      if (photoFileRef.current) {
        setIsUploading(true);
        const uploadInfo = await createProfileImageUploadUrl({
          contentType: photoFileRef.current.type,
          fileSize: photoFileRef.current.size,
        });
        await uploadProfileImageToS3({
          presignedUrl: uploadInfo.presignedUrl,
          file: photoFileRef.current,
        });
        await completeProfileImageUpload({ uploadKey: uploadInfo.objectKey });
        photoFileRef.current = null;
        setIsUploading(false);
      }

      // PUT 은 전체 교체라 8개 필드를 모두 보낸다. 일부만 보내면 나머지가 비워진다
      await updateMe({
        nickname,
        gender: gender === '남성',
        birthYear: Number(birthYear),
        animalProfile: animalProfileByName[selectedAnimal],
        mbti,
        contactType,
        contact: contact.trim(),
        notificationPhone: isSmsOptedOut ? null : notifPhone,
      });
      sessionStorage.setItem(EDIT_PROFILE_TOAST_STORAGE_KEY, 'true');
      navigate(-1);
    } catch (error) {
      setIsUploading(false);

      if (reportGlobalErrorIfNeeded(error)) {
        return;
      }

      if (isServerError(error)) {
        setServerError(true);
        return;
      }

      console.error(error);
      setToastMessage('정보 수정에 실패했어요. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="정보 수정" />
      <div className="px-5 pt-6 pb-[7.5625rem]">
        <div className="mx-auto flex w-full max-w-[22.6875rem] flex-col gap-5">
          {/* 동물 프로필 */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowAnimalModal(true)}
              className="relative"
              aria-label="프로필 동물 변경"
            >
              <div className="size-[6.25rem] overflow-hidden rounded-[1.875rem] bg-primary-100">
                <img
                  src={animalImageMap[selectedAnimal]}
                  alt={selectedAnimal}
                  className="size-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 flex size-[2.125rem] items-center justify-center rounded-full bg-primary-500">
                <ProfileChangeIcon className="h-[0.875rem] w-[1.125rem] text-white" />
              </div>
            </button>
          </div>

          {/* 닉네임 */}
          <section className="flex flex-col gap-[0.875rem]">
            <div className="flex items-center gap-2.5">
              <h2 className="typo-button-text text-grey-900">닉네임</h2>
              <p className="typo-comment-2 text-primary-300">
                * 닉네임은 8자까지만 작성이 가능해요
              </p>
            </div>
            <div className="flex flex-col gap-[0.31rem]">
              <div className="relative">
                <input
                  value={nickname}
                  maxLength={NICKNAME_MAX_LENGTH}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="none"
                  onChange={(event) => handleNicknameInputChange(event.target.value)}
                  className={`${fieldClassName} pr-[5.5rem] ${
                    nicknameErrorMessage ? 'border-[1.2px] border-warning' : ''
                  }`}
                  placeholder="닉네임을 입력하세요"
                />
                <button
                  type="button"
                  disabled={isCheckingNickname}
                  onClick={handleCheckNickname}
                  className="absolute right-[0.31rem] top-1/2 flex -translate-y-1/2 items-center justify-center rounded-[0.625rem] border-[0.8px] border-primary-200 bg-grey-100 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="typo-comment-2 text-primary-300">
                    {isCheckingNickname ? '확인 중' : '확인'}
                  </span>
                </button>
              </div>
              <div className="min-h-[0.875rem]">
                {nicknameErrorMessage ? (
                  <div className="flex items-center gap-[0.125rem]">
                    <span className="typo-comment-2 text-warning">{nicknameErrorMessage}</span>
                    <img src={forbiddenIcon} alt="" className="h-[0.6875rem] w-[0.6875rem]" />
                  </div>
                ) : isNicknameChecked ? (
                  <div className="flex items-center gap-[0.125rem]">
                    <span className="typo-comment-2 text-primary-300">
                      사용 가능한 닉네임입니다
                    </span>
                    <img src={pinkCheckIcon} alt="" className="h-[0.6875rem] w-[0.6875rem]" />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {/* 성별 */}
          <section className="flex flex-col gap-[0.875rem]">
            <h2 className="typo-button-text text-grey-900">성별</h2>
            <div className="flex gap-[0.3125rem]">
              {['남성', '여성'].map((option) => {
                const isSelected = gender === option;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled
                    className={`flex h-10 flex-1 items-center justify-center rounded-[0.625rem] px-2.5 ${
                      isSelected
                        ? 'bg-primary-500 typo-input-text text-grey-100 opacity-60'
                        : 'bg-primary-100 typo-input-text-m text-grey-600 opacity-40'
                    } cursor-not-allowed`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 출생 연도 */}
          <section className="flex flex-col gap-2.5">
            <h2 className="typo-button-text text-grey-900">출생 연도</h2>
            <div className="relative w-[10.875rem]">
              <select
                value={birthYear}
                onChange={(event) => setBirthYear(event.target.value)}
                className={`${selectClassName} typo-input-text ${
                  birthYear ? 'text-primary-500' : 'text-grey-600'
                }`}
              >
                <option value="">출생 연도를 선택해주세요</option>
                {birthYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-[0.875rem] top-1/2 -translate-y-1/2">
                <img src={selectArrow} alt="" className="h-[0.3125rem] w-[0.625rem]" />
              </span>
            </div>
          </section>

          {/* MBTI */}
          <section className="flex flex-col gap-4">
            <h2 className="typo-subtitle-header-2 text-grey-900">MBTI</h2>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setShowMbtiModal(true)}
                className="flex items-center justify-center gap-1.5 rounded-[0.9375rem] bg-primary-100 px-[1.375rem] py-2.5"
              >
                <span className="typo-button-text-b text-primary-500">
                  {mbti || 'MBTI 선택'}
                </span>
                <ProfileChangeIcon className="h-[0.6875rem] w-[0.875rem] text-primary-500" />
              </button>
            </div>
          </section>

          {/* 나를 표현하는 사진 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="typo-subtitle-header-2 text-grey-900">나를 표현하는 사진</h2>
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
            </div>
            {/* 회원가입 사진 스텝(SignupStepPhoto)과 동일한 영역 */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`relative mx-auto flex aspect-[71/109] w-full max-w-[13.3125rem] items-center justify-center overflow-hidden rounded-[0.625rem] bg-grey-300 ${
                photoUrl ? '' : 'border-[1.8px] border-dashed border-grey-700'
              }`}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="선택한 프로필 사진"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <>
                  <img
                    src={sumnailIcon}
                    alt=""
                    className="absolute left-1/2 top-1/2 h-[9.9375rem] w-[10.3125rem] -translate-x-1/2 -translate-y-1/2 object-contain opacity-50"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2.5">
                    {isPhotoProcessing ? (
                      <>
                        <div
                          role="status"
                          aria-label="사진 준비 중"
                          className="h-6 w-6 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
                        />
                        <span className="typo-input-text-m text-center text-grey-900 opacity-50">
                          사진을 준비하고 있어요
                        </span>
                      </>
                    ) : (
                      <>
                        <img src={uploadIcon} alt="" className="h-6 w-6" />
                        <span className="typo-input-text-m text-grey-900 opacity-50">
                          클릭하여 파일 선택
                        </span>
                      </>
                    )}
                  </div>
                </>
              )}
            </button>
          </section>

          {/* 공유할 연락처 */}
          <section className="flex flex-col gap-[0.875rem]">
            <h2 className="typo-button-text text-grey-900">공유할 연락처</h2>
            <div className="grid grid-cols-[7.75rem_minmax(0,1fr)] gap-2.5">
              <div className="relative">
                <select
                  value={contactType}
                  onChange={(event) => {
                    setContactType(event.target.value as ContactType);
                    setContact('');
                  }}
                  className={`${selectClassName} text-grey-600`}
                >
                  <option value="">선택</option>
                  {CONTACT_METHODS.map((item) => (
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
                className={`flex h-10 w-full items-center gap-0.5 rounded-[0.625rem] border-[1.2px] border-transparent bg-primary-100 px-[0.875rem] ${
                  contactType ? '' : 'opacity-50'
                }`}
              >
                {contactType === 'INSTAGRAM' && (
                  <span className="typo-input-text-m text-primary-500">@</span>
                )}
                <input
                  value={contact}
                  onChange={(event) => setContact(event.target.value.replace(/^@+/, ''))}
                  disabled={!contactType}
                  className="min-w-0 flex-1 bg-transparent typo-input-text-m text-primary-500 placeholder:text-grey-600 focus:outline-none"
                  placeholder={
                    contactType === 'INSTAGRAM'
                      ? '인스타 ID를 입력해주세요'
                      : contactType === 'KAKAO'
                        ? '카카오톡 ID를 입력해주세요'
                        : ''
                  }
                />
              </div>
            </div>
          </section>

          {/* 알림문자 받을 전화번호 */}
          <section className="flex flex-col gap-[0.875rem]">
            <h2 className="typo-button-text text-grey-900">알림문자 받을 전화번호</h2>
            <input
              value={formatPhoneNumber(notifPhone)}
              onChange={(event) =>
                setNotifPhone(event.target.value.replace(/[^0-9]/g, '').slice(0, 11))
              }
              disabled={isSmsOptedOut}
              inputMode="numeric"
              maxLength={13}
              placeholder="010-0000-0000"
              className={`h-9 w-full border-b-[1.8px] bg-transparent typo-input-text focus:outline-none ${
                isSmsOptedOut
                  ? 'border-grey-400 text-grey-400 placeholder:text-grey-400'
                  : 'border-primary-200 text-primary-500 placeholder:text-grey-600'
              }`}
            />
            <button
              type="button"
              aria-pressed={isSmsOptedOut}
              onClick={() => {
                setIsSmsOptedOut((prev) => !prev);
                setNotifPhone('');
              }}
              className="flex items-center gap-2.5 self-start"
            >
              <span
                className={`flex h-[1.5625rem] w-[1.5625rem] items-center justify-center rounded-[0.3125rem] ${
                  isSmsOptedOut ? 'bg-primary-500' : 'bg-grey-400'
                }`}
              >
                <CheckIcon className="w-[1.125rem] h-[0.9375rem]" />
              </span>
              <span
                className={`typo-comment-1-m ${
                  isSmsOptedOut ? 'text-primary-600' : 'text-grey-600'
                }`}
              >
                문자 알림 안 받을래요
              </span>
            </button>
          </section>
        </div>
      </div>

      <BottomActionBar
        label="수정 완료"
        disabled={!isFormValid || isUpdating || isUploading}
        onClick={handleSubmit}
      />

      {toastMessage && <Toast message={toastMessage} icon={forbiddenIcon} />}

      {showAnimalModal && (
        <AnimalSelectModal
          current={selectedAnimal}
          onConfirm={(animal) => {
            setSelectedAnimal(animal);
            setShowAnimalModal(false);
          }}
          onClose={() => setShowAnimalModal(false)}
        />
      )}

      {showMbtiModal && (
        <MbtiModal
          mbti={mbti}
          onConfirm={(nextMbti) => {
            setMbti(nextMbti.trim());
            setShowMbtiModal(false);
          }}
          onClose={() => setShowMbtiModal(false)}
        />
      )}

      {cropSourceFile && (
        <PhotoCropModal
          sourceFile={cropSourceFile}
          imageUrl={cropSourceUrl}
          onConfirm={handleCropConfirm}
          onCancel={closeCropModal}
        />
      )}
    </div>
  );
}

function EditProfilePage() {
  // 가입 직후에는 서버가 사진을 처리하는 동안 imageUrl 이 null 로 온다
  const { data: me, error, isLoading } = useUserMeQuery({ pollWhileImageMissing: true });

  if (isServerError(error)) {
    return <ErrorPage />;
  }

  if (isLoading || !me) {
    return (
      <div className="min-h-screen bg-grey-100">
        <NotLoginHeader title="정보 수정" />
      </div>
    );
  }

  return <EditProfileForm me={me} isPhotoProcessing={!me.imageUrl} />;
}

export default EditProfilePage;
