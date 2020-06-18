import React from 'react';

import { renderHook } from '@testing-library/react-hooks';

import { useMqttState, Connector } from '../lib';
import { URL, options } from './connection';

let wrapper;

describe('Connector wrapper', () => {
  beforeAll(() => {
    wrapper = ({ children }) => (
      <Connector brokerUrl={URL} options={options}>{children}</Connector>
    );
  });

  it('should connect with mqtt', async () => {
    const { result, waitForNextUpdate, wait } = renderHook(
      () => useMqttState(),
      {
        wrapper,
      },
    );

    await waitForNextUpdate();

    expect(result.current.connectionStatus).toBe('connected');

    result.current.mqtt?.end();

    await wait(() => result.current.mqtt?.connected === false);
  });
});
