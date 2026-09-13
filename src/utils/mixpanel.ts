import mixpanel from 'mixpanel-browser';

const token = import.meta.env.VITE_MIXPANEL_TOKEN;

let enabled = false;

/**
 * 개발과 운영이 같은 믹스패널 프로젝트를 쓰므로 모든 이벤트에 env 를 붙인다.
 * 리포트에서 env = production 으로 필터링하면 로컬 이벤트가 지표에 섞이지 않는다.
 *
 * reset() 이 수퍼 프로퍼티를 전부 지우므로 초기화 때와 리셋 후 양쪽에서 부른다.
 */
const registerEnv = () => {
  mixpanel.register({
    env: import.meta.env.DEV ? 'development' : 'production',
  });
};

/**
 * 유입 경로 파라미터. 인스타그램·에브리타임·QR 처럼 채널별로 다른 링크를 뿌리고
 * 여기서 읽어 수퍼 프로퍼티로 등록한다. 그래야 가입·구매 같은 뒤쪽 이벤트까지
 * 유입 경로를 달고 다녀서 "인스타로 온 사람이 얼마나 구매했나" 를 볼 수 있다.
 *
 * 나중에 다른 링크로 다시 들어오면 덮어쓴다(마지막 유입 기준).
 * 최초 유입은 믹스패널이 initial_utm_* 로 알아서 한 번만 남기므로 따로 하지 않는다.
 */
const campaignKeys = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

const registerCampaignParams = () => {
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};

  for (const key of campaignKeys) {
    const value = params.get(key);
    if (value) {
      found[key] = value;
    }
  }

  if (Object.keys(found).length === 0) {
    return;
  }

  mixpanel.register(found);
};

/**
 * 믹스패널을 초기화한다.
 *
 * 토큰이 없으면 초기화하지 않고 이후 track/identify 도 전부 무시한다.
 * 스토리북·테스트·토큰 없는 로컬에서 에러 없이 돌아가게 하기 위함이다.
 */
export const initMixpanel = () => {
  if (!token || enabled) {
    return;
  }

  mixpanel.init(token, {
    debug: import.meta.env.DEV,
    persistence: 'localStorage',
    autocapture: {
      click: true,
      pageview: 'full-url',
      input: false,
      submit: false,
      scroll: false,
      /**
       * 임의 요소의 텍스트까지 수집하면 소개서 내용·이름 같은 개인정보가 딸려 들어간다.
       * 대신 data-track 속성을 붙인 요소만 식별 가능한 이름을 남긴다.
       */
      capture_text_content: false,
      capture_extra_attrs: ['data-track'],
    },
  });

  registerEnv();
  registerCampaignParams();

  enabled = true;
};

/**
 * 사용자 상태. 이탈 지점을 보려면 이벤트가 발생한 "그 시점"의 상태를 알아야 하므로
 * 프로필 속성이 아니라 수퍼 프로퍼티로 모든 이벤트에 붙인다.
 *
 * anonymous             로그인 안 함
 * signed_up_incomplete  카카오 로그인은 했으나 회원가입 절차 미완료
 * registered            회원가입 완료
 * has_introduction      가입 + 소개서 보유 (소개팅 진입 가능)
 */
export type UserState =
  | 'anonymous'
  | 'signed_up_incomplete'
  | 'registered'
  | 'has_introduction';

export const registerUserState = (state: UserState) => {
  if (!enabled) {
    return;
  }

  mixpanel.register({ user_state: state });
};

/**
 * 성별을 수퍼 프로퍼티로 등록한다. 서버는 boolean 으로 주는데(true = 남성)
 * 리포트에서 읽기 어려우므로 문자열로 바꿔 남긴다.
 *
 * 프로필 속성으로도 함께 남겨 "현재 가입자 남녀 비율" 을 볼 수 있게 한다.
 */
export const registerGender = (isMale: boolean) => {
  if (!enabled) {
    return;
  }

  const gender = isMale ? 'male' : 'female';

  mixpanel.register({ gender });
  mixpanel.people.set({ gender });
};

export const track = (event: string, properties?: Record<string, unknown>) => {
  if (!enabled) {
    return;
  }

  mixpanel.track(event, properties);
};

/** publicId 를 distinct_id 로 삼아 로그인 사용자를 식별한다. */
export const identifyUser = (publicId: string, properties?: Record<string, unknown>) => {
  if (!enabled) {
    return;
  }

  mixpanel.identify(publicId);

  if (properties) {
    mixpanel.people.set(properties);
  }
};

/** 로그아웃 시 distinct_id 를 끊는다. 공용 기기에서 다음 사용자와 섞이지 않게 한다. */
export const resetMixpanel = () => {
  if (!enabled) {
    return;
  }

  mixpanel.reset();
  registerEnv();
};
