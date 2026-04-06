import useApi from "@/hooks/useApi";
import { useAuth } from "@/store/auth";
import {
  Container,
  LoadingOverlay,
  Paper,
  Title,
  Text,
  Avatar,
  Group,
  Stack,
  Alert,
  Pagination,
  Input,
  Button,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconAlertCircle,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";

interface PostData {
  id: string;
  account_id: string;
  account_name: string;
  contents: string;
}

interface PostListData {
  data: PostData[];
  page: number;
  page_size: number;
  page_total: number;
  total: number;
}

export const Route = createFileRoute("/_main/")({
  component: PostList,
  validateSearch: (
    search: Record<string, unknown>,
  ): { page?: number; page_size?: number; contents?: string } => {
    return {
      page: Number(search?.page) || 1,
      page_size: Number(search?.page_size) || 3,
      contents: typeof search?.contents === "string" ? search.contents : "",
    };
  },
});

function PostList() {
  const search = useSearch({ from: "/_main/" });
  const navigate = useNavigate();
  const api = useApi();
  const auth = useAuth();
  const currentPage = search.page || 1;
  const searchQuery = search.contents || "";
  const pageSize = search.page_size || 3;
  const [contentSearch, setContentSearch] = useState<string>(searchQuery);
  const mobile = useMediaQuery("(max-width: 768px)");

  const {
    data: posts,
    isLoading: loading,
    error,
  } = useQuery<PostListData>({
    queryKey: ["posts", currentPage, pageSize, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("page_size", pageSize.toString());

      if (searchQuery) {
        params.append("filters[contents]", searchQuery);
      }

      const res = await api.get<PostListData>(
        `/api/posts?${params.toString()}`,
      );
      return res;
    },
  });

  const handlePageChange = (page: number) => {
    navigate({
      to: "/",
      search: { page, contents: searchQuery },
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContentSearch(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({
      to: "/",
      search: { page: 1, contents: contentSearch },
    });
  };

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/api/posts/${postId}`);
    },
  });

  return (
    <Container size="md" py="xl">
      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <Title order={1}>Posts</Title>

        {auth && (
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={() => navigate({ to: "/create" })}
            variant="subtle"
          >
            New Post
          </Button>
        )}
      </div>

      {loading && <LoadingOverlay visible />}

      {error && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          variant="light"
          mb="md"
        >
          {error.message}
        </Alert>
      )}

      <form
        onSubmit={handleSearchSubmit}
        style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}
      >
        <Input
          style={{ flex: 1 }}
          placeholder="Search posts..."
          value={contentSearch}
          onChange={handleSearchChange}
        />
        <Button type="submit">Search</Button>
      </form>

      {!loading && !error && posts?.data.length === 0 && (
        <Paper shadow="xs" p="xl" radius="md">
          <Text ta="center" c="dimmed">
            No posts available
          </Text>
        </Paper>
      )}

      <Stack gap="md">
        {Array.isArray(posts?.data) &&
          posts.data.map((post) => (
            <Paper key={post.id} shadow="xs" p="lg" radius="md">
              <div
                style={{
                  display: mobile ? "block" : "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  justifyContent: "space-between",
                }}
              >
                <Group>
                  <Avatar size="sm" />
                  <Text fw={500}>{post.account_name}</Text>
                </Group>

                {auth && auth.accountId === post.account_id && (
                  <Group
                    style={{
                      marginTop: mobile ? "0.5rem" : 0,
                    }}
                  >
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => navigate({ to: `/posts/${post.id}/edit` })}
                      leftSection={<IconEdit size={12} />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconTrash size={12} />}
                      onClick={() => {
                        modals.openConfirmModal({
                          title: "Confirm delete",
                          children: (
                            <Text size="sm">
                              Are you sure you want to delete this post?
                            </Text>
                          ),
                          labels: { confirm: "Delete", cancel: "Cancel" },
                          onConfirm: async () =>
                            deletePostMutation.mutate(post.id),
                          confirmProps: { color: "red" },
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </Group>
                )}
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: post.contents || "",
                }}
              />
            </Paper>
          ))}
      </Stack>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "1rem",
        }}
      >
        <Pagination
          total={posts?.page_total || 0}
          value={currentPage}
          onChange={handlePageChange}
        />
      </div>
    </Container>
  );
}
