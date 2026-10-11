import { useEffect, useState } from "react";
import {
    ActionIcon,
    Alert,
    Badge,
    Button,
    Group,
    Loader,
    Modal,
    ScrollArea,
    Select,
    SimpleGrid,
    Stack,
    Table,
    Tabs,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    AlertCircle,
    CheckCircle2,
    FilePenLine,
    FilePlus2,
    ImagePlus,
    Search,
    Trash2,
    X,
} from "lucide-react";
import {
    createContent,
    deleteContent,
    getContent,
    updateContent,
    updateContentStatus,
    uploadArticleImage,
} from "../api";
import type { ContentInput, ContentItem, ContentLocale, ContentStatus } from "../types";
import AdminLayout from "../components/layout/AdminLayout";
import { useAuth } from "../auth/AuthContext";
import RichTextEditor from "../components/RichTextEditor";

const labels: Record<ContentStatus, string> = {
    draft: "Bản nháp",
    review: "Chờ duyệt",
    published: "Đã xuất bản",
    archived: "Lưu trữ",
};
const statusColors: Record<ContentStatus, string> = {
    draft: "gray",
    review: "yellow",
    published: "green",
    archived: "dark",
};
const statusOptions = Object.entries(labels).map(([value, label]) => ({
    value,
    label,
}));
type ContentFormValues = ContentInput;
const blankTranslation = () => ({ title: "", excerpt: "", body: "", translationStatus: "draft" as const });
const emptyValues = (author: string): ContentFormValues => ({
    slug: "",
    topic: "",
    author,
    status: "draft",
    coverImageUrl: "",
    translations: { vi: { ...blankTranslation(), translationStatus: "reviewed" }, en: blankTranslation(), ko: blankTranslation() },
});

