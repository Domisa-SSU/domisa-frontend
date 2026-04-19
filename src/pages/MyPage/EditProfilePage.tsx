import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomActionBar from "../../components/BottomActionBar";
import NotLoginHeader from "../../components/NotLoginHeader";
import forbiddenIcon from "../SignupPage/asset/forbiddenIcon.svg";
import pinkCheckIcon from "../SignupPage/asset/pinkCheckIcon.svg";
import selectArrow from "../SignupPage/asset/selectArrow.svg";

const birthYears = Array.from({ length: 21 }, (_, index) => `${2008 - index}`);
const contactMethods = ["인스타 ID", "전화번호", "카카오톡ID"];
const phonePrefixes = ["010", "011", "016", "017"];

// TODO: API 연동 시 교체
const mockUser = {
  nickname: "삑그리고",
  gender: "여성",
  birthYear: "2003",
  contactMethod: "인스타 ID",
  contactValue: "@1014.1248",
};

const fieldClassName =
  "h-10 w-full rounded-[0.625rem] border-[1.2px] border-transparent bg-primary-100 px-[0.875rem] typo-input-text-m text-primary-500 placeholder:text-grey-600 focus:outline-none";
const selectClassName =
  "h-10 w-full appearance-none rounded-[0.625rem] bg-primary-100 px-[0.875rem] pr-9 typo-input-text-m focus:outline-none";

function EditProfilePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(mockUser.nickname);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [nicknameErrorMessage, setNicknameErrorMessage] = useState("");
  const [gender, setGender] = useState(mockUser.gender);
  const [birthYear, setBirthYear] = useState(mockUser.birthYear);
  const [contactMethod, setContactMethod] = useState(mockUser.contactMethod);
  const [phonePrefix, setPhonePrefix] = useState("010");
  const [phoneMiddle, setPhoneMiddle] = useState("");
  const [phoneLast, setPhoneLast] = useState("");
  const [contactValue, setContactValue] = useState(mockUser.contactValue);

  const isFormValid = useMemo(() => {
    const isContactFilled =
      contactMethod === "전화번호"
        ? phonePrefix.length > 0 &&
          phoneMiddle.trim().length > 0 &&
          phoneLast.trim().length > 0
        : contactMethod.length > 0 && contactValue.trim().length > 0;

    return (
      nickname.trim().length > 0 &&
      gender.length > 0 &&
      birthYear.length > 0 &&
      isContactFilled
    );
  }, [
    birthYear,
    contactMethod,
    contactValue,
    gender,
    nickname,
    phoneLast,
    phoneMiddle,
    phonePrefix,
  ]);

  const isContactMethodSelected = contactMethod.length > 0;

  const handleLimitedChange = (
    value: string,
    limit: number,
    setter: (nextValue: string) => void,
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
                    setNicknameErrorMessage("");
                  }}
                  className={`${fieldClassName} pr-[5.5rem] ${
                    nicknameErrorMessage ? "border-[1.2px] border-warning" : ""
                  }`}
                  placeholder="닉네임을 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (nickname.trim().length === 0) {
                      setIsNicknameChecked(false);
                      setNicknameErrorMessage("이미 사용중인 닉네임입니다");
                      return;
                    }
                    setNicknameErrorMessage("");
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
                    <span className="typo-comment-2 text-warning">
                      {nicknameErrorMessage}
                    </span>
                    <img
                      src={forbiddenIcon}
                      alt=""
                      className="h-[0.6875rem] w-[0.6875rem]"
                    />
                  </div>
                ) : isNicknameChecked ? (
                  <div className="flex items-center gap-[0.125rem]">
                    <span className="typo-comment-2 text-primary-300">
                      사용 가능한 닉네임입니다
                    </span>
                    <img
                      src={pinkCheckIcon}
                      alt=""
                      className="h-[0.6875rem] w-[0.6875rem]"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {/* 성별 */}
          <section className="flex flex-col gap-[0.875rem]">
            <h2 className="typo-button-text text-grey-900">성별</h2>
            <div className="flex gap-[0.3125rem]">
              {["남성", "여성"].map((option) => {
                const isSelected = gender === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGender(option)}
                    className={`flex h-10 flex-1 items-center justify-center rounded-[0.625rem] px-2.5 ${
                      isSelected
                        ? "bg-primary-500 typo-input-text text-grey-100"
                        : "bg-primary-100 typo-input-text-m text-grey-600"
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
                  birthYear ? "text-primary-500" : "text-grey-600"
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
                <img
                  src={selectArrow}
                  alt=""
                  className="h-[0.3125rem] w-[0.625rem]"
                />
              </span>
            </div>
          </section>

          {/* 연락처 */}
          <section className="flex flex-col gap-[0.875rem]">
            <h2 className="typo-button-text text-grey-900">
              연락처를 입력해주세요
            </h2>
            <div className="grid grid-cols-[7.75rem_minmax(0,1fr)] gap-2.5">
              <div className="relative">
                <select
                  value={contactMethod}
                  onChange={(event) => {
                    const nextMethod = event.target.value;
                    setContactMethod(nextMethod);
                    setContactValue("");
                    setPhoneMiddle("");
                    setPhoneLast("");
                    if (nextMethod !== "전화번호") {
                      setPhonePrefix("010");
                    }
                  }}
                  className={`${selectClassName} ${
                    contactMethod ? "text-primary-500" : "text-grey-600"
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
                  <img
                    src={selectArrow}
                    alt=""
                    className="h-[0.3125rem] w-[0.625rem]"
                  />
                </span>
              </div>
              {contactMethod === "전화번호" ? (
                <div className="grid grid-cols-3 gap-[0.3125rem]">
                  <div className="relative">
                    <select
                      value={phonePrefix}
                      onChange={(event) => setPhonePrefix(event.target.value)}
                      disabled={!isContactMethodSelected}
                      className={`${selectClassName} px-[0.875rem] pr-6 ${
                        phonePrefix ? "text-primary-500" : "text-grey-600"
                      } ${isContactMethodSelected ? "" : "opacity-50"}`}
                    >
                      {phonePrefixes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-[0.625rem] top-1/2 -translate-y-1/2">
                      <img
                        src={selectArrow}
                        alt=""
                        className="h-[0.3125rem] w-[0.625rem]"
                      />
                    </span>
                  </div>
                  <input
                    value={phoneMiddle}
                    onChange={(event) =>
                      setPhoneMiddle(
                        event.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                      )
                    }
                    disabled={!isContactMethodSelected}
                    className={`${fieldClassName} ${isContactMethodSelected ? "" : "opacity-50"}`}
                    inputMode="numeric"
                    maxLength={4}
                  />
                  <input
                    value={phoneLast}
                    onChange={(event) =>
                      setPhoneLast(
                        event.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                      )
                    }
                    disabled={!isContactMethodSelected}
                    className={`${fieldClassName} ${isContactMethodSelected ? "" : "opacity-50"}`}
                    inputMode="numeric"
                    maxLength={4}
                  />
                </div>
              ) : (
                <input
                  value={contactValue}
                  onChange={(event) => setContactValue(event.target.value)}
                  disabled={!isContactMethodSelected}
                  className={`${fieldClassName} ${isContactMethodSelected ? "" : "opacity-50"}`}
                  placeholder={
                    contactMethod === "인스타 ID"
                      ? "인스타 ID를 입력해주세요"
                      : contactMethod === "카카오톡ID"
                        ? "카카오톡 ID를 입력해주세요"
                        : ""
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
        onClick={() => navigate(-1)}
      />
    </div>
  );
}

export default EditProfilePage;
