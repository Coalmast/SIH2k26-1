import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
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
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data: users, isLoading } = useUsers(search)

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <UsersTable data={users || []} search={search} navigate={navigate} />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
