import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PlannerPage from "./pages/PlannerPage";
import CulturePage from "./pages/CulturePage";
import ContentAdminPage from "./pages/ContentAdminPage";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./auth/AuthContext";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import AdminRoute from "./components/AdminRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import AboutPage from "./pages/AboutPage";
import PresenceTracker from "./components/PresenceTracker";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <PresenceTracker />
                <Routes>
                    <Route element={<PublicRoute />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/kham-pha" element={<ExplorePage />} />
                        <Route path="/gioi-thieu" element={<AboutPage />} />
                        <Route path="/van-hoa" element={<CulturePage />} />
                        <Route path="/van-hoa/:slug" element={<ArticleDetailPage />} />
                        <Route
                            path="/dang-nhap"
                            element={<AuthPage mode="login" />}
                        />
                        <Route
                            path="/dang-ky"
                            element={<AuthPage mode="register" />}
                        />
                        <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/tai-khoan" element={<AccountPage />} />
                        <Route path="/lich-trinh" element={<PlannerPage />} />
                    </Route>
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route
                            path="/admin/content"
                            element={<ContentAdminPage />}
                        />
                        <Route
                            path="/admin/users"
                            element={<AdminUsersPage />}
                        />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
