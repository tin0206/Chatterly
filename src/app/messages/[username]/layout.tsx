import { getFriendsList } from "@/actions/message.action"
import { getDbUserId, getDbUsername } from "@/actions/user.action"
import FriendList from "@/components/FriendList"
import styles from "@/app/messages/[username]/layout.module.css"

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
    const userId = await getDbUserId()
    const username = await getDbUsername()
    const friendList = await getFriendsList(userId as string)

    return (
        <>
            <div className="flex h-[calc(100vh-8.5rem)]">
                <div className="flex flex-col overflow-hidden sm:w-2/5 border-r pl-2 h-full">
                    <div className={`flex font-bold pl-[5px] sm:pl-0 h-[44px] sm:pt-[14px] sm:pb-[10px] sm:px-[24px] sm:text-base`}>
                        Messages
                    </div>
                    <div className="overflow-hidden flex-1">
                        <div className="h-full overflow-y-auto">
                            {friendList ? (
                                <>
                                    <FriendList username={username as string} friendList={friendList as []} />
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                </div>
                <div className="sm:w-3/5 w-full flex flex-col h-full relative">
                    {children}
                </div>
            </div>
        </>
    )
}