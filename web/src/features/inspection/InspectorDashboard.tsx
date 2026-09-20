import React from 'react';
import { useTranslation } from "react-i18next";
import { ComplianceCalendar } from '@/features/compliance/components/ComplianceCalendar';
import { useAuthStore } from '@/stores/auth-store';
import { Calendar, UserCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function InspectorDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.auth.user);
  
  // Use primary assigned mine, or fallback for demo
  const mineId = user?.mineIds?.[0] || '00000000-0000-0000-0000-000000000004';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background max-w-[1600px] mx-auto w-full space-y-6">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-primary" />
            {t("welcome_inspector", "Welcome, Inspector")} {user?.firstName || 'Sunil Patil'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("your_assigned_inspections", "Your assigned inspections and compliance tasks for")} <span className="font-medium text-foreground">Mine {mineId.split('-')[0]}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 text-sm font-medium">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Calendar Section */}
        <Card className="border-border shadow-sm flex flex-col h-[700px] overflow-hidden bg-card/50">
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            {/* We reuse the ComplianceCalendar but it normally shows all tasks for the mine. 
                In a real app, we'd filter by assigneeId === user.id. 
                For the demo, it shows the calendar. */}
            <ComplianceCalendar mineId={mineId} />
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
