import { connect, MqttClient, IClientOptions } from 'mqtt';
import React, { useEffect, useState } from 'react';

import MqttContext from './Context';

interface Props {
  brokerUrl?: string | object;
  options?: IClientOptions | undefined;
  children: React.ReactNode;
}

export default function Connector({
  children,
  brokerUrl,
  options = {},
}: Props) {
  const [connectionStatus, setStatus] = useState<string>('offline');
  const [mqtt, setMqtt] = useState<MqttClient>();

  useEffect(() => {
    const mqttInstance = connect(brokerUrl, options);
    setMqtt(mqttInstance);
    mqttInstance.on('connect', () => setStatus('connected'));
    mqttInstance.on('reconnect', () => setStatus('reconnecting'));
    mqttInstance.on('close', () => setStatus('closed'));
    mqttInstance.on('offline', () => setStatus('offline'));
    mqttInstance.on('error', error => setStatus(error.message));

    return () => {
      mqttInstance?.end(true);
    };
  }, [brokerUrl, options]);

  return (
    <MqttContext.Provider value={{ connectionStatus, mqtt }}>
      {children}
    </MqttContext.Provider>
  );
}
