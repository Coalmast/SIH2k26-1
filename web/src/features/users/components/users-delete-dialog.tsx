'use client';
import { useTranslation } from "react-i18next";

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const {
    t
  } = useTranslation();

  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value.trim() !== currentRow.full_name) return

    onOpenChange(false)
    showSubmittedData(currentRow, 'The following user has been deleted:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='users-delete-form'
      disabled={value.trim() !== currentRow.full_name}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}{t("delete_user", "Delete User")}</span>
      }
      desc={
        <form
          id='users-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>{t("are_you_sure_you_want_to_delet", "Are you sure you want to delete")}{' '}
            <span className='font-bold'>{currentRow.full_name}</span>{t("text", "?")}<br />{t(
            "this_action_will_permanently_r",
            "This action will permanently remove the user with the role of"
          )}{' '}
            <span className='font-bold'>
              {(currentRow.roles?.[0] || 'Unknown').toUpperCase()}
            </span>{' '}{t(
            "from_the_system_this_cannot_be",
            "from the system. This cannot be undone."
          )}</p>

          <Label className='my-2'>{t("username", "Username:")}<Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter username to confirm deletion.'
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t("warning", "Warning!")}</AlertTitle>
            <AlertDescription>{t(
              "please_be_careful_this_operati",
              "Please be careful, this operation can not be rolled back."
            )}</AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Delete'
      destructive
    />
  );
}
