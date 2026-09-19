import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../../src/components/ui/Card';
import { AlertTriangle, Eye, FileText } from 'lucide-react-native'; // Assuming lucide-react-native is used for icons

export default function ReportScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-comet-canvas pt-6">
      
      <ScrollView className="flex-1 px-4">
        <View className="flex-col gap-4 pb-8">
        {/* Incident Report Card */}
        <TouchableOpacity onPress={() => router.push('/(app)/report/incident')}>
          <Card className="flex-row items-center p-4">
            <View className="bg-red-500/20 p-3 rounded-full mr-4">
              <AlertTriangle color="#ef4444" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-comet-fg font-bold text-lg">Report Incident</Text>
              <Text className="text-comet-fg-muted text-sm">Injury, near-miss, gas event, or hazard</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Safety Observation Card */}
        <TouchableOpacity onPress={() => router.push('/(app)/report/observation')}>
          <Card className="flex-row items-center p-4">
            <View className="bg-comet-orange/20 p-3 rounded-full mr-4">
              <Eye color="#f97316" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-comet-fg font-bold text-lg">Safety Observation</Text>
              <Text className="text-comet-fg-muted text-sm">STOP card, unsafe act or condition</Text>
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
              <Text className="text-comet-fg font-bold text-lg">Shift Report</Text>
              <Text className="text-comet-fg-muted text-sm">Statutory CMR 2017 Overman report</Text>
            </View>
          </Card>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
