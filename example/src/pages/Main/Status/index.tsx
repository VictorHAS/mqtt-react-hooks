import React from 'react';

import { useSubscription } from '../../../../../lib';

type Data = {
  temp: number;
  name: string;
  humidity: number;
  pressure: number;
  windspeed: number;
  winddirection: string;
};

export default function Status() {
  const {
    msgs,
    status,
    mqtt,
    lastMessage,
    lastMessageOnTopic,
    topic,
  } = useSubscription<Data>('light/+/rele1');

  function handleClick(message: string) {
    mqtt?.publish('light/esp32/rele1', message);
  }

  return (
    <>
      <span>
        {`last message on mqtt: `}
        <strong>{JSON.stringify(lastMessage?.message)}</strong> topic:
        <strong> {lastMessage?.topic}</strong>
      </span>
      <h1>{`Status: ${status}; Host: ${mqtt?.options.host}; Protocol: ${mqtt?.options.protocol}; Topic: ${topic} `}</h1>
      <h2>{`last message on topic ${topic}: ${JSON.stringify(
        lastMessageOnTopic?.message
      )}`}</h2>
      <div style={{ display: 'flex' }}>
        <button type="button" onClick={() => handleClick('enable')}>
          Disable led
        </button>
        <button type="button" onClick={() => handleClick('disable')}>
          Enable led
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {msgs?.map(message => (
          <span key={message.id}>
            {`topic:${message.topic} - message: ${JSON.stringify(
              message.message
            )}`}
          </span>
        ))}
      </div>
    </>
  );
}
