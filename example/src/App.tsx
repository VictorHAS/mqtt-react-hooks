import { useState, useCallback, useEffect } from 'react';
import { Connector, useSubscription, useMqttState } from 'mqtt-react-hooks';
import './index.css';

const TEST_BROKER = 'wss://test.mosquitto.org:8081/mqtt';

// ------------- HEADER STATUS -------------
function Header() {
  const { connectionStatus } = useMqttState();
  const isConnected = connectionStatus === 'Connected';
  const color = isConnected ? '#4ade80' : '#fb923c';

  return (
    <div className="header">
      <h1 className="gradient-text">Smart Environment Demo</h1>
      <p style={{ color: '#94a3b8', margin: 0 }}>mqtt-react-hooks live demonstration</p>

      <div className="status-badge" style={{ borderColor: color }}>
        <div className={`dot ${isConnected ? 'pulsing' : ''}`} style={{ background: color }} />
        <span style={{ color }}>{String(connectionStatus)}</span>
      </div>
    </div>
  );
}

// ------------- DEVICE SENSOR MULTIPLEXER -------------
function SensorDisplay({ room }: { room: string }) {
  const topic = `smarthome/${room}/temperature`;
  const { message } = useSubscription(topic);

  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
      <div className="label">{room}</div>
      <div className="value-display">
        {message ? `${Number(message.message).toFixed(1)}°` : '--°'}
      </div>
    </div>
  );
}

function IoTDashboard() {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <span className="label">Strict Subscriptions</span>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
        Subscribes to specific rooms. Multiplexed efficiently by the central SubscriptionManager.
      </p>
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <SensorDisplay room="living-room" />
        <SensorDisplay room="kitchen" />
      </div>
    </div>
  );
}

// ------------- BROADCASTER -------------
function ControlPanel() {
  const { client } = useSubscription([]); // Empty sub just to grab the client
  const [autoSimulate, setAutoSimulate] = useState(false);

  const publishRandomData = useCallback(() => {
    if (!client) return;
    const rooms = ['living-room', 'kitchen', 'bedroom'];
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
    const randomTemp = (20 + Math.random() * 10).toFixed(2);
    client.publish(`smarthome/${randomRoom}/temperature`, randomTemp);
    client.publish(`smarthome/system/logs`, `Updated ${randomRoom} to ${randomTemp}°C`);
  }, [client]);

  useEffect(() => {
    if (!autoSimulate) return;
    const interval = setInterval(publishRandomData, 1500);
    return () => clearInterval(interval);
  }, [autoSimulate, publishRandomData]);

  return (
    <div className="card" style={{ background: 'linear-gradient(to bottom right, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))' }}>
      <h2>Control Panel</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
        Publish mock sensor data to the MQTT broker.
      </p>
      <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
        <button onClick={publishRandomData} style={{ flex: 1 }}>
          Broadcast Data
        </button>
        <button
          className={autoSimulate ? 'danger' : 'outline'}
          onClick={() => setAutoSimulate(!autoSimulate)}
          style={{ flex: 1 }}
        >
          {autoSimulate ? 'Stop Auto' : 'Start Auto'}
        </button>
      </div>
    </div>
  );
}

// ------------- WILDCARD LOGGER -------------
function SystemLogger() {
  const { message } = useSubscription('smarthome/#');
  const [logs, setLogs] = useState<{ topic: string; payload: string; time: string }[]>([]);

  useEffect(() => {
    if (message) {
      setLogs(prev => [
        { topic: message.topic, payload: message.message as string, time: new Date().toLocaleTimeString() },
        ...prev
      ].slice(0, 30));
    }
  }, [message]);

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Wildcard Traffic Logger</h2>
        <span className="label">Topic: smarthome/#</span>
      </div>
      <div className="log-box">
        {logs.length === 0 && <span style={{ color: '#64748b' }}>Awaiting traffic on smarthome/#...</span>}
        {logs.map((log, i) => (
          <div key={i} className="log-entry">
            <span style={{ color: '#94a3b8', marginRight: '10px' }}>[{log.time}]</span>
            <span style={{ color: '#a855f7', fontWeight: 600 }}>{log.topic}</span>
            <span style={{ color: '#e2e8f0', marginLeft: '12px' }}>{log.payload}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------- LATE MOUNTER DEMONSTRATION -------------
function CacheDemonstrator() {
  const [mounted, setMounted] = useState(false);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Initialization Cache</h2>
        <span className="label">Late Mounting</span>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
        Even if this mounts <i>after</i> data was published, it immediately synchronizes with the SubscriptionManager's cache.
      </p>

      {!mounted ? (
        <button onClick={() => setMounted(true)} style={{ marginTop: 'auto' }}>
          Mount Component
        </button>
      ) : (
        <>
          <LateMountedSensor />
          <button className="outline" onClick={() => setMounted(false)} style={{ marginTop: '12px' }}>
            Unmount Component
          </button>
        </>
      )}
    </div>
  );
}

function LateMountedSensor() {
  const { message } = useSubscription('smarthome/+/temperature');

  return (
    <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>CACHED / LIVE READING</div>
        <div style={{ color: '#e2e8f0', fontSize: '0.9rem', wordBreak: 'break-all' }}>{message ? message.topic : 'No cache matched'}</div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
        {message ? `${Number(message.message).toFixed(1)}°` : '--'}
      </div>
    </div>
  );
}


// ------------- MULTI-SUBSCRIPTION ARRAY DEMONSTRATOR -------------
function MultiSubscriptionDemo() {
  const { message } = useSubscription(['smarthome/kitchen/temperature', 'smarthome/bedroom/temperature']);
  const [kitchenTemp, setKitchenTemp] = useState<string | null>(null);
  const [bedroomTemp, setBedroomTemp] = useState<string | null>(null);

  useEffect(() => {
    if (message?.topic === 'smarthome/kitchen/temperature') {
      setKitchenTemp(String(message.message));
    } else if (message?.topic === 'smarthome/bedroom/temperature') {
      setBedroomTemp(String(message.message));
    }
  }, [message]);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Topic Array Matcher</h2>
        <span className="label">Multiple String Sub</span>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
        Since `useSubscription` returns the <i>latest</i> matching message, track both independently inside a `useEffect`. Or, simply call the hook twice!
      </p>

      <div style={{ padding: '8px', marginTop: '12px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid #ec4899', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid rgba(236, 72, 153, 0.2)'}}>
          <div style={{ color: '#ec4899', fontWeight: 600, fontSize: '0.85rem' }}>KITCHEN</div>
          <div style={{ fontWeight: 800, color: '#ec4899' }}>{kitchenTemp ? `${Number(kitchenTemp).toFixed(1)}°` : '--°'}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px'}}>
          <div style={{ color: '#ec4899', fontWeight: 600, fontSize: '0.85rem' }}>BEDROOM</div>
          <div style={{ fontWeight: 800, color: '#ec4899' }}>{bedroomTemp ? `${Number(bedroomTemp).toFixed(1)}°` : '--°'}</div>
        </div>

      </div>
    </div>
  );
}


function App() {
  return (
    <Connector brokerUrl={TEST_BROKER}>
      <Header />
      <div className="grid">
        <ControlPanel />
        <IoTDashboard />
        <CacheDemonstrator />
        <MultiSubscriptionDemo />
        <SystemLogger />
      </div>
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        Connected securely via WebSocket to {TEST_BROKER}
      </div>
    </Connector>
  );
}

export default App;
