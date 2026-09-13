import letterCorner from '../assets/letterCorner.svg';

function LetterCorner({ className }: { className: string }) {
  return (
    <img
      src={letterCorner}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none absolute size-4 ${className}`}
    />
  );
}

export type IntroductionLetterItem = {
  title: string;
  content: string;
};

/**
 * 친구 소개서 편지지.
 * 수락 화면(/introduce/:linkCode)과 마이페이지 확인 화면(/my/friend-intro)이 함께 쓴다.
 * 테두리 2겹은 absolute 오버레이라 답변 길이에 따라 높이가 늘고 준다.
 */
function IntroductionLetter({ items }: { items: IntroductionLetterItem[] }) {
  return (
    <section className="relative overflow-hidden rounded-[0.125rem] bg-[#f2f0ea] px-10 pt-[2.1875rem] pb-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[0.59375rem] inset-y-[0.53125rem] border-[1.2px] border-[#d0c2b5]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[1.09375rem] inset-y-4 rounded-[2.0625rem] border-[1.2px] border-[#d0c2b5]"
      />
      <LetterCorner className="left-3 top-3" />
      <LetterCorner className="right-3 top-3 rotate-90" />
      <LetterCorner className="right-3 bottom-3 rotate-180" />
      <LetterCorner className="left-3 bottom-3 -rotate-90" />

      <h2 className="relative text-center typo-letter-title text-[#b04b3e]">
        친구 소개서
      </h2>

      <div className="relative mt-[1.375rem] flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col gap-2.5">
            <p className="typo-letter-question text-grey-900/45">{item.title}</p>
            <p className="whitespace-pre-line typo-letter-answer text-grey-900/80">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default IntroductionLetter;
