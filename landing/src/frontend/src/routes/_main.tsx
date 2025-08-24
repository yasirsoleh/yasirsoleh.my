import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { AppShell, Text, Menu, Burger, Drawer, Button } from "@mantine/core";
import { IconChevronDown, IconLogout, IconUser } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { extractTokenClaims } from "@/utils/token";

export const Route = createFileRoute("/_main")({
  component: RouteComponent,
});

function RouteComponent() {
  const mobile = useMediaQuery("(max-width: 768px)");
  const [opened, { toggle }] = useDisclosure(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setAuthToken(token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Changed from "auth_token" to "authToken"
    setAuthToken(null);
    navigate({ to: "/" });
  };

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
              {mobile && <Burger opened={opened} onClick={toggle} mr={1} />}
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

          {!mobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                gap: "2rem",
              }}
            >
              {/* Link to Home and Posts */}
              <Link to="/" style={{ textDecoration: "none" }}>
                <Text
                  style={{ textDecoration: "none", color: "black" }}
                  size="sm"
                >
                  Home
                </Text>
              </Link>
              <Link to="/posts" style={{ textDecoration: "none" }}>
                <Text
                  style={{ textDecoration: "none", color: "black" }}
                  size="sm"
                >
                  Posts
                </Text>
              </Link>
              <a
                href="https://github.com/yasirsoleh/yasirsoleh.my"
                style={{ textDecoration: "none" }}
              >
                <Text
                  style={{ textDecoration: "none", color: "black" }}
                  size="sm"
                >
                  Source Code
                </Text>
              </a>
            </div>
          )}

          <Drawer
            opened={opened}
            onClose={toggle}
            title="Navigation"
            padding="md"
            size="md"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <Link to="/" style={{ textDecoration: "none" }}>
                <Text
                  style={{ textDecoration: "none", color: "black" }}
                  size="sm"
                >
                  Home
                </Text>
              </Link>
              <Link to="/posts" style={{ textDecoration: "none" }}>
                <Text
                  style={{ textDecoration: "none", color: "black" }}
                  size="sm"
                >
                  Posts
                </Text>
              </Link>
              <a
                href="https://github.com/yasirsoleh/yasirsoleh.my"
                style={{ textDecoration: "none" }}
              >
                <Text
                  style={{ textDecoration: "none", color: "black" }}
                  size="sm"
                >
                  Source Code
                </Text>
              </a>
            </div>
          </Drawer>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "200px",
              justifyContent: "flex-end",
              marginRight: "1rem",
            }}
          >
            {authToken ? (
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
                    <Text fw={500}>
                      {extractTokenClaims(authToken)?.account_name || "Profile"}
                    </Text>
                    <Text>
                      {extractTokenClaims(authToken)?.email || "Email"}
                    </Text>
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
                        onConfirm: handleLogout,
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
