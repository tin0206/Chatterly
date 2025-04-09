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

    useEffect(() => {
        setIsLoading(true)
        const fetchConversation = async () => {
            try {
                const data = await getConversation(userId, contactedFriend?.id as string)
                setConversation(data)

                setTimeout(() => {
                    scrollToBottom()
                }, 10)
            } catch (error) {
                console.error("Error fetching conversation:", error)
            } finally {
                setIsLoading(false)
            }
        }
        if (contactedFriend?.id) {
            fetchConversation()
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
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Spinner />
                </div>
            ) : (
                <>
                    <div className="flex flex-col justify-center items-center">
                        <img className="size-[92] rounded-full" src={contactedFriend?.image ?? "/avatar.png"} alt="" />
                        <div className="text-[18px] font-[600px] pt-[12]">{contactedFriend?.username}</div>
                        <div className="pt-[12]">
                            <span className="text-[16px] font-[400px] text-muted-foreground">
                                Instagram
                            </span>
                        </div>
                        <div className="py-[24]">
                            <Link href={`/profile/${contactedFriend?.username}`}>
                                <Button className="cursor-pointer bg-gray-200 hover:bg-gray-300" variant="outline">
                                    View profile
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div>
                        {conversation.map((message: any, index: number) => (
                            <div key={index} className='w-full flex mb-2'>
                                {message.sender.id !== userId && (
                                    <div className='flex items-end'>
                                        <div className='w-[50] h-[28] pl-[14] pr-[8]'>
                                            {checkDisplayImg(index) && (
                                                <Link href={`/profile/${message.sender.username}`}>
                                                    <img
                                                        src={message.sender.image}
                                                        className="size-[28px] rounded-full"
                                                        alt=""
                                                    />
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