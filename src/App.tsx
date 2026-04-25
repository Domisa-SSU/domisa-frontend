import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import IntroduceFriendPage from "./pages/IntroduceFriendPage/IntroduceFriendPage";
import Kakao from "./pages/LoginPage/Kakao";
import SignupCharacterSelectPage from "./pages/SignupPage/SignupCharacterSelectPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import { SignupFlowProvider } from "./pages/SignupPage/SignupFlowContext";
import MyPage from "./pages/MyPage/MyPage";
import MyCookiePage from "./pages/MyPage/MyCookiePage";
import EditProfilePage from "./pages/MyPage/EditProfilePage";
import DatingCardEditPage from "./pages/MyPage/DatingCardEditPage";
import RequireIntroducePage from "./pages/DatingPage/RequireIntroducePage";
import "./App.css";

function App() {
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
          <Route path="/auth/signup" element={<SignupPage></SignupPage>}></Route>
          <Route
            path="/auth/signup/next"
            element={<SignupCharacterSelectPage></SignupCharacterSelectPage>}
          ></Route>
          <Route
            path="/dating/require-introduce"
            element={<RequireIntroducePage></RequireIntroducePage>}
          ></Route>
          <Route path="/my" element={<MyPage></MyPage>}></Route>
          <Route path="/my/cookie" element={<MyCookiePage></MyCookiePage>}></Route>
          <Route path="/my/edit-profile" element={<EditProfilePage></EditProfilePage>}></Route>
          <Route path="/my/dating-card" element={<DatingCardEditPage></DatingCardEditPage>}></Route>
        </Routes>
      </SignupFlowProvider>
    </>
  );
}

export default App;
