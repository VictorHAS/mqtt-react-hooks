import { useContext, useEffect, useCallback } from 'react';

import { IClientSubscribeOptions } from 'mqtt';

import MqttContext from './Context';
import { IMqttContext as Context, IUseSubscription } from './types';

export default function useSubscription(
  topic: string | string[],
  options: IClientSubscribeOptions = {} as IClientSubscribeOptions,
): IUseSubscription {
  const { client, connectionStatus, message } = useContext<Context>(
    MqttContext,
  );

  const subscribe = useCallback(async () => {
    client?.subscribe(topic, options);
  }, [client, options, topic]);

  useEffect(() => {
    if (client?.connected) {
      subscribe();
    }
  }, [client, subscribe]);

  return {
    client,
    topic,
    message,
    connectionStatus,
  };
}
