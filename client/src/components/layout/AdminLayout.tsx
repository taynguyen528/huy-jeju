import type { ReactNode } from "react";
import { FileText, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "@mantine/core";
import { Burger, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

function AdminNavigation({ onNavigate }: { onNavigate?: () => void }) {
    return <><span>ADMIN WORKSPACE</span><NavLink to="/admin" end onClick={onNavigate}><LayoutDashboard size={17} /> Tổng quan</NavLink><NavLink to="/admin/content" onClick={onNavigate}><FileText size={17} /> Nội dung</NavLink><NavLink to="/admin/users" onClick={onNavigate}><UsersRound size={17} /> Người dùng</NavLink></>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { user, logout } = useAuth();
    const [opened, { open, close }] = useDisclosure(false);
    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <Link className="brand" to="/admin">
                    <span>JEJU</span>
                </Link>
                <div>
                    <AdminNavigation />
                </div>
                <footer>
                    <small>{user?.displayName}</small>
                    <Button variant="subtle" color="dark" leftSection={<LogOut size={15} />} onClick={() => void logout()}>
                        Đăng xuất
                    </Button>
                </footer>
            </aside>
            <header className="admin-mobile-header"><Link className="brand" to="/admin">JEJU</Link><Burger opened={opened} onClick={open} aria-label="Mở menu quản trị" /></header>
            <Drawer opened={opened} onClose={close} position="left" size="min(86%, 330px)" title={<Link className="brand" to="/admin" onClick={close}>JEJU</Link>} classNames={{ body: "admin-mobile-drawer" }}><nav><AdminNavigation onNavigate={close}/></nav><div className="admin-mobile-account"><small>{user?.displayName}</small><Button variant="light" color="red" leftSection={<LogOut size={15}/>} onClick={() => void logout()}>Đăng xuất</Button></div></Drawer>
            {children}
        </div>
    );
}
