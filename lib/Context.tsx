/* istanbul ignore file */

import { createContext } from 'react';

import { IMqttContext } from './types';

export default createContext<IMqttContext>({} as IMqttContext);
