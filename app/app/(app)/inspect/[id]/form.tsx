import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../../../src/db';
import { Inspection, ChecklistTemplate, Observation } from '../../../../src/db/models';
import { Q } from '@nozbe/watermelondb';
import { ChecklistSection, ChecklistItem as ItemType } from '../../../../src/types/inspection.types';
import { ChecklistItem, ResponseType, ObservationDetail } from '../../../../src/components/ChecklistItem';
import { VoiceInput } from '../../../../src/components/VoiceInput';
import { Button } from '../../../../src/components/ui/Button';
import { useObserve } from '../../../../src/hooks/useObserve';

export default function InspectionFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const inspectionQuery = useMemo(() => database.get<Inspection>('inspections').query(Q.where('id', id)).observe(), [id]);
  const inspections = useObserve(inspectionQuery, []);
  const inspection = inspections?.[0];

  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { value: ResponseType, detail: ObservationDetail }>>({});
  
  // Load template
  useEffect(() => {
    if (!inspection) return;
    const fetchTemplate = async () => {
      const tmpl = await database.get<ChecklistTemplate>('checklist_templates')
        .query(Q.where('remote_id', inspection.checklistTemplateId))
        .fetch();
      
      if (tmpl.length > 0) {
        setTemplate(tmpl[0]);
        try {
          const parsed = JSON.parse(tmpl[0].checklistItems);
          setSections(parsed);
          // Sync currentSectionIndex with inspection.currentSection if available
          setCurrentSectionIndex(inspection.currentSection || 0);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchTemplate();
  }, [inspection]);

  // Load existing observations
  useEffect(() => {
    if (!inspection) return;
    const loadObservations = async () => {
      const obsList = await database.get<Observation>('observations')
        .query(Q.where('inspection_id', inspection.id))
        .fetch();
      
      const loaded: Record<string, any> = {};
      obsList.forEach(obs => {
        if (obs.checklistItemId) {
          loaded[obs.checklistItemId] = {
            value: obs.responseType as ResponseType,
            detail: {
              description: obs.description,
              severity: obs.severity,
              photoUris: obs.photoUris ? JSON.parse(obs.photoUris) : [],
              subZone: obs.subZone || '',
            }
          };
        }
      });
      setResponses(loaded);
    };
    loadObservations();
  }, [inspection]);

  if (!inspection || !template) {
    return (
      <View className="flex-1 bg-binance-ink items-center justify-center">
        <ActivityIndicator size="large" color="#fcd535" />
      </View>
    );
  }

  const currentSection = sections[currentSectionIndex];

  const handleResponseChange = (questionId: string, value: ResponseType) => {
    setResponses(prev => {
      const current = prev[questionId] || { detail: { description: '', severity: 'low', photoUris: [], subZone: '' } };
      return {
        ...prev,
        [questionId]: { ...current, value }
      };
    });
  };

  const handleDetailChange = (questionId: string, detail: ObservationDetail) => {
    setResponses(prev => {
      const current = prev[questionId] || { value: null };
      return {
        ...prev,
        [questionId]: { ...current, detail }
      };
    });
  };

  const saveProgress = async () => {
    try {
      await database.write(async () => {
        // Update inspection
        await inspection.update((i: any) => {
          i.currentSection = currentSectionIndex;
          i.status = 'in_progress';
        });

        // Upsert observations for current section
        for (const item of currentSection.questions) {
          const res = responses[item.id];
          if (!res || !res.value) continue; // Skip unanswered

          const existing = await database.get<Observation>('observations')
            .query(Q.where('inspection_id', inspection.id), Q.where('checklist_item_id', item.id))
            .fetch();

          const isIssue = res.value === 'non_compliant' || res.value === 'observation_only';

          if (existing.length > 0) {
            await existing[0].update((o: any) => {
              o.responseType = res.value;
              o.isCompliant = res.value === 'ok' || res.value === 'na';
              if (isIssue) {
                o.description = res.detail.description;
                o.severity = res.detail.severity;
                o.photoUris = JSON.stringify(res.detail.photoUris);
                o.subZone = res.detail.subZone;
                o.category = currentSection.sectionTitle; // fallback
              }
            });
          } else {
            await database.get<Observation>('observations').create((o: any) => {
              o.inspectionId = inspection.id;
              o.checklistItemId = item.id;
              o.statuteRef = item.regulationRef;
              o.responseType = res.value;
              o.isCompliant = res.value === 'ok' || res.value === 'na';
              o.syncStatus = 'pending_sync';
              
              if (isIssue) {
                o.description = res.detail.description;
                o.severity = res.detail.severity;
                o.photoUris = JSON.stringify(res.detail.photoUris);
                o.subZone = res.detail.subZone;
                o.category = currentSection.sectionTitle;
              } else {
                o.category = currentSection.sectionTitle;
                o.description = '';
                o.severity = 'low';
              }
            });
          }
        }
        
        // Update counts
        const allObs = await database.get<Observation>('observations').query(Q.where('inspection_id', inspection.id)).fetch();
        const obsCount = allObs.filter(o => o.responseType === 'observation_only' || o.responseType === 'non_compliant').length;
        const vioCount = allObs.filter(o => o.responseType === 'non_compliant').length;

        await inspection.update((i: any) => {
          i.observationCount = obsCount;
          i.violationCount = vioCount;
        });
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save progress');
      throw e;
    }
  };

  const handleNext = async () => {
    // Basic validation for required answers in this section
    const unanswered = currentSection.questions.filter(q => !responses[q.id]?.value);
    if (unanswered.length > 0) {
      return Alert.alert('Incomplete', `Please answer all questions before proceeding. (${unanswered.length} left)`);
    }

    try {
      await saveProgress();
      
      if (currentSectionIndex < sections.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
      } else {
        router.replace(`/inspect/${id}/summary`);
      }
    } catch (e) {
      // Error handled in saveProgress
    }
  };

  const handlePrev = async () => {
    try {
      await saveProgress();
      setCurrentSectionIndex(prev => Math.max(0, prev - 1));
    } catch (e) {
      // Error handled in saveProgress
    }
  };

  if (!currentSection) return null;

  return (
    <View className="flex-1 bg-binance-ink pt-12 pb-4">
      {/* Header */}
      <View className="px-4 pb-4 border-b border-binance-border-strong flex-row justify-between items-center">
        <View>
          <Text className="text-binance-muted-strong font-semibold uppercase text-xs">Section {currentSectionIndex + 1} of {sections.length}</Text>
          <Text className="text-white text-xl font-bold mt-1">{currentSection.sectionTitle}</Text>
        </View>
        <TouchableOpacity onPress={async () => { await saveProgress(); router.back(); }}>
          <Text className="text-binance-primary font-bold">Save & Exit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {currentSection.questions.map((q) => (
          <ChecklistItem
            key={q.id}
            questionId={q.id}
            questionText={q.text}
            regulationRef={q.regulationRef}
            allowNa={q.allowNa}
            value={responses[q.id]?.value || null}
            existingDetail={responses[q.id]?.detail}
            onChange={(val) => handleResponseChange(q.id, val)}
            onDetailChange={(detail) => handleDetailChange(q.id, detail)}
          />
        ))}

        <VoiceInput />
        
        <View className="h-10" /> {/* Spacer */}
      </ScrollView>

      {/* Footer Navigation */}
      <View className="px-4 pt-4 border-t border-binance-border-strong flex-row justify-between">
        <Button 
          variant="secondary" 
          onPress={handlePrev} 
          disabled={currentSectionIndex === 0}
          className="flex-1 mr-2"
        >
          ← Previous
        </Button>
        <Button 
          variant="primary" 
          onPress={handleNext}
          className="flex-1 ml-2"
        >
          {currentSectionIndex === sections.length - 1 ? 'Review Summary →' : 'Next Section →'}
        </Button>
      </View>
    </View>
  );
}
