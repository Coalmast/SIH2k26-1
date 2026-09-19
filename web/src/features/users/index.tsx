import { useTranslation } from "react-i18next";
import { getRouteApi } from '@tanstack/react-router'

import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { useUsers } from './hooks/useUsers'
import { Loader2 } from 'lucide-react'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const {
    t
  } = useTranslation();

  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data: users, isLoading } = useUsers(search)

  return (
    <UsersProvider>


      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t("user_list", "User List")}</h2>
            <p className='text-muted-foreground'>{t(
              "manage_your_users_and_their_ro",
              "Manage your users and their roles here."
            )}</p>
          </div>
          <div className="flex items-center gap-2">
            <Search className='me-auto' />
            <UsersPrimaryButtons />
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <UsersTable data={users || []} search={search} navigate={navigate} />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  );
}
