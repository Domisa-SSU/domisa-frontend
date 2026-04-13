import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Kakao from "./pages/LoginPage/Kakao";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage></HomePage>}></Route>
        <Route path="/auth" element={<Kakao></Kakao>}></Route>
      </Routes>
    </>
  );
}

export default App;
