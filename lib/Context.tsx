/* istanbul ignore file */

import { createContext } from 'react';

import { MqttContext } from './types';

export default createContext<MqttContext<any>>({} as MqttContext<any>);
