import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, UserCog, MoreVertical } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: AdminUsersPage,
})

const MOCK_USERS = [
  { id: '1', name: 'Rajesh Kumar', role: 'Mine Manager', mine: 'Pit 3 East', status: 'Active' },
  { id: '2', name: 'Sneha Patel', role: 'Safety Officer', mine: 'Pit 3 East', status: 'Active' },
  { id: '3', name: 'Amit Singh', role: 'Field Inspector', mine: 'All', status: 'Inactive' },
  { id: '4', name: 'Dr. A. Verma', role: 'DGMS Regulator', mine: 'National', status: 'Active' },
  { id: '5', name: 'K. L. Sharma', role: 'Contractor Admin', mine: 'Balaji Mining', status: 'Active' },
]

function AdminUsersPage() {
  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserCog className="h-6 w-6 text-primary" />
              User Management
            </h1>
            <p className="text-slate-500 mt-1">Manage roles, mine assignments, and permissions.</p>
          </div>
          <Button className="bg-primary"><Plus className="h-4 w-4 mr-2" /> Add User</Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">All Users</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search users..." className="pl-9 h-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Assignment</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_USERS.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.mine}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
