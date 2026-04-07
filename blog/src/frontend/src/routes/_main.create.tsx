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
import useApi from "@/hooks/useApi";
import { useMutation } from "@tanstack/react-query";

interface CreatePostForm {
  content: string;
}

export const Route = createFileRoute("/_main/create")({
  component: PostCreate,
});

function PostCreate() {
  const navigate = useNavigate();
  const api = useApi();
  const [content, setContent] = useState<string>("");
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

  const createMutation = useMutation<void, Error, CreatePostForm>({
    mutationFn: async (values: CreatePostForm) => {
      let res = await api.post("/api/posts", values);
      return res;
    },
    onSuccess: () => {
      navigate({ to: "/" });
    },
  });

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
          onClick={() => navigate({ to: "/" })}
          leftSection={<IconArrowLeft size={20} />}
          variant="subtle"
        >
          Back
        </Button>

        <Title order={1}>New Post</Title>
      </div>

      {createMutation.error && (
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Error"
          color="red"
          variant="light"
          mb="md"
        >
          {createMutation.error.message}
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
        onClick={() => createMutation.mutate({ content })}
      >
        Save
      </Button>
    </Container>
  );
}
