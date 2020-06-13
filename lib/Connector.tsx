import React, { useEffect, useState } from 'react';

import { connect, MqttClient, IClientOptions } from 'mqtt';

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
    mqttInstance.on('error', error => setStatus(error.message));

    return () => {
      mqttInstance.end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brokerUrl]);

  return (
    <MqttContext.Provider value={{ connectionStatus, mqtt }}>
      {children}
    </MqttContext.Provider>
  );
}
