"use client"

import { getFriendsList } from "@/actions/message.action"
import { getProfileByUsername } from "@/actions/profile.action"
import ChatBody from "@/components/ChatBody"
import InputMessage from "@/components/InputMessage"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { MessageCircleMoreIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

type User = Awaited<ReturnType<typeof getProfileByUsername>>
type FriendList = Awaited<ReturnType<typeof getFriendsList>>

interface MessagePageClientProps {
    user: NonNullable<User>
    friendList: FriendList
}

function MessagePageClient({user, friendList} : MessagePageClientProps) {
    const [contactedFriend, setContactedFriend] = useState<User>()
    const [currentChat, setCurrentChat] = useState("")
    const [temp, setTemp] = useState("")
    const [friend, setFriend] = useState("")
    const [showSendMessageDialog, setShowSendMessageDialog] = useState(false)
    const [contactList, setContactList] = useState<any>([])

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
        const fetchContactedFriend = async () => {
            const friend = await getProfileByUsername(currentChat)
            if (friend) {
                setContactedFriend(friend)
            }
        }

        fetchContactedFriend()
    },[currentChat])
    
    return (
        <>
            <div className="flex h-[calc(100vh-8.5rem)]">
                <div className="flex flex-col overflow-hidden w-2/5 border-r pl-2 h-full">
                    <div className="font-bold h-[44] pt-[14] pb-[10] px-[24] text-base shrink-0">
                        Messages
                    </div>
                    <div className="overflow-hidden flex-1">
                        <div className="h-full overflow-y-auto">
                            {friendList ? (
                                <>
                                    {friendList.map((friend, index) => (
                                        <div 
                                            key={index} 
                                            className={`flex sm:h-[72] px-[24] py-[8] cursor-pointer ${
                                                currentChat === friend.username ? "" : "hover:bg-gray-50 dark:hover:bg-neutral-600"
                                            } 
                                            ${
                                                currentChat === friend.username ? "bg-gray-50 dark:bg-gray-900" : ""
                                            }`}
                                            onClick={() => {
                                                if (currentChat === friend.username) setCurrentChat("")
                                                else setCurrentChat(friend.username)
                                            }}
                                        >
                                            <div className="flex justify-center items-center">
                                                <img className="size-[48] mr-[12] rounded-full" src={friend.image ?? "/avatar.png"} alt="" />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <div className="hidden sm:block">
                                                    <div className="text-[14px]">{friend.username}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-3/5 flex flex-col h-full relative">
                    {
                        currentChat === "" ? (
                            <div className="flex-1 flex flex-col justify-center items-center">
                                <div className="flex items-center justify-center w-full h-[96] px-[16]">
                                    <MessageCircleMoreIcon className="w-[96] h-[96]" />
                                </div>
                                <div className="text-xl h-[35] pt-[20] px-[16]">
                                    Your messages
                                </div>
                                <div className="px-[16] pt-[16] h-[27] text-sm text-muted-foreground">
                                    Send a message to start a chat.
                                </div>
                                <div className="flex items-center justify-center w-full pt-[20] px-[16]">
                                    <Button className="cursor-pointer bg-blue-500 hover:bg-blue-400" onClick={() => setShowSendMessageDialog(true)}>
                                        Send Message
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex px-[16] pb-2 border-b sticky top-0">
                                    <Link
                                        className="flex justify-center items-center w-[56] cursor-pointer"
                                        href={`/profile/${contactedFriend?.username}`}
                                    >
                                        <img className="size-[44] rounded-full" src={contactedFriend?.image ?? "/avatar.png"} alt="" />
                                    </Link>
                                    <Link 
                                        className="flex flex-col justify-center items-center cursor-pointer"
                                        href={`/profile/${contactedFriend?.username}`}
                                    >
                                        <div className="text-base">{contactedFriend?.username}</div>
                                    </Link>
                                </div>
                                <div>
                                    <div className="h-[20]"></div>
                                    <div className="flex-1 h-[calc(100vh-16.7rem)] overflow-y-auto">
                                        <ChatBody userId={user.id} contactedFriend={contactedFriend} />
                                    </div>
                                </div>
                                <InputMessage user={user} contactedFriend={contactedFriend} />              
                            </>
                        )
                    }
                </div>
            </div>

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
                    <div className="flex justify-center items-center pb-[18] sticky top-0 bg-background border-b h-[38]">
                        <div className="text-base font-bold pr-[16] h-full">
                            To:
                        </div>
                        <Input placeholder="Search following" onChange={(e) =>
                            setFriend(e.target.value)
                        } />
                    </div>
                    <div className="flex-1 overflow-y-auto pb-4">
                        {contactList.map((friend: any, index: number) => (
                            <div key={index} className="flex h-[60] px-[16] py-[8]">
                                <div className="flex w-full">
                                    <div className="w-[56] flex justify-center items-center">
                                        <img className="size-[44] mr-[12] rounded-full" src={friend.image ?? "/avatar.png"} alt="" />
                                    </div>
                                    <div className="w-[340] flex flex-col justify-center">
                                        <div className="text-base">{friend.username}</div>
                                    </div>
                                    <div className="flex justify-center rounded-full items-center">
                                        <Checkbox 
                                        className="rounded-full size-[30] cursor-pointer hover:bg-gray-100" 
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
