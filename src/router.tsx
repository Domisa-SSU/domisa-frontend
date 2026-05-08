import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import IntroduceFriendGeneratingPage from "./pages/IntroduceFriendPage/IntroduceFriendGeneratingPage";
import IntroduceFriendPage from "./pages/IntroduceFriendPage/IntroduceFriendPage";
import ReceiveIntroducePage from "./pages/IntroduceFriendPage/ReceiveIntroducePage";
import Kakao from "./pages/LoginPage/Kakao";
import SignupCharacterSelectPage from "./pages/SignupPage/SignupCharacterSelectPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import MyPage from "./pages/MyPage/MyPage";
import MyCookiePage from "./pages/MyPage/MyCookiePage";
import CookiePurchasePage from "./pages/MyPage/CookiePurchasePage";
import EditProfilePage from "./pages/MyPage/EditProfilePage";
import DatingCardEditPage from "./pages/MyPage/DatingCardEditPage";
import LikesReceivedPage from "./pages/MyPage/LikesReceivedPage";
import LikesSentPage from "./pages/MyPage/LikesSentPage";
import MutualMatchPage from "./pages/MyPage/MutualMatchPage";
import FriendIntroCheckPage from "./pages/MyPage/FriendIntroCheckPage";
import DatingPage from "./pages/DatingPage/DatingPage";
import DatingCardDetailPage from "./pages/DatingPage/DatingCardDetailPage";
import DatingRegisterPage from "./pages/DatingPage/DatingRegisterPage";
import NotificationPage from "./pages/NotificationPage/NotificationPage";
import RequireIntroducePage from "./pages/DatingPage/RequireIntroducePage";
import DatingAccessGuard from "./routes/DatingAccessGuard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "auth", element: <Kakao /> },
      { path: "auth/signup", element: <SignupPage /> },
      { path: "auth/signup/next", element: <SignupCharacterSelectPage /> },
      { path: "introduce-friend", element: <IntroduceFriendPage /> },
      { path: "introduce-friend/generating", element: <IntroduceFriendGeneratingPage /> },
      { path: "introduce/:linkCode", element: <ReceiveIntroducePage /> },
      {
        path: "dating",
        element: (
          <DatingAccessGuard>
            <DatingPage />
          </DatingAccessGuard>
        ),
      },
      {
        path: "dating/cards/:cardId",
        element: (
          <DatingAccessGuard>
            <DatingCardDetailPage />
          </DatingAccessGuard>
        ),
      },
      { path: "dating/require-introduce", element: <RequireIntroducePage /> },
      { path: "dating/register", element: <DatingRegisterPage /> },
      { path: "my", element: <MyPage /> },
      { path: "my/cookie", element: <MyCookiePage /> },
      { path: "my/cookie/purchase", element: <CookiePurchasePage /> },
      { path: "my/edit-profile", element: <EditProfilePage /> },
      { path: "my/dating-card", element: <DatingCardEditPage /> },
      { path: "my/likes-received", element: <LikesReceivedPage /> },
      { path: "my/likes-sent", element: <LikesSentPage /> },
      { path: "my/mutual-match", element: <MutualMatchPage /> },
      { path: "my/friend-intro", element: <FriendIntroCheckPage /> },
      { path: "notifications", element: <NotificationPage /> },
    ],
  },
]);

export default router;
