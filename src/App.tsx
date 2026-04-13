import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage></HomePage>}></Route>
        <Route path="/auth"></Route>
      </Routes>
    </>
  );
}

export default App;
