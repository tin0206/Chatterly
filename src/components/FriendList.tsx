"use client"

import { getFriendsList } from "@/actions/message.action"
import { useCurrentChat } from "@/store/chatTarget"
import { set } from "date-fns"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

type FriendList = Awaited<ReturnType<typeof getFriendsList>>

interface FriendListProps {
    username: string
    friendList: FriendList[]
}

function FriendList({username, friendList} : FriendListProps) {
    const router = useRouter()
    const pathname = usePathname()
    const currentChat = useCurrentChat((state: any) => state.currentChat)
    const setCurrentChat = useCurrentChat((state: any) => state.setCurrentChat)
    
    useEffect(() => {
        const friendUsername = pathname.split(`${username}`)[1]
        if (friendUsername !== '/' && friendUsername !== '') {
            const friendName = friendUsername.split('/')[1]
            setCurrentChat(friendName)
        }
    }, [])

    const handleClick = (friendUsername: string, newCurrentChat: string) => {
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
                        <img className="sm:size-[48px] sm:mr-[12px] rounded-full" src={friend.image ?? "/avatar.png"} alt="" />
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
