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
import useApi from "@/hooks/useApi";
import { useAuth } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";

interface Token {
  token: string;
}

export const Route = createFileRoute("/_main/login")({
  component: LoginPage,
});

interface LoginForm {
  email: string;
  password: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const api = useApi();
  const auth = useAuth();

  const loginMutation = useMutation<Token, Error, LoginForm>({
    mutationFn: async (values: LoginForm) => {
      let res = await api.post<Token>("/api/login", values);
      return res;
    },
    onSuccess: (data) => {
      auth.login(data.token);
      navigate({ to: "/" });
    },
  });

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

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md" pos="relative">
        <LoadingOverlay visible={loginMutation.isPending} />

        <Stack gap="lg">
          <div style={{ textAlign: "center" }}>
            <Title order={2} mb="sm">
              Welcome Back
            </Title>
            <p>Sign in to your account</p>
          </div>

          {loginMutation.error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Login Error"
              color="red"
              variant="light"
            >
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : String(loginMutation.error)}
            </Alert>
          )}

          <form
            onSubmit={form.onSubmit((values) =>
              loginMutation.mutateAsync(values),
            )}
          >
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

              <Button
                type="submit"
                fullWidth
                mt="md"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
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
