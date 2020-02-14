import { useContext } from 'react';
import MqttContext from './Context';
import { MqttContext as Context } from './types';

export default function useMqttState() {
  const { status, mqtt, messages: allMessages } = useContext<Context>(
    MqttContext
  );

  return {
    status,
    mqtt,
    allMessages,
  };
}
