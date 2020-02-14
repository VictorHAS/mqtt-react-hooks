import React from 'react';

import { useSubscription } from '../../../../../lib';

export default function Status() {
  const { msgs, status, mqtt } = useSubscription('light/esp33/rele1');

  function handleClick(message: string) {
    return mqtt?.publish('light/esp33/rele1', message);
  }

  return (
    <>
      <h1>{`Status: ${status}; Host: ${mqtt?.options.host}; Protocol: ${mqtt?.options.protocol}; Topic: light/esp33/rele1`}</h1>
      <div style={{ display: 'flex' }}>
        <button type="button" onClick={() => handleClick('v')}>
          Disable led
        </button>
        <button type="button" onClick={() => handleClick('f')}>
          Enable led
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {msgs?.map(message => (
          <span key={message.id}>
            {`topic:${message.topic} - message: ${message.message}`}
          </span>
        ))}
      </div>
    </>
  );
}
