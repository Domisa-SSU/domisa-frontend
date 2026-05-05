import { apiClient } from "./client";

export type DatingHomeCard = {
  id: string;
  userId: string;
  profile: string;
};

export type DatingHomeResponse = {
  refreshAvailableAt: string;
  canRefresh: boolean;
  profileNum: number;
  freeLikeRemaining: number;
  cards: DatingHomeCard[];
  receivedLikes: DatingHomeCard[];
  sentLikes: DatingHomeCard[];
};

type RefreshTimeResponse = {
  refreshAvailableAt: string;
  canRefresh: boolean;
};

type ProfilesResponse = {
  profileNum: number;
  freeLikeRemaining: number;
  profiles: DatingHomeCard[];
};

type ReceivedLikesResponse = {
  myFanNumber: number;
  myFans: DatingHomeCard[];
};

type SentLikesResponse = {
  myTypeNumber: number;
  myTypes: DatingHomeCard[];
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

const isProfileCard = (value: unknown): value is DatingHomeCard => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const profile = value as Record<string, unknown>;

  return (
    typeof profile.userId === "string" &&
    typeof profile.profile === "string"
  );
};

const normalizeProfileCard = (profile: DatingHomeCard): DatingHomeCard => ({
  id: profile.userId,
  userId: profile.userId,
  profile: profile.profile,
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

export const fetchDatingHome = async (): Promise<DatingHomeResponse> => {
  const [refreshTime, profiles, receivedLikes, sentLikes] = await Promise.all([
    getDatingRefreshTime(),
    getDatingProfiles(),
    getReceivedLikes(),
    getSentLikes(),
  ]);

  return {
    refreshAvailableAt: refreshTime.refreshAvailableAt,
    canRefresh: refreshTime.canRefresh,
    profileNum: profiles.profileNum,
    freeLikeRemaining: profiles.freeLikeRemaining,
    cards: profiles.profiles,
    receivedLikes: receivedLikes.myFans,
    sentLikes: sentLikes.myTypes,
  };
};
