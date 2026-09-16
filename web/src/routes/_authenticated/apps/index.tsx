import { useTranslation } from "react-i18next";
import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'

const Apps = () => {
  const {
    t
  } = useTranslation();

  return <div>{t("apps_feature_coming_soon", "Apps Feature Coming Soon")}</div>;
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
