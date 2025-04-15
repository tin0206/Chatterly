"use client"

import { getConversation } from '@/actions/message.action'
import Link from "next/link"
import { useEffect, useRef, useState } from 'react'
import { Spinner } from './Spinner'
import { getProfileByUsername } from '@/actions/profile.action'
import { Button } from './ui/button'
import { format, isToday, isYesterday } from "date-fns"
import {socket} from '@/lib/socketClient'

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
    const currentDate = format(new Date(), "dd/MM/yyyy")
    const [days, setDays] = useState<string[]>([])
    const [times, setTimes] = useState<string[]>([])
    const [hoveredAvatarIndex, setHoveredAvatarIndex] = useState<number | null>(null)
    const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(null)

    useEffect(() => {
        socket.emit("join", userId)

        const handleMessage = (data: {senderId: string, receiverId: string, message: string}) => {
            const { senderId, receiverId, message } = data
            const createdAt = new Date()
            if (senderId === contactedFriend?.id && receiverId === userId ||
                senderId === userId && receiverId === contactedFriend?.id) {
                setConversation((prev) => [
                    ...prev,
                    {
                        sender: { id: senderId },
                        receiver: { id: receiverId },
                        content: message,
                        createdAt,
                    }
                ])
                calculateDays()
                calculateTimes()
                
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
        
    }, [userId, contactedFriend?.id, currentDate])

    useEffect(() => {
        if (conversation.length > 0) {
            calculateDays()
            calculateTimes()
        }
    }, [conversation])

    function calculateDays() {
        const formattedDays = conversation.map((message) => {
            const messageDate = message.createdAt
            const daysDiff = parseInt(currentDate) - parseInt(format(messageDate, "dd/MM/yyyy"))
            const time = format(messageDate, "HH:mm")
            const hours = parseInt(time.split(":")[0], 10)
            const isAM = hours < 12
            const formattedTime = `${time} ${isAM ? "AM" : "PM"}`
            if (daysDiff < 7) {
                if (isToday(messageDate)) {
                    return `Today ${formattedTime}`
                }
                else if (isYesterday(messageDate)) {
                    return `Yesterday ${formattedTime}`
                }
                else {
                    const dayOfWeek = format(messageDate, "EEE")
                    return `${dayOfWeek} ${formattedTime}`
                }
            }
            else {
                const formattedDate = format(messageDate, "dd/MM/yyyy")
                return `${formattedDate} ${formattedTime}`
            }
        })

        setDays(formattedDays)
    }

    function calculateTimes() {
        const formattedTimes = conversation.map((message) => {
            const messageDate = message.createdAt
            const daysDiff = parseInt(currentDate) - parseInt(format(messageDate, "dd/MM/yyyy"))
            const time = format(messageDate, "HH:mm")
            if (daysDiff < 7) {
                if (isToday(messageDate)) {
                    return `${time}`
                }
                else {
                    const dayOfWeek = format(messageDate, "EEE")
                    return `${time} ${dayOfWeek}`
                }
            }
            else {
                const formattedDate = format(messageDate, "dd/MM/yyyy")
                return `${formattedDate} ${time}`
            }
        })

        setTimes(formattedTimes)
    }

    function displayTime(index: number) {
        const messageDate = conversation[index].createdAt
        const prevMessageDate = conversation[index - 1]?.createdAt
        const diff = messageDate.getTime() - prevMessageDate?.getTime()
        const diffInMinutes = Math.floor(diff / (1000 * 60))
        if (diffInMinutes <= 10) return false
        return true
    }

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
                            <div key={index}>
                                {displayTime(index) && (
                                    <div className='w-full px-[20px] py-[16px] flex justify-center items-center text-[13px] text-muted-foreground'>
                                        {times[index]}
                                    </div>
                                )}
                                <div key={index} className={`w-full flex ${checkDisplayImg(index) ? displayTime(index) ? "" : "mb-2" : "mb-2"}`}>
                                    {message.sender.id !== userId && (
                                        <div className='flex items-end'>
                                            <div className='w-[50px] h-[28px] pl-[14px] pr-[8px]'>
                                                {checkDisplayImg(index) && (
                                                    <div>
                                                        <Link href={`/profile/${message.sender.username}`}>
                                                            <div className={`size-[28px]`}
                                                                onMouseEnter={() => setHoveredAvatarIndex(index)}
                                                                onMouseLeave={() => setHoveredAvatarIndex(null)}
                                                            >
                                                                <img
                                                                    src={message.sender.image}
                                                                    className="rounded-full"
                                                                    alt=""
                                                                />
                                                            </div>
                                                        </Link> 
                                                        {hoveredAvatarIndex === index && (
                                                            <div className={`mt-1 p-1 text-[13px] bg-gray-200 dark:bg-white text-black inline-block rounded-3xl -translate-x-1`}>
                                                                {message.sender.username}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {hoveredMessageIndex === index && message.sender.id === userId && (
                                        <div className='ml-auto'>
                                            <div className='h-full flex justify-center items-center mr-1.5'>
                                                <div className='p-3 h-8 flex justify-center items-center text-[11px] bg-gray-600 text-white dark:bg-white dark:text-black rounded-xl'>
                                                    {days[index]}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div 
                                        className={`max-w-[65%] px-3 py-2 rounded-3xl ${
                                            message.sender.id === userId
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 border"
                                        } ${hoveredMessageIndex === index && message.sender.id === userId || message.sender.id !== userId ? "" : "ml-auto"}`}
                                        onMouseOver={() => setHoveredMessageIndex(index)}
                                        onMouseLeave={() => setHoveredMessageIndex(null)}
                                    >
                                        <div className={`text-[15px] ${message.sender.id !== userId ? "dark:text-black" : ""}`}>
                                            {message.content}
                                        </div>
                                    </div>
                                    {hoveredMessageIndex === index && message.sender.id !== userId && (
                                        <div className='flex justify-center items-center ml-1.5'>
                                            <div className='flex justify-center items-center text-[11px] p-3 h-8 bg-gray-600 text-white dark:bg-white dark:text-black rounded-xl'>
                                                {days[index]}
                                            </div>
                                        </div>
                                    )}
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