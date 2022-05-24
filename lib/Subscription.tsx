import React, { useEffect, useState, useCallback, createContext } from 'react';

import { IClientSubscribeOptions } from 'mqtt';
import { matches } from 'mqtt-pattern';

import { IMessage, SubscriptionProps } from './types';
import useMqttState from './useMqttState';

// The message receiver has to be in a different component from the component that holds
// the subscription state, so that message receipt doesn't trigger subscription reset
const createMessageReceiver = MessageContext =>
  function ({ topic, children, callback }) {
    const [message, setMessage] = useState<IMessage | undefined>(undefined);
    const { client, parserMethod } = useMqttState();

    const receiveMessage = useCallback(
      (receivedTopic: string, receivedMessage: any) => {
        if ([topic].flat().some(rTopic => matches(rTopic, receivedTopic))) {
          setMessage({
            topic: receivedTopic,
            message:
              parserMethod?.(receivedMessage) || receivedMessage.toString(),
          });
          callback?.(receivedTopic, receivedMessage);
        }
      },
      [parserMethod, topic],
    );

    useEffect(() => {
      client?.on('message', receiveMessage);
      return () => {
        client?.off('message', receiveMessage);
      };
    }, [client]);

    return (
      <MessageContext.Provider value={message}>
        {children}
      </MessageContext.Provider>
    );
  };

function createSubscriptionComponent(MessageReceiver) {
  return function ({
    topic,
    options = {} as IClientSubscribeOptions,
    subscribeCallback,
    messageCallback,
    children,
  }: SubscriptionProps) {
    const { client } = useMqttState();
    useEffect(() => {
      client?.subscribe(topic, options, subscribeCallback);
      return () => {
        client?.unsubscribe(topic, options);
      };
    }, [client, topic, options]);
    return (
      <MessageReceiver topic={topic} callback={messageCallback}>
        {children}
      </MessageReceiver>
    );
  };
}

export default function createSubscription() {
  const MessageContext = createContext({} as IMessage);
  const MessageReceiver = createMessageReceiver(MessageContext);
  const Subscription = createSubscriptionComponent(MessageReceiver);
  return {
    Subscription,
    MessageContext,
  };
}
