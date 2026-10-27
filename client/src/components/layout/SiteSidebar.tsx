import { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Compass, Info, Route } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { getPublicContent } from "../../api";
import type { ContentItem } from "../../types";

const links = [
    ["About", "/gioi-thieu", Info],
    ["Explore", "/kham-pha", Compass],
    ["Itinerary", "/lich-trinh", Route],
] as const;

export default function SiteSidebar({ opened, onNavigate }: { opened: boolean; onNavigate: () => void }) {
    const [articles, setArticles] = useState<ContentItem[]>([]);

    useEffect(() => {
        void getPublicContent().then(setArticles).catch(() => setArticles([]));
    }, []);

    return (
        <aside className={`site-sidebar ${opened ? "opened" : ""}`} aria-label="Sidebar navigation">
            <Link className="site-sidebar-brand" to="/" onClick={onNavigate}>JEJU</Link>
            <nav>
                {links.map(([label, path, Icon]) => (
                    <NavLink key={path} to={path} onClick={onNavigate} aria-label={label} title={label}>
                        <span><Icon size={15} /></span>
                        <strong>{label}</strong>
                        <ChevronRight size={15} />
                    </NavLink>
                ))}
                <NavLink className="site-sidebar-culture" to="/van-hoa" onClick={onNavigate} aria-label="Jeju Culture" title="Jeju Culture">
                    <span><BookOpen size={15} /></span>
                    <strong>Jeju Culture</strong>
                    <ChevronRight size={15} />
                </NavLink>
                <div className="site-sidebar-submenu" aria-label="Published Jeju Culture articles">
                    {articles.map((article) => (
                        <NavLink key={article.id} to={`/van-hoa/${article.slug}`} title={article.title} onClick={onNavigate}>
                            {article.title}
                        </NavLink>
                    ))}
                    {!articles.length && <small>No published stories</small>}
                </div>
            </nav>
            <p>JEJU JOURNAL<br />EST. 2026</p>
        </aside>
    );
}
