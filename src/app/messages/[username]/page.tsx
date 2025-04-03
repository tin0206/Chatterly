import { getProfileByUsername } from "@/actions/profile.action"
import MessagePageClient from "./MessagePageClient"
import { notFound } from "next/navigation"
import { getFriendsList } from "@/actions/message.action"

async function MessagesPage({ params } : Readonly<{ params: { username: string } }>) {
  const { username } = await params
  const user = await getProfileByUsername(username)
  if (!user) notFound()

  const [friendList] = await Promise.all([
    getFriendsList(user.id),
  ])

  return (
    <MessagePageClient
      user={user}
      friendList={friendList}
    />
  )
}

export default MessagesPage