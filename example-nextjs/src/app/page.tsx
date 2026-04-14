"use client";

import { Connector, useSubscription } from "mqtt-react-hooks";

function MqttApp() {
  const { message } = useSubscription(["devices/+/status"]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Next.js + MQTT v5 Test</h1>
      <div className="bg-slate-100 p-4 rounded text-black">
        <p className="font-semibold">Latest Message:</p>
        <pre>{message ? JSON.stringify(message, null, 2) : "No messages yet"}</pre>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Connector brokerUrl="wss://test.mosquitto.org:8081" options={{ keepalive: 0 }}>
      <MqttApp />
    </Connector>
  );
}
