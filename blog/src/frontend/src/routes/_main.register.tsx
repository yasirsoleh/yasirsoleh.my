import { useForm } from "@mantine/form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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

export const Route = createFileRoute("/_main/register")({
  component: Register,
});

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (values: RegisterForm) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      setSuccess(true);

      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
        <LoadingOverlay visible={loading} />

        <Stack gap="lg">
          <div style={{ textAlign: "center" }}>
            <Title order={2} mb="sm">
              Create Account
            </Title>
            <p>Join us today and start sharing your thoughts</p>
          </div>

          {error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Registration Error"
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
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

              <Button type="submit" fullWidth mt="md" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
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
