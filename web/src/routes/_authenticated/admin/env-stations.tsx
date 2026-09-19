import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioTower, Plus, Activity, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/admin/env-stations')({
  component: AdminEnvStationsPage,
})

const MOCK_STATIONS = [
  { id: 'ENV-101', name: 'Pit 3 East (Upwind)', type: 'Air Quality (AQI)', status: 'Online', lastPing: '2 mins ago', reading: 'PM10: 85 µg/m³' },
  { id: 'ENV-102', name: 'Pit 3 West (Downwind)', type: 'Air Quality (AQI)', status: 'Online', lastPing: '1 min ago', reading: 'PM10: 142 µg/m³' },
  { id: 'ENV-204', name: 'Haul Road B', type: 'Dust & Noise', status: 'Offline', lastPing: '4 hours ago', reading: '--' },
  { id: 'ENV-301', name: 'Tailings Dam Alpha', type: 'Water Quality', status: 'Online', lastPing: '15 mins ago', reading: 'pH: 7.2' },
]

function AdminEnvStationsPage() {
  const {
    t
  } = useTranslation();

  return (
    <div className="p-4 md:p-8 bg-muted/50 min-h-screen text-foreground">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <RadioTower className="h-6 w-6 text-primary" />{t("environmental_iot_stations", "Environmental IoT Stations")}</h1>
            <p className="text-muted-foreground mt-1">{t(
              "manage_environmental_monitorin",
              "Manage environmental monitoring devices and calibration records."
            )}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" />{t("sync_devices", "Sync Devices")}</Button>
            <Button className="bg-primary"><Plus className="h-4 w-4 mr-2" />{t("add_station", "Add Station")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{t("total_stations", "Total Stations")}</p>
                <p className="text-3xl font-black text-foreground">{t("24", "24")}</p>
              </div>
              <RadioTower className="h-8 w-8 text-muted-foreground/50" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{t("online", "Online")}</p>
                <p className="text-3xl font-black text-comet-up">{t("22", "22")}</p>
              </div>
              <Activity className="h-8 w-8 text-emerald-200" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{t("offline_error", "Offline/Error")}</p>
                <p className="text-3xl font-black text-comet-down">{t("2", "2")}</p>
              </div>
              <RadioTower className="h-8 w-8 text-red-200" />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg">{t("station_directory", "Station Directory")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                  <tr>
                    <th className="px-6 py-4 font-semibold">{t("station_id_name", "Station ID / Name")}</th>
                    <th className="px-6 py-4 font-semibold">{t("type", "Type")}</th>
                    <th className="px-6 py-4 font-semibold">{t("status", "Status")}</th>
                    <th className="px-6 py-4 font-semibold">{t("last_ping", "Last Ping")}</th>
                    <th className="px-6 py-4 font-semibold">{t("latest_reading", "Latest Reading")}</th>
                    <th className="px-6 py-4 font-semibold text-right">{t("actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_STATIONS.map((station) => (
                    <tr key={station.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{station.name}</div>
                        <div className="text-xs text-muted-foreground">{station.id}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground/80">{station.type}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={station.status === 'Online' ? 'bg-[#0ecb81]/10 text-comet-up border-[#0ecb81]/30' : 'bg-[#f6465d]/10 text-comet-down border-[#f6465d]/30 animate-pulse'}>
                          <div className={`h-1.5 w-1.5 rounded-full mr-2 ${station.status === 'Online' ? 'bg-comet-up' : 'bg-comet-down'}`}></div>
                          {station.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{station.lastPing}</td>
                      <td className="px-6 py-4 font-medium text-foreground">{station.reading}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-medium">{t("configure", "Configure")}</Button>
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
