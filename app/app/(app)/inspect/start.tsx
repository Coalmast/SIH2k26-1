import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/stores/authStore';
import { useChecklistTemplates, useCreateInspection } from '../../../src/hooks/useInspectionApi';
import { Button } from '../../../src/components/ui/Button';

export default function StartInspectionScreen() {
  const router = useRouter();
  const mineId = useAuthStore(state => state.mineId);
  const mineName = useAuthStore(state => state.mineName);
  const userId = useAuthStore(state => state.user?.id);
  
  const { data: templates, isLoading: templatesLoading } = useChecklistTemplates();
  const createInspection = useCreateInspection();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [zone, setZone] = useState('Pit 3 East');

  // Auto-select first template if available
  useEffect(() => {
    if (templates && templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates]);

  const handleStart = async () => {
    if (!selectedTemplateId) return Alert.alert('Required', 'Please select an inspection type');
    if (!zone) return Alert.alert('Required', 'Please enter a zone/district');

    const selectedTemplate = templates?.find((t: any) => t.id === selectedTemplateId);

    const payload = {
      mine_id: mineId,
      conducted_by: userId,
      inspection_type: selectedTemplate?.inspection_type || 'environmental_pcb',
      checklist_template_id: selectedTemplateId,
      scheduled_date: new Date().toISOString().split('T')[0],
      zone: zone
    };

    createInspection.mutate(payload, {
      onSuccess: (res) => {
        if (res.error) {
          Alert.alert('Notice', 'Started in offline mode. Will sync later.');
        }
        router.replace(`/inspect/${res.localId}/form`);
      },
      onError: () => {
        Alert.alert('Error', 'Could not start inspection');
      }
    });
  };

  return (
    <View className="flex-1 bg-binance-ink px-4 pt-6">

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Mine Info */}
        <View className="mb-6">
          <Text className="text-binance-muted-strong font-semibold mb-2 uppercase text-xs tracking-wider">Location</Text>
          <View className="bg-binance-surface-card-dark p-4 rounded-xl border border-binance-border-strong flex-row justify-between items-center">
            <Text className="text-binance-on-dark font-medium text-lg">{mineName}</Text>
            <View className="bg-binance-primary/20 px-2 py-1 rounded">
               <Text className="text-binance-primary text-xs font-bold">VERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Zone */}
        <View className="mb-6">
          <Text className="text-binance-muted-strong font-semibold mb-2 uppercase text-xs tracking-wider">Zone / District</Text>
          <TextInput
            className="bg-binance-surface-card-dark text-binance-on-dark p-4 rounded-xl border border-binance-border-strong text-base"
            placeholder="e.g. Panel 4, Section B"
            placeholderTextColor="#707a8a"
            value={zone}
            onChangeText={setZone}
          />
        </View>

        {/* Type Selection */}
        <View className="mb-8">
          <Text className="text-binance-muted-strong font-semibold mb-2 uppercase text-xs tracking-wider">Inspection Template</Text>
          
          {templatesLoading ? (
            <ActivityIndicator color="#fcd535" className="mt-4" />
          ) : (
            <View className="gap-3">
              {templates?.map((t: any) => {
                const isSelected = selectedTemplateId === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedTemplateId(t.id)}
                    className={`p-4 rounded-xl border ${
                      isSelected 
                        ? 'bg-binance-primary border-binance-primary' 
                        : 'bg-binance-surface-card-dark border-binance-border-strong'
                    }`}
                  >
                    <Text className={`font-bold text-lg mb-1 ${isSelected ? 'text-binance-ink' : 'text-binance-on-dark'}`}>
                      {t.name}
                    </Text>
                    <Text className={isSelected ? 'text-binance-ink/80' : 'text-binance-muted-strong'}>
                      {t.regulation_reference}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Bottom Action */}
      <View className="py-4 border-t border-binance-border-strong">
        <Button 
          variant={selectedTemplateId && zone ? 'primary' : 'secondary'} 
          size="lg"
          onPress={handleStart}
          disabled={createInspection.isPending || templatesLoading}
        >
          {createInspection.isPending ? 'Starting...' : 'Proceed to Form →'}
        </Button>
      </View>
    </View>
  );
}
