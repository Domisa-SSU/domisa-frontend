export const INTRODUCTION_QUESTION_IDS = ["q1", "q3", "q2"] as const;

export type IntroductionQuestionId = (typeof INTRODUCTION_QUESTION_IDS)[number];

export type IntroductionAnswers = Record<IntroductionQuestionId, string>;

type IntroductionQuestionCopy = {
  title: string;
  placeholder: string;
  helperText?: string;
  minLength: number;
  maxLength: number;
};

export const INTRODUCTION_QUESTIONS: Record<
  IntroductionQuestionId,
  IntroductionQuestionCopy
> = {
  q1: {
    title: "친구의 매력 포인트",
    placeholder:
      "ex) 다람쥐 같이 귀여운 면이 있으며 춤 잘 춰요\n친해지면 나만을 위한 개그콘서트 열어줌",
    minLength: 10,
    maxLength: 35,
  },
  q2: {
    title: "친구와 잘 맞을 것 같은 사람",
    placeholder:
      "ex) 테토라서 연하남이랑 잘 맞을 것 같아요.\n삼겹살에 오렌지 주스 좋아하는 사람?",
    helperText: "* 수많은 솔로 중 내 친구를 선택해야 되는 이유를 어필해주세요",
    minLength: 10,
    maxLength: 75,
  },
  q3: {
    title: "친구의 이상형",
    placeholder:
      "ex) 강아지상에 다정한 연하남. 대화가 잘 통하고 배려심이 깊은 사람",
    minLength: 10,
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
    (questionId) =>
      value[questionId].trim().length >=
      INTRODUCTION_QUESTIONS[questionId].minLength,
  );
};
