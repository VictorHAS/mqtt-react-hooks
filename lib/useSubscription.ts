import { useContext, useEffect, useMemo } from 'react';
import MQTTPattern from 'mqtt-pattern';
import uuid from 'uuid/v4';

import MqttContext from './Context';
import { MqttContext as Context } from './types';

export default function useSubscription(topic: string) {
  const { mqtt, status, message, setMessage } = useContext<Context>(
    MqttContext,
  );
  const subscribed = useMemo(() => mqtt?.subscribe(topic), [mqtt]);

  useEffect(() => {
    function getMessages() {
      subscribed?.once(
        'message',
        (t: string, message: { toString: () => string }) => {
          let msg: string;
          try {
            msg = JSON.parse(message.toString());
          } catch (e) {
            msg = message.toString();
          }
          const packet = {
            message: msg,
            topic: t,
          };
          if (MQTTPattern.matches(topic, t)) {
            setMessage(packet);
          }
        },
      );
    }
    getMessages();
  }, [subscribed]);

  return {
    mqtt,
    status,
    topic,
    message,
  };
}
