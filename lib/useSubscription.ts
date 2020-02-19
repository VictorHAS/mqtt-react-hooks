import { useContext, useEffect, useMemo } from 'react';
import MQTTPattern from 'mqtt-pattern';
import uuid from 'uuid';

import MqttContext from './Context';
import { MqttContext as Context } from './types';

export default function useSubscription<T>(topic: string) {
  const { mqtt, status, messages, addMessage, lastMessage } = useContext<
    Context<T>
  >(MqttContext);
  const subscribed = useMemo(() => mqtt?.subscribe(topic), [mqtt]);

  useEffect(() => {
    function getMessages() {
      subscribed?.once(
        'message',
        (t: string, message: { toString: () => string }) => {
          let msg;
          try {
            msg = JSON.parse(message.toString());
          } catch (e) {
            msg = message.toString();
          }
          const packet = {
            message: msg,
            topic: t,
            id: uuid(),
          };
          if (MQTTPattern.matches(topic, t)) {
            addMessage(packet);
          }
        }
      );
    }
    getMessages();
  }, [subscribed, messages]);

  const msgs = messages.filter(msg => MQTTPattern.matches(topic, msg.topic));
  const lastMessageOnTopic = msgs[msgs.length - 1];

  return {
    msgs,
    mqtt,
    status,
    lastMessage,
    lastMessageOnTopic,
    topic,
  };
}
