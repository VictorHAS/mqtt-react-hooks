import { connect, MqttClient, IClientOptions } from 'mqtt';
import React, { useEffect, useState } from 'react';

import MqttContext from './Context';
import { Message } from './types';

interface Props {
  brokerUrl?: string | object;
  opts?: IClientOptions | undefined;
  children: React.ReactNode;
}

export default function Connector({ children, brokerUrl, opts }: Props) {
  const [status, setStatus] = useState<string>('offline');
  const [mqtt, setMqtt] = useState<MqttClient>();
  const [message, setMessage] = useState<Message>({} as Message);

  useEffect(() => {
    const mqttInstance = connect(brokerUrl, opts);
    setMqtt(mqttInstance);
    mqttInstance.on('connect', () => setStatus('connected'));
    mqttInstance.on('reconnect', () => setStatus('reconnecting'));
    mqttInstance.on('close', () => setStatus('closed'));
    mqttInstance.on('offline', () => setStatus('offline'));

    return () => {
      mqttInstance.end();
    };
  }, []);

  return (
    <MqttContext.Provider value={{ status, mqtt, message, setMessage }}>
      {children}
    </MqttContext.Provider>
  );
}
