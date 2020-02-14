import { useContext, useEffect, useMemo } from 'react';
import uuid from 'uuid';

import FormContext from './Context';
import { MqttContext } from './types';

export default function useSubscription(topic: string) {
  const { mqtt, status, messages, addMessage } = useContext<MqttContext>(
    FormContext
  );

  const subscribed = useMemo(() => mqtt?.subscribe(topic), [mqtt]);

  useEffect(() => {
    subscribed?.once(
      'message',
      (t: string, message: { toString: () => string }) => {
        if (t === topic) {
          addMessage({ message: message.toString(), topic: t, id: uuid() });
        }
      }
    );
  }, [subscribed, messages]);

  const msgs = messages.filter(msg => msg.topic === topic);

  return {
    msgs,
    mqtt,
    status,
  };
}
