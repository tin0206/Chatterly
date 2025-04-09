import { SendIcon } from "lucide-react"
import { Input } from "./ui/input"
import { useState } from "react"
import { createMessage } from "@/actions/message.action"
import { getProfileByUsername } from "@/actions/profile.action"

type User = Awaited<ReturnType<typeof getProfileByUsername>>

interface MessagePageClientProps {
    user: NonNullable<User>
    contactedFriend: User | undefined
}

function InputMessage({ user, contactedFriend }: MessagePageClientProps) {
    const [currentText, setCurrentText] = useState("")
    const [isSendingMessage, setIsSendingMessage] = useState(false)

    const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (currentText.trim() === "") return
        const receiverId = contactedFriend?.id || ""
        if (!receiverId) return
        setIsSendingMessage(true)
        try {
            const result = await createMessage(currentText, user.id, receiverId)
            if (result?.success) {
                setCurrentText("")
            }
        } catch (error) {
            console.error("Failed to send message", error)
        } finally {
            setIsSendingMessage(false)
            setCurrentText("")
        }
    }

    return (
        <form 
            className="flex justify-center items-center gap-2 m-[16] h-[44] sticky bottom-0"
            onSubmit={handleSubmitMessage}
        >
            <Input
                className="rounded-[50]"
                placeholder="Message..." 
                onChange={
                    (e) =>setCurrentText(e.target.value)
                }
                value={currentText}
            />
            <button 
                className="flex size-[40] rounded-full justify-center items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-400"
                type="submit"
                disabled={currentText.trim() === "" || isSendingMessage}
            >
                <SendIcon />
            </button>
        </form>  
    )
}

export default InputMessage
