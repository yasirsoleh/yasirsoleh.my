import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { AppShell, Text, Menu, Button } from "@mantine/core";
import { IconChevronDown, IconLogout, IconUser } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import useApi from "@/hooks/useApi";
import { useAuth } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_main")({
  component: RouteComponent,
});

type User = {
  id: string;
  email: string;
  account_name: string;
  photo_identifier: string | null;
};

function RouteComponent() {
  const api = useApi();
  const auth = useAuth();
  const navigate = useNavigate();

  const { data: me } = useQuery<User>({
    queryKey: ["user", auth.token],
    queryFn: async () => {
      return await api.request<User>("/api/me");
    },
    enabled: !!auth.token,
  });

  return (
    <AppShell header={{ height: 70 }} padding="md">
      <AppShell.Header>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "200px",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginLeft: "1rem",
              }}
            >
              <Link to="/" style={{ textDecoration: "none" }}>
                <Text
                  style={{ textDecoration: "none", color: "black" }}
                  size="xl"
                >
                  yasirsoleh
                </Text>
              </Link>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "200px",
              justifyContent: "flex-end",
              marginRight: "1rem",
            }}
          >
            {me ? (
              <Menu>
                <Menu.Target>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.2rem",
                    }}
                  >
                    <IconUser size={32} strokeWidth={1} />
                    <IconChevronDown size={16} strokeWidth={1} />
                  </div>
                </Menu.Target>
                <Menu.Dropdown>
                  <div style={{ padding: "0.5rem" }}>
                    <Text fw={500}>{me?.account_name || "Profile"}</Text>
                    <Text>{me?.email || "Email"}</Text>
                  </div>
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={14} />}
                    onClick={() => {
                      modals.openConfirmModal({
                        title: "Confirm logout",
                        children: (
                          <Text size="sm">
                            Are you sure you want to logout?
                          </Text>
                        ),
                        labels: { confirm: "Logout", cancel: "Cancel" },
                        onConfirm: () => {
                          auth.logout();
                        },
                        confirmProps: { color: "red" },
                      });
                    }}
                  >
                    Log Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button
                onClick={() => {
                  navigate({ to: "/login" });
                }}
              >
                Log In
              </Button>
            )}
          </div>
        </div>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
