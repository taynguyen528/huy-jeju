import {
    Burger,
    Drawer,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, NavLink } from "react-router-dom";
import UserMenu from "../user/UserMenu";
const links = [
    ["About", "/gioi-thieu"],
    ["Explore", "/kham-pha"],
    ["Itinerary", "/lich-trinh"],
    ["Jeju Culture", "/van-hoa"],
] as const;
export default function SiteHeader() {
    const [opened, { open, close }] = useDisclosure(false);
    return (
        <header className="topbar">
            <Link className="brand" to="/">
                JEJU
            </Link>
            <nav aria-label="Main navigation">
                {links.map(([label, path]) => (
                    <NavLink key={path} to={path}>
                        {label}
                    </NavLink>
                ))}
            </nav>
            <div className="header-actions">
                <UserMenu />
                <Burger
                    opened={opened}
                    onClick={open}
                    hiddenFrom="md"
                    aria-label="Open menu"
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
                    {links.map(([label, path], index) => (
                        <NavLink key={path} to={path} onClick={close}>
                            {label}
                            <span>0{index + 1}</span>
                        </NavLink>
                    ))}
                </nav>
            </Drawer>
        </header>
    );
}
