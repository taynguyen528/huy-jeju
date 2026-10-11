import { Center, Loader } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading)
        return (
            <Center mih="100vh">
                <Loader color="dark" />
            </Center>
        );
    if (!user)
        return (
            <Navigate
                to="/dang-nhap"
                replace
                state={{ from: location.pathname }}
            />
        );
    if (user.roles.includes("ADMIN")) return <Navigate to="/admin" replace />;
    return <Outlet />;
}
