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
        { label: "Đang truy cập", value: data?.onlineVisitors, icon: Activity, live: true },
        { label: "Người dùng", value: data?.users, icon: UsersRound },
        { label: "Chờ duyệt", value: data?.pendingContent, icon: FileClock },
        {
            label: "Đã xuất bản",
            value: data?.publishedContent,
            icon: FileCheck2,
        },
        { label: "Báo cáo mở", value: data?.openReports, icon: ShieldAlert },
    ];
    return (
        <AdminLayout>
            <main className="admin-main">
                <header>
                    <div>
                        <span>ADMIN OVERVIEW</span>
                        <h1>Tổng quan hệ thống</h1>
                        <p>
                            Theo dõi nội dung, thành viên và công việc cần xử
                            lý.
                        </p>
                    </div>
                </header>
                <section className="admin-stats">
                    {cards.map(({ label, value, icon: Icon, live }) => (
                        <article key={label}>
                            <Icon />
                            <span>{label}</span>
                            <strong>{value ?? "—"}</strong>
                            {live && <small className="live-metric"><i /> Gần thời gian thực · trễ tối đa {data?.delaySeconds ?? 15}s</small>}
                        </article>
                    ))}
                </section>
                <section className="presence-breakdown">
                    <div><span>PHIÊN ĐANG HOẠT ĐỘNG</span><h2>Ai đang ở trên website?</h2><p>Mỗi tab trình duyệt gửi tín hiệu 15 giây một lần và được xem là offline sau 45 giây không phản hồi.</p></div>
                    <div className="presence-audiences"><article><strong>{data?.byAudience.guest ?? "—"}</strong><span>Khách</span></article><article><strong>{data?.byAudience.member ?? "—"}</strong><span>Thành viên</span></article><article><strong>{data?.byAudience.admin ?? "—"}</strong><span>Admin</span></article></div>
                </section>
                <section className="admin-placeholder">
                    <span>NEXT WORKFLOW</span>
                    <h2>Hàng đợi kiểm duyệt</h2>
                    <p>
                        Khu vực này sẽ hiển thị bài viết, báo cáo và dữ liệu địa
                        điểm cần admin xem xét.
                    </p>
                </section>
            </main>
        </AdminLayout>
    );
}
