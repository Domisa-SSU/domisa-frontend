import { apiClient } from "./client";

export type DatingHomeCard = {
  id: string;
  publicId: string;
  profile: string | null;
};

type DatingHomeCardDto = Omit<DatingHomeCard, "id">;

export type DatingMatch = {
  id: string;
  publicId: string;
  nickname: string;
  profile: string | null;
  contactType: string;
  contact: string;
};

export type DatingHomeResponse = {
  refreshAvailableAt: string;
  profileNum: number;
  freeLikeRemaining: number;
  cards: DatingHomeCard[];
  receivedLikes: DatingHomeCard[];
  sentLikes: DatingHomeCard[];
  matches: DatingMatch[];
};

type RefreshTimeResponse = {
  refreshAvailableAt: string;
};

export type UserCookiesResponse = {
  cookieCount: number;
};

type ProfilesResponse = {
  profileNum: number;
  freeLikeRemaining: number;
  profiles: DatingHomeCardDto[];
};

type ReceivedLikesResponse = {
  myFanNumber: number;
  myFans: DatingHomeCardDto[];
};

type SentLikesResponse = {
  myTypeNumber: number;
  myTypes: DatingHomeCardDto[];
};

type DatingMatchDto = Omit<DatingMatch, "id">;

export type DatingMatchesResponse = {
  matchCount: number;
  matches: DatingMatchDto[];
};

export type DatingMatchCountResponse = {
  matchCount: number;
};

const isDatingMatchCountResponse = (
  value: unknown,
): value is DatingMatchCountResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return typeof response.matchCount === "number";
};

const isProfileCard = (value: unknown): value is DatingHomeCardDto => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const profile = value as Record<string, unknown>;

  return (
    typeof profile.publicId === "string" &&
    (typeof profile.profile === "string" || profile.profile === null)
  );
};

const normalizeProfileCard = (profile: DatingHomeCardDto): DatingHomeCard => ({
  id: profile.publicId,
  publicId: profile.publicId,
  profile: profile.profile,
});

const isDatingMatchDto = (value: unknown): value is DatingMatchDto => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const match = value as Record<string, unknown>;

  return (
    typeof match.publicId === "string" &&
    typeof match.nickname === "string" &&
    (typeof match.profile === "string" || match.profile === null) &&
    typeof match.contactType === "string" &&
    typeof match.contact === "string"
  );
};

const normalizeDatingMatch = (match: DatingMatchDto): DatingMatch => ({
  id: match.publicId,
  publicId: match.publicId,
  nickname: match.nickname,
  profile: match.profile,
  contactType: match.contactType,
  contact: match.contact,
});

const isRefreshTimeResponse = (
  value: unknown,
): value is RefreshTimeResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return typeof response.refreshAvailableAt === "string";
};

const isUserCookiesResponse = (
  value: unknown,
): value is UserCookiesResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return typeof response.cookieCount === "number";
};

const isProfilesResponse = (value: unknown): value is ProfilesResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.profileNum === "number" &&
    typeof response.freeLikeRemaining === "number" &&
    Array.isArray(response.profiles) &&
    response.profiles.every(isProfileCard)
  );
};

const isReceivedLikesResponse = (
  value: unknown,
): value is ReceivedLikesResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.myFanNumber === "number" &&
    Array.isArray(response.myFans) &&
    response.myFans.every(isProfileCard)
  );
};

const isSentLikesResponse = (value: unknown): value is SentLikesResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.myTypeNumber === "number" &&
    Array.isArray(response.myTypes) &&
    response.myTypes.every(isProfileCard)
  );
};

const isDatingMatchesResponse = (
  value: unknown,
): value is DatingMatchesResponse => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.matchCount === "number" &&
    Array.isArray(response.matches) &&
    response.matches.every(isDatingMatchDto)
  );
};

export const getDatingRefreshTime = async () => {
  const { data } = await apiClient.get<unknown>("/api/datings/refresh-time");

  if (!isRefreshTimeResponse(data)) {
    throw new Error("Invalid dating refresh time response");
  }

  return data;
};

export const getUserCookies = async () => {
  const { data } = await apiClient.get<unknown>("/api/users/cookies");

  if (!isUserCookiesResponse(data)) {
    throw new Error("Invalid user cookies response");
  }

  return data;
};

export const shuffleDatingCards = async () => {
  await apiClient.post("/api/datings/shuffle");
};

export const getDatingMatchCount = async () => {
  const { data } = await apiClient.get<unknown>("/api/datings/count");

  if (!isDatingMatchCountResponse(data)) {
    throw new Error("Invalid dating count response");
  }

  return data;
};

export const getDatingProfiles = async () => {
  const { data } = await apiClient.get<unknown>("/api/datings/profiles");

  if (!isProfilesResponse(data)) {
    throw new Error("Invalid dating profiles response");
  }

  return {
    profileNum: data.profileNum,
    freeLikeRemaining: data.freeLikeRemaining,
    profiles: data.profiles.map(normalizeProfileCard),
  };
};

export const getReceivedLikes = async () => {
  const { data } = await apiClient.get<unknown>("/api/users/likes/received");

  if (!isReceivedLikesResponse(data)) {
    throw new Error("Invalid received likes response");
  }

  return {
    myFanNumber: data.myFanNumber,
    myFans: data.myFans.map(normalizeProfileCard),
  };
};

export const getSentLikes = async () => {
  const { data } = await apiClient.get<unknown>("/api/users/likes/sent");

  if (!isSentLikesResponse(data)) {
    throw new Error("Invalid sent likes response");
  }

  return {
    myTypeNumber: data.myTypeNumber,
    myTypes: data.myTypes.map(normalizeProfileCard),
  };
};

export const getDatingMatches = async () => {
  const { data } = await apiClient.get<unknown>("/api/datings/matches");

  if (!isDatingMatchesResponse(data)) {
    throw new Error("Invalid dating matches response");
  }

  return {
    matchCount: data.matchCount,
    matches: data.matches.map(normalizeDatingMatch),
  };
};

export const fetchDatingHome = async (): Promise<DatingHomeResponse> => {
  const [refreshTime, profiles, receivedLikes, sentLikes, matches] =
    await Promise.all([
      getDatingRefreshTime(),
      getDatingProfiles(),
      getReceivedLikes(),
      getSentLikes(),
      getDatingMatches(),
    ]);

  return {
    refreshAvailableAt: refreshTime.refreshAvailableAt,
    profileNum: profiles.profileNum,
    freeLikeRemaining: profiles.freeLikeRemaining,
    cards: profiles.profiles,
    receivedLikes: receivedLikes.myFans,
    sentLikes: sentLikes.myTypes,
    matches: matches.matches,
  };
};
