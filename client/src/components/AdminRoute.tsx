import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../auth/AuthContext";

export default function AdminRoute() {
    const { user, loading } = useAuth();
    if (loading)
        return (
            <Center mih="100vh">
                <Loader color="dark" />
            </Center>
        );
    if (!user)
        return <Navigate to="/dang-nhap" replace state={{ from: "/admin" }} />;
    return user.roles.includes("ADMIN") ? (
        <Outlet />
    ) : (
        <Navigate to="/tai-khoan" replace />
    );
}
