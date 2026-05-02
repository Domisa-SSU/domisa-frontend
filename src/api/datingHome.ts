export type DatingCardVariant =
  | "night"
  | "sunset"
  | "sky"
  | "forest"
  | "lavender"
  | "peach";

export type DatingHomeCard = {
  id: string;
  variant: DatingCardVariant;
};

export type DatingHomeResponse = {
  remainingSeconds: number;
  cards: DatingHomeCard[];
  receivedLikes: DatingHomeCard[];
  sentLikes: DatingHomeCard[];
};

const CARD_REFRESH_SECONDS = 7152;

const createCards = (
  prefix: string,
  variants: DatingCardVariant[],
): DatingHomeCard[] =>
  variants.map((variant, index) => ({
    id: `${prefix}-${index + 1}`,
    variant,
  }));

const rotateCards = (
  cards: DatingHomeCard[],
  offset: number,
): DatingHomeCard[] => {
  const normalizedOffset = offset % cards.length;
  return [...cards.slice(normalizedOffset), ...cards.slice(0, normalizedOffset)];
};

const mockDatingHomeData: DatingHomeResponse = {
  remainingSeconds: CARD_REFRESH_SECONDS,
  cards: createCards("solo", [
    "night",
    "sunset",
    "sky",
    "forest",
    "lavender",
    "peach",
    "night",
    "sky",
  ]),
  receivedLikes: createCards("received", [
    "forest",
    "sunset",
    "peach",
    "lavender",
    "sky",
    "night",
    "forest",
    "sunset",
  ]),
  sentLikes: createCards("sent", ["forest", "sunset", "peach", "lavender", "sky"]),
};

export const initialDatingHomeData = mockDatingHomeData;

let mockRequestCount = 0;

export const fetchDatingHome = async (): Promise<DatingHomeResponse> => {
  mockRequestCount += 1;

  return {
    remainingSeconds: CARD_REFRESH_SECONDS,
    cards: rotateCards(mockDatingHomeData.cards, mockRequestCount),
    receivedLikes: rotateCards(mockDatingHomeData.receivedLikes, mockRequestCount),
    sentLikes: rotateCards(mockDatingHomeData.sentLikes, mockRequestCount),
  };
};
