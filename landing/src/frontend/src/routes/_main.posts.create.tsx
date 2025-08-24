import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RichTextEditor, Link as TipTapLink } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { Alert, Button, Container, Title } from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useState } from "react";

export const Route = createFileRoute("/_main/posts/create")({
  component: PostCreate,
});

function PostCreate() {
  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TipTapLink,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const token = localStorage.getItem("auth_token");

  const onSave = async () => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contents: content }),
      });

      if (!response.ok) {
        throw new Error("Failed to save post");
      }

      navigate({ to: "/posts" });
    } catch (error) {
      setError("Failed to save post");
    }
  };

  return (
    <Container size="md" py="xl">
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <Button
          onClick={() => navigate({ to: "/posts" })}
          leftSection={<IconArrowLeft size={20} />}
          variant="subtle"
        >
          Back
        </Button>

        <Title order={1}>New Post</Title>
      </div>

      {error && (
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Error"
          color="red"
          variant="light"
          mb="md"
        >
          {error}
        </Alert>
      )}

      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>

      <Button
        mt={20}
        style={{
          width: "100%",
        }}
        leftSection={<IconDeviceFloppy size={20} />}
        onClick={onSave}
      >
        Save
      </Button>
    </Container>
  );
}
