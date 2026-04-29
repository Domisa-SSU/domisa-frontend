import NotLoginHeader from "../../components/NotLoginHeader";

function DatingPage() {
  return (
    <div className="min-h-screen bg-grey-100">
      <NotLoginHeader title="소개팅" />
      <main className="flex min-h-[calc(100vh-5.9rem)] items-center justify-center px-5 text-center">
        <p className="typo-subtitle-header-2 text-grey-900">
          솔로 둘러보기 준비 중이에요
        </p>
      </main>
    </div>
  );
}

export default DatingPage;
