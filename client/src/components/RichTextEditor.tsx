import { useRef, useState } from "react";
import type { ReactNode } from "react";
import {
    ActionIcon,
    Button,
    Group,
    Loader,
    Text,
    Tooltip,
} from "@mantine/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
    Bold,
    Heading2,
    ImagePlus,
    Italic,
    Link2,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Undo2,
} from "lucide-react";
import { uploadArticleImage } from "../api";

export default function RichTextEditor({
    value,
    onChange,
    error,
}: {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ allowBase64: false }),
            Link.configure({ openOnClick: false, autolink: true }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: { attributes: { class: "rich-editor-content" } },
        onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    });

    if (!editor)
        return (
            <div className="rich-editor-loading">
                <Loader size="sm" />
            </div>
        );
    const setLink = () => {
        const previous = editor.getAttributes("link").href as
            | string
            | undefined;
        const url = window.prompt(
            "Enter a link URL",
            previous || "https://",
        );
        if (url === null) return;
        if (!url.trim())
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        else
            editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url.trim() })
                .run();
    };
    const uploadImages = async (files?: FileList | null) => {
        if (!files?.length) return;
        setUploading(true);
        setUploadError("");
        try {
            for (const file of Array.from(files)) {
                const uploaded = await uploadArticleImage(file);
                editor
                    .chain()
                    .focus()
                    .setImage({ src: uploaded.url, alt: file.name })
                    .createParagraphNear()
                    .run();
            }
        } catch (reason) {
            setUploadError((reason as Error).message);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };
    const tool = (
        label: string,
        active: boolean,
        action: () => void,
        icon: ReactNode,
    ) => (
        <Tooltip label={label}>
            <ActionIcon
                type="button"
                variant={active ? "filled" : "subtle"}
                color={active ? "pink" : "dark"}
                onClick={action}
            >
                {icon}
            </ActionIcon>
        </Tooltip>
    );

    return (
        <div className={`rich-editor ${error ? "has-error" : ""}`}>
            <Group className="rich-editor-toolbar" gap={4} wrap="wrap">
                {tool(
                    "Bold",
                    editor.isActive("bold"),
                    () => editor.chain().focus().toggleBold().run(),
                    <Bold size={16} />,
                )}
                {tool(
                    "Italic",
                    editor.isActive("italic"),
                    () => editor.chain().focus().toggleItalic().run(),
                    <Italic size={16} />,
                )}
                {tool(
                    "Heading",
                    editor.isActive("heading", { level: 2 }),
                    () =>
                        editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run(),
                    <Heading2 size={16} />,
                )}
                {tool(
                    "Bulleted list",
                    editor.isActive("bulletList"),
                    () => editor.chain().focus().toggleBulletList().run(),
                    <List size={16} />,
                )}
                {tool(
                    "Numbered list",
                    editor.isActive("orderedList"),
                    () => editor.chain().focus().toggleOrderedList().run(),
                    <ListOrdered size={16} />,
                )}
                {tool(
                    "Block quote",
                    editor.isActive("blockquote"),
                    () => editor.chain().focus().toggleBlockquote().run(),
                    <Quote size={16} />,
                )}
                {tool(
                    "Link",
                    editor.isActive("link"),
                    setLink,
                    <Link2 size={16} />,
                )}
                <span className="rich-editor-spacer" />
                {tool(
                    "Undo",
                    false,
                    () => editor.chain().focus().undo().run(),
                    <Undo2 size={16} />,
                )}
                {tool(
                    "Redo",
                    false,
                    () => editor.chain().focus().redo().run(),
                    <Redo2 size={16} />,
                )}
            </Group>
            <div className="rich-editor-upload">
                <div>
                    <Text fw={700} size="sm">
                        Article images
                    </Text>
                    <Text size="xs" c="dimmed">
                        Select one or more JPG, PNG, WebP, or GIF files · up to
                        5 MB each.
                    </Text>
                </div>
                <Button
                    type="button"
                    variant="light"
                    color="pink"
                    leftSection={<ImagePlus size={17} />}
                    loading={uploading}
                    onClick={() => inputRef.current?.click()}
                >
                    Upload images
                </Button>
            </div>
            {uploadError && (
                <Text className="rich-editor-upload-error" size="xs" c="red">
                    {uploadError}
                </Text>
            )}
            <EditorContent editor={editor} />
            <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={(event) =>
                    void uploadImages(event.currentTarget.files)
                }
            />
            {error && <span className="rich-editor-error">{error}</span>}
        </div>
    );
}
