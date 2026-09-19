import { useTranslation } from "react-i18next";
import { TaskCard } from "@/components/task-card";
import { useNavigate } from "@tanstack/react-router";

export function InspectionCard({ inspection }: { inspection: any }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const statusLabel = inspection.status
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  const typeLabel = inspection.inspection_type.replace(/_/g, ' ').toUpperCase();

  return (
    <div 
      className="cursor-pointer h-full" 
      onClick={() => navigate({ to: '/inspection/$id', params: { id: inspection.id } })}
    >
      <TaskCard
        className="hover:shadow-md transition-shadow h-full"
        editable={false}
        value={{
          id: inspection.id,
          name: typeLabel,
          status: statusLabel,
          active: true,
          setAt: inspection.started_at || inspection.created_at,
          targetPerson: inspection.conducted_by ? { id: inspection.conducted_by, name: inspection.conducted_by.substring(0, 6) } : undefined,
          labels: [
            inspection.zone || 'General'
          ]
        }}
        renderExtra={(item) => (
          <div className="flex gap-4 font-semibold text-base mt-2">
            <span className="text-indigo-400 dark:text-indigo-300">
              {t("obs", "obs")}: {inspection.observation_count || 0}
            </span>
            <span className="text-red-500 dark:text-red-400">
              {t("violations", "violations")}: {inspection.violation_count || 0}
            </span>
          </div>
        )}
      />
    </div>
  );
}
