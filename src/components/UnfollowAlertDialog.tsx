"use client"

import { Loader2Icon } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Button } from "./ui/button"

interface UnfollowAlertDialogProps {
    isUnfollowing: boolean
    onUnfollow: () => Promise<void>
    title?: string
    description?: string
}

export function UnfollowAlertDialog({
    isUnfollowing,
    onUnfollow,
    title = "Unfollow",
    description = "This action cannot be undone.",
}: UnfollowAlertDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-500 cursor-pointer"
                >
                    {isUnfollowing ? (
                        <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                        <div>
                            Unfollow
                        </div>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{ title }</AlertDialogTitle>
                    <AlertDialogDescription>{ description }</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onUnfollow}
                        className="bg-red-500 hover:bg-red-600 cursor-pointer"
                        disabled={isUnfollowing}
                    >
                        {isUnfollowing ? "Unfollowing..." : "Unfollow"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}