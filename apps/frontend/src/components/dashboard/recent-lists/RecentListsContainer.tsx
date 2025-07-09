import { Suspense } from "react"
import { useRecentLists } from "../../../utils/hooks/dashboard-hooks"
import { RecentLists } from "./RecentLists"
import { RecentListsEmpty } from "./RecentListsEmpty"
import { RecentListsSkeleton } from "./RecentListsSkeleton"

const RecentListsContent = () => {
  const { data: lists, isLoading } = useRecentLists()

  if (isLoading) {
    return <RecentListsSkeleton />
  }

  if (!lists || lists.length === 0) {
    return <RecentListsEmpty />
  }

  return <RecentLists lists={lists} />
}

export const RecentListsContainer = () => {
  return (
    <Suspense fallback={<RecentListsSkeleton />}>
      <RecentListsContent />
    </Suspense>
  )
}
