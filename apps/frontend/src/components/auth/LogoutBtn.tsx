import { authClient } from "@app/shared/auth-client"
import { useInvalidateSession } from "@app/shared/session-cache"
import { toast } from "@app/shared/toast"
import { Button } from "@mantine/core"
import { LogOutIcon } from "lucide-react"
import { memo, useState } from "react"

type LogoutBtnProps = {
  onLogoutSuccess: () => Promise<void>
}

const LogoutBtn = ({ onLogoutSuccess }: LogoutBtnProps) => {
  const [loggingOut, setLoggingOut] = useState(false)
  const invalidateSession = useInvalidateSession()

  const handleClick = async () => {
    setLoggingOut(true)
    const signOutRes = await authClient.signOut()
    setLoggingOut(false)

    if (signOutRes.error) {
      toast.error({
        title: "Failed to logout",
        message: signOutRes.error.message,
      })
    } else {
      // clear session cache after logout
      invalidateSession()
      await onLogoutSuccess()
    }
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
