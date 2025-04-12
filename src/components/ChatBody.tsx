"use client"

import { getConversation } from '@/actions/message.action'
import Link from "next/link"
import { useEffect, useRef, useState } from 'react'
import { Spinner } from './Spinner'
import { getProfileByUsername } from '@/actions/profile.action'
import { Button } from './ui/button'
import { format } from "date-fns"
import {socket} from '@/lib/socketClient'

type User = Awaited<ReturnType<typeof getProfileByUsername>>

interface ChatBodyProps {
    userId: string
    contactedFriend: User | undefined
}

const ChatBody = ({ userId, contactedFriend }: ChatBodyProps) => {
    const [conversation, setConversation] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showName, setShowName] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const previousFriendIdRef = useRef<string | undefined>(undefined)

    useEffect(() => {
        socket.emit("join", userId)

        const handleMessage = (data: {senderId: string, receiverId: string, message: string}) => {
            const { senderId, receiverId, message } = data
            if (senderId === contactedFriend?.id && receiverId === userId ||
                senderId === userId && receiverId === contactedFriend?.id) {
                setConversation((prev) => [
                    ...prev,
                    {
                        sender: { id: senderId },
                        receiver: { id: receiverId },
                        content: message,
                    }
                ])
                setTimeout(() => {
                    scrollToBottom()
                }, 10)        
            }  
        }
        
        socket.on("message", handleMessage)
        return () => {
            socket.off("message", handleMessage)
        }
    }, [userId, contactedFriend?.id])

    useEffect(() => {
        setTimeout(() => {
        }, 100)

        if (contactedFriend?.id !== previousFriendIdRef.current) {
            setConversation([])
            setIsLoading(true)
            previousFriendIdRef.current = contactedFriend?.id
        }

        const fetchConversation = async () => {
            if (!contactedFriend?.id) {
                setConversation([])
                setIsLoading(true)
                return
            }

            try {
                setIsLoading(true)
                const data = await getConversation(userId, contactedFriend?.id as string)
                setConversation(data)

                setTimeout(() => {
                    scrollToBottom()
                }, 10)
            } catch (error) {
                console.error("Error fetching conversation:", error)
                setConversation([])
            } finally {
                setTimeout(() => {
                    setIsLoading(false)
                }, 5)
            }
        }
        if (contactedFriend?.id) {
            fetchConversation()
        }
        return () => {
            setConversation([])
            setIsLoading(false)
        }
        
    }, [userId, contactedFriend?.id])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" })
    }

    const checkDisplayImg = (index: number) => {
        const currentMessage = conversation[index]
        const nextMessage = conversation[index + 1]
        const isSameSender = currentMessage.sender.id === nextMessage?.sender.id
        return !isSameSender
    }

    return (
        <div>
            {isLoading || !contactedFriend ? (
                <div className="flex-1 flex items-center justify-center w-full h-full dark:bg-black bg-white">
                    <Spinner />
                </div>
            ) : (
                <>
                    <div className="flex flex-col justify-center items-center">
                        <div className='size-[90px]'>
                            <img className="rounded-full" src={contactedFriend?.image ?? "/avatar.png"} alt="" />
                        </div>
                        <div className="text-[18px] font-[600px] pt-[12px]">{contactedFriend?.username}</div>
                        <div className="pt-[12px]">
                            <span className="text-[16px] font-[400px] text-muted-foreground">
                                Instagram
                            </span>
                        </div>
                        <div className="py-[24px]">
                            <Link href={`/profile/${contactedFriend?.username}`}>
                                <Button className="cursor-pointer bg-gray-200 hover:bg-gray-300" variant="outline">
                                    View profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div>
                        {conversation.map((message: any, index: number) => (
                            <div key={index} className={`w-full flex ${checkDisplayImg(index) ? "mb-[32px]" : "mb-2"}`}>
                                {message.sender.id !== userId && (
                                    <div className='flex items-end'>
                                        <div className='w-[50px] h-[28px] pl-[14px] pr-[8px]'>
                                            {checkDisplayImg(index) && (
                                                <div>
                                                    <Link href={`/profile/${message.sender.username}`}>
                                                        <div className={`size-[28px]`}
                                                            onMouseEnter={() => setShowName(true)}
                                                            onMouseLeave={() => setShowName(false)}
                                                        >
                                                            <img
                                                                src={message.sender.image}
                                                                className="rounded-full"
                                                                alt=""
                                                            />
                                                        </div>
                                                    </Link> 
                                                    {showName && (
                                                        <div className={`mt-1 p-1 text-[13px] bg-gray-200 dark:bg-white text-black inline-block rounded-3xl -translate-x-1`}>
                                                            {message.sender.username}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className={`max-w-[80%] px-3 py-2 rounded-3xl ${
                                    message.sender.id === userId
                                    ? "ml-auto bg-blue-500 text-white"
                                    : "bg-gray-100 border"
                                }`}>
                                    <div className={`text-[15px] ${message.sender.id !== userId ? "dark:text-black" : ""}`}>
                                        {message.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </>
            )}
        </div>
    )
}

export default ChatBody