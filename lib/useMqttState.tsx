import { useContext } from 'react';

import MqttContext from './Context';
import { IMqttContext as Context } from './types';

export default function useMqttState() {
  const { connectionStatus, client, parserMethod } = useContext<Context>(
    MqttContext,
  );

  return {
    connectionStatus,
    client,
    parserMethod,
  };
}
