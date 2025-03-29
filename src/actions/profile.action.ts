"use server"

import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getDbUserId } from "./user.action"

export async function getProfileByUsername(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                bio: true,
                image: true,
                location: true,
                website: true,
                createdAt: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                }
            }
        })

        return user
    } catch (error) {
        console.error("Error fetching profile:", error)
        throw new Error("Failed to fetch profile")
    }
}

export async function getUserPosts(userId: string) {
    try {
        const posts = await prisma.post.findMany({
            where: {
                authorId: userId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return posts
    } catch (error) {
        console.error("Error fetching user posts:", error)
        throw new Error("Failed to fetch user posts")
    }
}

export async function getUserLikedPosts(userId: string) {
    try {
        const likedPosts = await prisma.post.findMany({
            where: {
                likes: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return likedPosts
    } catch (error) {
        console.error("Error fetching liked posts:", error)
        throw new Error("Failed to fetch liked posts")
    }
}

export async function updateProfile(formData: FormData) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) throw new Error("Unauthorized")
        
        const name = formData.get("name") as string
        const bio = formData.get("bio") as string
        const location = formData.get("location") as string
        const website = formData.get("website") as string

        const user = await prisma.user.update({
            where: {
                clerkId
            },
            data: {
                name,
                bio,
                location,
                website
            }
        })

        revalidatePath("/profile")
        return { success: true, user }
    } catch (error) {
        console.error("Error updating profile:", error)
        return { success: false, error: "Failed to update profile" }
    }
}

export async function isFollowing(userId: string) {
    try {
        const currentUserId = await getDbUserId()
        if (!currentUserId) return false

        const two_follow = `${currentUserId}_${userId}`

        const follow = await prisma.follows.findUnique({
            where: {
                id: two_follow
            }
        })

        return !!follow
    } catch (error) {
        console.error("Error checking follow status:", error)
        return false
    }
}

export async function getFollowers(userId: string) {
    try {
        const followers = await prisma.follows.findMany({
            where: {
                followingId: userId
            },
            select: {
                follower: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        bio: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return followers
    } catch (error) {
        console.error("Error fetching followers:", error)
        throw new Error("Failed to fetch followers")
    }
}

export async function getFollowing(userId: string) {
    try {
        const following = await prisma.follows.findMany({
            where: {
                followerId: userId
            },
            select: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        bio: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return following
    } catch (error) {
        console.error("Error fetching following:", error)
        throw new Error("Failed to fetch following")
    }
}