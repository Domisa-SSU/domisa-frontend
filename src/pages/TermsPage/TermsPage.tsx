import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "../../components/Button/Button";
import NotLoginHeader from "../../components/NotLoginHeader";

type TermsPageType = "service" | "privacy";

type TermsPageProps = {
  type: TermsPageType;
};

type TermsLocationState = {
  checkedAgreements?: unknown;
  fromAuthPath?: unknown;
  pendingSignupPath?: unknown;
  showKakaoLoginToast?: unknown;
} | null;

type TermsPageContent = {
  title: string;
  heading: string;
  body: ReactNode;
};

const termsPageContent: Record<TermsPageType, TermsPageContent> = {
  service: {
    title: "이용약관",
    heading: "도미사 이용약관",
    body: <ServiceTermsContent />,
  },
  privacy: {
    title: "개인정보 수집 및 이용 동의",
    heading: "도미사럽 서비스 개인정보 수집 및 이용 동의",
    body: <PrivacyTermsContent />,
  },
};

const getSafeInternalPath = (value: unknown) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : null;

function Chapter({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="typo-button-text text-grey-800">{title}</h2>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

function Article({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="typo-comment-1-b text-grey-800">{title}</h3>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  );
}

function Paragraph({ children }: { children: ReactNode }) {
  return <p className="typo-comment-1 text-grey-700">{children}</p>;
}

function OrderedList({
  children,
  start,
}: {
  children: ReactNode;
  start?: number;
}) {
  return (
    <ol
      start={start}
      className="list-decimal space-y-1 pl-[1.15rem] typo-comment-1 text-grey-700"
    >
      {children}
    </ol>
  );
}

function BulletList({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc space-y-1 pl-[1.15rem] typo-comment-1 text-grey-700">
      {children}
    </ul>
  );
}

function IndentedBlock({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1 pl-[1.15rem]">{children}</div>;
}

function ServiceTermsContent() {
  return (
    <>
      <Chapter title="제1장 총칙">
        <Article title="제1조 (목적)">
          <Paragraph>
            본 이용약관은 도미사 (이하 “회사”)에서 제공하는 도 서비스
            (이하 “서비스”)의 이용과 관련하여 적용되는 것으로 회사와 이용자에게
            적용됩니다. 본 약관은 서비스 이용에 관한 권리 및 의무와 책임사항,
            기타 필요한 사항을 규정하는 것을 목적으로 합니다.
          </Paragraph>
        </Article>

        <Article title="제2조 (용어의 정의)">
          <Paragraph>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</Paragraph>
          <Paragraph>
            본 용어의 설명은 서비스 이용의 이해를 돕기 위해 제공됩니다. 각
            항목에 대한 구체적인 명칭은 변경될 수 있습니다만, 명칭이
            바뀌었더라도 기존의 명칭에 덧붙여진 설명의 내용과 통용되는 의미가
            같다면 별도로 서비스 이용 약관에서 명칭을 수정하지 않을 수 있습니다.
          </Paragraph>
          <OrderedList>
            <li>회원: 본 약관에 동의하고 가입 절차를 마친 뒤 서비스를 이용하는 자를 말합니다.</li>
            <li>친구: 회원의 실제 지인으로서 가입 시 회원을 소개하는 소개서를 작성해 주는 자를 말합니다.</li>
            <li>서비스: 단말기(PC, 스마트폰 등)와 상관없이 이용자가 이용할 수 있는 ‘도미사’ 관련 제반 서비스를 의미합니다.</li>
            <li>소개팅 카드: 회원이 게시한 텍스트, 사진, 파일 및 친구가 작성한 소개서 등 회원의 프로필 정보를 통칭합니다.</li>
            <li>쿠키: 서비스 내 유료 기능을 이용하기 위해 사용하는 가상의 화폐 단위입니다.</li>
            <li>호감 보내기: 상대방의 프로필을 확인한 후 관심이 있음을 표현하는 행위입니다.</li>
            <li>쌍방 매칭: 서로 호감을 표시하여 양측의 연락처가 공개되는 상태를 의미합니다.</li>
            <li>
              회원가입 : 회원이 “도미사”서비스를 이용하기 위해 카카오 로그인
              이후 성별,출생연도를 입력하여 서비스에 가입하는 것을 의미합니다.
              이용자가 고의로 허위나 부정한 정보를 입력하여 서비스를 이용하는
              경우 “도미사”는 이와 관련한 법적 책임을 부담하지 않습니다. 허위나
              부정한 정보를 통해 타 회원 및 "도미사” 서비스에 피해를 끼친 경우
              민형사상의 책임을 물을 수 있습니다.
            </li>
          </OrderedList>
        </Article>

        <Article title="제3조 (약관의 효력 및 변경)">
          <OrderedList>
            <li>본 약관은 이용자가 서비스 가입 시 동의함과 동시에 효력이 발생합니다.</li>
            <li>회사는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 서비스 내 공지사항 등을 통해 게시합니다.</li>
            <li>회원이 개정된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있으며, 공지 후에도 서비스를 계속 이용할 경우 변경된 약관에 동의한 것으로 간주합니다.</li>
          </OrderedList>
        </Article>

        <Article title="제4조 (약관 외 준칙)">
          <Paragraph>
            본 약관에 명시되지 않은 사항은 관련 법령(전자상거래법, 정보통신망법
            등) 및 일반적인 상관례에 따릅니다.
          </Paragraph>
        </Article>
      </Chapter>

      <Chapter title="제2장 이용계약 및 서비스 이용">
        <Article title="제5조 (이용계약의 성립 및 해지)">
          <OrderedList>
            <li>이용계약은 이용자가 약관에 동의하고 가입 절차를 완료하여 서비스를 개시함으로써 성립됩니다.</li>
            <li>회원은 언제든지 서비스 내 기능을 통해 자신의 프로필을 삭제하거나 탈퇴를 요청할 수 있습니다. 단, 이미 타인에게 노출된 정보는 시스템상 일정 기간 열람될 수 있습니다.</li>
            <li>허위 정보를 입력하여 가입한 경우, 회사는 사전 통보 없이 이용 권한을 박탈할 수 있으며 이로 인해 발생하는 불이익은 회원이 부담합니다.</li>
          </OrderedList>
        </Article>

        <Article title="제6조 (서비스 이용 시간 및 종료)">
          <OrderedList>
            <li>
              서비스는 다음 기간 동안 제공됩니다.
              <BulletList>
                <li>무료/유료 기능 운영: 2026. 05. 13. 08:00 ~ 2026. 05. 17. 00. 00</li>
                <li>최종 서비스 종료: 2026. 05. 17. 00. 00</li>
              </BulletList>
            </li>
            <li>업무상 또는 기술상 장애로 인해 서비스를 개시하지 못할 경우 웹사이트에 공지하며, 고의나 중과실이 없는 한 회사는 이에 대한 책임을 지지 않습니다.</li>
          </OrderedList>
        </Article>

        <Article title="제7조 (서비스의 내용)">
          <Paragraph>
            ① ‘무료 기능‘ : '소개팅 카드' 생성 및 타인의 카드 열람 기능을
            포함합니다. 이용자는 2시간마다 제공되는 8장의 카드 중 3명에게
            무료로 '호감 보내기'를 할 수 있습니다.
          </Paragraph>
          <Paragraph>
            ② ‘유료 기능‘ : '쿠키'를 사용하여 제공되는 프리미엄 기능을
            말합니다.
          </Paragraph>
          <BulletList>
            <li>나에게 호감을 표시한 상대방의 '소개팅 카드' 확인</li>
            <li>2시간 주기당 기본 제공 횟수(3회)를 초과한 추가 '호감 보내기'</li>
            <li>
              ‘소개팅 카드 즉시 갱신’ 기능: 2시간의 대기 시간이 경과하기 전,
              새로운 카드 8장을 즉시 제공받는 기능을 의미합니다. 단, 회사의 회원
              보유 현황 및 매칭 로직에 따라 이전에 노출되었던 카드와 동일한
              카드가 중복하여 노출될 수 있으며, 회사는 이를 별도로 보상하지
              않습니다.
            </li>
          </BulletList>
          <Paragraph>③ 기타 회사가 유료로 정하여 서비스 내에 게시하는 부가 기능</Paragraph>
          <Paragraph>
            4.소개팅 카드 : 회원이 서비스를 이용함에 있어 회원이 서비스에
            게시한 문자,문서,파일, 친구가 작성한 소개서 혹은 이들의 조합으로
            이루어진 정보 등 모든 정보나 자료를 의미합니다.
          </Paragraph>
          <Paragraph>
            5.쌍방 매칭 : 본 서비스에 가입한 각 이성 간에 프로필이 서로
            제공되고, 이에 양 측이 모두 호감을 표시된 것을 의미합니다. 매칭이 될
            시 양 측에게 상호의 연락처를 공개합니다.
          </Paragraph>
        </Article>
      </Chapter>

      <Chapter title="제3장 유료 결제 및 환불">
        <Article title="제8조 (쿠키의 관리 및 소멸)">
          <BulletList>
            <li>회사는 회원의 일정한 조건에 해당하는 활동에 대하여 쿠키를 부여하고 관리합니다.</li>
            <li>회원이 부정한 방법으로 쿠키를 획득한 사실이 확인될 경우 회사는 쿠키를 회수하여 이용 제한 조치를 취할 수 있습니다.</li>
            <li>회사는 회원이 본 약관을 위반한 경우 기타 운영상의 합리적인 사유가 있을 경우 회원의 쿠키를 일부 혹은 전량 회수하거나 사용자의 서비스 이용을 제한할 수 있습니다.</li>
            <li>쿠키는 회사가 제공하는 서비스를 사용할 때 지불 수단으로 이용될 수 있습니다.</li>
            <li>쿠키는 서비스 이용기간(~2026. 05. 17. 00. 00) 이후에는 사용이 불가합니다.</li>
          </BulletList>
        </Article>

        <Article title="제9조 (결제 및 환불 규정)">
          <OrderedList>
            <li>이용자는 서비스 내의 결제시스템을 통해 결제를 할 수 있으며, 결제가 비정상적으로 처리되어 정상처리를 요청할 경우 회사는 이용자의 결제금액을 정상처리 할 의무를 집니다.</li>
            <li>회사는 부정한 방법 또는 회사가 금지한 방법을 통해 충전 및 결제된 금액에 대해서는 이를 취소하거나 환불을 제한할 수 있습니다.</li>
            <li>본 서비스의 결제는 '상대방 정보 제공' 및 '연락처 교환'이라는 용역에 대한 대가입니다. 매칭 성공 후 실제 연락 여부나 만남 성사 여부 등 이용자 간의 주관적 영역에 대해서는 회사가 보상하지 않습니다.</li>
            <li>
              이용자는 다음 각 호의 사유가 있으면 아래의 규정에 따라서 회사로부터
              결제 취소, 환불 및 보상을 받을 수 있습니다.
              <OrderedList>
                <li>결제를 통해 사용할 수 있는 서비스가 전무하며 그에 대한 책임이 전적으로 회사에 있을 경우 (단, 시스템 정기 점검 등의 불가피한 사유로 인한 경우는 제외)</li>
                <li>서비스 중단 등 회사의 잘못으로 인해 회사가 이용자에게 해지를 통보하는 경우</li>
              </OrderedList>
            </li>
            <li>이용자가 이용권 구매한 후 제6조 제1항에 따른 서비스 이용 기간 내 사용하지 않은 경우에는 환불이 불가합니다.</li>
            <li>
              환불을 원하는 이용자는 회사 인스타그램, 이메일을 통해 이용자 본인임을
              인증하는 절차를 거쳐 접수하셔야 하며 본인 인증과 동시에 환불을
              신청하여야 합니다.
              <OrderedList>
                <li>
                  이용자가 환불 등의 조치가 필요한 경우 회사에게 요청할 수 있으나,
                  다음 각 호에 해당하는 경우에는 디지털 콘텐츠의 특성 및 단기
                  서비스 운영 정책에 따라 환불이 불가합니다.
                  <OrderedList>
                    <li>디지털 재화의 사용: 이용자가 쿠키를 구매한 후 이를 1개라도 사용하여 상대방의 프로필을 열람하거나 '호감 보내기', ‘카드섞기’ 등 유료 기능을 실행한 경우. 또한, 구매한 쿠키 중 일부를 사용한 경우에도 전체 및 잔여분에 대한 환불이 불가합니다.</li>
                    <li>운영 기간 종료: 본 서비스는 축제 한정 서비스로, 서비스 운영 기간(2026. 05. 13. ~ 2026. 05. 17. 00. 00) 내에 사용하지 않은 쿠키는 기간 경과와 함께 효력이 소멸하며 환불 대상에서 제외됩니다.</li>
                    <li>이용자 귀책에 의한 서비스 중단: 이용자가 본인의 의사로 프로필을 '비공개'로 전환하거나 직접 계정을 삭제(탈퇴)하여 서비스 이용 권한을 포기한 경우.</li>
                    <li>운영 정책 위반: 이용약관 제10조(이용자의 의무)를 위반하여 부정행위, 허위 정보 기재, 타인 비방 등으로 인해 서비스 이용이 제한되거나 강제 탈퇴 조치된 경우.</li>
                  </OrderedList>
                </li>
                <li>환불은 결제 후 7일 내 사용되지 않은 쿠키의 경우에 한하여 환불이 가능합니다. 쿠키를 사용한 경우 환불 대상에서 제외되며, 고객센터를 통해 재지급된 쿠키는 환불 기한이 최초 구매로부터 연장되지 않습니다.</li>
                <li>회사의 정책 상 환불 사유에 해당할 경우 회사는 이용자에게 환불을 위한 일정한 절차 및 환불 입금 계좌번호 등의 금융정보를 이용자에게 요청할 수 있습니다. 이용자가 이에 정보를 제공하는 경우에 한해 환불이 가능하며, 이용자는 환불 요청시 이러한 개인정보 제공에 동의하는 것으로 간주합니다.</li>
              </OrderedList>
              <IndentedBlock>
                <Paragraph>f. 이용자가 이용약관과 서비스 및 회사 정책을 위반함으로 인해 이용정지 또는 강제이용중단 조치 되는 경우 환불 및 보상하지 않습니다.</Paragraph>
                <Paragraph>g. 신원 인증과정에서 이용자의 등록정보가 허위 정보로 판명되거나 이용 조건에 부합되지 않는 것이 판명될 경우 강제 이용 중지 또는 영구 이용 중지 조치가 되며 이용자 본인의 귀책사유로 인한 것이므로 환불 및 보상이 불가능합니다.</Paragraph>
              </IndentedBlock>
            </li>
            <li>분쟁 해결: 회사와 이용자 간 발생한 분쟁은 관련 법령에 따라 전자거래분쟁조정위원회의 조정을 따를 수 있습니다.</li>
          </OrderedList>
        </Article>
      </Chapter>

      <Chapter title="제4장 계약 당사자의 의무">
        <Article title="제10조 (회사의 의무)">
          <OrderedList>
            <li>회사는 안정적인 서비스 제공을 위해 최선을 다하며, 개인정보 보호를 위한 보안 시스템을 구축합니다.</li>
            <li>회사는 서비스 매칭 결과 발송 등을 위해 SMS 알림을 보낼 수 있으며, 회원이 가입 시 이에 동의한 것으로 간주합니다.</li>
            <li>회사는 직무상 알게 된 회원의 개인정보를 제3자에게 누설하지 않습니다.</li>
          </OrderedList>
        </Article>

        <Article title="제11조 (이용자의 의무 및 금지행위)">
          <OrderedList>
            <li>회원은 프로필 작성 시 사실에 근거하여 작성해야 하며, 정보 변경 시 이를 갱신해야 합니다. 이를 이행하지 않아 발생하는 불이익은 회원 본인에게 있습니다.</li>
            <li>본 서비스는 대학(원) 재·휴학생만 이용할 수 있습니다. 회원은 본인의 자격 충족 여부에 대해 책임을 지며, 자격을 허위로 기재하거나 자격 요건에 해당하지 않음에도 가입한 경우 이에 따른 책임은 회원 본인에게 있습니다. 회사는 해당 회원의 서비스 이용을 제한하거나 회원 자격을 박탈할 수 있습니다.</li>
            <li>
              회원은 본 서비스 이용과 관련하여 다음 각 호의 행위를 해서는 안 됩니다.
              <BulletList>
                <li>
                  개인정보 및 타인 사칭
                  <OrderedList>
                    <li>타인의 개인정보(성명, 연락처, 사진 등)를 무단으로 수집, 저장 또는 유포하는 행위</li>
                    <li>타인의 휴대전화번호나 개인정보를 도용하여 가입하거나 타인으로 사칭하는 행위</li>
                  </OrderedList>
                </li>
                <li>
                  부적절한 콘텐츠 게시
                  <OrderedList>
                    <li>음란한 행위를 묘사하거나, 성매매 관련 정보를 공유하거나, 성적 수치심 및 불쾌감을 유발하는 내용을 등록하는 행위(미풍양속 위반)</li>
                    <li>타인에 대한 혐오 표현, 욕설, 비속어, 은어를 사용하거나 사회 통념에 반하는 단어를 등록하는 행위</li>
                  </OrderedList>
                </li>
                <li>
                  기망 및 부당 이득
                  <OrderedList>
                    <li>타인을 기망하여 금전적 이득을 취하거나 기타 피해를 주는 행위</li>
                    <li>본 서비스를 영리, 영업, 광고 등 본래의 목적외의 용도로 사용하는 행위</li>
                  </OrderedList>
                </li>
                <li>
                  시스템 오남용 및 저작권 침해
                  <OrderedList>
                    <li>회사나 타인의 지식재산권(저작권 등)을 침해하거나 무단으로 정보를 복제, 유통하는 행위</li>
                    <li>알려지거나 알려지지 않은 버그를 악용하여 서비스를 이용하는 행위</li>
                    <li>서버 해킹, 역설계(Reverse Engineering), 소스 코드 유출 및 변경, 운영진 사칭 등 시스템을 공격하거나 변경하는 행위</li>
                  </OrderedList>
                </li>
                <li>
                  기타 위반 행위
                  <OrderedList>
                    <li>서비스 내 신청서 영역 등에 자신의 연락처를 직접 기재하여 부당하게 매칭 시스템을 우회하는 행위</li>
                    <li>그 밖에 관계 법령에 위반되거나 선량한 풍속 기타 사회통념에 반하는 행위</li>
                  </OrderedList>
                </li>
              </BulletList>
            </li>
          </OrderedList>
          <BulletList>
            <li>회원은 위 금지행위를 위반할 경우, 회사는 사전 통보 없이 서비스 이용 제한, 강제 탈퇴 및 영구 이용 중단 조치를 취할 수 있으며, 이로 인해 발생한 민·형사상의 책임은 회원 본인에게 귀속됩니다.</li>
          </BulletList>
        </Article>
      </Chapter>

      <Chapter title="제5장 기타 사항">
        <Article title="제12조 (서비스 이용 제한)">
          <Paragraph>
            회사는 회원이 본 약관을 위반하거나 정상적인 운영을 방해하는 경우,
            별도의 설명 의무 없이 서비스 이용을 제한하거나 계약을 해지할 수
            있습니다.
          </Paragraph>
        </Article>

        <Article title="제13조 (저작권)">
          <Paragraph>
            웹사이트 및 서비스 내 모든 콘텐츠의 저작권은 회사에 귀속되며, 회원의
            무단 사용이나 인용을 금지합니다.
          </Paragraph>
        </Article>

        <Article title="제14조 (손해배상 및 책임 제한)">
          <OrderedList>
            <li>회사는 무료 서비스 이용과 관련하여 발생한 손해에 대해 회사의 고의 또는 과실이 없는 한 책임을 지지 않습니다.</li>
            <li>회원 간의 만남 과정에서 발생한 분쟁이나 문제는 이용자 본인의 책임이며, 회사는 이에 개입하거나 책임지지 않습니다.</li>
          </OrderedList>
        </Article>

        <Article title="부칙">
          <Paragraph>본 약관은 2026년 5월 13일부터 시행됩니다.</Paragraph>
        </Article>
      </Chapter>
    </>
  );
}

function PrivacyTermsContent() {
  return (
    <>
      <Chapter title="개인정보 수집 및 이용 동의">
        <Article title="1. 수집 및 이용 목적">
          <BulletList>
            <li>도미사 매칭 서비스 제공: 프로필 카드 생성, 이성 회원과의 매칭, 쌍방 매칭시 연락처 공개 및 서비스 운영 안내.</li>
          </BulletList>
        </Article>

        <Article title="2. 수집하는 개인정보 항목">
          <BulletList>
            <li>필수 항목: 이름, 성별, 출생연도 , SNS ID, 전화번호, 친구소개서, MBTI, 사진, 연애 취향, 이상형 정보.</li>
          </BulletList>
        </Article>

        <Article title="3. 개인정보의 보유 및 이용 기간">
          <BulletList>
            <li>회원 탈퇴 시까지 보관 및 이용합니다.</li>
            <li>본 서비스는 단발성 행사에 그치지 않고 향후 리오픈 시 기존 회원의 편의를 위해 정보를 유지하며, 이용자가 직접 탈퇴를 요청할 경우 지체 없이 파기합니다. 단, 관계 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관 후 파기합니다.</li>
          </BulletList>
        </Article>

        <Article title="4. 동의 거부 권리 및 불이익 안내">
          <BulletList>
            <li>귀하는 위와 같은 개인정보 수집 및 이용에 대해 동의를 거부할 권리가 있습니다.</li>
            <li>단, 위 항목은 서비스 제공을 위한 필수 정보로, 동의를 거부하실 경우 도미사 매칭 서비스 이용이 제한됩니다.</li>
          </BulletList>
        </Article>

        <Article title="1. 개인정보 보호 책임자 안내">
          <BulletList>
            <li>책임자: 도미사 운영팀</li>
            <li>
              이메일:{" "}
              <a
                href="mailto:domisalove.my@gmail.com"
                className="underline underline-offset-2"
              >
                domisalove.my@gmail.com
              </a>
            </li>
            <li>인스타그램: domisa_love</li>
          </BulletList>
        </Article>
      </Chapter>
    </>
  );
}

function TermsPage({ type }: TermsPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as TermsLocationState;
  const content = termsPageContent[type];
  const fromAuthPath = getSafeInternalPath(state?.fromAuthPath);
  const pendingSignupPath = getSafeInternalPath(state?.pendingSignupPath);

  const handleBack = () => {
    if (fromAuthPath) {
      navigate(fromAuthPath, {
        replace: true,
        state: pendingSignupPath
          ? {
              checkedAgreements: state?.checkedAgreements,
              pendingSignupPath,
              showKakaoLoginToast: state?.showKakaoLoginToast === true,
            }
          : undefined,
      });
      return;
    }

    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-grey-400">
      <header className="fixed top-0 left-1/2 w-full frame-max-w -translate-x-1/2 z-40 bg-grey-100">
        <NotLoginHeader title={content.title} onBack={handleBack} />
      </header>
      <main className="bg-grey-400 px-5 pt-[8.875rem] pb-[8.75rem]">
        <section className="mx-auto flex w-full max-w-[22.625rem] flex-col gap-6">
          <h1 className="typo-header-3 text-grey-900">{content.heading}</h1>
          <div className="flex flex-col gap-6">{content.body}</div>
        </section>
      </main>
      <section className="fixed bottom-0 left-1/2 w-full frame-max-w -translate-x-1/2 bg-grey-400 px-5 pt-2.5 pb-[2.75rem]">
        <div className="mx-auto w-full max-w-[22.625rem]">
          <Button label="돌아가기" onClick={handleBack} />
        </div>
      </section>
    </div>
  );
}

export default TermsPage;
