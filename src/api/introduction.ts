import { INTRODUCTION_QUESTIONS } from "../constants/introductionQuestions";
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
  q1: INTRODUCTION_QUESTIONS.q1.placeholder,
  q2: INTRODUCTION_QUESTIONS.q2.placeholder,
  q3: INTRODUCTION_QUESTIONS.q3.placeholder,
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

export type MyIntroduction = {
  q1: string;
  q2: string;
  q3: string;
};

const isMyIntroduction = (value: unknown): value is MyIntroduction => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const intro = value as Record<string, unknown>;
  return (
    typeof intro.q1 === "string" &&
    typeof intro.q2 === "string" &&
    typeof intro.q3 === "string"
  );
};

/**
 * API 제목: 내 친구 소개서 조회
 * GET /api/users/introduction
 * 현재 로그인한 사용자에게 등록된 친구 소개서를 조회한다.
 * 소개서가 없으면 빈 body 200으로 응답한다.
 */
export const getMyIntroduction = async (): Promise<MyIntroduction | null> => {
  const { data } = await apiClient.get<unknown>("/api/users/introduction");

  if (!data || (typeof data === 'object' && Object.keys(data as object).length === 0)) return null;

  if (!isMyIntroduction(data)) {
    throw new Error("Invalid my introduction response");
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
