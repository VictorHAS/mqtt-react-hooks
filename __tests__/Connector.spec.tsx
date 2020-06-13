import React from 'react';

import { renderHook, act } from '@testing-library/react-hooks';

import { useMqttState, Connector } from '../lib';

const URL = 'mqtt://127.0.0.1:1883';

let wrapper;

describe('Connector wrapper', () => {
  beforeAll(() => {
    wrapper = ({ children }) => (
      <Connector brokerUrl={URL}>{children}</Connector>
    );
  });

  it('should not connect with mqtt, wrong url', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <Connector brokerUrl="mqtt://192.168.1.12:1884">{children}</Connector>
      ),
    });

    await waitForNextUpdate();

    expect(result.current.connectionStatus).toBe(
      'connect ECONNREFUSED 192.168.1.12:1884',
    );
    console.log(result.current.connectionStatus);
  });

  it('should connect with mqtt', async () => {
    const { result, wait } = renderHook(() => useMqttState(), {
      wrapper,
    });

    await wait(() => result.current.mqtt?.connected === true);

    expect(result.current.connectionStatus).toBe('connected');

    act(() => {
      result.current.mqtt?.end();
    });

    await wait(() => result.current.mqtt?.connected === false);
    expect(result.current.connectionStatus).toBe('closed');
  });

  it('should connect passing props', async () => {
    const { result, wait } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <Connector brokerUrl={URL} options={{ keepalive: 0 }}>
          {children}
        </Connector>
      ),
    });

    await wait(() => result.current.mqtt?.connected === true);

    expect(result.current.connectionStatus).toBe('connected');

    act(() => {
      result.current.mqtt?.end();
    });

    await wait(() => result.current.mqtt?.connected === false);

    expect(result.current.connectionStatus).toBe('closed');
  });

  it('should get status reconnecting', async () => {
    const { result, wait } = renderHook(() => useMqttState(), {
      wrapper,
    });

    await wait(() => result.current.mqtt?.connected === true);

    act(() => {
      result.current.mqtt?.reconnect();
    });

    expect(result.current.connectionStatus).toBe('reconnecting');

    act(() => {
      result.current.mqtt?.end();
    });

    await wait(() => result.current.mqtt?.connected === false);
    expect(result.current.connectionStatus).toBe('closed');
  });
});
