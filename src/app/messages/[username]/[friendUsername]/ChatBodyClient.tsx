"use client"

import { getProfileByUsername } from '@/actions/profile.action'
import ChatBody from '@/components/ChatBody'
import InputMessage from '@/components/InputMessage'
import React from 'react'

type Friend = Awaited<ReturnType<typeof getProfileByUsername>>

interface ChatBodyClientProps {
    userId: string
    contactedFriend: Friend
}

function ChatBodyClient({ userId, contactedFriend }: ChatBodyClientProps) {
  return (
    <>
      <div>
        <div className='h-[20px]'></div>
        <div className='flex-1 h-[calc(100vh-13.7rem)] overflow-y-auto'>
          <ChatBody userId={userId} contactedFriend={contactedFriend} />
        </div>
      </div>
      <InputMessage user={userId} contactedFriend={contactedFriend} />
    </>
  )
}

export default ChatBodyClient
