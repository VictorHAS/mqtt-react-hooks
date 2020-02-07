/* istanbul ignore file */

import { createContext, useContext } from 'react';

import { MqttContext, SubscribeContext } from './types';

const mqttContext = createContext<MqttContext>({
  status: '',
  mqtt: undefined,
});

const subscribeContext = createContext<SubscribeContext>({
  messages: [],
  topic: '',
});

function useMqttState() {
  const context = useContext(mqttContext);
  return context;
}

function useSubscribeState() {
  const { messages, topic } = useContext(subscribeContext);
  return { messages, topic };
}

export { mqttContext, useMqttState, subscribeContext, useSubscribeState };
