import { useTranslation } from "react-i18next";
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
  const {
    t
  } = useTranslation();

  return (
    <div className="p-4 md:p-8 bg-muted/50 min-h-screen text-foreground">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserCog className="h-6 w-6 text-primary" />{t("user_management", "User Management")}</h1>
            <p className="text-muted-foreground mt-1">{t(
              "manage_roles_mine_assignments_",
              "Manage roles, mine assignments, and permissions."
            )}</p>
          </div>
          <Button className="bg-primary"><Plus className="h-4 w-4 mr-2" />{t("add_user", "Add User")}</Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{t("all_users", "All Users")}</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input placeholder="Search users..." className="pl-9 h-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                  <tr>
                    <th className="px-6 py-4 font-semibold">{t("name", "Name")}</th>
                    <th className="px-6 py-4 font-semibold">{t("role", "Role")}</th>
                    <th className="px-6 py-4 font-semibold">{t("assignment", "Assignment")}</th>
                    <th className="px-6 py-4 font-semibold">{t("status", "Status")}</th>
                    <th className="px-6 py-4 font-semibold text-right">{t("actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_USERS.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{user.mine}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={user.status === 'Active' ? 'bg-[#0ecb81]/10 text-comet-up border-[#0ecb81]/30' : 'bg-muted text-muted-foreground border-border'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 hover:text-foreground">
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
  );
}