export default function ContentAdminPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [query, setQuery] = useState("");
    const [editorOpened, setEditorOpened] = useState(false);
    const [editing, setEditing] = useState<ContentItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
    const [activeLocale, setActiveLocale] = useState<ContentLocale>("vi");
    const [uploadingCover, setUploadingCover] = useState(false);
    const form = useForm<ContentFormValues>({
        initialValues: emptyValues(user?.displayName || "Admin"),
        validate: {
            slug: (value) =>
                /^[a-z0-9-]+$/.test(value)
                    ? null
                    : "Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.",
            topic: (value) => (value.trim() ? null : "Hãy nhập chủ đề."),
            translations: {
                vi: {
                    title: (value) => value.trim().length < 3 ? "Tiêu đề tiếng Việt cần ít nhất 3 ký tự." : null,
                    excerpt: (value) => value.trim().length < 10 ? "Mô tả tiếng Việt cần ít nhất 10 ký tự." : null,
                    body: (value) => value.trim().length < 20 ? "Nội dung tiếng Việt cần ít nhất 20 ký tự." : null,
                },
            },
        },
    });

    const reload = async () => {
        setLoading(true);
        setError("");
        try {
            setItems(await getContent());
        } catch (reason) {
            setError((reason as Error).message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void reload();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setActiveLocale("vi");
        form.setValues(emptyValues(user?.displayName || "Admin"));
        form.resetDirty();
        setError("");
        setEditorOpened(true);
    };
    const openEdit = (item: ContentItem) => {
        setEditing(item);
        setActiveLocale("vi");
        form.setValues({
            slug: item.slug,
            topic: item.topic,
            author: item.author,
            status: item.status,
            coverImageUrl: item.coverImageUrl || "",
            translations: {
                vi: item.translations?.vi || { title: item.title, excerpt: item.excerpt, body: item.body, translationStatus: "reviewed" },
                en: item.translations?.en || blankTranslation(),
                ko: item.translations?.ko || blankTranslation(),
            },
        });
        form.resetDirty();
        setError("");
        setEditorOpened(true);
    };
    const submit = form.onSubmit(async (values) => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            if (editing) await updateContent(editing.id, values);
            else await createContent(values);
            setSuccess(
                editing ? "Đã cập nhật bài viết." : "Đã tạo bài viết mới.",
            );
            setEditorOpened(false);
            await reload();
        } catch (reason) {
            setError((reason as Error).message);
        } finally {
            setSaving(false);
        }
    });
    const changeStatus = async (item: ContentItem, status: ContentStatus) => {
        setError("");
        setSuccess("");
        try {
            await updateContentStatus(item.id, status);
            setSuccess(
                `Đã chuyển “${item.title}” sang ${labels[status].toLowerCase()}.`,
            );
            await reload();
        } catch (reason) {
            setError((reason as Error).message);
        }
    };
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await deleteContent(deleteTarget.id);
            setSuccess(`Đã xóa “${deleteTarget.title}”.`);
            setDeleteTarget(null);
            await reload();
        } catch (reason) {
            setError((reason as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    const visibleItems = normalizedQuery
        ? items.filter((item) =>
              [item.title, item.slug, item.topic, item.author].some((value) =>
                  value.toLocaleLowerCase("vi").includes(normalizedQuery),
              ),
          )
        : items;
    const localeLabels: Record<ContentLocale, string> = { vi: "Tiếng Việt", en: "English", ko: "한국어" };
    const uploadCover = async (file?: File | null) => {
        if (!file) return;
        setUploadingCover(true);
        setError("");
        try {
            const uploaded = await uploadArticleImage(file);
            form.setFieldValue("coverImageUrl", uploaded.url);
        } catch (reason) {
            setError((reason as Error).message);
        } finally {
            setUploadingCover(false);
        }
    };
    const renderTranslation = (locale: ContentLocale) => {
        const translation = form.values.translations[locale] || blankTranslation();
        const required = locale === "vi";
        return <Tabs.Panel value={locale} pt="md"><Stack gap="md">
            {locale !== "vi" && <Alert color="blue" variant="light">Nếu để trống, người đọc sẽ thấy bản tiếng Việt và nhãn nội dung thay thế.</Alert>}
            <TextInput label={`Tiêu đề · ${localeLabels[locale]}`} placeholder={locale === "vi" ? "Tên bài viết" : "Translated title"} required={required} {...form.getInputProps(`translations.${locale}.title`)} />
            <Textarea label="Mô tả ngắn" placeholder="Tóm tắt hiển thị trên card" autosize minRows={2} maxRows={4} required={required} {...form.getInputProps(`translations.${locale}.excerpt`)} />
            <div><Text size="sm" fw={500} mb={7}>Nội dung {required && <span aria-hidden="true">*</span>}</Text><RichTextEditor key={`${editing?.id || "new"}-${locale}`} value={translation.body} onChange={(body) => form.setFieldValue(`translations.${locale}.body`, body)} error={typeof form.errors[`translations.${locale}.body`] === "string" ? form.errors[`translations.${locale}.body`] as string : undefined}/></div>
            <Select label="Trạng thái bản dịch" description="Bản nháp cần được biên tập viên kiểm tra trước khi công bố chính thức." data={[{value:"draft",label:"Bản dịch nháp"},{value:"reviewed",label:"Đã kiểm tra"}]} allowDeselect={false} {...form.getInputProps(`translations.${locale}.translationStatus`)} />
        </Stack></Tabs.Panel>;
    };

    return (
        <AdminLayout>
            <main className="admin-main content-admin-page">
                <header>
                    <div>
                        <span>CONTENT STUDIO</span>
                        <h1>Quản lý nội dung</h1>
                        <p>
                            Thêm, chỉnh sửa, xuất bản và xóa nội dung văn hóa
                            Jeju.
                        </p>
                    </div>
                    <Button
                        className="primary"
                        leftSection={<FilePlus2 size={18} />}
                        onClick={openCreate}
                    >
                        Tạo bài viết
                    </Button>
                </header>
                <Stack gap="sm" mb="lg">
                    {success && (
                        <Alert
                            color="green"
                            icon={<CheckCircle2 size={18} />}
                            withCloseButton
                            onClose={() => setSuccess("")}
                        >
                            {success}
                        </Alert>
                    )}
                    {error && (
                        <Alert
                            color="red"
                            icon={<AlertCircle size={18} />}
                            withCloseButton
                            onClose={() => setError("")}
                        >
                            {error}
                        </Alert>
                    )}
                </Stack>
                <TextInput
                    className="content-search"
                    leftSection={<Search size={17} />}
                    placeholder="Tìm theo tiêu đề, slug, chủ đề hoặc tác giả"
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    mb="lg"
                />
                <section className="content-table-shell">
                    {loading ? (
                        <div className="content-state">
                            <Loader color="pink" />
                            <Text>Đang tải nội dung…</Text>
                        </div>
                    ) : visibleItems.length === 0 ? (
                        <div className="content-state">
                            <Text fw={700}>Không tìm thấy nội dung</Text>
                            <Text c="dimmed" size="sm">
                                Thử từ khóa khác hoặc tạo bài viết mới.
                            </Text>
                        </div>
                    ) : (
                        <ScrollArea>
                            <Table
                                className="content-mantine-table"
                                verticalSpacing="md"
                                horizontalSpacing="lg"
                                highlightOnHover
                            >
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Bài viết</Table.Th>
                                        <Table.Th>Trạng thái</Table.Th>
                                        <Table.Th>Cập nhật</Table.Th>
                                        <Table.Th ta="right">Thao tác</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {visibleItems.map((item) => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td>
                                                <div className="content-title-cell">
                                                    <strong>
                                                        {item.title}
                                                    </strong>
                                                    <span>
                                                        {item.topic} · /
                                                        {item.slug}
                                                    </span>
                                                    <small>{item.author}</small>
                                                </div>
                                            </Table.Td>
                                            <Table.Td>
                                                <Select
                                                    aria-label={`Trạng thái ${item.title}`}
                                                    value={item.status}
                                                    data={statusOptions}
                                                    allowDeselect={false}
                                                    leftSection={
                                                        <Badge
                                                            color={
                                                                statusColors[
                                                                    item.status
                                                                ]
                                                            }
                                                            circle
                                                            size="xs"
                                                        />
                                                    }
                                                    onChange={(value) =>
                                                        value &&
                                                        void changeStatus(
                                                            item,
                                                            value as ContentStatus,
                                                        )
                                                    }
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <time>
                                                    {new Date(
                                                        item.updatedAt,
                                                    ).toLocaleDateString(
                                                        "vi-VN",
                                                    )}
                                                </time>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group
                                                    gap="xs"
                                                    justify="flex-end"
                                                    wrap="nowrap"
                                                >
                                                    <Tooltip label="Chỉnh sửa">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="dark"
                                                            size="lg"
                                                            onClick={() =>
                                                                openEdit(item)
                                                            }
                                                        >
                                                            <FilePenLine
                                                                size={17}
                                                            />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label="Xóa">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            size="lg"
                                                            onClick={() =>
                                                                setDeleteTarget(
                                                                    item,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 size={17} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    )}
                </section>
                <Modal
                    opened={editorOpened}
                    onClose={() => !saving && setEditorOpened(false)}
                    title={editing ? "Chỉnh sửa bài viết" : "Tạo bài viết"}
                    size="xl"
                    centered
                    classNames={{
                        content: "content-editor-modal",
                        header: "content-editor-header",
                    }}
                    closeOnClickOutside={!saving}
                >
                    <form onSubmit={submit}>
                        <Stack gap="md">
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" className="content-editor-grid">
                                <TextInput
                                    label="Slug"
                                    description="Không dấu và không khoảng trắng"
                                    placeholder="cau-chuyen-jeju"
                                    required
                                    {...form.getInputProps("slug")}
                                />
                                <TextInput
                                    label="Chủ đề"
                                    description="Nhóm nội dung để lọc bài viết"
                                    placeholder="Haenyeo"
                                    required
                                    {...form.getInputProps("topic")}
                                />
                            </SimpleGrid>
                            <section className="cover-image-field">
                                <div className="cover-image-copy">
                                    <Text fw={700} size="sm">Ảnh bìa / background</Text>
                                    <Text c="dimmed" size="xs">Ảnh ngang riêng dùng trên card Culture Journal và đầu trang bài viết. Không được chèn vào nội dung.</Text>
                                </div>
                                {form.values.coverImageUrl ? <div className="cover-image-preview">
                                    <img src={form.values.coverImageUrl} alt="Xem trước ảnh bìa bài viết" />
                                    <ActionIcon color="red" variant="filled" radius="xl" aria-label="Xóa ảnh bìa" onClick={() => form.setFieldValue("coverImageUrl", "")}><X size={17}/></ActionIcon>
                                </div> : <div className="cover-image-empty"><ImagePlus size={30}/><Text size="sm" fw={650}>Chưa chọn ảnh bìa</Text><Text size="xs" c="dimmed">Khuyến nghị tỷ lệ 16:9 hoặc 4:3, tối đa 5 MB.</Text></div>}
                                <Group gap="sm">
                                    <Button component="label" variant="light" color="pink" leftSection={<ImagePlus size={17}/>} loading={uploadingCover}>
                                        {form.values.coverImageUrl ? "Thay ảnh bìa" : "Tải ảnh bìa"}
                                        <input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { void uploadCover(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }}/>
                                    </Button>
                                    {form.values.coverImageUrl && <Button variant="subtle" color="red" onClick={() => form.setFieldValue("coverImageUrl", "")}>Gỡ ảnh</Button>}
                                </Group>
                            </section>
                            <Tabs value={activeLocale} onChange={(value) => setActiveLocale((value || "vi") as ContentLocale)} className="translation-tabs">
                                <Tabs.List>{(["vi","en","ko"] as ContentLocale[]).map(locale => { const value=form.values.translations[locale]; const complete=Boolean(value?.title.trim()&&value?.body.trim()); return <Tabs.Tab key={locale} value={locale} rightSection={<Badge size="xs" circle color={complete?"green":"gray"}>{complete?"✓":"·"}</Badge>}>{localeLabels[locale]}</Tabs.Tab> })}</Tabs.List>
                                {renderTranslation("vi")}{renderTranslation("en")}{renderTranslation("ko")}
                            </Tabs>
                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" className="content-editor-grid">
                                <TextInput
                                    label="Tác giả"
                                    required
                                    {...form.getInputProps("author")}
                                />
                                <Select
                                    label="Trạng thái"
                                    data={statusOptions}
                                    allowDeselect={false}
                                    {...form.getInputProps("status")}
                                />
                            </SimpleGrid>
                            <Group justify="flex-end" mt="sm">
                                <Button
                                    variant="subtle"
                                    color="dark"
                                    onClick={() => setEditorOpened(false)}
                                    disabled={saving}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    color="pink"
                                    loading={saving}
                                >
                                    {editing ? "Lưu thay đổi" : "Tạo bài viết"}
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </Modal>
                <Modal
                    opened={Boolean(deleteTarget)}
                    onClose={() => !saving && setDeleteTarget(null)}
                    title="Xác nhận xóa nội dung"
                    centered
                    size="md"
                    closeOnClickOutside={!saving}
                >
                    <Text>
                        Bạn sắp xóa vĩnh viễn{" "}
                        <strong>{deleteTarget?.title}</strong>. Thao tác này
                        không thể hoàn tác.
                    </Text>
                    <Group justify="flex-end" mt="xl">
                        <Button
                            variant="subtle"
                            color="dark"
                            onClick={() => setDeleteTarget(null)}
                            disabled={saving}
                        >
                            Hủy
                        </Button>
                        <Button
                            color="red"
                            leftSection={<Trash2 size={16} />}
                            loading={saving}
                            onClick={() => void confirmDelete()}
                        >
                            Xóa vĩnh viễn
                        </Button>
                    </Group>
                </Modal>
            </main>
        </AdminLayout>
    );
}
