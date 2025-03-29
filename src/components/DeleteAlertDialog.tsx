"use client"

import { Loader2Icon, Trash2Icon } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { Button } from "./ui/button"

interface DeleteAlertDialogProps {
    isDeleting: boolean
    onDelete: () => Promise<void>
    title?: string
    description?: string
}

export function DeleteAlertDialog({
    isDeleting,
    onDelete,
    title = "Delete Post",
    description = "This action cannot be undone.",
}: DeleteAlertDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-500 -mr-2 cursor-pointer"
                >
                    {isDeleting ? (
                        <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                        <Trash2Icon className="size-4" />
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
                        onClick={onDelete}
                        className="bg-red-500 hover:bg-red-600 cursor-pointer"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}