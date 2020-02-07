import { connect, MqttClient, IClientOptions } from 'mqtt';
import React, { useEffect, useState } from 'react';

import { mqttContext } from './Context';

interface Props {
  brokerUrl?: string | object;
  opts?: IClientOptions | undefined;
  children: React.ReactNode;
}

export default function Connector({ children, brokerUrl, opts }: Props) {
  const [status, setStatus] = useState<string>('offline');
  const [mqtt, setMqtt] = useState<MqttClient>();

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
    <mqttContext.Provider value={{ status, mqtt }}>
      {children}
    </mqttContext.Provider>
  );
}
