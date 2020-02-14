import React from 'react';

import { Connector } from '../../../../lib';
import Status from './Status';
import Copia from './Copia';

export default function Main() {
  return (
    <Connector brokerUrl="mqtt://192.168.0.37:1884">
      <Status />
      <Copia />
    </Connector>
  );
}
