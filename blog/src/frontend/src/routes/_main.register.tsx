import { useForm } from "@mantine/form";
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
import {
  IconAlertCircle,
  IconCheck,
  IconLock,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import useApi from "@/hooks/useApi";
import { useAuth } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/_main/register")({
  component: Register,
});

interface Token {
  token: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Register() {
  const navigate = useNavigate();
  const api = useApi();
  const auth = useAuth();

  const registerMutation = useMutation<Token, Error, RegisterForm>({
    mutationFn: async (form: RegisterForm) => {
      let res = await api.post<Token>("/api/register", {
        account_name: form.name,
        email: form.email,
        password: form.password,
      });
      return res;
    },
    onSuccess: (data) => {
      auth.login(data.token);
      navigate({
        to: "/",
      });
    },
  });

  const form = useForm<RegisterForm>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) => {
        if (!value) return "Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        return null;
      },
      email: (value) => {
        if (!value) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format";
        return null;
      },
      password: (value) => {
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return "Please confirm your password";
        if (value !== values.password) return "Passwords do not match";
        return null;
      },
    },
  });

  if (registerMutation.isSuccess) {
    return (
      <Container size="sm" py="xl">
        <Paper shadow="md" p="xl" radius="md">
          <Stack gap="lg" align="center">
            <IconCheck size={48} color="green" />
            <Title order={2} ta="center">
              Registration Successful!
            </Title>
            <p style={{ textAlign: "center" }}>
              Your account has been created successfully. You will be redirected
              shortly.
            </p>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md" pos="relative">
        <LoadingOverlay visible={registerMutation.isPending} />

        <Stack gap="lg">
          <div style={{ textAlign: "center" }}>
            <Title order={2} mb="sm">
              Create Account
            </Title>
            <p>Join us today and start sharing your thoughts</p>
          </div>

          {registerMutation.error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Registration Error"
              color="red"
              variant="light"
            >
              {registerMutation.error.message}
            </Alert>
          )}

          <form
            onSubmit={form.onSubmit((values) =>
              registerMutation.mutateAsync(values),
            )}
          >
            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                leftSection={<IconUser size={16} />}
                required
                {...form.getInputProps("name")}
              />

              <TextInput
                label="Email"
                placeholder="your@email.com"
                leftSection={<IconMail size={16} />}
                required
                {...form.getInputProps("email")}
              />

              <PasswordInput
                label="Password"
                placeholder="Create a strong password"
                leftSection={<IconLock size={16} />}
                required
                description="Password must be at least 8 characters with uppercase, lowercase, and number"
                {...form.getInputProps("password")}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                leftSection={<IconLock size={16} />}
                required
                {...form.getInputProps("confirmPassword")}
              />

              <Button
                type="submit"
                fullWidth
                mt="md"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </Stack>
          </form>

          <Group justify="center" gap="xs">
            <span>Already have an account?</span>
            <Anchor component="a" href="/login" size="sm">
              Sign in
            </Anchor>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
