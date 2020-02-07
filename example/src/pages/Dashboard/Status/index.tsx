/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { useMqttState, useSubscribeState } from '../../../../../lib';

export default function Status() {
  const { status, mqtt } = useMqttState();
  const { messages, topic } = useSubscribeState();

  return (
    <>
      <h1>{`Status: ${status}; Host: ${mqtt?.options.host}; Protocol: ${mqtt?.options.protocol}; Topic: ${topic}`}</h1>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {messages?.map(message => (
          <span key={message.id}>
            {`topic:${message.topic} - message: ${message.message}`}
          </span>
        ))}
      </div>
    </>
  );
}
