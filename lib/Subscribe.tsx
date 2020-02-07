import React, { useState, useEffect, useMemo } from 'react';
import uuid from 'uuid';

import { useMqttState, subscribeContext } from './Context';
import { Message } from './types';

interface Props {
  children: React.ReactNode;
  topic: string;
}

export default function Subscribe({ children, topic }: Props) {
  const { mqtt } = useMqttState();
  const [messages, setMessages] = useState<Message[]>([]);

  const subscribed = useMemo(() => mqtt?.subscribe(topic), [mqtt]);

  function addMessage(message: Message) {
    setMessages(state => [...state, message]);
  }

  useEffect(() => {
    subscribed?.once(
      'message',
      (t: string, message: { toString: () => string }) => {
        addMessage({ message: message.toString(), topic: t, id: uuid() });
      }
    );
  }, [subscribed, messages]);

  return (
    <subscribeContext.Provider value={{ messages, topic }}>
      {children}
    </subscribeContext.Provider>
  );
}
