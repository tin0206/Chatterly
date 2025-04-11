import { getConversation } from '@/actions/message.action'
import Link from "next/link"
import { useEffect, useRef, useState } from 'react'
import { Spinner } from './Spinner'
import { getProfileByUsername } from '@/actions/profile.action'
import { Button } from './ui/button'

type User = Awaited<ReturnType<typeof getProfileByUsername>>

interface ChatBodyProps {
    userId: string
    contactedFriend: User | undefined
}

const ChatBody = ({ userId, contactedFriend }: ChatBodyProps) => {
    const [conversation, setConversation] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const previousFriendIdRef = useRef<string | undefined>(undefined)

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
                            <div key={index} className={`w-full flex ${checkDisplayImg(index) ? "mb-4" : "mb-2"}`}>
                                {message.sender.id !== userId && (
                                    <div className='flex items-end'>
                                        <div className='w-[50px] h-[28px] pl-[14px] pr-[8px]'>
                                            {checkDisplayImg(index) && (
                                                <Link href={`/profile/${message.sender.username}`}>
                                                    <div className='size-[28px]'>
                                                        <img
                                                            src={message.sender.image}
                                                            className="rounded-full"
                                                            alt=""
                                                        />
                                                    </div>
                                                </Link>
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