import { authClient, sessionQueryKey } from "@app/shared/auth-client"
import { useAppForm } from "@app/shared/hooks/app-form"
import { toast } from "@app/shared/toast"
import { Card, Divider, Stack, Text, Title } from "@mantine/core"
import { useQueryClient } from "@tanstack/react-query"
import { type } from "arktype"
import AnchorLink from "../layout/AnchorLink"

const formSchema = type({ email: "string.email", password: "string" })

type LoginFormProps = {
  onLoginSuccess: () => Promise<void>
  // loginFn: () => Promise<void>
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const queryClient = useQueryClient()

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: formSchema },

    onSubmit: async ({ value }) => {
      const res = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      })

      if (res.error) {
        toast.error({
          message: res.error.message,
          title: res.error.statusText,
        })
      } else {
        // Invalidate session cache to trigger refetch with new session
        queryClient.invalidateQueries({ queryKey: sessionQueryKey })
        toast.success({ message: "Login successful" })
        await onLoginSuccess()
      }
    },
  })

  const authPending = form.state.isSubmitting

  return (
    <Card miw="65%" p="lg" radius="lg" shadow="md" withBorder>
      <Card.Section inheritPadding py="lg">
        <Stack align="center" gap="xs">
          <Title order={2}>Login to Carbonteq</Title>
          <Text c="dimmed" size="sm">
            Don't have an account yet?{" "}
            <AnchorLink preload="intent" size="sm" to="/auth/register">
              Sign Up
            </AnchorLink>
          </Text>
        </Stack>
      </Card.Section>
      <Divider />
      <Card.Section
        component="form"
        inheritPadding
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        py="xs"
      >
        <form.AppForm>
          <Stack gap="md">
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  disabled={authPending}
                  label="Email"
                  placeholder="your@email.com"
                  required
                  type="email"
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {(field) => (
                <field.PasswordField
                  disabled={authPending}
                  label="Password"
                  placeholder="Your password"
                  required
                  type="password"
                />
              )}
            </form.AppField>
          </Stack>
          <Divider my="md" />
          <form.SubmitButton fullWidth label="Login" />
        </form.AppForm>
      </Card.Section>
    </Card>
  )
}

export default LoginForm
