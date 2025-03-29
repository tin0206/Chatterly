"use server"

import prisma from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function syncUser() {
    try {
        const { userId } = await auth()
        const user = await currentUser()

        if (!userId || !user) return

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })

        if (existingUser) return existingUser

        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name:`${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
            }
        })
        return dbUser
    } catch (error) {
        console.log("Error syncing user:", error)
    }
}

export async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({
        where: {
            clerkId,
        },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                }
            }
        }
    })
}

export async function getDbUserId() {
    const { userId:clerkId } = await auth()
    if (!clerkId) return null
    
    const user = await getUserByClerkId(clerkId)

    if(!user) throw new Error("User not found")
    return user.id
}

export async function getRandomUsers() {
    try {
        const userId = await getDbUserId()
        if (!userId) return []

        // get 3 random users excluding the current user and users the current user is following
        const randomUsers = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        NOT: {id: userId},
                    },
                    {
                        NOT: {
                            followers: {
                                some: {
                                    followerId: userId
                                }
                            }
                        }
                    },
                ]
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        followers: true,
                    }
                }
            },
            take: 3,
        })
        return randomUsers
    } catch (error) {
        console.log("Error fetching random users:", error)
        return []
    }
}

export async function toggleFollow(targetUserId: string) {
    try {
        const userId = await getDbUserId()
        if (!userId) return
        if (userId === targetUserId) throw new Error("You can't follow yourself")
        const followId = `${userId}_${targetUserId}`
        const existingFollow = await prisma.follows.findUnique({
            where: {
                id: followId
            }
        })
        if (existingFollow) {
            await prisma.follows.delete({
                where: {
                    id: followId
                }
            })
        } else {
            await prisma.$transaction([
                prisma.follows.create({
                    data: {
                        id: followId,
                        followerId: userId,
                        followingId: targetUserId
                    }
                }),

                prisma.notification.create({
                    data: {
                        type: "FOLLOW",
                        userId: targetUserId,
                        creatorId: userId,
                    }
                })

            ])
        }

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.log("Error toggling follow:", error)
        return { success: false, error: "Error toggling follow" }
    }
}

export async function deleteFollower(targetUserId: string) {
    try {
        const userId = await getDbUserId()
        if (!userId) return
        if (userId === targetUserId) throw new Error("You can't delete yourself")
        const followId = `${targetUserId}_${userId}`
        const existingFollow = await prisma.follows.findUnique({
            where: {
                id: followId
            }
        })
        if (existingFollow) {
            await prisma.follows.delete({
                where: {
                    id: followId
                }
            })
        }

        return { success: true }
    } catch (error) {
        console.log("Error deleting follower:", error)
        return { success: false, error: "Error deleting follower" }
    }
}

export async function changeFollowingState(targetUserId: string) {
    try {
        const userId = await getDbUserId()
        if (!userId) return

        const followId = `${userId}_${targetUserId}`
        const existingFollow = await prisma.follows.findUnique({
            where: {
                id: followId
            }
        })
        if (existingFollow) {
            await prisma.follows.delete({
                where: {
                    id: followId
                }
            })
        } else {
            await prisma.$transaction([
                prisma.follows.create({
                    data: {
                        id: followId,
                        followerId: userId,
                        followingId: targetUserId
                    }
                }),

                prisma.notification.create({
                    data: {
                        type: "FOLLOW",
                        userId: targetUserId,
                        creatorId: userId,
                    }
                })
            ])
        }

        return { success: true }
    } catch (error) {
        console.log("Error changing following state:", error)
        return { success: false, error: "Error changing following state" }
    }
}