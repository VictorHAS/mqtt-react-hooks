import { useContext, useEffect, useCallback, useState } from 'react';

import { IClientSubscribeOptions } from 'mqtt';

import MqttContext from './Context';
import { IMqttContext as Context, IUseSubscription, IMessage } from './types';

export default function useSubscription(
  topic: string | string[],
  options: IClientSubscribeOptions = {} as IClientSubscribeOptions,
): IUseSubscription {
  const { client, connectionStatus, parserMethod } = useContext<Context>(
    MqttContext,
  );
  
  const [message, setMessage] = useState<IMessage | undefined>(undefined)
 
  const subscribe = useCallback(async () => {
    client?.subscribe(topic, options);    
  }, [client, options, topic]);

  useEffect(() => {
    if (client?.connected) {
      subscribe();
      
      const callback = (receivedTopic, message) => {
        if ([topic].flat().includes(receivedTopic)) {
          setMessage({receivedTopic, message: parserMethod?.(message) || message.toString()})
        }
      };
      
      client.on('message', callback);
      
      return () => client.off('message', callback)
    }
    return
  }, [client, subscribe]);

  return {
    client,
    topic,
    message,
    connectionStatus,
  };
}
