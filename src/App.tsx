import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login.tsx";
import PostsPage from "./pages/PostsPage.tsx";

function App() {
    return (
        <Routes> { /* Using React Router for proper pagination */ }
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<PostsPage />} />
        </Routes>
    );
}

export default App;