<div align="center">

[![npm](https://img.shields.io/npm/v/mqtt-react-hooks?color=blue)](https://www.npmjs.com/package/mqtt-react-hooks)<space><space>
[![Quality and Build](https://github.com/VictorHAS/mqtt-react-hooks/actions/workflows/publish.yml/badge.svg)](https://github.com/VictorHAS/mqtt-react-hooks/actions/workflows/publish.yml)

</div>

## Overview

This library is focused in help you to connect, publish and subscribe to a Message Queuing Telemetry Transport (MQTT) in ReactJS with the power of React Hooks.

## 🚀 Version 3.0.0 - Major Architecture Rewrite!
Version `3.0.0` introduces a globally scalable **SubscriptionManager multiplexer**.

* **Zero Event Duplication**: Calling `useSubscription` inside multiple nested components no longer spawns duplicate `client.on('message')` listeners. Everything routes perfectly through a single Singleton-Context listener.
* **Intelligent Reference Counting**: The broker only `.subscribe`s over the network on the first mount. When the very last matching hook unmounts, it safely triggers `.unsubscribe()`.
* **Pre-Hydrated Cache**: If a sensor event occurs and a React hook mounts a few seconds later, it instantly loads the *cached payload*.
* **Upgraded Core**: Powered natively by the highly robust latest `mqtt` v5 implementation.

## Installation

Just add `mqtt-react-hooks` and `mqtt` to your project:

```bash
npm add mqtt-react-hooks mqtt
```

### Exported Hooks

- `useMqttState` -> returns `{ connectionStatus, client, message }`
- `useSubscription(topic: string | string[], options?: {} )` -> returns `{ client, topic, message, connectionStatus }`

---

## Usage

Similarly to `react-redux`, you must first wrap your application (or subtree) with a `<Connector>` which will initialize the internal Mqtt Client instance and Subscription Multiplexer.

### Root component

The only required prop is `brokerUrl`. Additional options follow the standard [mqtt.Client#connect](https://github.com/mqttjs/MQTT.js#connect) schema.

```tsx
import React from 'react';
import { Connector } from 'mqtt-react-hooks';
import Status from './Status';

export default function App() {
  return (
    <Connector brokerUrl="wss://test.mosquitto.org:8081/mqtt">
      <Status />
    </Connector>
  );
}
```

### Connection Status

Use `useMqttState` to universally extract the internal connection variables safely without subscribing to topics.

```tsx
import React from 'react';
import { useMqttState } from 'mqtt-react-hooks';

export default function Status() {
  /*
   * Status strings:
   * - Connecting
   * - Connected
   * - Reconnecting
   * - Offline
   * - Error
   */
  const { connectionStatus } = useMqttState();

  return <h1>{`Status: ${connectionStatus}`}</h1>;
}
```

### Subscribing to Overlapping Topics

 Multiple components can subscribe directly to arrays or exact wildcard filters independently without clashing.

```tsx
import React from 'react';
import { useSubscription } from 'mqtt-react-hooks';

export default function RoomGauges() {
  /* Message structure:
   *  topic: string
   *  message: string (or Buffer depending on parser)
   */
  const { message } = useSubscription([
    'room/livingroom/temperature',
    'room/kitchen/temperature',
  ]);

  return (
    <div>
      <span>Latest Update: {message?.topic}</span>
      <h2>{message?.message}°C</h2>
    </div>
  );
}
```

### Publishing Messages

You don't need a topic subscription if you just want to publish! You can use `useMqttState` (or pass an empty array to `useSubscription([])`) to just grab the raw client object:

```tsx
import React from 'react';
import { useSubscription } from 'mqtt-react-hooks';

export default function SwitchButton() {
  const { client } = useSubscription([]);

  function handleClick() {
    client?.publish('room/livingroom/lights', 'OFF');
  }

  return (
    <button type="button" onClick={handleClick}>
      Disable Lights
    </button>
  );
}
```

## Contributing

Thanks for being interested on making this package better. We encourage everyone to help improving this project with some new features, bug fixes and performance issues. Please take a little bit of your time to read our guides, so this process can be faster and easier.

## License

MIT ©
