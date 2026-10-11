import { useEffect, useState } from "react";
import {
    ActionIcon,
    Alert,
    Badge,
    Button,
    Group,
    Loader,
    Modal,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import { CalendarDays, Eye, Trash2, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EditorialLayout from "../components/EditorialLayout";
import { useAuth } from "../auth/AuthContext";
import { archiveItinerary, getMyItineraries } from "../api";
import type { SavedItinerary } from "../types";

export default function AccountPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<SavedItinerary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [preview, setPreview] = useState<SavedItinerary | null>(null);

    const reload = async () => {
        setLoading(true);
        setError("");
        try {
            setItems(await getMyItineraries());
        } catch (reason) {
            setError((reason as Error).message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void reload();
    }, []);
    const archive = async (id: string) => {
        try {
            await archiveItinerary(id);
            if (preview?.id === id) setPreview(null);
            await reload();
        } catch (reason) {
            setError((reason as Error).message);
        }
    };

    return (
        <EditorialLayout>
            <main className="account-route">
                <header>
                    <span>PRIVATE SPACE</span>
                    <h1>
                        Xin chào,
                        <br />
                        <em>{user?.displayName}.</em>
                    </h1>
                </header>
                {error && (
                    <Alert color="red" mb="lg">
                        {error}
                    </Alert>
                )}
                <section className="account-grid">
                    <article>
                        <UserRound />
                        <span>HỒ SƠ</span>
                        <h2>{user?.displayName}</h2>
                        <p>{user?.email}</p>
                    </article>
                    <article>
                        <CalendarDays />
                        <span>HÀNH TRÌNH</span>
                        <h2>{items.length} chuyến đi đã lưu</h2>
                        <p>
                            Lịch trình do Taewak đề xuất và bạn quyết định lưu.
                        </p>
                    </article>
                </section>
                <section className="saved-itineraries">
                    <div className="saved-heading">
                        <span>MY ITINERARIES</span>
                        <h2>Lịch trình của tôi</h2>
                    </div>
                    {loading ? (
                        <div className="saved-empty">
                            <Loader color="pink" />
                            <Text>Đang tải lịch trình…</Text>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="saved-empty">
                            <CalendarDays size={34} />
                            <Text fw={700}>Bạn chưa lưu chuyến đi nào</Text>
                            <Text c="dimmed" size="sm">
                                Mở Taewak, tạo lịch trình và chọn “Lưu lịch
                                trình”.
                            </Text>
                        </div>
                    ) : (
                        <div className="itinerary-list">
                            {items.map((item) => (
                                <article key={item.id}>
                                    <div>
                                        <Badge color="pink" variant="light">
                                            {item.status === "DRAFT"
                                                ? "Bản nháp"
                                                : item.status}
                                        </Badge>
                                        <h3>{item.title}</h3>
                                        <p>
                                            {item.startDate && item.endDate
                                                ? `${item.startDate} → ${item.endDate}`
                                                : "Thời gian linh hoạt"}{" "}
                                            · {item.travelers} người
                                        </p>
                                        <small>
                                            {[
                                                item.pace,
                                                item.transport,
                                                ...item.interests,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </small>
                                    </div>
                                    <Group gap="xs">
                                        <Tooltip label="Xem lịch trình">
                                            <ActionIcon
                                                size="lg"
                                                variant="light"
                                                color="dark"
                                                onClick={() => setPreview(item)}
                                            >
                                                <Eye size={17} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Lưu trữ">
                                            <ActionIcon
                                                size="lg"
                                                variant="light"
                                                color="red"
                                                onClick={() =>
                                                    void archive(item.id)
                                                }
                                            >
                                                <Trash2 size={17} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <Modal
                    opened={Boolean(preview)}
                    onClose={() => setPreview(null)}
                    title={preview?.title}
                    size="xl"
                    centered
                    classNames={{ content: "itinerary-preview-modal" }}
                >
                    <Stack gap="md">
                        <Group gap="xs">
                            <Badge color="pink">{preview?.destination}</Badge>
                            {preview?.budgetAmount && (
                                <Badge color="gray">
                                    ₩
                                    {preview.budgetAmount.toLocaleString(
                                        "ko-KR",
                                    )}
                                </Badge>
                            )}
                        </Group>
                        <div className="itinerary-markdown">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {preview?.aiContent || ""}
                            </ReactMarkdown>
                        </div>
                        <Group justify="flex-end">
                            <Button
                                variant="light"
                                color="red"
                                leftSection={<Trash2 size={16} />}
                                onClick={() =>
                                    preview && void archive(preview.id)
                                }
                            >
                                Lưu trữ
                            </Button>
                            <Button
                                color="dark"
                                onClick={() => setPreview(null)}
                            >
                                Đóng
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </main>
        </EditorialLayout>
    );
}
