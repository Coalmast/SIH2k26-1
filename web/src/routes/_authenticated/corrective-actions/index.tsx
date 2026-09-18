import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/corrective-actions/')({
  component: CAPAIndexPage,
})

const MOCK_CAPAS = [
  { id: "CAPA-2026-081", title: "Ventilation non-compliance at Return Airway Level 3", status: "in_progress", date: "2026-09-15" },
  { id: "CAPA-2026-080", title: "PM10 Limit Exceeded - Pit 2", status: "closed", date: "2026-09-10" },
  { id: "CAPA-2026-079", title: "Defective Dust Masks Provided", status: "in_progress", date: "2026-09-08" },
]

function CAPAIndexPage() {
  const { t } = useTranslation();

  return (
    <Main className='flex flex-1 flex-col p-6 bg-muted/30 min-h-screen'>
      <div className="max-w-5xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("violations_capas", "Violations & CAPAs")}</h1>
            <p className="text-muted-foreground">{t("manage_corrective_actions", "Manage all corrective and preventive actions.")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-64" />
            <Button>{t("new_capa", "New CAPA")}</Button>
          </div>
        </div>

        <div className="grid gap-4">
          {MOCK_CAPAS.map(capa => (
            <Card key={capa.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link to={`/corrective-actions/${capa.id}`} className="block">
                <CardHeader className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{capa.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{capa.id} • {capa.date}</p>
                    </div>
                    <Badge variant={capa.status === 'closed' ? 'default' : 'secondary'} className={capa.status === 'closed' ? 'bg-comet-up' : ''}>
                      {capa.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </Main>
  )
}
