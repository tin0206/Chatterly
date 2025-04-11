import { getProfileByUsername } from "@/actions/profile.action"
import ChatBodyClient from "./ChatBodyClient"

async function ChatBodyServer({ params } : Readonly<{ params: { username: string, friendUsername: string } }>) {
  const { username, friendUsername } = await params
  const user = await getProfileByUsername(username)
  const friend = await getProfileByUsername(friendUsername)
  
  return (
    <div>
      <ChatBodyClient userId={user?.id ?? ""} contactedFriend={friend} />
    </div>
  )
}

export default ChatBodyServer