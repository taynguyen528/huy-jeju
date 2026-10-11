import type { ReactNode } from "react";
import SiteHeader from './layout/SiteHeader'
import SiteFooter from './layout/SiteFooter'
export { default as SiteHeader } from './layout/SiteHeader'
export { default as SiteFooter } from './layout/SiteFooter'

export default function EditorialLayout({
    children,
    footer = true,
}: {
    children: ReactNode;
    footer?: boolean;
}) {
    return (
        <div className="app-shell">
            <SiteHeader />
            {children}
            {footer && <SiteFooter />}
        </div>
    );
}
