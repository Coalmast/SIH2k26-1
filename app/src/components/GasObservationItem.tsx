import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAddObservation } from '../hooks/useInspectionApi';

interface GasObservationItemProps {
  item: any;
  localInspectionId: string;
  remoteInspectionId: string;
  zone: string;
  savedObservation?: any;
  onSaved: () => void;
}

const GAS_RULES: Record<string, any> = {
  'GAS-CH4': { danger: 1.25, warning: 0.25, type: '>', reg: 'CMR Reg. 5(2)' },
  'GAS-O2': { danger: 19.5, type: '<', reg: 'CMR Reg. 5(1)(a)' },
  'GAS-CO2': { danger: 0.5, type: '>', reg: 'CMR Reg. 5(1)(c)' },
  'GAS-CO': { danger: 50, type: '>', reg: 'CMR Reg. 5(1)(b)' },
  'GAS-H2S': { danger: 10, type: '>', reg: 'CMR Reg. 5(1)(d)' },
  'VENT-FLOW': { danger: 30, type: '<', reg: 'CMR Reg. 68(1)' },
  'TEMP-WB': { danger: 33.5, type: '>', reg: 'CMR Reg. 5(2)' },
  'DUST-PM10': { danger: 3, type: '>', reg: 'CMR Reg. 106', dangerSeverity: 'medium' },
};

export function GasObservationItem({ item, localInspectionId, remoteInspectionId, zone, savedObservation, onSaved }: GasObservationItemProps) {
  const [value, setValue] = useState(savedObservation ? String(JSON.parse(savedObservation.gasReadings || '{}').value || '') : '');
  const [status, setStatus] = useState<'ok'|'warning'|'danger'|null>(null);
  const [severity, setSeverity] = useState('none');
  const addObservation = useAddObservation();

  const isSaved = !!savedObservation;
  const rule = GAS_RULES[item.id];

  useEffect(() => {
    if (!value || isNaN(Number(value)) || !rule) {
      setStatus(null);
      setSeverity('none');
      return;
    }
    const num = Number(value);
    
    let isDanger = false;
    let isWarning = false;

    if (rule.type === '>') {
      if (num > rule.danger) isDanger = true;
      else if (rule.warning && num > rule.warning) isWarning = true;
    } else {
      if (num < rule.danger) isDanger = true;
      else if (rule.warning && num < rule.warning) isWarning = true;
    }

    if (isDanger) {
      setStatus('danger');
      setSeverity(rule.dangerSeverity || 'critical');
    } else if (isWarning) {
      setStatus('warning');
      setSeverity('high');
    } else {
      setStatus('ok');
      setSeverity('none');
    }
  }, [value, rule]);

  const handleSave = () => {
    if (!value) return;
    
    let backendStatus = 'ok';
    if (status === 'danger' || status === 'warning') {
      backendStatus = 'non_compliant';
    }

    const obsData = {
      checklist_item_id: item.id,
      category: 'environmental',
      severity: severity === 'none' ? 'low' : severity,
      status: backendStatus,
      description: status !== 'ok' ? `Threshold breach: recorded ${value} ${item.unit}. Regulation: ${rule?.reg}` : 'Values within normal limits.',
      gas_readings: { value: Number(value), unit: item.unit }
    };

    addObservation.mutate({
      localInspectionId,
      remoteInspectionId,
      obsData
    }, {
      onSuccess: () => {
        onSaved();
      }
    });
  };

  const statusColors = {
    danger: 'bg-binance-trading-down border-binance-trading-down',
    warning: 'bg-[#fcd535] border-[#fcd535]',
    ok: 'bg-binance-trading-up border-binance-trading-up',
    null: 'bg-binance-surface-card-dark border-binance-border-strong'
  };
  const textColor = status === 'warning' ? 'text-binance-ink' : (status ? 'text-white' : 'text-binance-on-dark');

  return (
    <View className="mb-4 bg-binance-surface-elevated-dark p-4 rounded-xl border border-binance-border-strong">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 pr-4">
          <Text className="text-binance-on-dark font-bold text-lg">{item.text}</Text>
          <Text className="text-binance-muted-strong text-xs mt-1">{item.regulation}</Text>
        </View>
        {status && (
          <View className={`px-2 py-1 rounded ${statusColors[status]}`}>
            <Text className={`text-xs font-bold ${textColor}`}>
              {status === 'danger' ? 'CRITICAL' : status === 'warning' ? 'HIGH' : 'OK'}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center mt-3 gap-3">
        <View className={`flex-row items-center border rounded-lg px-4 py-2 flex-1 ${status ? statusColors[status].replace('bg-', 'bg-opacity-10 bg-') : 'border-binance-border-strong bg-binance-surface-card-dark'}`}>
          <TextInput
            className="flex-1 text-white font-bold text-lg"
            placeholder="0.00"
            placeholderTextColor="#707a8a"
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
            editable={!isSaved}
          />
          <Text className="text-binance-muted font-medium ml-2">{item.unit}</Text>
        </View>
        
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaved || addObservation.isPending || !value}
          className={`px-4 py-3 rounded-lg flex-row items-center gap-2 ${
            isSaved ? 'bg-binance-trading-up' : 
            !value ? 'bg-binance-surface-card-dark' : 'bg-binance-primary'
          }`}
        >
          {addObservation.isPending ? (
            <Text className="text-binance-ink font-bold">Saving...</Text>
          ) : isSaved ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-bold">Saved</Text>
            </>
          ) : (
            <Text className={!value ? 'text-binance-muted' : 'text-binance-ink font-bold'}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {status && status !== 'ok' && (
        <View className="mt-3 bg-[#2b3139] p-3 rounded-lg">
          <Text className="text-binance-on-dark text-sm">
            <Text className="font-bold">Regulation Breach:</Text> {rule?.reg}
          </Text>
        </View>
      )}
    </View>
  );
}
