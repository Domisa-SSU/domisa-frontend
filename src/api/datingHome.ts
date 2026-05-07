import { apiClient } from "./client";

export type DatingHomeCard = {
  id: string;
  publicId: string;
  profile: string | null;
};

type DatingHomeCardDto = {
  userId: string;
  profile: string | null;
};

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
  canRefresh: boolean;
  profileNum: number;
  freeLikeRemaining: number;
  cards: DatingHomeCard[];
  receivedLikes: DatingHomeCard[];
  sentLikes: DatingHomeCard[];
  matches: DatingMatch[];
};

type RefreshTimeResponse = {
  refreshAvailableAt: string;
  canRefresh: boolean;
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

type DatingMatchDto = Omit<DatingMatch, "id" | "publicId"> & {
  userId: string;
};

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
    typeof profile.userId === "string" &&
    (typeof profile.profile === "string" || profile.profile === null)
  );
};

const normalizeProfileCard = (profile: DatingHomeCardDto): DatingHomeCard => ({
  id: profile.userId,
  publicId: profile.userId,
  profile: profile.profile,
});

const isDatingMatchDto = (value: unknown): value is DatingMatchDto => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const match = value as Record<string, unknown>;

  return (
    typeof match.userId === "string" &&
    typeof match.nickname === "string" &&
    (typeof match.profile === "string" || match.profile === null) &&
    typeof match.contactType === "string" &&
    typeof match.contact === "string"
  );
};

const normalizeDatingMatch = (match: DatingMatchDto): DatingMatch => ({
  id: match.userId,
  publicId: match.userId,
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

  return (
    typeof response.refreshAvailableAt === "string" &&
    typeof response.canRefresh === "boolean"
  );
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
    canRefresh: refreshTime.canRefresh,
    profileNum: profiles.profileNum,
    freeLikeRemaining: profiles.freeLikeRemaining,
    cards: profiles.profiles,
    receivedLikes: receivedLikes.myFans,
    sentLikes: sentLikes.myTypes,
    matches: matches.matches,
  };
};
