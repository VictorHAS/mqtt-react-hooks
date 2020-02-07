import React from 'react';

import { Connector, Subscribe } from '../../../../lib';
import Status from './Status';

export default function Main() {
  return (
    <Connector brokerUrl="mqtt://test.mosquitto.org:8080">
      <Subscribe topic="#">
        <Status />
      </Subscribe>
    </Connector>
  );
}
