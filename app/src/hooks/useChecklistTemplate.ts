import { useState, useEffect, useMemo } from 'react';
import { database } from '../db';
import { Q } from '@nozbe/watermelondb';
import { useObserve } from './useObserve';
import { useConnectivity } from './useConnectivity';
import { ChecklistTemplate } from '../db/models';
import { ChecklistSection } from '../types/inspection.types';

// Mock API call to be replaced with actual Axios/fetch instance
const fetchTemplatesFromApi = async () => {
  console.log('[API] Fetching all templates');
  return []; // Mock return, in reality it should return templates from GET /api/v1/inspections/templates
};

export function useChecklistTemplate(inspectionType: string | null) {
  const { isOnline } = useConnectivity();
  const [isLoading, setIsLoading] = useState(false);

  // Sync templates on mount if online
  useEffect(() => {
    if (!isOnline) return;

    let mounted = true;
    const syncTemplates = async () => {
      setIsLoading(true);
      try {
        const templates = await fetchTemplatesFromApi();
        if (!mounted || !templates.length) return;

        await database.write(async () => {
          for (const t of templates) {
            const existing = await database.get<ChecklistTemplate>('checklist_templates')
              .query(Q.where('remote_id', t.id))
              .fetch();
            
            if (existing.length === 0) {
              await database.get<ChecklistTemplate>('checklist_templates').create((r: any) => {
                r.remoteId = t.id;
                r.name = t.name;
                r.inspectionType = t.inspection_type;
                r.regulationRef = t.regulation_ref;
                r.checklistItems = JSON.stringify(t.checklist_items || []);
                r.version = t.version || 1;
                r.isActive = t.is_active !== false;
                r.syncedAt = Date.now();
              });
            } else {
              // Update if newer version
              const ex = existing[0];
              if (t.version > ex.version) {
                await ex.update((r: any) => {
                  r.name = t.name;
                  r.regulationRef = t.regulation_ref;
                  r.checklistItems = JSON.stringify(t.checklist_items || []);
                  r.version = t.version;
                  r.isActive = t.is_active !== false;
                  r.syncedAt = Date.now();
                });
              }
            }
          }
        });
      } catch (error) {
        console.error('Failed to sync templates:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    syncTemplates();

    return () => {
      mounted = false;
    };
  }, [isOnline]);

  // Query template from local DB
  const templateQuery = useMemo(() => {
    if (!inspectionType) return null;
    return database.get<ChecklistTemplate>('checklist_templates').query(
      Q.where('inspection_type', inspectionType),
      Q.where('is_active', true)
    ).observe();
  }, [inspectionType]);

  const templates = useObserve(templateQuery, []);
  const template = templates && templates.length > 0 ? templates[0] : null;

  // Parse sections
  const sections: ChecklistSection[] = useMemo(() => {
    if (!template || !template.checklistItems) return [];
    try {
      return JSON.parse(template.checklistItems) as ChecklistSection[];
    } catch (e) {
      console.error('Failed to parse checklist items', e);
      return [];
    }
  }, [template]);

  return {
    template,
    sections,
    isLoading,
    isCached: !!template,
  };
}
