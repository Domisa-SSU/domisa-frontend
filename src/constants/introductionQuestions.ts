export const INTRODUCTION_QUESTION_IDS = ["q1", "q2", "q3"] as const;

export type IntroductionQuestionId = (typeof INTRODUCTION_QUESTION_IDS)[number];

export type IntroductionAnswers = Record<IntroductionQuestionId, string>;

type IntroductionQuestionCopy = {
  title: string;
  placeholder: string;
  helperText?: string;
  maxLength: number;
};

export const INTRODUCTION_QUESTIONS: Record<
  IntroductionQuestionId,
  IntroductionQuestionCopy
> = {
  q1: {
    title: "친구의 매력 포인트",
    placeholder:
      "가끔 이해할 수 없는 행동을 해요 길에서 갑자기 춤추기.. 해맑은 똥강아지 같은 친구입니다",
    helperText: "* 수많은 솔로 중 내 친구를 선택해야 되는 이유를 어필해주세요",
    maxLength: 75,
  },
  q2: {
    title: "친구와 잘 맞을 것 같은 사람",
    placeholder: "텐션 높은 친구를 진정시켜 줄 수 있는 차분하고 다정한 사람",
    maxLength: 35,
  },
  q3: {
    title: "친구를 데려갈 사람에게 한마디",
    placeholder:
      "한 번 데려가시면 반품 및 환불은 절대 불가합니다. 평생 책임져주세요! 떡볶이 킬러니 첫 데이트 메뉴는 떡볶이 추천",
    maxLength: 75,
  },
};

export const EMPTY_INTRODUCTION_ANSWERS: IntroductionAnswers = {
  q1: "",
  q2: "",
  q3: "",
};

export const isIntroductionAnswers = (
  value: unknown,
): value is IntroductionAnswers => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const answers = value as Record<string, unknown>;

  return INTRODUCTION_QUESTION_IDS.every(
    (questionId) => typeof answers[questionId] === "string",
  );
};

export const hasCompleteIntroductionAnswers = (
  value: unknown,
): value is IntroductionAnswers => {
  if (!isIntroductionAnswers(value)) {
    return false;
  }

  return INTRODUCTION_QUESTION_IDS.every(
    (questionId) => value[questionId].trim().length > 0,
  );
};
