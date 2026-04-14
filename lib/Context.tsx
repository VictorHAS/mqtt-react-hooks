import { createContext } from 'react';

import type { IMqttContext } from './types';

export default createContext<IMqttContext>({} as IMqttContext);
