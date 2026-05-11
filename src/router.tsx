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
import TermsPage from "./pages/TermsPage/TermsPage";
import CompletedFlowRoute from "./routes/CompletedFlowRoute";
import DatingAccessGuard from "./routes/DatingAccessGuard";
import DatingRegisterRoute from "./routes/DatingRegisterRoute";
import RegisteredOnlyRoute from "./routes/RegisteredOnlyRoute";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import NightBoothPage from "./pages/NightBooth/NightBoothPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "auth", element: <Kakao /> },
      {
        path: "auth/signup",
        element: (
          <CompletedFlowRoute flow="signup">
            <SignupPage />
          </CompletedFlowRoute>
        ),
      },
      {
        path: "auth/signup/next",
        element: (
          <CompletedFlowRoute flow="signup">
            <SignupCharacterSelectPage />
          </CompletedFlowRoute>
        ),
      },
      { path: "introduce-friend", element: <IntroduceFriendPage /> },
      { path: "introduce-friend/generating", element: <IntroduceFriendGeneratingPage /> },
      { path: "introduce/:linkCode", element: <ReceiveIntroducePage /> },
      { path: "terms/service", element: <TermsPage type="service" /> },
      { path: "terms/privacy", element: <TermsPage type="privacy" /> },
      { path: "error", element: <ErrorPage /> },
      { path: "night-booth", element: <NightBoothPage /> },
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
      {
        path: "dating/register",
        element: (
          <DatingRegisterRoute>
            <DatingRegisterPage />
          </DatingRegisterRoute>
        ),
      },
      {
        path: "my",
        element: (
          <RegisteredOnlyRoute>
            <MyPage />
          </RegisteredOnlyRoute>
        ),
      },
      {
        path: "my/cookie",
        element: (
          <RegisteredOnlyRoute>
            <MyCookiePage />
          </RegisteredOnlyRoute>
        ),
      },
      {
        path: "my/cookie/purchase",
        element: (
          <RegisteredOnlyRoute>
            <CookiePurchasePage />
          </RegisteredOnlyRoute>
        ),
      },
      {
        path: "my/edit-profile",
        element: (
          <RegisteredOnlyRoute>
            <EditProfilePage />
          </RegisteredOnlyRoute>
        ),
      },
      {
        path: "my/dating-card",
        element: (
          <RegisteredOnlyRoute>
            <DatingCardEditPage />
          </RegisteredOnlyRoute>
        ),
      },
      {
        path: "my/likes-received",
        element: (
          <RegisteredOnlyRoute>
            <LikesReceivedPage />
          </RegisteredOnlyRoute>
        ),
      },
      {
        path: "my/likes-sent",
        element: (
          <RegisteredOnlyRoute>
            <LikesSentPage />
          </RegisteredOnlyRoute>
        ),
      },
      {
        path: "my/mutual-match",
        element: (
          <RegisteredOnlyRoute>
            <MutualMatchPage />
          </RegisteredOnlyRoute>
        ),
      },
      {
        path: "my/friend-intro",
        element: (
          <RegisteredOnlyRoute>
            <FriendIntroCheckPage />
          </RegisteredOnlyRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <RegisteredOnlyRoute>
            <NotificationPage />
          </RegisteredOnlyRoute>
        ),
      },
    ],
  },
]);

export default router;
