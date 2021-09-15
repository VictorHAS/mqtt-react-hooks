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
        <Connector
          brokerUrl="mqtt://test.mosqu.org:1884"
          options={{ connectTimeout: 2000 }}
        >
          {children}
        </Connector>
      ),
    });

    await waitForValueToChange(() => result.current.connectionStatus);

    expect(result.current.connectionStatus).toBe(
      'getaddrinfo ENOTFOUND test.mosqu.org',
    );

    await waitForValueToChange(() => result.current.connectionStatus);

    expect(result.current.connectionStatus).toBe('Offline');
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
        <Connector
          brokerUrl={URL}
          options={{ clientId: 'testingMqttUsingProps' }}
        >
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
});
