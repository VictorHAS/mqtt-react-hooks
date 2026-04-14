import { useEffect, useMemo, useRef, useState } from 'react';

import * as mqtt from 'mqtt';
import type { MqttClient } from 'mqtt';

import MqttContext from './Context';
import { SubscriptionManager } from './SubscriptionManager';
import type { ConnectorProps, IMqttContext, MqttError } from './types';

export default function Connector({
  children,
  brokerUrl,
  options = { keepalive: 0 },
  parserMethod,
}: ConnectorProps) {
  const [manager] = useState(() => {
    const m = new SubscriptionManager();
    m.setParserMethod(parserMethod);
    return m;
  });

  // Using a ref rather than relying on state because it is synchronous
  const clientValid = useRef(false);
  const [connectionStatus, setStatus] = useState<string | MqttError>('Offline');
  const [client, setClient] = useState<MqttClient | null>(null);

  useEffect(() => {
    if (!client && !clientValid.current) {
      // This synchronously ensures we won't enter this block again
      // before the client is asynchronously set
      clientValid.current = true;
      setStatus('Connecting');

      // Vite/Webpack CJS-ESM interop wraps the mqtt module in a .default property
      const connectFn = mqtt.connect || (mqtt as any).default?.connect || (mqtt as any).default;
      const clientInstance: MqttClient =
        typeof connectFn === 'function'
          ? connectFn(brokerUrl, options)
          : (mqtt as any).connect(brokerUrl, options);
      manager.setClient(clientInstance);

      clientInstance.on('connect', () => {
        setStatus('Connected');
        setClient(clientInstance);
      });
      clientInstance.on('reconnect', () => {
        setStatus('Reconnecting');
      });
      clientInstance.on('error', (err) => {
        setStatus(err.message);
      });
      clientInstance.on('offline', () => {
        setStatus('Offline');
      });
      clientInstance.on('end', () => {
        setStatus('Offline');
      });
    }
  }, [client, brokerUrl, options, manager]);

  // Only do this when the component unmounts
  useEffect(
    () => () => {
      if (client) {
        manager.setClient(null);
        client.end(true);
        setClient(null);
        clientValid.current = false;
      }
    },
    [client, manager],
  );

  // Memoize context value to avoid unnecessary re-renders
  const value: IMqttContext = useMemo<IMqttContext>(
    () => ({
      connectionStatus,
      client,
      parserMethod,
      manager,
    }),
    [client, connectionStatus, parserMethod, manager],
  );

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}
