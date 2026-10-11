import { Avatar, Button, Menu, Text, UnstyledButton } from "@mantine/core";
import { Bookmark, ChevronDown, LogIn, LogOut, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useI18n } from "../../i18n/I18nContext";

export default function UserMenu() {
    const { user, logout } = useAuth();
    const { t } = useI18n();
    const navigate = useNavigate();
    if (!user)
        return (
            <Button
                component={Link}
                to="/dang-nhap"
                radius="xl"
                color="pink"
                leftSection={<LogIn size={15} />}
            >
                {t("nav.login")}
            </Button>
        );
    const initials = user.displayName
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    return (
        <Menu
            position="bottom-end"
            width={260}
            shadow="xl"
            radius="lg"
            offset={10}
        >
            <Menu.Target>
                <UnstyledButton
                    className="user-menu-trigger"
                    aria-label={t("user.account")}
                >
                    <Avatar size={34} radius="xl" color="pink">
                        {initials}
                    </Avatar>
                    <span>{user.displayName.split(" ").at(-1)}</span>
                    <ChevronDown size={14} />
                </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown className="user-menu-dropdown">
                <div className="user-menu-summary">
                    <Text fw={700}>{user.displayName}</Text>
                    <Text size="xs" c="dimmed">
                        {user.email}
                    </Text>
                </div>
                <Menu.Divider />
                <Menu.Item
                    component={Link}
                    to="/tai-khoan"
                    leftSection={<UserRound size={16} />}
                >
                    {t("user.account")}
                </Menu.Item>
                <Menu.Item
                    component={Link}
                    to="/tai-khoan#lich-trinh"
                    leftSection={<Bookmark size={16} />}
                >
                    {t("user.itineraries")}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                    color="red"
                    leftSection={<LogOut size={16} />}
                    onClick={async () => {
                        await logout();
                        navigate("/");
                    }}
                >
                    {t("user.logout")}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
