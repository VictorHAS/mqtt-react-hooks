import React, { useEffect, useState, useCallback } from 'react';

import { connect, MqttClient, IClientOptions } from 'mqtt';

import MqttContext from './Context';
import { IMessage } from './types';

interface Props {
  brokerUrl?: string | object;
  options?: IClientOptions;
  parserMethod?: (message) => string;
  children: React.ReactNode;
}

export default function Connector({
  children,
  brokerUrl,
  options = {},
  parserMethod,
}: Props) {
  const [connectionStatus, setStatus] = useState<string>('offline');
  const [client, setClient] = useState<MqttClient | null>(null);
  const [message, setMessage] = useState<IMessage>();

  const mqttConnect = useCallback(async () => {
    try {
      setStatus('Connecting');
      setClient(connect(brokerUrl, options));
    } catch (error) {
      setStatus(error);
    }
  }, [brokerUrl, options]);

  useEffect(() => {
    if (client) {
      client.on('connect', () => {
        setStatus('Connected');
      });
      client.on('error', err => {
        console.error('Connection error: ', err);
        client?.end(true, {}, () => {
          setStatus('offline');
        });
      });
      client.on('reconnect', () => {
        setStatus('Reconnecting');
      });
      client.on('message', (topic, msg) => {
        const payload = {
          topic,
          message: parserMethod?.(msg) || msg.toString(),
        };
        setMessage(payload);
      });
    } else {
      mqttConnect();
    }

    return () => {
      client?.end(true);
    };
  }, [client, mqttConnect, parserMethod]);

  return (
    <MqttContext.Provider value={{ connectionStatus, client, message }}>
      {children}
    </MqttContext.Provider>
  );
}
