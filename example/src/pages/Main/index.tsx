import React from 'react';

import { Connector, Subscribe } from '../../../../lib';
import Status from './Status';

export default function Main() {
  return (
    <Connector brokerUrl="mqtt://192.168.0.37:1884">
      <Subscribe topic="light/esp32/+">
        <Status />
      </Subscribe>
    </Connector>
  );
}
