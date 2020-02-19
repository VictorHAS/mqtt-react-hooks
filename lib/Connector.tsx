import { connect, MqttClient, IClientOptions } from 'mqtt';
import React, { useEffect, useState, useCallback } from 'react';

import MqttContext from './Context';
import { Message, MessageStructure } from './types';

interface Props {
  brokerUrl?: string | object;
  opts?: IClientOptions | undefined;
  children: React.ReactNode;
}

export default function Connector({ children, brokerUrl, opts }: Props) {
  const [status, setStatus] = useState<string>('offline');
  const [mqtt, setMqtt] = useState<MqttClient>();
  const [messages, setMessages] = useState<Message<MessageStructure>[]>([]);

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

  const addMessage = useCallback((message: Message<{}>) => {
    setMessages(state => [...state, message]);
  }, []);

  const lastMessage = messages[messages.length - 1];

  return (
    <MqttContext.Provider
      value={{ status, mqtt, addMessage, messages, lastMessage }}
    >
      {children}
    </MqttContext.Provider>
  );
}
