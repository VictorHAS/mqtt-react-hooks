import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';

import { connect, MqttClient } from 'mqtt';

import MqttContext from './Context';
import { Error, ConnectorProps, IMqttContext } from './types';

export default function Connector({
  children,
  brokerUrl,
  options = { keepalive: 0 },
  parserMethod,
}: ConnectorProps) {
  // Using a ref rather than relying on state because it is synchronous
  const clientValid = useRef(false);
  const [connectionStatus, setStatus] = useState<string | Error>('Offline');
  const [client, setClient] = useState<MqttClient | null>(null);

  useEffect(() => {
    if (!client && !clientValid.current) {
      // This synchronously ensures we won't enter this block again
      // before the client is asynchronously set
      clientValid.current = true;
      setStatus('Connecting');
      console.log(`attempting to connect to ${brokerUrl}`);
      const mqtt = connect(brokerUrl, options);
      mqtt.on('connect', () => {
        console.debug('on connect');
        setStatus('Connected');
        // For some reason setting the client as soon as we get it from connect breaks things
        setClient(mqtt);
      });
      mqtt.on('reconnect', () => {
        console.debug('on reconnect');
        setStatus('Reconnecting');
      });
      mqtt.on('error', err => {
        console.log(`Connection error: ${err}`);
        setStatus(err.message);
      });
      mqtt.on('offline', () => {
        console.debug('on offline');
        setStatus('Offline');
      });
      mqtt.on('end', () => {
        console.debug('on end');
        setStatus('Offline');
      });
    }
  }, [client, clientValid, brokerUrl, options]);

  // Only do this when the component unmounts
  useEffect(
    () => () => {
      if (client) {
        console.log('closing mqtt client');
        client.end(true);
        setClient(null);
        clientValid.current = false;
      }
    },
    [client, clientValid],
  );

  // This is to satisfy
  // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-constructed-context-values.md
  const value: IMqttContext = useMemo<IMqttContext>(
    () => ({
      connectionStatus,
      client,
      parserMethod,
    }),
    [connectionStatus, client, parserMethod],
  );

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}
