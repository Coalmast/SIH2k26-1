import { useTranslation } from "react-i18next";
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { Wind, Activity, Droplets, AlertTriangle, Plus, MapPin, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const mockTrendData = [
  { time: '08:00', pm10: 85, pm25: 42, no2: 25 },
  { time: '10:00', pm10: 92, pm25: 45, no2: 28 },
  { time: '12:00', pm10: 105, pm25: 55, no2: 32 },
  { time: '14:00', pm10: 115, pm25: 60, no2: 35 },
  { time: '16:00', pm10: 98, pm25: 48, no2: 30 },
  { time: '18:00', pm10: 90, pm25: 45, no2: 27 },
  { time: '20:00', pm10: 82, pm25: 40, no2: 24 },
]

export function EnvironmentModule() {
  const {
    t
  } = useTranslation();

  const [selectedStation, setSelectedStation] = useState('all')

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/30 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Wind className="h-8 w-8 text-primary" />{t("environment_emissions", "Environment & Emissions")}</h1>
          <p className="text-muted-foreground mt-1">{t(
            "real_time_caaqms_telemetry_and",
            "Real-time CAAQMS telemetry and Environmental Clearance tracking."
          )}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><MapPin className="h-4 w-4 mr-2" />{t("view_sensor_map", "View Sensor Map")}</Button>
          <Button><Plus className="h-4 w-4 mr-2" />{t("manual_reading", "Manual Reading")}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex justify-between">{t("aqi_level", "AQI Level")}<Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">{t("moderate", "Moderate")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600">{t("112", "112")}</div>
            <div className="text-xs text-muted-foreground mt-1">{t("target_100", "Target < 100")}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex justify-between">{t("pm10_avg_24h", "PM10 Avg (24h)")}<Badge variant="outline" className="bg-[#f6465d]/15 text-comet-down hover:bg-[#f6465d]/15">{t("exceeding", "Exceeding")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-comet-down">{t("105_g_m", "105 µg/m³")}</div>
            <div className="text-xs text-muted-foreground mt-1">{t("limit_100_g_m", "Limit: 100 µg/m³")}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex justify-between">{t("noise_level", "Noise Level")}<Badge variant="outline" className="bg-[#0ecb81]/15 text-comet-up hover:bg-[#0ecb81]/15">{t("normal", "Normal")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-comet-up">{t("68_db_a", "68 dB(A)")}</div>
            <div className="text-xs text-muted-foreground mt-1">{t("limit_75_db_a_day", "Limit: 75 dB(A) (Day)")}</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border border-primary/30 shadow-sm text-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary flex items-center gap-2">
              <Activity className="h-4 w-4" />{t("ai_forecast", "AI Forecast")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{t(
              "pm10_expected_to_peak_at_125_g",
              "PM10 expected to peak at 125 µg/m³ between 14:00-16:00."
            )}</div>
            <div className="text-xs text-muted-foreground mt-2">{t(
              "recommendation_increase_water_",
              "Recommendation: Increase water sprinkling on Haul Road B."
            )}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle className="text-lg">{t("sensor_telemetry_trend", "Sensor Telemetry Trend")}</CardTitle>
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Station" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_stations_avg", "All Stations Avg")}</SelectItem>
              <SelectItem value="s1">{t("station_1_pit", "Station 1 (Pit)")}</SelectItem>
              <SelectItem value="s2">{t("station_2_crusher", "Station 2 (Crusher)")}</SelectItem>
              <SelectItem value="s3">{t("station_3_boundary", "Station 3 (Boundary)")}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <RechartsTooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Line type="monotone" dataKey="pm10" name="PM10 (µg/m³)" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="pm25" name="PM2.5 (µg/m³)" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="no2" name="NO₂ (µg/m³)" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg">{t("recent_threshold_breaches", "Recent Threshold Breaches")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="p-4 flex justify-between items-center bg-[#f6465d]/10/30">
                <div>
                  <div className="font-semibold text-sm">{t("pm10_exceedance", "PM10 Exceedance")}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t("station_2_crusher_today_14_22", "Station 2 (Crusher) • Today, 14:22")}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-comet-down">{t("118_g_m", "118 µg/m³")}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{t("limit_100", "Limit: 100")}</div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-sm">{t("noise_level", "Noise Level")}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t("station_1_pit_yesterday_22_15", "Station 1 (Pit) • Yesterday, 22:15")}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-comet-down">{t("76_db_a", "76 dB(A)")}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{t("limit_70_night", "Limit: 70 (Night)")}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg flex justify-between items-center">{t("ec_conditions_tracking", "EC Conditions Tracking")}<Button variant="link" size="sm" className="h-6 text-primary">{t("view_all", "View All")}</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="p-4 flex items-start gap-4">
                <Droplets className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">{t("zero_liquid_discharge_maintain", "Zero Liquid Discharge Maintained")}</div>
                  <div className="text-xs text-muted-foreground mt-1 mb-2">{t(
                    "ec_condition_ix_a_no_effluent_",
                    "EC Condition ix(a): No effluent shall be discharged outside the mine premises."
                  )}</div>
                  <Badge variant="outline" className="bg-[#0ecb81]/10 text-comet-up border-[#0ecb81]/30">{t("compliant", "Compliant")}</Badge>
                </div>
              </div>
              <div className="p-4 flex items-start gap-4">
                <Wind className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">{t("green_belt_development", "Green Belt Development")}</div>
                  <div className="text-xs text-muted-foreground mt-1 mb-2">{t(
                    "ec_condition_v_c_33_area_to_be",
                    "EC Condition v(c): 33% area to be covered by green belt."
                  )}</div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">{t("at_risk_28", "At Risk (28%)")}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
