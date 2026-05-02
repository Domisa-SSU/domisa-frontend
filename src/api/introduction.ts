import { apiClient } from "./client";

export type ReceivedIntroduction = {
  introductionId: number;
  q1: string;
  q2: string;
  q3: string;
};

export type CreateIntroductionLinkRequest = {
  q1: string;
  q2: string;
  q3: string;
};

export type CreateIntroductionLinkResponse = {
  linkCode: string;
};

const DUMMY_LINK_CODE = "test-code";
const DUMMY_INTRODUCTION_ID = 1;

const dummyReceivedIntroduction: ReceivedIntroduction = {
  introductionId: DUMMY_INTRODUCTION_ID,
  q1: "제 친구는 처음 보면 조금 조용하고 차분해 보이지만, 친해지면 하루 종일 옆에서 웃겨주는 사람입니다. 작은 약속도 잘 지키고 상대방 이야기를 진심으로 들어줘요. 누가 힘든 이야기를 꺼내면 바로 조언부터 하기보다 끝까지 들어주고, 필요한 순간에는 조용히 챙겨주는 타입입니다. 그래서 같이 있으면 괜히 긴장하지 않아도 되고, 별말 없이 같은 공간에 있어도 편안한 느낌이 들어요.",
  q2: "가끔 이해할 수 없는 행동을 해요. 길을 걷다가 갑자기 춤을 추거나, 편의점 신상 과자를 전부 비교해보겠다고 진지하게 리뷰를 남기기도 합니다. 여행을 가면 계획표는 꼼꼼하게 짜놓고 막상 현장에서는 갑자기 다른 골목이 예쁘다며 새로운 길로 새기도 해요. 그런데 그런 엉뚱함이 부담스럽지 않고 주변 사람을 편하게 만들어줘요. 분위기가 어색해질 때 자연스럽게 웃음을 만들 줄 알고, 자기만 웃긴 게 아니라 같이 있는 사람까지 기분 좋게 만드는 힘이 있습니다.",
  q3: "대화가 잘 통하고 사소한 장난을 같이 웃어넘길 수 있는 사람이 잘 맞을 것 같아요.\n너무 급하게 가까워지기보다 천천히 알아가는 걸 좋아하고, 서로의 하루를 물어봐주는 다정한 사람이면 좋겠습니다.\n또 약속 시간을 잘 지키고, 연락이 늦어질 때는 이유를 말해줄 수 있는 사람이면 더 잘 맞을 것 같아요. 감정 표현이 엄청 화려하지 않아도 괜찮지만, 고마운 일에는 고맙다고 말하고 미안한 일에는 미안하다고 말할 수 있는 솔직한 사람이면 좋겠습니다.",
};

const isReceivedIntroduction = (
  value: unknown,
): value is ReceivedIntroduction => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const introduction = value as Record<string, unknown>;

  return (
    typeof introduction.introductionId === "number" &&
    typeof introduction.q1 === "string" &&
    typeof introduction.q2 === "string" &&
    typeof introduction.q3 === "string"
  );
};

const isCreateIntroductionLinkResponse = (
  value: unknown,
): value is CreateIntroductionLinkResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return typeof response.linkCode === "string";
};

/**
 * API 제목: 친구 소개서 공유 링크 생성
 * POST /api/datings/introduction-links
 * 친구 소개서 답변을 저장하고 공유 가능한 linkCode를 발급받는다.
 */
export const createIntroductionLink = async (
  payload: CreateIntroductionLinkRequest,
) => {
  const { data } = await apiClient.post<unknown>(
    "/api/datings/introduction-links",
    payload,
  );

  if (!isCreateIntroductionLinkResponse(data)) {
    throw new Error("Invalid introduction link response");
  }

  return data;
};

/**
 * API 제목: 받은 친구 소개서 조회
 * GET /api/introduction/{linkCode}
 * 공유 링크에 포함된 linkCode로 친구가 작성한 소개서를 조회한다.
 */
export const getReceivedIntroduction = async (linkCode: string) => {
  if (import.meta.env.DEV && linkCode === DUMMY_LINK_CODE) {
    return dummyReceivedIntroduction;
  }

  const { data } = await apiClient.get<unknown>(
    `/api/introduction/${encodeURIComponent(linkCode)}`,
  );

  if (!isReceivedIntroduction(data)) {
    throw new Error("Invalid received introduction response");
  }

  return data;
};

/**
 * API 제목: 친구 소개서 수락
 * POST /api/users/introduction/{introductionId}
 * 현재 로그인한 사용자의 친구 소개서로 받은 소개서를 등록한다.
 */
export const acceptReceivedIntroduction = async (introductionId: number) => {
  if (import.meta.env.DEV && introductionId === DUMMY_INTRODUCTION_ID) {
    return;
  }

  await apiClient.post<void>(`/api/users/introduction/${introductionId}`);
};
