const REQUIRE_INTRODUCE_PATH = "/dating/require-introduce";

/**
 * 소개서 수락 링크(`/introduce/:linkCode`)로 들어온 흐름인지 판단한다.
 * 이 경로로 돌아가는 사용자는 그 화면에서 바로 소개서를 받게 되므로
 * 소개서 필수 안내를 한 번 더 보여줄 필요가 없다.
 */
export const isReceiveIntroducePath = (path: string) =>
    new URL(path, window.location.origin).pathname.startsWith("/introduce/");

/**
 * 회원가입을 마친 직후 어디로 보낼지 정한다.
 *
 * `returnTo` 를 먼저 보면, 소개팅(`/dating`)처럼 소개서가 있어야 들어갈 수 있는
 * 곳에서 출발한 사용자가 안내 없이 그 화면으로 되돌아가 접근 제한 모달만 보게 된다.
 * 그래서 소개서 수락 링크가 아니라면 소개서가 없는 사용자에게 안내를 먼저 보여준다.
 *
 * @param status 가입 응답(또는 `authMe`)의 사용자 상태
 * @param returnTo 가입 흐름에 들어올 때 들고 온 복귀 경로. 이미 안전성 검증을 마친 값이어야 한다
 */
export const getPostSignupPath = (
    status: { hasIntroduction: boolean },
    returnTo: string | null,
) => {
    if (returnTo && isReceiveIntroducePath(returnTo)) {
        return returnTo;
    }

    if (!status.hasIntroduction) {
        return REQUIRE_INTRODUCE_PATH;
    }

    return returnTo ?? "/";
};
