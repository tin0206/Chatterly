import { getProfileByUsername } from "@/actions/profile.action"
import ChatBodyClient from "./ChatBodyClient"

type ChatBodyServerProps = {
  params: Promise<{ username: string; friendUsername: string }>
}

export default async function ChatBodyServer({ params } : ChatBodyServerProps) {
  const { username, friendUsername } = await params
  const user = await getProfileByUsername(username)
  const friend = await getProfileByUsername(friendUsername)
  
  return (
    <div>
      <ChatBodyClient userId={user?.id ?? ""} contactedFriend={friend} />
    </div>
  )
}