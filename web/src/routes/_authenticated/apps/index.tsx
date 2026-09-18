import { useTranslation } from "react-i18next";
import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'

import { AppWindow, Construction } from 'lucide-react'

const Apps = () => {
  const {
    t
  } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
      <div className="bg-muted p-6 rounded-full mb-2">
        <AppWindow className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">{t("apps_feature_coming_soon", "Apps Ecosystem")}</h1>
      <p className="text-muted-foreground max-w-md">
        {t("we_are_building_a_new_way_to", "We're building a marketplace of third-party integrations for COMET. Check back soon.")}
      </p>
      <div className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-full mt-4">
        <Construction className="h-4 w-4" />
        {t("under_construction", "Under Construction")}
      </div>
    </div>
  );
};

const appsSearchSchema = z.object({
  type: z
    .enum(['all', 'connected', 'notConnected'])
    .optional()
    .catch(undefined),
  filter: z.string().optional().catch(''),
  sort: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/apps/')({
  validateSearch: appsSearchSchema,
  component: Apps,
})
