import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, BookOpen, Edit2, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/admin/regulations')({
  component: AdminRegulationsPage,
})

const MOCK_REGS = [
  { id: '1', act: 'Mines Act, 1952', section: 'Section 22', title: 'Power to prohibit employment', penalty: 'Up to ₹5,00,000' },
  { id: '2', act: 'CMR, 2017', section: 'Reg 104', title: 'Precautions against dust', penalty: 'Suspension of operations' },
  { id: '3', act: 'CMR, 2017', section: 'Reg 116', title: 'Fencing and gates', penalty: 'Fine + CAPA' },
  { id: '4', act: 'Environment (Protection) Act', section: 'Sec 7', title: 'Discharge of environmental pollutants', penalty: 'Imprisonment up to 5 yrs' },
]

function AdminRegulationsPage() {
  const {
    t
  } = useTranslation();

  return (
    <div className="p-4 md:p-8 bg-muted/50 min-h-screen text-foreground">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />{t("regulation_library", "Regulation Library")}</h1>
            <p className="text-muted-foreground mt-1">{t(
              "manage_acts_statutes_and_assoc",
              "Manage acts, statutes, and associated violation penalties."
            )}</p>
          </div>
          <Button className="bg-primary"><Plus className="h-4 w-4 mr-2" />{t("add_regulation", "Add Regulation")}</Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{t("acts_regulations", "Acts & Regulations")}</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input placeholder="Search by act, section or title..." className="pl-9 h-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {MOCK_REGS.map((reg) => (
                <div key={reg.id} className="p-6 hover:bg-muted/30 transition-colors flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="bg-muted text-foreground/80">{reg.act}</Badge>
                      <span className="text-sm font-semibold text-foreground/80">{reg.section}</span>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">{reg.title}</h3>
                    <p className="text-sm text-amber-600 font-medium">{t("penalty", "Penalty:")}{reg.penalty}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8"><Edit2 className="h-3 w-3 mr-2" />{t("edit", "Edit")}</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-comet-down hover:text-comet-down hover:bg-[#f6465d]/10"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
