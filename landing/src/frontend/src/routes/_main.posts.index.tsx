import { extractTokenClaims } from "@/utils/token";
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
import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_main/posts/")({
  component: PostList,
  validateSearch: (
    search: Record<string, unknown>
  ): { page?: number; page_size?: number; contents?: string } => {
    return {
      page: Number(search?.page) || 1,
      page_size: Number(search?.page_size) || 3,
      contents: typeof search?.contents === "string" ? search.contents : "",
    };
  },
});

type Post = {
  id: string;
  account_id: string;
  account_name: string;
  contents: string;
};

type PostList = {
  data: Post[];
  page: number;
  page_size: number;
  page_total: number;
  total: number;
};

function PostList() {
  const search = useSearch({ from: "/_main/posts/" });
  const navigate = useNavigate();
  const currentPage = search.page || 1;
  const searchQuery = search.contents || "";
  const pageSize = search.page_size || 3;
  const [contentSearch, setContentSearch] = useState<string>(searchQuery);
  const mobile = useMediaQuery("(max-width: 768px)");
  const [posts, setPosts] = useState<PostList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setAuthToken(token);
    if (token) {
      const claims = extractTokenClaims(token);
      setAccountId(claims?.sub || null);
    }
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append("page", currentPage.toString());
        params.append("page_size", pageSize.toString());

        if (searchQuery) {
          params.append("filters[contents]", searchQuery);
        }

        const response = await fetch(`/api/posts?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`);
        }

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
        setPosts(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [currentPage, searchQuery]);

  const handlePageChange = (page: number) => {
    navigate({
      to: "/posts",
      search: { page, contents: searchQuery },
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContentSearch(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({
      to: "/posts",
      search: { page: 1, contents: contentSearch },
    });
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Refresh the post list after deletion
      navigate({
        to: "/posts",
        reloadDocument: true,
        search: { page: currentPage, contents: searchQuery },
      });
    } catch (error) {
      setError("Failed to delete post");
    }
  };

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

        {authToken && (
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={() => navigate({ to: "/posts/create" })}
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
          {error}
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

                {accountId && accountId === post.account_id && (
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
                          onConfirm: () => handleDeletePost(post.id),
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
