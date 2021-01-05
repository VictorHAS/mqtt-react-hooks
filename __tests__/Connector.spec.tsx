import React from 'react';

import { renderHook, act } from '@testing-library/react-hooks';

import { useMqttState, Connector } from '../lib';
import { URL, options } from './connection';

let wrapper;

describe('Connector wrapper', () => {
  beforeAll(() => {
    wrapper = ({ children }) => (
      <Connector brokerUrl={URL} options={options}>
        {children}
      </Connector>
    );
  });

  it('should not connect with mqtt, wrong url', async () => {
    const { result, waitForValueToChange } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <Connector brokerUrl="mqtt://192.168.1.12:1884">{children}</Connector>
      ),
    });

    await waitForValueToChange(() => result.current.connectionStatus);

    return expect(result.current.connectionStatus).toBe('Reconnecting');
  });

  it('should connect with mqtt', async () => {
    const { result, wait } = renderHook(() => useMqttState(), {
      wrapper,
    });

    await wait(() => result.current.client?.connected === true);

    expect(result.current.connectionStatus).toBe('Connected');

    await act(async () => {
      await result.current.client?.end();
    });
  });

  it('should connect passing props', async () => {
    const { result, wait } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <Connector brokerUrl={URL} options={{ keepalive: 0 }}>
          {children}
        </Connector>
      ),
    });

    await wait(() => result.current.client?.connected === true);

    expect(result.current.connectionStatus).toBe('Connected');

    await act(async () => {
      await result.current.client?.end();
    });
  });

  // it('should get status reconnecting', async () => {
  //   const { result, wait } = renderHook(() => useMqttState(), {
  //     wrapper,
  //   });

  //   await wait(() => result.current.mqtt?.connected === true);

  //   act(() => {
  //     result.current.mqtt?.reconnect();
  //   });

  //   expect(result.current.connectionStatus).toBe('reconnecting');

  //   jest.setTimeout(1000);
  //   expect(result.current.connectionStatus).toBe('connected');

  //   await act(async () => {
  //     await result.current.mqtt?.end();
  //   });
  // });
});
