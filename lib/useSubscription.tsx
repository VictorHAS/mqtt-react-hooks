import { useContext, useEffect, useId, useState } from 'react';

import type { IClientSubscribeOptions } from 'mqtt';

import MqttContext from './Context';
import type { IMqttContext as Context, IMessage, IUseSubscription } from './types';

const DEFAULT_OPTIONS: IClientSubscribeOptions = {} as IClientSubscribeOptions;

export default function useSubscription(
  topic: string | string[],
  options: IClientSubscribeOptions = DEFAULT_OPTIONS,
): IUseSubscription {
  const { client, connectionStatus, manager } = useContext<Context>(MqttContext);

  // Provide a fallback ID just in case useId() doesn't work out of the box in some environments
  const subscriberId = useId();

  const [message, setMessage] = useState<IMessage | undefined>(() => {
    // Get immediately matching cached message if rendering later
    return manager?.getLastMessage(topic);
  });

  useEffect(() => {
    if (client?.connected && manager) {
      manager.subscribe(subscriberId, topic, options, (receivedMessage) => {
        setMessage(receivedMessage);
      });
    }

    return () => {
      if (manager) {
        manager.unsubscribe(subscriberId);
      }
    };
  }, [client, topic, options, subscriberId, manager]);

  return {
    client,
    topic,
    message,
    connectionStatus,
  };
}
