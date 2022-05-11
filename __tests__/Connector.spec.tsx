/**
 * @jest-environment jsdom
 */

import React from 'react';

import { renderHook, act, waitFor } from '@testing-library/react';

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
    const { result } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <Connector
          brokerUrl="mqtt://test.mosqu.org:1884"
          options={{ connectTimeout: 2000 }}
        >
          {children}
        </Connector>
      ),
    });

    await waitFor(() => expect(result.current.connectionStatus).toBe('Offline'));
  });

  it('should connect with mqtt', async () => {
    const { result } = renderHook(() => useMqttState(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.client?.connected).toBe(true));

    expect(result.current.connectionStatus).toBe('Connected');

    await act(async () => {
      result.current.client?.end();
    });
  });

  it('should connect passing props', async () => {
    const { result } = renderHook(() => useMqttState(), {
      wrapper: ({ children }) => (
        <Connector
          brokerUrl={URL}
          options={{ clientId: 'testingMqttUsingProps' }}
        >
          {children}
        </Connector>
      ),
    });

    await waitFor(() => expect(result.current.client?.connected).toBe(true));

    expect(result.current.connectionStatus).toBe('Connected');

    await act(async () => {
      result.current.client?.end();
    });
  });
});
