import { getFriendsList } from "@/actions/message.action"
import { getDbUserId, getDbUsername } from "@/actions/user.action"
import FriendList from "@/components/FriendList"

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
    const userId = await getDbUserId()
    const username = await getDbUsername()
    const friendList = await getFriendsList(userId as string)

    return (
        <>
            <div className="flex h-[calc(100vh-8.5rem)]">
                <div className="flex flex-col overflow-hidden w-2/5 border-r pl-2 h-full">
                    <div className="font-bold h-[44px] pt-[14px] pb-[10px] px-[24px] text-base">
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
                <div className="w-3/5 flex flex-col h-full relative">
                    {children}
                </div>
            </div>
        </>
    )
}