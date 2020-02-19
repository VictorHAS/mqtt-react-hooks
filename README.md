<div align="center">

[![npm](https://img.shields.io/npm/v/mqtt-react-hooks?color=blue)](https://www.npmjs.com/package/@unform/core)<space><space>
[![Build Status](https://travis-ci.com/VictorHAS/mqtt-react-hooks.svg?branch=master&color=blue)](https://travis-ci.com/VictorHAS/mqtt-react-hooks)

</div>

## Overview

This library is focused in help you to connect, publish and subscribe to a Message Queuing Telemetry Transport (MQTT) in ReactJS with the power of React Hooks.

## Flow of Data
1. WiFi or other mobile sensors publish data to an MQTT broker
2. ReactJS subscribes to the MQTT broker and receives the data using MQTT.js
3. React's state is updated and the data is passed down to stateless components

## Key features
- React Hooks;
- Beautiful syntax;
- Performance focused;

## Installation

Just add mqtt-react-hooks to your project:

```
yarn add mqtt-react-hooks
```

### Hooks availables

- useMqttState -> return { status, mqtt, allMessages, lastMessage }
- useSubscription(topic) -> return { msgs, mqtt, status, lastMessage, lastMessageOnTopic }

### Usage
Currently, mqtt-react-hooks exports one enhancers.
Similarly to react-redux, you'll have to first wrap a root component with a
```Connector``` which will initialize the mqtt instance.

#### Root component
The only property for the connector is the connection information for [mqtt.Client#connect](https://github.com/mqttjs/MQTT.js#connect)

**Example Root component:**
```js
import React from 'react';

import { Connector } from 'mqtt-react-hooks';
import Status from './Status';

export default function App() {
  return (
    <Connector brokerUrl="mqtt://test.mosquitto.org:8080">
        <Status />
    </Connector>
  );
}
```

**Example Connection Status**
```js
import React from 'react';

import { useMqttState } from 'mqtt-react-hooks';

export default function Status() {

  /*
  * Status list
  * - offline
  * - connected
  * - reconnecting
  * - closed
  */
  const { status } = useMqttState();

  return (
    <h1>{`Status: ${status}`}</h1>
  );
}
```

#### Subscribe
**Example Posting Messages**

MQTT Client is passed on useMqttState and can be used to publish messages via
[mqtt.Client#publish](https://github.com/mqttjs/MQTT.js#publish) and don't need Subscribe

```js
import React from 'react';
import { useMqttState } from 'mqtt-react-hooks';

export default function Status() {
  const { mqtt } = useMqttState();

  function handleClick(message) {
    return mqtt.publish('esp32/led', message);
  }

  return (
    <button type="button" onClick={() => handleClick('false')}>
      Disable led
    </button>
  );
}
```

**Example Subscribing and Receiving messages**
```js
import React from 'react';

import { useSubscription } from 'mqtt-react-hooks';

export default function Status() {

  /* Message structure:
  *  id: auto-generated uuidv4
  *  topic: string
  *  message: string
  */
  const { msgs } = useSubscription('room/esp32/teste');

  return (
    <>
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
```

## Contributing

Thanks for being interested on making this package better. We encourage everyone to help improving this project with some new features, bug fixes and performance issues. Please take a little bit of your time to read our guides, so this process can be faster and easier.

## License

MIT ©
