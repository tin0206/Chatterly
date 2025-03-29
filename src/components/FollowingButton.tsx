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
                    `w-[132] h-[32] rounded-lg cursor-pointer mb-1.5
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
            {/* {showConfirmation && (
                <div className='flex gap-3 mt-2'>
                    <div
                        className='w-[60] text-center pt-1 pb-1 border-[1] rounded-sm cursor-pointer bg-black text-white hover:bg-gray-500'
                        onClick={() => {
                            setShowConfirmation(false)
                            changeState()
                        }}
                    >
                        Yes
                    </div>
                    <div 
                        className='w-[60] text-center pt-1 pb-1 border-[1] rounded-sm cursor-pointer bg-black text-white hover:bg-gray-500'
                        onClick={() => {
                            setShowConfirmation(false)
                        }}
                    >
                        No
                    </div>
                </div>
            )} */}
        </div>
    )
}

export default FollowingButton
