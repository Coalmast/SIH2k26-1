import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, Eye, ShieldAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function InspectionCard({ inspection }: { inspection: any }) {
  const {
    t
  } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'scheduled': return 'bg-muted text-foreground border-border';
      default: return 'bg-muted text-foreground border-border';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg text-primary">{inspection.inspection_type.replace(/_/g, ' ').toUpperCase()}</CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{t("zone", "Zone")}{inspection.zone || 'General'}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(inspection.started_at || inspection.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{t("inspector", "Inspector")}{inspection.conducted_by ? inspection.conducted_by.substring(0,6) : 'N/A'}</span>
          </div>
        </div>
        <Badge variant="outline" className={getStatusColor(inspection.status)}>
          {inspection.status.replace(/_/g, ' ')}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between items-center mt-2">
           <div className="flex gap-4 text-sm">
             <div className="flex items-center gap-1">
               <Eye className="h-4 w-4 text-muted-foreground/70" />
               <span className="font-medium">{inspection.observation_count || 0}</span>{t("obs", "obs")}</div>
             <div className="flex items-center gap-1">
               <ShieldAlert className={`h-4 w-4 ${(inspection.violation_count || 0) > 0 ? 'text-comet-down' : 'text-muted-foreground/70'}`} />
               <span className="font-medium">{inspection.violation_count || 0}</span>{t("violations", "violations")}</div>
           </div>
           
           <Link to="/inspection/$id" params={{ id: inspection.id }}>
              <Button variant="outline" size="sm">{t("view_details", "View Details")}</Button>
           </Link>
        </div>
      </CardContent>
    </Card>
  );
}
