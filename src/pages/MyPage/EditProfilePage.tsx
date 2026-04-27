import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomActionBar from '../../components/BottomActionBar';
import NotLoginHeader from '../../components/NotLoginHeader';
import { EDIT_PROFILE_TOAST_STORAGE_KEY } from '../../constants/storageKeys';
import ProfileChangeIcon from '../../assets/profile_change.svg?react';
import xIcon from '../../assets/X.svg';
import forbiddenIcon from '../SignupPage/asset/forbiddenIcon.svg';
import pinkCheckIcon from '../SignupPage/asset/pinkCheckIcon.svg';
import selectArrow from '../SignupPage/asset/selectArrow.svg';
import alphacaImg from '../SignupPage/asset/alphacaImg.png';
import bearImg from '../SignupPage/asset/bearImg.png';
import capibaraImg from '../SignupPage/asset/capibaraImg.png';
import catImg from '../SignupPage/asset/catImg.png';
import deerImg from '../SignupPage/asset/deerImg.png';
import dogImg from '../SignupPage/asset/dogImg.png';
import foxImg from '../SignupPage/asset/foxImg.png';
import hamsterImg from '../SignupPage/asset/hamsterImg.png';
import namuneulboImg from '../SignupPage/asset/namuneulboImg.png';
import rabbitImg from '../SignupPage/asset/rabbitImg.png';
import sudalImg from '../SignupPage/asset/sudalImg.png';
import wolfImg from '../SignupPage/asset/wolfImg.png';

const birthYears = Array.from({ length: 21 }, (_, index) => `${2008 - index}`);
const contactMethods = ['인스타 ID', '전화번호', '카카오톡ID'];
const phonePrefix = '010';

const animalOptions = [
  { name: '강아지', image: dogImg },
  { name: '고양이', image: catImg },
  { name: '곰', image: bearImg },
  { name: '나무늘보', image: namuneulboImg },
  { name: '햄스터', image: hamsterImg },
  { name: '늑대', image: wolfImg },
  { name: '토끼', image: rabbitImg },
  { name: '사슴', image: deerImg },
  { name: '수달', image: sudalImg },
  { name: '알파카', image: alphacaImg },
  { name: '여우', image: foxImg },
  { name: '카피바라', image: capibaraImg },
];

const animalImageMap: Record<string, string> = Object.fromEntries(
  animalOptions.map((a) => [a.name, a.image])
);

// TODO: API 연동 시 교체
const mockUser = {
  nickname: '삑그리고',
  gender: '여성',
  birthYear: '2003',
  contactMethod: '인스타 ID',
  contactValue: '@1014.1248',
  animalType: '수달',
};

const fieldClassName =
  'h-10 w-full rounded-[0.625rem] border-[1.2px] border-transparent bg-primary-100 px-[0.875rem] typo-input-text-m text-primary-500 placeholder:text-grey-600 focus:outline-none';
