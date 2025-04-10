"use client"

import { getFriendsList } from "@/actions/message.action"
import { useCurrentChat } from "@/store/chatTarget"
import Link from "next/link"
import { useRouter } from "next/navigation"

type FriendList = Awaited<ReturnType<typeof getFriendsList>>

interface FriendListProps {
    username: string
    friendList: FriendList[]
}

function FriendList({username, friendList} : FriendListProps) {
    const currentChat = useCurrentChat((state: any) => state.currentChat)
    const setCurrentChat = useCurrentChat((state: any) => state.setCurrentChat)
    const router = useRouter()
    const handleClick = (friendUsername: string, newCurrentChat: string) => {
        console.log(currentChat)
        if (newCurrentChat === "") router.push(`/messages/${username}`)
        else router.push(`/messages/${username}/${friendUsername}`)
    }

    return (
        <>
            {friendList.map((friend : any, index: number) => (
                <div
                    key={index}
                    className={`flex sm:h-[72px] px-[24px] py-[8px] cursor-pointer ${
                        currentChat === friend.username ? "" : "hover:bg-gray-50 dark:hover:bg-neutral-600"
                    }
                    ${
                        currentChat === friend.username ? "bg-gray-50 dark:bg-gray-900" : ""
                    }`}
                    onClick={() => {
                        const newCurrentChat = currentChat === friend.username ? "" : friend.username
                        setCurrentChat(newCurrentChat)
                        handleClick(friend.username, newCurrentChat)
                    }}
                >
                    <div className="flex justify-center items-center w-[60px] h-[56px]">
                        <img className="size-[48px] mr-[12px] rounded-full" src={friend.image ?? "/avatar.png"} alt="" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="hidden sm:block">
                            <div className="text-[14px]">{friend.username}</div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default FriendList
