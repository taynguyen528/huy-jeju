import {
    ActionIcon,
    Burger,
    Drawer,
    Menu,
    SegmentedControl,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Languages } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";
import UserMenu from "../user/UserMenu";
const links = [
    ["nav.about", "/gioi-thieu"],
    ["nav.explore", "/kham-pha"],
    ["nav.planner", "/lich-trinh"],
    ["nav.culture", "/van-hoa"],
] as const;
export default function SiteHeader() {
    const [opened, { open, close }] = useDisclosure(false);
    const { locale, setLocale, t } = useI18n();
    const language = (
        <SegmentedControl
            size="xs"
            value={locale}
            onChange={(value) => setLocale(value as "vi" | "en" | "ko")}
            data={[
                { label: "VI", value: "vi" },
                { label: "EN", value: "en" },
                { label: "한국", value: "ko" },
            ]}
        />
    );
    return (
        <header className="topbar">
            <Link className="brand" to="/">
                JEJU
            </Link>
            <nav aria-label="Main navigation">
                {links.map(([key, path]) => (
                    <NavLink key={path} to={path}>
                        {t(key)}
                    </NavLink>
                ))}
            </nav>
            <div className="header-actions">
                <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                        <ActionIcon
                            variant="subtle"
                            color="dark"
                            radius="xl"
                            size={42}
                            aria-label={t("common.language")}
                        >
                            <Languages size={19} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>{t("common.language")}</Menu.Label>
                        <div className="language-control">{language}</div>
                    </Menu.Dropdown>
                </Menu>
                <UserMenu />
                <Burger
                    opened={opened}
                    onClick={open}
                    hiddenFrom="md"
                    aria-label={t("common.menu")}
                />
            </div>
            <Drawer
                opened={opened}
                onClose={close}
                position="right"
                size="min(100%, 420px)"
                title={
                    <Link className="brand" to="/" onClick={close}>
                        JEJU
                    </Link>
                }
                classNames={{
                    content: "mobile-drawer",
                    body: "mobile-drawer-body",
                }}
            >
                <nav>
                    {links.map(([key, path], index) => (
                        <NavLink key={path} to={path} onClick={close}>
                            {t(key)}
                            <span>0{index + 1}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="drawer-language">{language}</div>
            </Drawer>
        </header>
    );
}
