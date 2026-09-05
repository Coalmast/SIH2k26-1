import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../../src/components/ui/Card';
import { AlertTriangle, Eye, FileText } from 'lucide-react-native'; // Assuming lucide-react-native is used for icons

export default function ReportScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-binance-canvas-dark px-4 py-6">
      <Text className="text-binance-on-dark text-3xl font-bold mb-6">Reports</Text>
      
      <View className="flex-col gap-4">
        {/* Incident Report Card */}
        <TouchableOpacity onPress={() => router.push('/(app)/report/incident')}>
          <Card className="flex-row items-center p-4">
            <View className="bg-red-500/20 p-3 rounded-full mr-4">
              <AlertTriangle color="#ef4444" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-binance-on-dark font-bold text-lg">Report Incident</Text>
              <Text className="text-binance-muted-strong text-sm">Injury, near-miss, gas event, or hazard</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Safety Observation Card */}
        <TouchableOpacity onPress={() => router.push('/(app)/report/observation')}>
          <Card className="flex-row items-center p-4">
            <View className="bg-binance-primary/20 p-3 rounded-full mr-4">
              <Eye color="#FCD535" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-binance-on-dark font-bold text-lg">Safety Observation</Text>
              <Text className="text-binance-muted-strong text-sm">STOP card, unsafe act or condition</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Shift Report Card */}
        <TouchableOpacity onPress={() => router.push('/(app)/report/shift')}>
          <Card className="flex-row items-center p-4">
            <View className="bg-blue-500/20 p-3 rounded-full mr-4">
              <FileText color="#3b82f6" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-binance-on-dark font-bold text-lg">Shift Report</Text>
              <Text className="text-binance-muted-strong text-sm">Statutory CMR 2017 Overman report</Text>
            </View>
          </Card>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
