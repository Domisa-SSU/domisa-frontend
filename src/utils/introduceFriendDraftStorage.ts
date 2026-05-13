import { INTRODUCE_FRIEND_DRAFT_STORAGE_KEY } from "../constants/storageKeys";
import {
    hasCompleteIntroductionAnswers,
    isIntroductionAnswers,
    type IntroductionAnswers,
} from "../constants/introductionQuestions";

const INTRODUCE_FRIEND_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

type StoredIntroduceFriendDraft = {
    answers: IntroductionAnswers;
    expiresAt: number;
};

const isStoredIntroduceFriendDraft = (
    value: unknown,
): value is StoredIntroduceFriendDraft => {
    if (!value || typeof value !== "object") {
        return false;
    }

    const draft = value as Record<string, unknown>;

    return (
        isIntroductionAnswers(draft.answers) &&
        typeof draft.expiresAt === "number"
    );
};

const getStorageItem = (storage: Storage) => {
    try {
        return storage.getItem(INTRODUCE_FRIEND_DRAFT_STORAGE_KEY);
    } catch {
        return null;
    }
};

const removeStorageItem = (storage: Storage) => {
    try {
        storage.removeItem(INTRODUCE_FRIEND_DRAFT_STORAGE_KEY);
    } catch {
        // Ignore storage access failures.
    }
};

const parseDraft = (rawDraft: string | null) => {
    if (!rawDraft) {
        return null;
    }

    try {
        const parsedDraft = JSON.parse(rawDraft);

        if (isStoredIntroduceFriendDraft(parsedDraft)) {
            if (parsedDraft.expiresAt <= Date.now()) {
                return null;
            }

            return parsedDraft.answers;
        }

        if (isIntroductionAnswers(parsedDraft)) {
            return parsedDraft;
        }
    } catch {
        return null;
    }

    return null;
};

export const saveIntroduceFriendDraft = (answers: IntroductionAnswers) => {
    const storedDraft: StoredIntroduceFriendDraft = {
        answers,
        expiresAt: Date.now() + INTRODUCE_FRIEND_DRAFT_TTL_MS,
    };

    try {
        localStorage.setItem(
            INTRODUCE_FRIEND_DRAFT_STORAGE_KEY,
            JSON.stringify(storedDraft),
        );
        sessionStorage.removeItem(INTRODUCE_FRIEND_DRAFT_STORAGE_KEY);
    } catch {
        try {
            sessionStorage.setItem(
                INTRODUCE_FRIEND_DRAFT_STORAGE_KEY,
                JSON.stringify(storedDraft),
            );
        } catch {
            // Ignore storage access failures.
        }
    }
};

export const getIntroduceFriendDraft = () => {
    const localDraft = parseDraft(getStorageItem(localStorage));

    if (localDraft) {
        return localDraft;
    }

    removeStorageItem(localStorage);

    const sessionDraft = parseDraft(getStorageItem(sessionStorage));

    if (sessionDraft) {
        saveIntroduceFriendDraft(sessionDraft);
        return sessionDraft;
    }

    removeStorageItem(sessionStorage);

    return null;
};

export const hasValidIntroduceFriendDraft = () => {
    const draft = getIntroduceFriendDraft();

    return hasCompleteIntroductionAnswers(draft);
};

export const clearIntroduceFriendDraft = () => {
    removeStorageItem(localStorage);
    removeStorageItem(sessionStorage);
};