const selectClassName =
  'h-10 w-full appearance-none rounded-[0.625rem] bg-primary-100 px-[0.875rem] pr-9 typo-input-text-m focus:outline-none';

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
          {animalOptions.map((animal) => {
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

function EditProfilePage() {
  const navigate = useNavigate();
  const [selectedAnimal, setSelectedAnimal] = useState(mockUser.animalType);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const [nickname, setNickname] = useState(mockUser.nickname);
  const [isNicknameChecked, setIsNicknameChecked] = useState(true);
  const [nicknameErrorMessage, setNicknameErrorMessage] = useState('');
  const [gender, setGender] = useState(mockUser.gender);
  const [birthYear, setBirthYear] = useState(mockUser.birthYear);
  const [contactMethod, setContactMethod] = useState(mockUser.contactMethod);
  const [phoneMiddle, setPhoneMiddle] = useState('');
  const [phoneLast, setPhoneLast] = useState('');
  const [contactValue, setContactValue] = useState(mockUser.contactValue);

  const isFormValid = useMemo(() => {
    const isContactFilled =
      contactMethod === '전화번호'
        ? phoneMiddle.trim().length > 0 && phoneLast.trim().length > 0
        : contactMethod.length > 0 && contactValue.trim().length > 0;

    return (
      nickname.trim().length > 0 &&
      isNicknameChecked &&
      gender.length > 0 &&
      birthYear.length > 0 &&
      isContactFilled
    );
  }, [
    birthYear,
    contactMethod,
    contactValue,
    gender,
    isNicknameChecked,
    nickname,
    phoneLast,
    phoneMiddle,
  ]);

  const isContactMethodSelected = contactMethod.length > 0;

  const handleLimitedChange = (
    value: string,
    limit: number,
    setter: (nextValue: string) => void
  ) => {
    if (value.length <= limit) {
      setter(value);
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
                * 닉네임은 4자까지만 작성이 가능해요
              </p>
            </div>
            <div className="flex flex-col gap-[0.31rem]">
              <div className="relative">
                <input
                  value={nickname}
                  maxLength={4}
                  onChange={(event) => {
                    handleLimitedChange(event.target.value, 4, setNickname);
                    setIsNicknameChecked(false);
                    setNicknameErrorMessage('');
                  }}
                  className={`${fieldClassName} pr-[5.5rem] ${
                    nicknameErrorMessage ? 'border-[1.2px] border-warning' : ''
                  }`}
                  placeholder="닉네임을 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (nickname.trim().length === 0) {
                      setIsNicknameChecked(false);
                      setNicknameErrorMessage('닉네임을 입력해주세요');
                      return;
                    }
                    // TODO: 닉네임 중복 확인 API 호출로 교체 (nickname.trim() 전송)
                    setNicknameErrorMessage('');
                    setIsNicknameChecked(true);
                  }}
                  className="absolute right-[0.31rem] top-1/2 flex -translate-y-1/2 items-center justify-center rounded-[0.625rem] border-[0.8px] border-primary-200 bg-grey-100 px-4 py-2"
                >
                  <span className="typo-comment-2 text-primary-300">확인</span>
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
                    onClick={() => setGender(option)}
                    className={`flex h-10 flex-1 items-center justify-center rounded-[0.625rem] px-2.5 ${
                      isSelected
                        ? 'bg-primary-500 typo-input-text text-grey-100'
                        : 'bg-primary-100 typo-input-text-m text-grey-600'
                    }`}
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

          {/* 연락처 */}
          <section className="flex flex-col gap-[0.875rem]">
            <h2 className="typo-button-text text-grey-900">연락처를 입력해주세요</h2>
            <div className="grid grid-cols-[7.75rem_minmax(0,1fr)] gap-2.5">
              <div className="relative">
                <select
                  value={contactMethod}
                  onChange={(event) => {
                    const nextMethod = event.target.value;
                    setContactMethod(nextMethod);
                    setContactValue('');
                    setPhoneMiddle('');
                    setPhoneLast('');
                  }}
                  className={`${selectClassName} ${
                    contactMethod ? 'text-primary-500' : 'text-grey-600'
                  }`}
                >
                  <option value="">선택</option>
                  {contactMethods.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-[0.875rem] top-1/2 -translate-y-1/2">
                  <img src={selectArrow} alt="" className="h-[0.3125rem] w-[0.625rem]" />
                </span>
              </div>
              {contactMethod === '전화번호' ? (
                <div className="grid grid-cols-3 gap-[0.3125rem]">
                  <div
                    aria-disabled="true"
                    className="flex h-10 w-full items-center rounded-[0.625rem] bg-primary-100 px-[0.875rem] typo-input-text-m text-primary-500"
                  >
                    {phonePrefix}
                  </div>
                  <input
                    value={phoneMiddle}
                    onChange={(event) =>
                      setPhoneMiddle(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))
                    }
                    disabled={!isContactMethodSelected}
                    className={`${fieldClassName} ${isContactMethodSelected ? '' : 'opacity-50'}`}
                    inputMode="numeric"
                    maxLength={4}
                  />
                  <input
                    value={phoneLast}
                    onChange={(event) =>
                      setPhoneLast(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))
                    }
                    disabled={!isContactMethodSelected}
                    className={`${fieldClassName} ${isContactMethodSelected ? '' : 'opacity-50'}`}
                    inputMode="numeric"
                    maxLength={4}
                  />
                </div>
              ) : (
                <input
                  value={contactValue}
                  onChange={(event) => setContactValue(event.target.value)}
                  disabled={!isContactMethodSelected}
                  className={`${fieldClassName} ${isContactMethodSelected ? '' : 'opacity-50'}`}
                  placeholder={
                    contactMethod === '인스타 ID'
                      ? '인스타 ID를 입력해주세요'
                      : contactMethod === '카카오톡ID'
                        ? '카카오톡 ID를 입력해주세요'
                        : ''
                  }
                />
              )}
            </div>
          </section>
        </div>
      </div>

      <BottomActionBar
        label="수정 완료"
        disabled={!isFormValid}
        onClick={() => {
          // TODO: API 연동 시 수정 성공 콜백 안으로 이동
          sessionStorage.setItem(EDIT_PROFILE_TOAST_STORAGE_KEY, 'true');
          navigate(-1);
        }}
      />

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
    </div>
  );
}

export default EditProfilePage;
