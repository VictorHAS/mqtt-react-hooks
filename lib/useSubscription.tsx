import { useState, useContext, useEffect, useCallback } from 'react';

import { IClientSubscribeOptions } from 'mqtt';

import MqttContext from './Context';
import { IMqttContext as Context, IUseSubscription } from './types';

export default function useSubscription(
  topic: string,
  options: IClientSubscribeOptions = {} as IClientSubscribeOptions,
): IUseSubscription {
  const { client, connectionStatus, message } = useContext<Context>(
    MqttContext,
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribe = useCallback(async () => {
    if (connectionStatus === 'Connected') {
      client?.subscribe(topic, options, error => {
        if (error) {
          console.log('Subscribe to topics error', error);
          return;
        }
        setIsSubscribed(true);
      });
    }
  }, [connectionStatus, client, options, topic]);

  useEffect(() => {
    if (client) {
      subscribe();
    }
  }, [client, connectionStatus, subscribe]);

  return {
    client,
    topic,
    isSubscribed,
    message,
    connectionStatus,
  };
}
