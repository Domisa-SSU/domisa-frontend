/**
 * 닉네임 입력 규칙. 회원가입과 내 정보 수정이 같은 규칙을 써야 해서 여기 모아둔다.
 * 한쪽에만 반영되면 한 화면에서는 걸러지고 다른 화면에서는 그대로 서버로 나간다.
 */
export const NICKNAME_MAX_LENGTH = 8;

const NICKNAME_DISALLOWED_CHARACTERS = /[^A-Za-z0-9가-힣]/g;
const NICKNAME_WHITESPACE = /\s/;

export const NICKNAME_WHITESPACE_MESSAGE =
    "띄어쓰기 없이 한글, 영문, 숫자만 사용할 수 있어요";
export const NICKNAME_SPECIAL_CHARACTER_MESSAGE =
    "특수문자 없이 한글, 영문, 숫자만 사용할 수 있어요";

export const hasNicknameWhitespace = (value: string) =>
    NICKNAME_WHITESPACE.test(value);

/** 조합 중인 한글 낱자모(ㄱ, ㅏ). 글자가 완성되면 가-힣 으로 바뀐다. */
const HANGUL_JAMO = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/g;

export const normalizeNickname = (value: string) =>
    value.replace(NICKNAME_DISALLOWED_CHARACTERS, "").slice(0, NICKNAME_MAX_LENGTH);

/**
 * 그대로 써도 되는 닉네임인지. 걸러낼 게 없고 비어 있지 않으면 규칙을 만족한다.
 * 따로 정규식을 두지 않아야 normalizeNickname 과 규칙이 어긋나지 않는다.
 */
export const isValidNickname = (value: string) =>
    value.length > 0 && value === normalizeNickname(value);

/**
 * 타이핑 중에 보여줄 안내. 값은 건드리지 않고 무엇이 문제인지만 알려준다.
 *
 * 조합 중인 낱자모는 빼고 본다. 아직 완성되지 않은 글자를 특수문자라고 할 수는 없다.
 * 길이도 보지 않는다. maxLength 로 막혀 있고, 넘치는 건 확정 시점에 자른다.
 */
export const getTypingNicknameMessage = (value: string) => {
    if (hasNicknameWhitespace(value)) {
        return NICKNAME_WHITESPACE_MESSAGE;
    }

    const withoutComposingJamo = value.replace(HANGUL_JAMO, "");
    const allowedOnly = withoutComposingJamo.replace(NICKNAME_DISALLOWED_CHARACTERS, "");

    return allowedOnly !== withoutComposingJamo ? NICKNAME_SPECIAL_CHARACTER_MESSAGE : "";
};

/**
 * 걸러낸 뒤 무엇이 지워졌는지 알려준다.
 * 띄어쓰기는 조용히 지워지면 사용자가 왜 안 써지는지 알 수 없으니 따로 짚어준다.
 */
export const getNicknameFilterMessage = (
    value: string,
    normalizedNickname: string,
) => {
    if (hasNicknameWhitespace(value)) {
        return NICKNAME_WHITESPACE_MESSAGE;
    }

    return value !== normalizedNickname ? NICKNAME_SPECIAL_CHARACTER_MESSAGE : "";
};
