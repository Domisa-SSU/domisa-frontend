# 사용자 정보 관리 구조

이 문서는 현재 프론트엔드에서 로그인 여부, 회원 진행 단계, 쿠키 개수를 관리하는 기준을 정리합니다.

현재 구조는 `zustand` 기반의 `useUserStore`를 사용합니다. 인증 토큰은 프론트 상태에 저장하지 않고, 백엔드가 설정한 `HttpOnly Cookie`를 기준으로 `/api/auth/me`를 호출해 사용자 상태를 복구합니다.

## 관련 파일

- `src/stores/userStore.ts`: 사용자 전역 상태 store
- `src/types/user.ts`: 사용자 상태 타입
- `src/api/client.ts`: 공통 axios client
- `src/api/auth.ts`: `/api/auth/me` 호출 함수
- `src/App.tsx`: 앱 최초 진입 시 `fetchMe()` 호출 및 인증 로딩 처리

## 인증 방식

백엔드는 로그인 성공 시 `Set-Cookie`로 `accessToken`, `refreshToken`을 설정합니다.

프론트는 쿠키 값을 직접 읽지 않습니다. API 요청 시 브라우저가 쿠키를 자동으로 보내도록 axios client에 `withCredentials: true`를 설정합니다.

```ts
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
    withCredentials: true,
});
```

프론트 전역 상태에는 토큰을 저장하지 않습니다.

저장하지 않는 값:

- `accessToken`
- `refreshToken`
- 카카오 access token

전역 store에는 화면 분기와 UI 표시를 위한 최소 사용자 상태만 저장합니다.

## API 응답 타입

`GET /api/auth/me`는 현재 로그인 세션 기준의 사용자 상태를 반환합니다.

```ts
export interface UserStatus {
    isRegistered: boolean;
    hasIntroduction: boolean;
    isProfileCompleted: boolean;
}

export interface AuthMeResponse {
    userId: number;
    cookieCount: number;
    status: UserStatus;
}
```

### `userId`

현재 로그인한 서비스 유저의 고유 ID입니다.

- `number`: 로그인된 사용자
- `null`: 비로그인 상태이거나 아직 사용자 정보를 확정하지 못한 상태

이 값은 화면에 직접 보여주기 위한 값이라기보다, 현재 store에 로그인 사용자가 존재하는지 판단할 때 사용됩니다.

### `cookieCount`

현재 사용자의 쿠키 개수입니다.

여러 페이지에서 공통으로 쓰이므로 전역 상태로 관리합니다.

주의할 점:

- 쿠키 구매 성공 후 서버 응답값으로 갱신해야 합니다.
- 쿠키 차감 성공 후 서버 응답값으로 갱신해야 합니다.
- 프론트에서 임의로 `+1`, `-1` 계산한 값을 최종 기준으로 삼지 않습니다.

즉, `cookieCount`의 진짜 기준은 항상 서버입니다.

### `status`

사용자가 서비스 진행 단계 중 어디까지 완료했는지 나타냅니다.

```ts
status: {
    isRegistered: boolean;
    hasIntroduction: boolean;
    isProfileCompleted: boolean;
}
```

상세 프로필 전체 정보는 전역으로 관리하지 않습니다. `status`는 페이지 접근 권한과 다음 이동 경로를 판단하기 위한 최소 플래그입니다.

## `UserStatus` 각 값의 의미

### `isRegistered`

회원가입 완료 여부입니다.

- `false`: 카카오 로그인은 했지만 서비스 회원가입 정보 입력이 아직 끝나지 않은 상태
- `true`: 서비스 회원가입이 완료된 상태

예상 사용처:

- 회원가입 페이지 접근 제어
- 카카오 로그인 성공 후 다음 목적지 판단
- 가입 완료 API 성공 후 `updateStatus({ isRegistered: true })`

### `hasIntroduction`

친구 소개서 수락 또는 등록 완료 여부입니다.

