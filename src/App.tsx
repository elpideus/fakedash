import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login.tsx";
import PostsPage from "./pages/PostsPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <PostsPage />
                    </ProtectedRoute>
                }
            />
            <Route path="/"
                   element={
                        <ProtectedRoute>
                            <PostsPage />
                        </ProtectedRoute>
                   }
            />
        </Routes>
    );
}

export default App;