import { create } from 'zustand'

export const useCurrentChat = create((set) => {
    return {
        currentChat: "",
        setCurrentChat: (chat: string) => set(() => ({ currentChat: chat })),
    }
})