- `false`: 소개팅 서비스를 이용하기 위한 친구 소개서가 아직 없는 상태
- `true`: 친구 소개서 조건을 충족한 상태

예상 사용처:

- 소개서 필요 화면으로 보낼지 판단
- 친구 소개서 등록/수락 API 성공 후 `updateStatus({ hasIntroduction: true })`

### `isProfileCompleted`

소개팅 카드, 즉 내 정보 카드 작성 완료 여부입니다.

- `false`: 소개팅 카드가 아직 작성되지 않은 상태
- `true`: 소개팅 카드 작성이 완료된 상태

예상 사용처:

- 카드 작성 페이지 접근 제어
- 마이페이지에서 등록된 카드가 있는지 판단
- 카드 작성 API 성공 후 `updateStatus({ isProfileCompleted: true })`

## Store 상태값

`useUserStore`는 아래 상태를 관리합니다.

```ts
interface UserState {
    userId: number | null;
    status: UserStatus | null;
    cookieCount: number | null;
    isLoggedIn: boolean;
    isAuthLoaded: boolean;
}
```

### `isLoggedIn`

현재 사용자가 로그인 상태인지 나타냅니다.

- `true`: `/api/auth/me` 성공 또는 로그인 성공 후 사용자 정보 세팅 완료
- `false`: `/api/auth/me` 실패, 401, 로그아웃, 또는 인증 정보 없음

주의할 점:

`isLoggedIn`은 프론트가 임의로 로그인 성공이라고 판단해서 바꾸는 값이 아닙니다. 서버 인증 결과를 반영해야 합니다.

### `isAuthLoaded`

로그인 여부와 사용자 진행 상태 확인이 끝났는지 나타냅니다.

- `false`: 앱 진입 직후이거나 `/api/auth/me` 요청 중
- `true`: `/api/auth/me` 성공 또는 실패 처리가 끝난 상태

이 값이 필요한 이유는 새로고침 때문입니다.

새로고침 직후 Zustand는 초기화됩니다.

```ts
isLoggedIn: false
status: null
isAuthLoaded: false
```

하지만 브라우저에는 여전히 HttpOnly Cookie가 남아 있을 수 있습니다. 이때 `/api/auth/me` 응답 전에 `isLoggedIn === false`만 보고 redirect하면, 실제 로그인 사용자를 로그인 화면으로 잘못 보낼 수 있습니다.

따라서 route guard는 반드시 아래 순서로 판단해야 합니다.

```tsx
if (!isAuthLoaded) {
    return <Loading />;
}

if (!isLoggedIn) {
    return <Navigate to="/auth" />;
}
```

핵심 규칙:

`isAuthLoaded === false`일 때는 redirect하지 않습니다.

### `status: null`

`status`가 `null`인 경우는 두 가지입니다.

- 아직 인증 상태 확인 전
- 비로그인 상태

따라서 `status === null`만으로 바로 비로그인이라고 판단하지 말고, 먼저 `isAuthLoaded`를 확인해야 합니다.

## Store 액션

### `fetchMe()`

`GET /api/auth/me`를 호출해 사용자 상태를 복구합니다.

호출 시점:

- 앱 최초 진입
- 새로고침 후
- 카카오 로그인 성공 직후
- 인증 상태를 다시 서버와 동기화해야 하는 시점

성공 시:

```ts
set({
    userId: data.userId,
    status: data.status,
    cookieCount: data.cookieCount,
    isLoggedIn: true,
    isAuthLoaded: true,
});
```

실패 또는 401 시:

```ts
set({
    userId: null,
    status: null,
    cookieCount: null,
    isLoggedIn: false,
    isAuthLoaded: true,
});
```

### `setAuthData(data)`

이미 서버에서 확정된 사용자 정보를 store에 반영합니다.

사용 예:

- 로그인 API 응답이 `userId`, `cookieCount`, `status`를 직접 반환하는 경우
- 특정 API 성공 후 전체 인증 데이터를 다시 받은 경우

