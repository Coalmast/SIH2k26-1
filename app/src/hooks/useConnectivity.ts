import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
// Assuming useAppStore exists and has setOnline/setOffline, but we will just return it for now.

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false);
      setConnectionType(state.type);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isOnline, connectionType };
}
