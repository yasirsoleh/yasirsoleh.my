import {
  ActionIcon,
  Anchor,
  Container,
  Group,
  Paper,
  Stack,
  Title,
  Text,
  List,
  Badge,
  Divider,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconBrandGithub,
  IconBrandGitlab,
  IconMail,
  IconBrandLinkedin,
} from "@tabler/icons-react";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/")({
  component: Index,
});

function Index() {
  const mobile = useMediaQuery("(max-width: 768px)");
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Hero Section */}
        <Paper shadow="xs" p="xl" radius="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap="md" flex={1}>
              <Title order={1}>MOHAMMAD ALIF YASIR BIN SOLEH</Title>
              <Group gap="md">
                <ActionIcon
                  variant="subtle"
                  component="a"
                  href="mailto:yasirsoleh@gmail.com"
                >
                  <IconMail size={20} />
                </ActionIcon>
                <Anchor href="mailto:yasirsoleh@gmail.com" c="dark">
                  yasirsoleh@gmail.com
                </Anchor>
              </Group>
              <Group gap="md">
                <ActionIcon
                  variant="subtle"
                  component="a"
                  href="https://www.linkedin.com/in/yasirsoleh"
                  target="_blank"
                >
                  <IconBrandLinkedin size={20} />
                </ActionIcon>
                <Anchor
                  href="https://www.linkedin.com/in/yasirsoleh"
                  target="_blank"
                  c="dark"
                >
                  linkedin.com/in/yasirsoleh
                </Anchor>
              </Group>
              <Group gap="md">
                <ActionIcon
                  variant="subtle"
                  component="a"
                  href="https://github.com/yasirsoleh"
                  target="_blank"
                >
                  <IconBrandGithub size={20} />
                </ActionIcon>
                <Anchor
                  href="https://github.com/yasirsoleh"
                  target="_blank"
                  c="dark"
                >
                  github.com/yasirsoleh
                </Anchor>
              </Group>
              <Group gap="md">
                <ActionIcon
                  variant="subtle"
                  component="a"
                  href="https://gitlab.com/yasirsoleh"
                  target="_blank"
                >
                  <IconBrandGitlab size={20} />
                </ActionIcon>
                <Anchor
                  href="https://gitlab.com/yasirsoleh"
                  target="_blank"
                  c="dark"
                >
                  gitlab.com/yasirsoleh
                </Anchor>
              </Group>
            </Stack>
          </Group>
        </Paper>

        {/* Objective */}
        <Paper shadow="xs" p="xl" radius="md">
          <Title order={2} mb="md">
            OBJECTIVE
          </Title>
          <Text size="lg">
            Computer Science graduate from Universiti Malaysia Pahang.
            Specialized in cloud-based applications and embedded systems.
            Currently working with BigPay Malaysia Sdn. Bhd. as a Backend
            Engineer
          </Text>
        </Paper>

        {/* Work Experience */}
        <Paper shadow="xs" p="xl" radius="md">
          <Title order={2} mb="md">
            WORK EXPERIENCE
          </Title>
          <Stack gap="xl">
            <div>
              <Group
                justify="space-between"
                align="flex-start"
                mb="sm"
                style={{
                  display: mobile ? "block" : "flex",
                }}
              >
                <div>
                  <Title order={3}>Backend Engineer</Title>
                  <Text fw={500} c="gray">
                    BigPay Malaysia Sdn. Bhd.
                  </Text>
                </div>
                <Badge
                  variant="light"
                  style={{
                    marginTop: mobile ? "0.5rem" : 0,
                  }}
                >
                  November 2025 - Present
                </Badge>
              </Group>
            </div>

            <Divider />

            <div>
              <Group
                justify="space-between"
                align="flex-start"
                mb="sm"
                style={{
                  display: mobile ? "block" : "flex",
                }}
              >
                <div>
                  <Title order={3}>R&D Software Engineer</Title>
                  <Text fw={500} c="gray">
                    Elid Sales & Marketing Sdn. Bhd.
                  </Text>
                </div>
                <Badge
                  variant="light"
                  style={{
                    marginTop: mobile ? "0.5rem" : 0,
                  }}
                >
                  September 2022 - November 2025
                </Badge>
              </Group>
              <List spacing="xs">
                <List.Item>
                  Developed a real-time cloud based access control system to
                  manage Elid access controllers using Go programming language,
                  PostgreSQL, and NATS for event streaming
                </List.Item>
                <List.Item>
                  Designed and developed the firmware for cloud serial
                  communicators using Rust programming language, Embassy
                  framework, and Preact for user interfaces on Raspberry Pi Pico
                </List.Item>
              </List>
            </div>

            <Divider />

            <div>
              <Group
                justify="space-between"
                align="flex-start"
                mb="sm"
                style={{
                  display: mobile ? "block" : "flex",
                }}
              >
                <div>
                  <Title order={3}>Internship - Full Stack Developer</Title>
                  <Text fw={500} c="gray">
                    EfiChain Solutions Sdn. Bhd.
                  </Text>
                </div>
                <Badge
                  variant="light"
                  style={{
                    marginTop: mobile ? "0.5rem" : 0,
                  }}
                >
                  March 2022 - August 2022
                </Badge>
              </Group>
              <List spacing="xs">
                <List.Item>
                  Developed an accounting system using PHP, Laravel, and MySQL
                  on the backend, and TypeScript, React, and Redux on the
                  frontend
                </List.Item>
                <List.Item>
                  Configured CI/CD pipeline using CircleCI, Docker, and AWS EC2
                  for deployment
                </List.Item>
              </List>
            </div>
          </Stack>
        </Paper>

        {/* Education */}
        <Paper shadow="xs" p="xl" radius="md">
          <Title order={2} mb="md">
            EDUCATIONAL HISTORY
          </Title>
          <Group
            justify="space-between"
            align="flex-start"
            mb="sm"
            style={{
              display: mobile ? "block" : "flex",
            }}
          >
            <div>
              <Title order={3}>
                Bachelor of Computer Science (Software Engineering)
              </Title>
              <Text fw={500} c="gray">
                Universiti Malaysia Pahang
              </Text>
            </div>
            <Badge
              variant="light"
              style={{
                marginTop: mobile ? "0.5rem" : 0,
              }}
            >
              September 2018 - August 2022
            </Badge>
          </Group>
          <List spacing="xs">
            <List.Item>CGPA: 3.57</List.Item>
            <List.Item>
              Final Year Project: Implemented a vehicle tracking system
              utilizing a multi-camera setup based on license plate recognition,
              using Python, OpenCV, and PyTorch, deployed on Nvidia Jetson Nano,
              with a Laravel backend and Flutter frontend.
            </List.Item>
          </List>
        </Paper>

        {/* Certifications */}
        <Paper shadow="xs" p="xl" radius="md">
          <Title order={2} mb="md">
            CERTIFICATIONS
          </Title>
          <Stack gap="md">
            <Group
              justify="space-between"
              style={{
                display: mobile ? "block" : "flex",
              }}
            >
              <div>
                <Text fw={500}>Certified Kubernetes Administrator</Text>
                <Text c="dimmed">Cloud Native Computing Foundation</Text>
              </div>
              <Badge
                variant="light"
                style={{
                  marginTop: mobile ? "0.5rem" : 0,
                }}
              >
                August 2024
              </Badge>
            </Group>

            <Divider />

            <Group
              justify="space-between"
              style={{
                display: mobile ? "block" : "flex",
              }}
            >
              <div>
                <Text fw={500}>Certified DevOps Foundation</Text>
                <Text c="dimmed">CCSD Council</Text>
              </div>
              <Badge
                variant="light"
                style={{
                  marginTop: mobile ? "0.5rem" : 0,
                }}
              >
                July 2024
              </Badge>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