현재 권장 흐름은 로그인 성공 후 `fetchMe()`를 호출하는 방식입니다.

### `updateStatus(newStatus)`

기존 `status` 일부를 업데이트합니다.

```ts
updateStatus({ hasIntroduction: true });
```

사용 예:

- 회원가입 완료 후 `isRegistered: true`
- 친구 소개서 수락/등록 후 `hasIntroduction: true`
- 소개팅 카드 작성 후 `isProfileCompleted: true`

주의할 점:

서버 응답으로 확정된 상태값을 넣어야 합니다. 프론트가 예상으로 상태를 먼저 바꾸는 용도로 사용하지 않습니다.

### `setCookieCount(count)`

쿠키 개수를 갱신합니다.

사용 예:

- 쿠키 구매 API 성공 후 서버 응답의 최신 쿠키 수 반영
- 쿠키 차감 API 성공 후 서버 응답의 최신 쿠키 수 반영

주의할 점:

서버 응답값을 기준으로 넣어야 합니다.

### `clearAuth()`

로그아웃 또는 인증 실패 시 사용자 상태를 초기화합니다.

초기화 후에도 `isAuthLoaded`는 `true`입니다. 인증 확인이 끝났고, 그 결과가 비로그인이라는 뜻이기 때문입니다.

## 앱 초기화 흐름

`App.tsx`에서 앱이 처음 마운트되면 `fetchMe()`를 호출합니다.

```tsx
useEffect(() => {
    void fetchMe();
}, [fetchMe]);
```

`isAuthLoaded`가 `false`인 동안에는 전체 화면 로딩 UI를 보여줍니다.

```tsx
if (!isAuthLoaded) {
    return <LoadingScreen />;
}
```

인증 상태 확인이 끝난 뒤에만 실제 routes가 렌더링됩니다.

## 페이지 분기 기준

아직 route guard는 본격 적용 전입니다. 이후 페이지 접근 제어를 붙일 때는 아래 순서를 기준으로 합니다.

```tsx
if (!isAuthLoaded) {
    return <Loading />;
}

if (!isLoggedIn) {
    return <Navigate to="/auth" />;
}

if (!status?.isRegistered) {
    return <Navigate to="/auth/signup" />;
}

if (!status?.hasIntroduction) {
    return <Navigate to="/dating/require-introduce" />;
}

if (!status?.isProfileCompleted) {
    return <Navigate to="/my/dating-card" />;
}
```

각 페이지마다 필요한 단계가 다르므로, 모든 페이지에 같은 조건을 그대로 적용하면 안 됩니다.

예를 들어:

- 회원가입 페이지는 `isRegistered === false`인 사용자가 접근해야 합니다.
- 소개서 필요 화면은 `hasIntroduction === false`인 사용자가 접근해야 합니다.
- 카드 작성 페이지는 `hasIntroduction === true`이고 `isProfileCompleted === false`인 사용자가 접근해야 합니다.
- 마이페이지는 로그인된 사용자만 접근하도록 시작할 수 있습니다.

## 카카오 로그인과의 연결

카카오 로그인 성공 후 백엔드는 HttpOnly Cookie를 설정합니다.

프론트는 토큰을 직접 저장하지 않고, 로그인 성공 직후 `fetchMe()`를 호출해 사용자 상태를 복구합니다.

```ts
await kakaoLogin({ authorizationCode });
await useUserStore.getState().fetchMe();
```

이후 `status`를 기준으로 다음 화면을 결정합니다.

## 원칙

- 토큰은 전역 store에 저장하지 않습니다.
- 상세 프로필은 전역 store에 저장하지 않습니다.
- `cookieCount`는 전역으로 저장하지만 서버 응답값만 신뢰합니다.
- `status`는 페이지 분기용 최소 상태입니다.
- `isAuthLoaded === false`일 때는 redirect하지 않습니다.
- 서버 상태가 바뀌는 API는 성공 응답으로 최신 `status` 또는 최신 `cookieCount`를 내려줘야 합니다.
