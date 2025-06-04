"use client"

import { useState } from "react"
import { Edit, Shield, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface UserActionsAdminProps {
  userId: string
  userName: string
  onEdit?: (userId: string) => void
  onResetPassword?: (userId: string) => void
  onDelete?: (userId: string) => void
}

export function UserActionsAdmin({
  userId,
  userName,
  onEdit,
  onResetPassword,
  onDelete,
}: UserActionsAdminProps) {
  const { toast } = useToast()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleEdit = () => {
    onEdit?.(userId)
    toast({
      title: "Edit User",
      description: `Edit user: ${userName}`,
    })
  }

  const handleResetPassword = () => {
    onResetPassword?.(userId)
    toast({
      title: "Password reset email sent",
      description: `A password reset email has been sent to ${userName}.`,
    })
  }

  const handleDelete = () => {
    onDelete?.(userId)
    setDeleteOpen(false)
    toast({
      title: "User deleted",
      description: `User ${userName} has been deleted.`,
      variant: "destructive",
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Actions</span>
            <Trash className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleResetPassword}>
            <Shield className="mr-2 h-4 w-4" />
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete <span className="font-semibold">{userName}</span>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
