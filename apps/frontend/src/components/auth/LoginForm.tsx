import { useAppForm } from "@app/shared/hooks/app-form"
import { useLoginMutation } from "@app/shared/hooks/auth-hooks"
import { toast } from "@app/shared/toast"
import { Card, Divider, Stack, Text, Title } from "@mantine/core"
import { type } from "arktype"
import AnchorLink from "../layout/AnchorLink"

const formSchema = type({ email: "string.email", password: "string" })

type LoginFormProps = {
  onLoginSuccess: () => Promise<void>
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const loginMut = useLoginMutation()

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: formSchema },

    onSubmit: async ({ value }) => {
      console.debug("Submitting login form with values:", value)
      await loginMut.mutateAsync(value, {
        onError: (err) => {
          console.error(err)
          toast.error({ message: err.message, title: err.name })
        },
        onSuccess: async () => {
          console.debug("Login successful, redirecting...")
          await onLoginSuccess()
        },
      })
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
