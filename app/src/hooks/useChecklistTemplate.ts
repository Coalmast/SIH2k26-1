import { useState, useEffect, useMemo } from 'react';
import { database } from '../db';
import { Q } from '@nozbe/watermelondb';
import { useObserve } from './useObserve';
import { useConnectivity } from './useConnectivity';
import { ChecklistTemplate } from '../db/models';
import { ChecklistSection } from '../types/inspection.types';
import { supabase } from '../lib/supabase';

const MOCK_CHECKLIST = [
  {
    sectionTitle: 'ROOF & SIDE SUPPORT',
    regulation: 'CMR 2017, Regulation 100',
    questions: [
      { id: 'q1', text: 'Have roof and sides been sounded before work commenced in the area?', allowNa: false },
      { id: 'q2', text: 'Is systematic support installed as per approved support rules?', allowNa: false },
      { id: 'q3', text: 'Is withdrawal support plan posted at the face?', allowNa: false },
      { id: 'q4', text: 'Are props/chocks in serviceable condition?', allowNa: false },
      { id: 'q5', text: 'Roof fall history recorded in logbook?', allowNa: false },
      { id: 'q6', text: 'Is the area barricaded where support is absent / incomplete?', allowNa: false }
    ]
  },
  {
    sectionTitle: 'VENTILATION & GAS SAFETY',
    regulation: 'CMR 2017, Regulations 105, 116',
    questions: [
      { id: 'q7', text: 'Is ventilation current — airflow meeting minimum CMR requirement?', allowNa: false },
      { id: 'q9', text: 'Ventilation logbook up to date?', allowNa: false },
      { id: 'q10', text: 'Are brattice cloths / stoppings in serviceable condition?', allowNa: false },
      { id: 'q11', text: 'Is methane monitoring equipment calibrated and operational?', allowNa: false }
    ]
  },
  {
    sectionTitle: 'PPE COMPLIANCE',
    regulation: 'CMR 2017, Regulation 114',
    questions: [
      { id: 'q12', text: 'Are all workers wearing mandatory PPE (hard hat, safety boots, belt)?', allowNa: false },
      { id: 'q13', text: 'Are self-rescuers available and workers trained in their use?', allowNa: false },
      { id: 'q14', text: 'Is cap lamp charged and functional for each worker?', allowNa: false },
      { id: 'q15', text: 'Are flame-safety lamps available in fiery mines (if applicable)?', allowNa: true }
    ]
  },
  {
    sectionTitle: 'ELECTRICAL SAFETY',
    regulation: 'CMR 2017, Regulation 123',
    questions: [
      { id: 'q16', text: 'Are electrical switchgear enclosures in flameproof condition?', allowNa: false },
      { id: 'q17', text: 'Are earthing connections intact and tested?', allowNa: false },
      { id: 'q18', text: 'Is trailing cable in good condition (no exposed insulation)?', allowNa: false }
    ]
  },
  {
    sectionTitle: 'FIRE SAFETY & EXPLOSIVES',
    regulation: 'CMR 2017, Regulations 142, 155',
    questions: [
      { id: 'q19', text: 'Are fire fighting appliances at designated stations and charged?', allowNa: false },
      { id: 'q20', text: 'Is explosive magazine securely locked and record maintained?', allowNa: true },
      { id: 'q21', text: 'Are shot-firer certificates current and available for inspection?', allowNa: true }
    ]
  }
];

const fetchTemplatesFromApi = async () => {
  const { data, error } = await supabase
    .from('inspection_checklist_templates')
    .select('*')
    .eq('is_active', true);
    
  if (error) {
    console.error('[Supabase] fetchTemplatesFromApi error:', error);
    return [];
  }
  
  if (!data || data.length === 0) {
    console.log('[Supabase] No templates found in DB, falling back to mock templates');
    const types = [
      'dgms_annual_general', 'dgms_surprise', 'dgms_inquiry', 
      'internal_safety_committee', 'environmental_pcb', 'medical_fitness', 
      'electrical', 'explosives'
    ];
    return types.map((type, idx) => ({
      id: `template_${idx}`,
      name: `Safety Inspection - ${type}`,
      inspection_type: type,
      regulation_ref: 'CMR 2017',
      version: 1,
      is_active: true,
      checklist_items: MOCK_CHECKLIST,
    }));
  }
  return data;
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
