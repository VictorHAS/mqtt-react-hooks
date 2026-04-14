import { EventEmitter } from 'node:events';
import { vi } from 'vitest';

import type { IClientSubscribeOptions, MqttClient } from 'mqtt';

/**
 * Creates a mock MQTT client that simulates connect/subscribe/publish behavior.
 */
export function createMockMqttClient(): MqttClient {
  const emitter = new EventEmitter();
  let _connected = false;

  const client = Object.assign(emitter, {
    connected: false,
    subscribe: vi.fn(
      (
        _topic: string | string[],
        _opts?: IClientSubscribeOptions | ((...args: any[]) => void),
        callback?: (...args: any[]) => void,
      ) => {
        const cb = typeof _opts === 'function' ? _opts : callback;
        if (cb) cb(null, []);
        return client;
      },
    ),
    unsubscribe: vi.fn((_topic: string | string[], callback?: (...args: any[]) => void) => {
      if (callback) callback();
      return client;
    }),
    publish: vi.fn(
      (topic: string, message: string | Buffer, _opts?: any, callback?: (err?: Error) => void) => {
        const cb = typeof _opts === 'function' ? _opts : callback;
        // Simulate async message delivery
        setTimeout(() => {
          emitter.emit('message', topic, Buffer.from(message.toString()));
        }, 10);
        if (cb) cb(undefined);
        return client;
      },
    ),
    end: vi.fn(
      (force?: boolean | ((...args: any[]) => void), callback?: (...args: any[]) => void) => {
        _connected = false;
        Object.defineProperty(client, 'connected', {
          get: () => _connected,
          configurable: true,
        });
        emitter.emit('end');
        const cb = typeof force === 'function' ? force : callback;
        if (cb) cb();
        return client;
      },
    ),
    reconnect: vi.fn(() => client),
    options: {} as any,
    disconnecting: false,
    disconnected: false,
    reconnecting: false,
    incomingStore: {} as any,
    outgoingStore: {} as any,
    queueQoSZero: true,
  }) as unknown as MqttClient;

  // Simulate async connection
  setTimeout(() => {
    _connected = true;
    Object.defineProperty(client, 'connected', {
      get: () => _connected,
      configurable: true,
    });
    emitter.emit('connect', {});
  }, 50);

  return client;
}

// Mock the mqtt module
vi.mock('mqtt', () => ({
  connect: vi.fn(() => createMockMqttClient()),
}));
