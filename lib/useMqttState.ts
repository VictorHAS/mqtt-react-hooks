import { useContext } from 'react';
import MqttContext from './Context';
import { MqttContext as Context } from './types';

export default function useMqttState<T>() {
  const { status, mqtt, message } = useContext<Context<T>>(MqttContext);

  return {
    status,
    mqtt,
    message,
  };
}
