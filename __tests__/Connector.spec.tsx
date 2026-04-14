import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { Connector, useMqttState } from '../lib';

const BROKER_URL = 'ws://mock-broker:8080';

let wrapper: React.FC<{ children: React.ReactNode }>;

describe('Connector wrapper', () => {
  beforeAll(() => {
    wrapper = ({ children }) => <Connector brokerUrl={BROKER_URL}>{children}</Connector>;
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
        <Connector brokerUrl={BROKER_URL} options={{ clientId: 'testingMqttUsingProps' }}>
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
