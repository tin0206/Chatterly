"use client"

import { getFriendsList } from "@/actions/message.action"
import { Spinner } from "@/components/Spinner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCurrentChat } from "@/store/chatTarget"
import { MessageCircleMoreIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type FriendList = Awaited<ReturnType<typeof getFriendsList>>

interface MessagePageClientProps {
    username: string
    friendList: FriendList
}

function MessagePageClient({ username, friendList }: MessagePageClientProps) {
    const [showSendMessageDialog, setShowSendMessageDialog] = useState(false)
    const [friend, setFriend] = useState("")
    const [contactList, setContactList] = useState<any>([])
    const [temp, setTemp] = useState("")
    const currentChat = useCurrentChat((state: any) => state.currentChat)
    const setCurrentChat = useCurrentChat((state: any) => state.setCurrentChat)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchContactList = async () => {
            const temp : any = []
            if (friend != "") {
                friendList.forEach((f) => {
                    if (f.username.toLowerCase().includes(friend.toLowerCase())) {
                        temp.push(f)
                    }
                })
            } else {
                friendList.forEach((friend) => {
                    temp.push(friend)
                })
            }
            setContactList(temp)
        }
        fetchContactList()
    }, [friend])

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 500)
    }, [])

    return (
        <>
            {isLoading ? (
                <>
                    <div className="flex-1 flex items-center justify-center z-10 h-full w-full dark:bg-black bg-white">
                        <Spinner />
                    </div>
                </>
            ) : (
                <>
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <div className="flex items-center justify-center w-full h-[96px] px-[16px]">
                            <MessageCircleMoreIcon className="w-[96px] h-[96px]" />
                        </div>
                        <div className="text-xl h-[35px] pt-[20px] px-[16px]">
                            Your messages
                        </div>
                        <div className="px-[16px] pt-[16px] h-[27px] text-sm text-muted-foreground">
                            Send a message to start a chat.
                        </div>
                        <div className="flex items-center justify-center w-full pt-[20px] px-[16px]">
                            <Button className="cursor-pointer bg-blue-500 hover:bg-blue-400" onClick={() => setShowSendMessageDialog(true)}>
                                Send Message
                            </Button>
                        </div>
                    </div>
                </>
            )}
            
            <Dialog
                open={showSendMessageDialog}
                onOpenChange={() => {
                    setShowSendMessageDialog(false)
                }}
            >
                <DialogContent>
                    <DialogHeader className="border-b h-8">
                        <DialogTitle className="text-center">New message</DialogTitle>                            
                    </DialogHeader>
                    <div className="flex justify-center items-center pb-[18px] sticky top-0 bg-background border-b h-[38]">
                        <div className="text-base font-bold pr-[16px] h-full">
                            To:
                        </div>
                        <Input placeholder="Search following" onChange={(e) =>
                            setFriend(e.target.value)
                        } />
                    </div>
                    <div className="flex-1 overflow-y-auto pb-4">
                        {contactList.map((friend: any, index: number) => (
                            <div key={index} className="flex h-[60px] px-[16px] py-[8px]">
                                <div className="flex w-full">
                                    <div className="w-[56px] flex justify-center items-center">
                                        <img className="size-[44px] mr-[12px] rounded-full" src={friend.image ?? "/avatar.png"} alt="" />
                                    </div>
                                    <div className="w-[340px] flex flex-col justify-center">
                                        <div className="text-base">{friend.username}</div>
                                    </div>
                                    <div className="flex justify-center rounded-full items-center">
                                        <Checkbox 
                                        className="rounded-full size-[30px] cursor-pointer hover:bg-gray-100" 
                                        id={`checkbox-${index}`} 
                                        onClick={
                                            (e) => {
                                                if (currentChat === "") {
                                                    setTemp(friend.username)
                                                }
                                                else if (friend?.username === currentChat) {
                                                    setTemp("")
                                                }
                                                else if (friend?.username !== currentChat) {
                                                    setTemp(friend.username)
                                                }
                                            }
                                        }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button
                        className="cursor-pointer"
                        onClick={() => {
                            setCurrentChat(temp)
                            setShowSendMessageDialog(false)
                            router.push(`/messages/${username}/${temp}`)
                        }}
                    >
                        Chat
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default MessagePageClient
