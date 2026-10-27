import { useEffect, useState } from "react";
import { Activity, FileCheck2, FileClock, ShieldAlert, UsersRound } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import { getAdminOverview } from "../api";
import type { AdminOverview } from "../api";

export default function AdminDashboardPage() {
    const [data, setData] = useState<AdminOverview | null>(null);
    useEffect(() => {
        const load = () => void getAdminOverview().then(setData).catch(() => undefined);
        load();
        const interval = window.setInterval(load, 10_000);
        return () => window.clearInterval(interval);
    }, []);
    const cards = [
        { label: "Online now", value: data?.onlineVisitors, icon: Activity, live: true },
        { label: "Users", value: data?.users, icon: UsersRound },
        { label: "In review", value: data?.pendingContent, icon: FileClock },
        {
            label: "Published",
            value: data?.publishedContent,
            icon: FileCheck2,
        },
        { label: "Open reports", value: data?.openReports, icon: ShieldAlert },
    ];
    return (
        <AdminLayout>
            <main className="admin-main">
                <header>
                    <div>
                        <span>ADMIN OVERVIEW</span>
                        <h1>System overview</h1>
                        <p>Monitor content, members, and pending work.</p>
                    </div>
                </header>
                <section className="admin-stats">
                    {cards.map(({ label, value, icon: Icon, live }) => (
                        <article key={label}>
                            <Icon />
                            <span>{label}</span>
                            <strong>{value ?? "—"}</strong>
                            {live && <small className="live-metric"><i /> Near real time · up to {data?.delaySeconds ?? 15}s delay</small>}
                        </article>
                    ))}
                </section>
                <section className="presence-breakdown">
                    <div><span>ACTIVE SESSIONS</span><h2>Who is on the website?</h2><p>Each browser tab sends a heartbeat every 15 seconds and goes offline after 45 seconds without a response.</p></div>
                    <div className="presence-audiences"><article><strong>{data?.byAudience.guest ?? "—"}</strong><span>Guests</span></article><article><strong>{data?.byAudience.member ?? "—"}</strong><span>Members</span></article><article><strong>{data?.byAudience.admin ?? "—"}</strong><span>Admins</span></article></div>
                </section>
                <section className="admin-placeholder">
                    <span>NEXT WORKFLOW</span>
                    <h2>Moderation queue</h2>
                    <p>This area will show articles, reports, and destination data that require review.</p>
                </section>
            </main>
        </AdminLayout>
    );
}
