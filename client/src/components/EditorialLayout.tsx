import { useState } from "react";
import type { ReactNode } from "react";
import { Menu, X } from "lucide-react";
import SiteHeader from './layout/SiteHeader'
import SiteFooter from './layout/SiteFooter'
import SiteSidebar from './layout/SiteSidebar'
export { default as SiteHeader } from './layout/SiteHeader'
export { default as SiteFooter } from './layout/SiteFooter'

export default function EditorialLayout({
    children,
    footer = true,
}: {
    children: ReactNode;
    footer?: boolean;
}) {
    const [sidebarOpened, setSidebarOpened] = useState(false);
    return (
        <div className="app-shell">
            <button
                type="button"
                className={`site-sidebar-toggle ${sidebarOpened ? "opened" : ""}`}
                aria-label={sidebarOpened ? "Close sidebar" : "Open sidebar"}
                aria-expanded={sidebarOpened}
                onClick={() => setSidebarOpened((value) => !value)}
            >
                {sidebarOpened ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
                type="button"
                className={`site-sidebar-backdrop ${sidebarOpened ? "opened" : ""}`}
                aria-label="Close sidebar"
                tabIndex={sidebarOpened ? 0 : -1}
                onClick={() => setSidebarOpened(false)}
            />
            <SiteSidebar opened={sidebarOpened} onNavigate={() => setSidebarOpened(false)} />
            <SiteHeader />
            {children}
            {footer && <SiteFooter />}
        </div>
    );
}
