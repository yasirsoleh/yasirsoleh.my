import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RichTextEditor, Link as TipTapLink } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { Alert, Button, Container, LoadingOverlay, Title } from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_main/posts/$postId/edit")({
  component: PostEdit,
});

function PostEditor({
  content,
  postId,
  token,
  setError,
}: {
  content: string;
  postId: string;
  token: string;
  setError: (error: string | null) => void;
}) {
  const navigate = useNavigate();
  const [editedContent, setEditedContent] = useState<string>(content);
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
    content: editedContent,
    onUpdate: ({ editor }) => {
      setEditedContent(editor.getHTML());
    },
  });

  const onSave = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contents: editedContent }),
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
    <>
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
    </>
  );
}

function PostEdit() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fetchPost = async (postId: string) => {
    const token = localStorage.getItem("auth_token");
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch post");
      const data = await response.json();
      console.log("Fetched post data:", data.contents);
      setContent(data.data.contents);
    } catch (error) {
      setError("Failed to fetch post");
    }
  };

  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    fetchPost(postId);
  }, []);

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

        <Title order={1}>Edit Post</Title>
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

      {token && content != null && (
        <PostEditor
          content={content}
          postId={postId}
          token={token}
          setError={setError}
        />
      )}
      {content == null && <LoadingOverlay visible />}
    </Container>
  );
}
