/**
 * @jest-environment jsdom
 */

import React from 'react';

import { renderHook, waitFor } from '@testing-library/react';

import { Connector, useSubscription } from '../lib';
import { URL, options } from './connection';

const TOPIC = 'mqtt/react/hooks/test';

let wrapper;

describe('useSubscription', () => {
  beforeAll(() => {
    wrapper = ({ children }) => (
      <Connector brokerUrl={URL} options={options}>
        {children}
      </Connector>
    );
  });

  it('should get message on topic test', async () => {
    const { result } = renderHook(
      () => useSubscription(TOPIC),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.client?.connected).toBe(true));

    const message = 'testing message';
    result.current.client?.publish(TOPIC, message, (err) => {
      expect(err).toBeFalsy()
    });

    await waitFor(() => expect(result.current?.message?.message).toBe(message));
  });

  it('should get message on topic with single selection of the path + ', async () => {
    const { result } = renderHook(
      () => useSubscription(`${TOPIC}/+/test/+/selection`),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.client?.connected).toBe(true));

    const message = 'testing single selection message';

    result.current.client?.publish(
      `${TOPIC}/match/test/single/selection`,
      message,
    );

    await waitFor(() => expect(result.current.message?.message).toBe(message));
  });

  it('should get message on topic with # wildcard', async () => {
    const { result } = renderHook(
      () => useSubscription(`${TOPIC}/#`),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.client?.connected).toBe(true));

    const message = 'testing with # wildcard';

    result.current.client?.publish(`${TOPIC}/match/test/wildcard`, message);

    await waitFor(() => expect(result.current.message?.message).toBe(message));
  });
});
