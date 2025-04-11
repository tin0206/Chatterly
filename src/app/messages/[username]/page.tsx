import { getProfileByUsername } from "@/actions/profile.action"
import { notFound } from "next/navigation"
import { getFriendsList } from "@/actions/message.action"
import MessagePageClient from "./MessagePageClient"

async function MessagesPage({ params } : Readonly<{ params: { username: string } }>) {
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

export default MessagesPage