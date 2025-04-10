"use client"

import { getFollowers, getFollowing, getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.action"
import { changeFollowingState, deleteFollower, toggleFollow } from "@/actions/user.action"
import CreatePost from "@/components/CreatePost"
import FollowingButton from "@/components/FollowingButton"
import FollowSkeleton from "@/components/FollowSkeleton"
import PostCard from "@/components/PostCard"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { SignInButton, useUser } from "@clerk/nextjs"
import { DialogClose } from "@radix-ui/react-dialog"
import { TabsTrigger } from "@radix-ui/react-tabs"
import { format } from "date-fns"
import { CalendarIcon, EditIcon, FileTextIcon, HeartIcon, LinkIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

type User = Awaited<ReturnType<typeof getProfileByUsername>>
type Posts = Awaited<ReturnType<typeof getUserPosts>>

interface ProfilePageClientProps {
    user: NonNullable<User>
    posts: Posts
    likedPosts: Posts
    isFollowing: boolean
}

function ProfilePageClient({user, posts, likedPosts, isFollowing: initialFollowing} : ProfilePageClientProps) {
    const { user: currentUser } = useUser()
    const [followers, setFollowers] = useState<any>([])
    const [following, setFollowing] = useState<any>([])
    const [isLoadingFollowers, setIsLoadingFollowers] = useState(true)
    const [isLoadingFollowing, setIsLoadingFollowing] = useState(true)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showFollowersDialog, setShowFollowersDialog] = useState(false)
    const [showFollowingDialog, setShowFollowingDialog] = useState(false)
    const [isFollowing, setIsFollowing] = useState(initialFollowing)
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false)
    const [followersSearchInput, setFollowersSearchInput] = useState("")
    const [followingSearchInput, setFollowingSearchInput] = useState("")
    const [editForm, setEditForm] = useState({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
    })

    const handleEditSubmit = async () => {
        const formData = new FormData()
        Object.entries(editForm).forEach(([key, value]) => {
            formData.append(key, value)
        })

        const result = await updateProfile(formData)
        if (result.success) {
            setShowEditDialog(false)
            toast.success("Profile updated successfully")
        }
    }

    const handleFollow = async () => {
        if (!currentUser) return
        try {
            setIsUpdatingFollow(true)
            await toggleFollow(user.id)
            setIsFollowing(!isFollowing)
        } catch (error) {
            toast.error("Failed to update follow status")
        } finally {
            setIsUpdatingFollow(false)
        }
    }

    const fetchFollowers = async () => {
        const followersList = await getFollowers(user.id)
        const temp : any = []
        const searchInput = followersSearchInput.toLowerCase()
        if (searchInput != "") {
            followersList.forEach(follower => {
                const username = (follower.follower.username ?? follower.follower.name).toLowerCase()
                if (username.includes(searchInput)) {
                    temp.push(follower)
                }
            })
        }
        else {
            followersList.forEach(follower => {
                temp.push(follower)
            })
        }
        setFollowers(temp)
    }

    const fetchFollowing = async (followingList: any) => {
        const temp : any = []
        const searchInput = followingSearchInput.toLowerCase()
        if (searchInput != "") {
            followingList.forEach((following: any) => {
                const username = (following.following.username ?? following.following.name).toLowerCase()
                if (username.includes(searchInput)) {
                    temp.push(following)
                }
            })
        }
        else {
            followingList.forEach((following: any) => {
                temp.push(following)
            })
        }
        setFollowing(temp)
    }

    const showFollowersList = async () => {
        setShowFollowersDialog(true)
        loadFollowers()
    }

    const showFollowingList = async () => {
        setShowFollowingDialog(true)
        loadFollowing()
    }

    const loadFollowers = async () => {
        setIsLoadingFollowers(true)
        try {
            await fetchFollowers()
        } catch (error) {
            console.error("Failed to fetch followers", error)
        } finally {
            setIsLoadingFollowers(false)
        }
    }

    const loadFollowing = async () => {
        setIsLoadingFollowing(true)
        const followingList = await getFollowing(user.id)
        try {
            await fetchFollowing(followingList)
        } catch (error) {
            console.error("Failed to fetch following", error)
        } finally {
            setIsLoadingFollowing(false)
        }
    }

    const handleDeleteFollower = async (followerId : any) => {
        try {
            setIsUpdatingFollow(true)
            await deleteFollower(followerId)
            toast.success("Follower deleted successfully")
            loadFollowers()
        } catch (error) {
            toast.error("Failed to update follow status")
        } finally {
            setIsUpdatingFollow(false)
        }
    }

    const handleFollowing = async (followingId : any) => {
        try {
            setIsUpdatingFollow(true)
            await changeFollowingState(followingId)
        } catch (error) {
            toast.error("Failed to update follow status")
        } finally {
            setIsUpdatingFollow(false)
        }
    }

    useEffect(() => {
        loadFollowers()
    }, [followersSearchInput])

    useEffect(() => {
        loadFollowing()
    }, [followingSearchInput])

    const isOwnProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username

    const formattedDate = format(new Date(user.createdAt), "MMMM dd, yyyy")
  
    return (
        <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 gap-6">
                <div className="w-full max-w-lg mx-auto mb-3">
                    <Card className="bg-card">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={user.image ?? "/avatar.png"} />
                                </Avatar>
                                <h1 className="mt-4 text-2xl font-bold">{user.name ?? user.username}</h1>
                                <p className="text-muted-foreground">@{user.username}</p>
                                <p className="mt-2 text-sm">{user.bio}</p>

                                {/* PROFILE STATS */}
                                <div className="w-full mt-6">
                                    <div className="flex justify-between mb-4">
                                        <div className=" w-2/3">
                                            <div className="font-semibold">{user._count.posts.toLocaleString()}</div>
                                            <div className="text-base text-muted-foreground">Posts</div>
                                        </div>
                                        <Separator orientation="vertical" />
                                        <div className="cursor-pointer w-2/3" onClick={() => showFollowersList()}>
                                            <div className="font-semibold">{user._count.followers.toLocaleString()}</div>
                                            <div className="text-base text-muted-foreground">Followers</div>
                                        </div>
                                        <Separator orientation="vertical" />
                                        <div className="cursor-pointer w-2/3" onClick={() => showFollowingList()}>
                                            <div className="font-semibold">{user._count.following.toLocaleString()}</div>
                                            <div className="text-base text-muted-foreground">Following</div>
                                        </div>
                                    </div>
                                </div>

                                {/* "FOLLOW & EDIT PROFILE" BUTTONS */}
                                {!currentUser ? (
                                    <SignInButton mode="modal">
                                        <Button className="w-full mt-4">Follow</Button>
                                    </SignInButton>
                                ) : isOwnProfile ? (
                                    <Button className="w-full mt-4 cursor-pointer" onClick={() => setShowEditDialog(true)}>
                                        <EditIcon className="size-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full mt-4"
                                        onClick={handleFollow}
                                        disabled={isUpdatingFollow}
                                        variant={isFollowing ? "outline" : "default"}
                                    >
                                        { isFollowing ? "Unfollow" : "Follow" }
                                    </Button>
                                )}

                                {/* LOCATION & WEBSITE */}
                                <div className="w-full mt-6 space-y-2 text-sm">
                                    {user.location && (
                                        <div className="flex items-center text-muted-foreground">
                                            <MapPinIcon className="size-4 mr-2" />
                                            { user.location }
                                        </div>
                                    )}
                                    {user.website && (
                                        <div className="flex items-center text-muted-foreground">
                                            <LinkIcon className="size-4 mr-2" />
                                            <a 
                                                href={
                                                    user.website.startsWith("http") ? user.website : `https://${user.website}`
                                                }
                                                className="hover:underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                { user.website }
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center text-muted-foreground">
                                        <CalendarIcon className="size-4 mr-2" />
                                        Joined { formattedDate }
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <CreatePost />

                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger
                            value="posts"
                            className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                            data-[state=active]:bg-transparent px-6 font-semibold cursor-pointer"
                        >
                            <FileTextIcon className="size-4" />
                            Posts
                        </TabsTrigger>
                        {isOwnProfile && (
                            <TabsTrigger
                                value="likes"
                                className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
                                data-[state=active]:bg-transparent px-6 font-semibold  cursor-pointer"
                            >
                                <HeartIcon className="size-4" />
                                Likes
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="posts" className="mt-6">
                        <div className="space-y-6">
                            {posts.length > 0 ? (
                                posts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="likes" className="mt-6">
                        <div className="space-y-6">
                            {likedPosts.length > 0 ? (
                                likedPosts.map((post) => <PostCard key={post.id} post={post} dbUserId={user.id} />)
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <Dialog 
                    open={showEditDialog} 
                    onOpenChange={() => {
                        setShowEditDialog(false)
                        setEditForm({
                            name: user.name || "",
                            bio: user.bio || "",
                            location: user.location || "",
                            website: user.website || "",
                        })
                    }}
                >
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>                            
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    name="name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bio</Label>
                                <Textarea
                                    name="bio"
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    placeholder="Tell us about yourself"
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    name="location"
                                    value={editForm.location}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    placeholder="Where are you based?"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input
                                    name="website"
                                    value={editForm.website}
                                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                    placeholder="Your personal website"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <DialogClose asChild>
                                <Button className="cursor-pointer" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button className="cursor-pointer" onClick={handleEditSubmit}>Save Changes</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog 
                    open={showFollowersDialog} 
                    onOpenChange={() => {
                        setShowFollowersDialog(false)
                        setFollowersSearchInput("")
                    }}
                >
                    <DialogContent className="size-[440px] flex flex-col overflow-hidden">
                        <DialogHeader className="border-b h-8 px-4">
                            <DialogTitle className="text-center">Follower</DialogTitle>                            
                        </DialogHeader>
                        <div className="pt-2 pb-2 sticky top-0 bg-background">
                            <Input placeholder="Search followers" onChange={(e) =>
                                setFollowersSearchInput(e.target.value)
                            } />
                        </div>
                        <div className="flex-1 overflow-y-auto pb-4">
                            {isLoadingFollowers ? (
                                <FollowSkeleton />
                            ) : (
                                followers.map((follower: any, index: number) => (
                                    <div key={index} className="justify-between flex">
                                        <div className="flex items-center space-x-4 w-[353px] h-[50px]">
                                            <Link 
                                                href={`/profile/${follower?.follower.username ?? follower?.follower.email.split("@")[0]}`}
                                                target="_blank"
                                                className="cursor-pointer"
                                            >
                                                <img
                                                    src={follower?.follower.image ?? "/avatar.png"}
                                                    alt="avatar"
                                                    className="h-10 w-10 rounded-full hover:opacity-80"
                                                />
                                            </Link>
                                            <div className="h-9 justify-center items-center">
                                                <Link
                                                    href={`/profile/${follower?.follower.username ?? follower?.follower.email.split("@")[0]}`}
                                                    target="_blank"
                                                    className="cursor-pointer"
                                                >
                                                    <div className="font-semibold h-[18px] flex flex-col hover:underline">
                                                        <span className="text-sm">{follower?.follower.username}</span>
                                                    </div>
                                                </Link>
                                                <div className="text-muted-foreground h-[18px] flex flex-col">
                                                    <span className="text-sm">{follower?.follower.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            isOwnProfile ? (
                                                <div className="flex items-center">
                                                    <Button 
                                                        className="w-[70px] h-[32px] rounded-lg cursor-pointer bg-gray-100 text-black hover:bg-gray-300"
                                                        disabled={isUpdatingFollow}
                                                        onClick={() => handleDeleteFollower(follower?.follower.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            ) : (
                                                <></>
                                            )
                                        }
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog 
                    open={showFollowingDialog} 
                    onOpenChange={() => {
                        setShowFollowingDialog(false)
                        setFollowingSearchInput("")
                    }}
                >
                    <DialogContent className="size-[440px] flex flex-col overflow-hidden">
                        <DialogHeader className="border-b h-8">
                            <DialogTitle className="text-center">Following</DialogTitle>                            
                        </DialogHeader>
                        <div className="pt-2 pb-2 sticky top-0 bg-background">
                            <Input placeholder="Search following" onChange={(e) =>
                                setFollowingSearchInput(e.target.value)
                            } />
                        </div>
                        <div className="flex-1 overflow-y-auto pb-4">
                            {isLoadingFollowing ? (
                                <FollowSkeleton />
                            ) : (
                                following.map((item: any, index: number) => (
                                    <div key={index} className="justify-between flex">
                                        <div className="flex items-center space-x-4 w-[353px] h-[50px]">
                                            <Link
                                                href={`/profile/${item?.following.username ?? item?.following.email.split("@")[0]}`}
                                                target="_blank"
                                                className="cursor-pointer"
                                            >
                                                <img
                                                    src={item?.following.image ?? "/avatar.png"}
                                                    alt="avatar"
                                                    className="h-10 w-10 rounded-full hover:opacity-80"
                                                />
                                            </Link>
                                            <div className="h-9 justify-center items-center">
                                                <Link
                                                    href={`/profile/${item?.following.username ?? item?.following.email.split("@")[0]}`}
                                                    target="_blank"
                                                    className="cursor-pointer"
                                                >
                                                    <div className="font-semibold h-[18px] flex flex-col hover:underline">
                                                        <span className="text-sm">{item?.following.username}</span>
                                                    </div>
                                                </Link>
                                                <div className="text-muted-foreground h-[18px] flex flex-col">
                                                    <span className="text-sm">{item?.following.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            isOwnProfile ? (
                                                <div className="flex items-center">
                                                    <FollowingButton 
                                                        user={user} 
                                                        item={item}
                                                        isUpdatingFollow={isUpdatingFollow} 
                                                        handleFollowing={handleFollowing}
                                                    />
                                                </div>
                                            ) : (
                                                <></>
                                            )
                                        }
                                    </div>
                                )
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default ProfilePageClient