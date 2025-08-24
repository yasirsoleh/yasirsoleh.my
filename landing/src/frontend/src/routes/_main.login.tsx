import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Anchor,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconMail, IconLock, IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";

export const Route = createFileRoute("/_main/login")({
  component: LoginPage,
});

interface LoginForm {
  email: string;
  password: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => {
        if (!value) return "Email is required";
        if (!/^\S+@\S+$/.test(value)) return "Invalid email format";
        return null;
      },
      password: (value) => {
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return null;
      },
    },
  });

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // Store token or user data as needed
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      // Redirect to home page or dashboard
      navigate({ to: "/", reloadDocument: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md" pos="relative">
        <LoadingOverlay visible={loading} />

        <Stack gap="lg">
          <div style={{ textAlign: "center" }}>
            <Title order={2} mb="sm">
              Welcome Back
            </Title>
            <p>Sign in to your account</p>
          </div>

          {error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Login Error"
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                leftSection={<IconMail size={16} />}
                required
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                leftSection={<IconLock size={16} />}
                required
                {...form.getInputProps("password")}
              />

              <Button type="submit" fullWidth mt="md" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </form>

          <Group justify="center" gap="xs">
            <span>Don't have an account?</span>
            <Anchor component="a" href="/register" size="sm">
              Sign up
            </Anchor>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
