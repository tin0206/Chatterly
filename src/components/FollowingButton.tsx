"use client"

import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { getFollowing, getProfileByUsername } from '@/actions/profile.action'
import { UnfollowAlertDialog } from './UnfollowAlertDialog'

type User = Awaited<ReturnType<typeof getProfileByUsername>>

function FollowingButton({ user, item,handleFollowing, isUpdatingFollow} : {
    user: NonNullable<User>,
    item: any,
    handleFollowing: (followingId: string) => Promise<void>,
    isUpdatingFollow: boolean
}) {

    const [isUpdatingFollowState, setIsUpdatingFollowState] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [followingList, setFollowingList] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getFollowing(user?.id).then((list) => {
            setFollowingList(list)
            setIsLoading(false)
        })
        .catch((error) => {
            console.error('Error fetching following list:', error)
            setIsLoading(false)
        })
    }, [isUpdatingFollowState, user?.id])

    const checkFollowingOrNot = (followingId : any) => {
        return followingList.some((following: any) => 
            following.following.id === followingId
        )
    }

    const changeState = async () => {
        setIsUpdatingFollowState(prev => !prev)
        handleFollowing(item?.following.id)
        setShowConfirmation(false)
    }

    return (
        <div className="flex flex-col">
            <Button
                className=
                {
                    `w-[132px] h-[32px] rounded-lg cursor-pointer mb-1.5
                        ${
                            isLoading ? "bg-gray-100 hover:bg-gray-300 text-black" : 
                            `${
                                checkFollowingOrNot(item?.following.id) ? "bg-gray-100 hover:bg-gray-300 text-black" : "bg-blue-400 hover:bg-blue-600 text-white"
                            }
                        `}
                    `
                }
                disabled={isUpdatingFollow}
                onClick={() => {
                    if (checkFollowingOrNot(item?.following.id)) {
                        setShowConfirmation(prev => !prev)
                    }
                    else {
                        changeState()
                    }
                }}
            >
                {isLoading ? "Loading..." : (checkFollowingOrNot(item?.following.id) ? "Following" : "Follow")}
            </Button>
            {showConfirmation && (
                <UnfollowAlertDialog
                    onUnfollow={changeState}
                    isUnfollowing={isUpdatingFollowState}
                />
            )}
        </div>
    )
}

export default FollowingButton
