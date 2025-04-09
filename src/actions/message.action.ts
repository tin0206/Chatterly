"use server"

import prisma from "@/lib/prisma"

export async function getFriendsList(userId: string) {
    try {
        const followers = await prisma.follows.findMany({
            where: {
                followingId: userId,
            },
            select: {
                follower: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        const friendList = await Promise.all(
            followers.map(async (follow) => {
                const isMutual = await prisma.follows.findFirst({
                    where: {
                        followerId: userId,
                        followingId: follow.follower.id,
                    }
                })

                return {
                    ...follow.follower,
                    isFollowingCurrentUser: true,
                    isMutual: !!isMutual,
                }
            })
        )

        return friendList
    } catch (error) {
        console.error("Error fetching friends list:", error)
        throw new Error("Failed to fetch friends list")
    }
}

export async function createMessage(content: string, senderId: string, receiverId: string) {
    try {
        const id = `${senderId}_${receiverId}_${Date.now()}`
        const message = await prisma.message.create({
            data: {
                id: id,
                content,
                senderId,
                receiverId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        })

        return { success: true, message }
    } catch (error) {
        console.error("Failed to create message", error)
        return { success: false, error: "Failed to create message" }
    }
}

export async function getConversation(userId: string, friendId: string) {
    try {
        const conversation = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        senderId: userId,
                        receiverId: friendId,
                    },
                    {
                        senderId: friendId,
                        receiverId: userId,
                    }
                ]
            },
            select: {
                content: true,
                createdAt: true,
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        })

        return conversation
    } catch (error) {
        console.error("Error fetching conversation:", error)
        throw new Error("Failed to fetch conversation")
    }
}