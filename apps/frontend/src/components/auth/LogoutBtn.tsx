import { useLogoutMutation } from "@app/shared/hooks/auth-hooks"
import { toast } from "@app/shared/toast"
import { Button } from "@mantine/core"
import { LogOutIcon } from "lucide-react"
import { memo, useState } from "react"

type LogoutBtnProps = {
  onLogoutSuccess: () => Promise<void>
}

const LogoutBtn = ({ onLogoutSuccess }: LogoutBtnProps) => {
  const [loggingOut, setLoggingOut] = useState(false)
  const logoutMut = useLogoutMutation()

  const handleClick = async () => {
    setLoggingOut(true)

    await logoutMut.mutateAsync(undefined, {
      onError: (err) => {
        toast.error({
          title: "Logout failed",
          message: err.message,
        })
      },
      onSuccess: async (res) => {
        if (res.data?.success) {
          await onLogoutSuccess()
        }
      },
      onSettled: () => {
        setLoggingOut(false)
      },
    })
  }

  return (
    <Button
      fullWidth
      justify="start"
      loading={loggingOut}
      onClick={handleClick}
      variant="transparent"
    >
      <LogOutIcon />
      <span>Logout</span>
    </Button>
  )
}

export default memo(LogoutBtn)
