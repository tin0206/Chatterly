import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/actions/profile.action"
import { notFound } from "next/navigation"
import ProfilePageClient from "./ProfilePageClient"

type ProfilePageProps = {
    params: Promise<{ username: string }>
}

async function ProfilePageServer({ params } : ProfilePageProps) {

    const { username } = await params
    const user = await getProfileByUsername(username)

    if (!user) notFound()

    const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
        getUserPosts(user.id),
        getUserLikedPosts(user.id),
        isFollowing(user.id),
    ])

    return (
        <ProfilePageClient
            user={user}
            posts={posts}
            likedPosts={likedPosts}
            isFollowing={isCurrentUserFollowing}
        />
    )
}

export default ProfilePageServer
