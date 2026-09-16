import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, Vibration } from 'react-native';
import { useAlertStore } from '../stores/alertStore';
import { AlertOctagon } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function CriticalAlarmModal() {
  const { criticalAlarmActive, activeAlerts, acknowledgeAlert } = useAlertStore();
  const criticalAlerts = activeAlerts.filter(a => a.type === 'CRITICAL');
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let blinkInterval: NodeJS.Timeout;
    if (criticalAlarmActive && criticalAlerts.length > 0) {
      // Vibrate pattern: 1s on, 1s off
      Vibration.vibrate([1000, 1000], true);
      
      // Visual blink
      blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 500);
    } else {
      Vibration.cancel();
      setIsBlinking(false);
    }

    return () => {
      clearInterval(blinkInterval);
      Vibration.cancel();
    };
  }, [criticalAlarmActive, criticalAlerts.length]);

  const isActive = criticalAlarmActive && criticalAlerts.length > 0;
  const currentAlert = isActive ? criticalAlerts[0] : null;

  const handleAcknowledge = async () => {
    if (currentAlert) await acknowledgeAlert(currentAlert.id);
  };

  return (
    <Modal
      transparent
      visible={isActive}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.container, isBlinking && styles.containerBlink]}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <AlertOctagon color="#ef4444" size={64} />
          </View>
          
          <Text style={styles.title}>EMERGENCY ALARM</Text>
          <Text style={styles.subtitle}>{currentAlert?.title || ''}</Text>
          
          <View style={styles.messageBox}>
            <Text style={styles.message}>{currentAlert?.message || ''}</Text>
          </View>

          <TouchableOpacity style={styles.ackButton} onPress={handleAcknowledge}>
            <Text style={styles.ackButtonText}>ACKNOWLEDGE ALARM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.9)', // Red overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  containerBlink: {
    backgroundColor: 'rgba(153, 27, 27, 0.95)', // Darker red for blinking effect
  },
  card: {
    backgroundColor: '#0b0e11',
    width: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    color: '#ef4444',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  messageBox: {
    backgroundColor: '#1e2329',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  message: {
    color: '#eaecef',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  ackButton: {
    backgroundColor: '#ef4444',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  ackButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
