import React, { useEffect, useState, useMemo, useRef } from 'react';

import { connect, MqttClient } from 'mqtt';

import MqttContext from './Context';
import { Error, ConnectorProps, IMqttContext } from './types';

export default function Connector({
  children,
  brokerUrl,
  options = { keepalive: 0 },
  parserMethod,
}: ConnectorProps) {
  const [connectionStatus, setStatus] = useState<string | Error>('Offline');
  const clientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    setStatus('Connecting');
    console.log(`attempting to connect to ${brokerUrl}`);
    const mqtt = connect(brokerUrl, options);
    mqtt.on('connect', () => {
      console.debug('on connect');
      setStatus('Connected');
      // For some reason setting the client as soon as we get it from connect breaks things
      clientRef.current = mqtt;
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
    return () => {
      console.log('closing mqtt client');
      mqtt.end(true);
      clientRef.current = null;
    };
  }, [brokerUrl, options]);

  // Only do this when the component unmounts
  useEffect(
    () => () => {
      if (clientRef.current) {
        console.log('closing mqtt client');
        clientRef.current.end(true);
        clientRef.current = null;
      }
    },
    [],
  );

  // This is to satisfy
  // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-constructed-context-values.md
  const value: IMqttContext = useMemo<IMqttContext>(
    () => ({
      connectionStatus,
      client: clientRef.current,
      parserMethod,
    }),
    [connectionStatus, parserMethod],
  );

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}
