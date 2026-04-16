import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import IntroduceFriendPage from "./pages/IntroduceFriendPage/IntroduceFriendPage";
import Kakao from "./pages/LoginPage/Kakao";
import SignupCharacterSelectPage from "./pages/SignupPage/SignupCharacterSelectPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import "./App.css";

function App() {
  return (
    <>
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
      </Routes>
    </>
  );
}

export default App;
