import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import IntroduceFriendGeneratingPage from "./pages/IntroduceFriendPage/IntroduceFriendGeneratingPage";
import IntroduceFriendPage from "./pages/IntroduceFriendPage/IntroduceFriendPage";
import ReceiveIntroducePage from "./pages/IntroduceFriendPage/ReceiveIntroducePage";
import Kakao from "./pages/LoginPage/Kakao";
import SignupCharacterSelectPage from "./pages/SignupPage/SignupCharacterSelectPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import { SignupFlowProvider } from "./pages/SignupPage/SignupFlowContext";
import MyPage from "./pages/MyPage/MyPage";
import MyCookiePage from "./pages/MyPage/MyCookiePage";
import EditProfilePage from "./pages/MyPage/EditProfilePage";
import DatingCardEditPage from "./pages/MyPage/DatingCardEditPage";
import DatingPage from "./pages/DatingPage/DatingPage";
import DatingCardDetailPage from "./pages/DatingPage/DatingCardDetailPage";
import DatingRegisterPage from "./pages/DatingPage/DatingRegisterPage";
import NotificationPage from "./pages/NotificationPage/NotificationPage";
import RequireIntroducePage from "./pages/DatingPage/RequireIntroducePage";
import { useAuthMeQuery } from "./queries/auth";
import "./App.css";

function App() {
  const { isPending } = useAuthMeQuery();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-100">
        <div
          role="status"
          aria-label="사용자 정보 확인 중"
          className="h-10 w-10 animate-spin rounded-full border-[0.1875rem] border-primary-200 border-t-primary-500"
        />
      </div>
    );
  }

  return (
    <>
      <SignupFlowProvider>
        <Routes>
          <Route path="/" element={<HomePage></HomePage>}></Route>
          <Route path="/auth" element={<Kakao></Kakao>}></Route>
          <Route
            path="/introduce-friend"
            element={<IntroduceFriendPage></IntroduceFriendPage>}
          ></Route>
          <Route
            path="/introduce-friend/generating"
            element={<IntroduceFriendGeneratingPage></IntroduceFriendGeneratingPage>}
          ></Route>
          <Route
            path="/introduce/:linkCode"
            element={<ReceiveIntroducePage></ReceiveIntroducePage>}
          ></Route>
          <Route path="/auth/signup" element={<SignupPage></SignupPage>}></Route>
          <Route
            path="/auth/signup/next"
            element={<SignupCharacterSelectPage></SignupCharacterSelectPage>}
          ></Route>
          <Route
            path="/dating"
            element={<DatingPage></DatingPage>}
          ></Route>
          <Route
            path="/dating/cards/:cardId"
            element={<DatingCardDetailPage></DatingCardDetailPage>}
          ></Route>
          <Route
            path="/dating/require-introduce"
            element={<RequireIntroducePage></RequireIntroducePage>}
          ></Route>
          <Route
            path="/dating/register"
            element={<DatingRegisterPage></DatingRegisterPage>}
          ></Route>
          <Route path="/my" element={<MyPage></MyPage>}></Route>
          <Route path="/my/cookie" element={<MyCookiePage></MyCookiePage>}></Route>
          <Route path="/my/edit-profile" element={<EditProfilePage></EditProfilePage>}></Route>
          <Route path="/my/dating-card" element={<DatingCardEditPage></DatingCardEditPage>}></Route>
          <Route path="/notifications" element={<NotificationPage />}></Route>
        </Routes>
      </SignupFlowProvider>
    </>
  );
}

export default App;
