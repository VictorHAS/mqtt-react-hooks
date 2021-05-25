import { useContext, useEffect, useCallback } from 'react';

import { IClientSubscribeOptions } from 'mqtt';

import MqttContext from './Context';
import { IMqttContext as Context, IUseSubscription } from './types';

export default function useSubscription(
  topic: string | string[],
  options: IClientSubscribeOptions = {} as IClientSubscribeOptions,
): IUseSubscription {
  const { client, connectionStatus } = useContext<Context>(
    MqttContext,
  );
  
  const [message, setMessage] = useState()
 
  const subscribe = useCallback(async () => {
    client?.subscribe(topic, options);    
  }, [client, options, topic]);

  useEffect(() => {
    if (client?.connected) {
      subscribe();
      
      const callback = (receivedTopic, message) => {
        if (receivedTopic === topic) {
          setMessage({topic, message: message.toString()})
        }
      };
      
      client.on('message', callback);
      
      return () => client.off(callback)
    }
  }, [client, subscribe]);

  return {
    client,
    topic,
    message,
    connectionStatus,
  };
}
