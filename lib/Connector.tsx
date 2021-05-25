import React, { useEffect, useState, useCallback, useRef } from 'react';

import { connect, MqttClient, IClientOptions } from 'mqtt';

import MqttContext from './Context';
import { Error } from './types';

interface Props {
  brokerUrl?: string | object;
  options?: IClientOptions;
  parserMethod?: (message) => string;
  children: React.ReactNode;
}

export default function Connector({
  children,
  brokerUrl,
  options = { keepalive: 0 },
  parserMethod,
}: Props) {
  const mountedRef = useRef(true);
  const [connectionStatus, setStatus] = useState<string | Error>('Offline');
  const [client, setClient] = useState<MqttClient | null>(null);

  const mqttConnect = useCallback(async () => {
    try {
      setStatus('Connecting');
      const mqtt = connect(brokerUrl, options);
      mqtt.on('connect', () => {
        if (mountedRef.current) {
          setClient(mqtt);
          setStatus('Connected');
        }
      });
      mqtt.on('reconnect', () => {
        if (mountedRef.current) {
          setStatus('Reconnecting');
        }
      });
      mqtt.on('error', err => {
        if (mountedRef.current) {
          console.log(`Connection error: ${err}`);
          setStatus(err?.message);
        }
      });
      mqtt.on('offline', () => {
        if (mountedRef.current) {
          setStatus('Offline');
        }
      });
      mqtt.on('end', () => {
        if (mountedRef.current) {
          setStatus('Offline');
        }
      });
    } catch (error) {
      setStatus(error);
    }
  }, [brokerUrl, options]);

  useEffect(() => {
    if (!client) {
      mqttConnect();
    }

    return () => {
      mountedRef.current = false;
      client?.end(true);
    };
  }, [client, mqttConnect, parserMethod]);

  return (
    <MqttContext.Provider value={{ connectionStatus, client, parserMethod }}>
      {children}
    </MqttContext.Provider>
  );
}
