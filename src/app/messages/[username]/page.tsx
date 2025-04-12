import { getProfileByUsername } from "@/actions/profile.action"
import { notFound } from "next/navigation"
import { getFriendsList } from "@/actions/message.action"
import MessagePageClient from "./MessagePageClient"

type MessagesPageProps = {
  params: Promise<{ username: string }>
}

export default async function MessagesPage({ params } : MessagesPageProps) {
  const { username } = await params
  const user = await getProfileByUsername(username)
  if (!user) notFound()

  const [friendList] = await Promise.all([
    getFriendsList(user.id),
  ])

  return (
    <>
      <MessagePageClient username={username} friendList={friendList} />
    </>
  )
}