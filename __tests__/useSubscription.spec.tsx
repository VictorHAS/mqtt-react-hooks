import { cleanup, render, waitFor } from '@testing-library/react';
import type { MqttClient } from 'mqtt';
import { type Mock, afterEach, describe, expect, it } from 'vitest';

import { Connector, useSubscription } from '../lib';

const BROKER_URL = 'ws://mock-broker:8080';
const TOPIC = 'mqtt/react/hooks/test';

describe('useSubscription', () => {
  afterEach(cleanup);

  it('should get message on topic test', async () => {
    let client: MqttClient | null = null;
    let message: string | undefined;

    function TestComp() {
      const sub = useSubscription(TOPIC);
      if (sub.client) {
        client = sub.client;
      }
      message = sub.message?.message as string;
      return null;
    }

    render(
      <Connector brokerUrl={BROKER_URL}>
        <TestComp />
      </Connector>,
    );

    await waitFor(() => expect(client?.connected).toBe(true));

    const msgPayload = 'testing message';
    client!.publish(TOPIC, msgPayload, (err) => {
      expect(err).toBeFalsy();
    });

    await waitFor(() => expect(message).toBe(msgPayload));
  });

  it('should get message on topic with single selection of the path +', async () => {
    let client: MqttClient | null = null;
    let message: string | undefined;

    function TestComp() {
      const sub = useSubscription(`${TOPIC}/+/test/+/selection`);
      if (sub.client) {
        client = sub.client;
      }
      message = sub.message?.message as string;
      return null;
    }

    render(
      <Connector brokerUrl={BROKER_URL}>
        <TestComp />
      </Connector>,
    );

    await waitFor(() => expect(client?.connected).toBe(true));

    const msgPayload = 'testing single selection message';
    client!.publish(`${TOPIC}/match/test/single/selection`, msgPayload);

    await waitFor(() => expect(message).toBe(msgPayload));
  });

  it('should get message on topic with # wildcard', async () => {
    let client: MqttClient | null = null;
    let message: string | undefined;

    function TestComp() {
      const sub = useSubscription(`${TOPIC}/#`);
      if (sub.client) {
        client = sub.client;
      }
      message = sub.message?.message as string;
      return null;
    }

    render(
      <Connector brokerUrl={BROKER_URL}>
        <TestComp />
      </Connector>,
    );

    await waitFor(() => expect(client?.connected).toBe(true));

    const msgPayload = 'testing with # wildcard';
    client!.publish(`${TOPIC}/match/test/wildcard`, msgPayload);

    await waitFor(() => expect(message).toBe(msgPayload));
  });

  it('should manage subscriptions correctly (only subscribe once, unsubscribe on unmount)', async () => {
    let clientInstance: MqttClient | null = null;

    function SubChild() {
      const sub = useSubscription(`${TOPIC}/multi`);
      if (sub.client) clientInstance = sub.client;
      return null;
    }

    function TestApp({ activeSubs }: { activeSubs: number }) {
      return (
        <Connector brokerUrl={BROKER_URL}>
          {activeSubs > 0 && <SubChild />}
          {activeSubs > 1 && <SubChild />}
        </Connector>
      );
    }

    const { rerender } = render(<TestApp activeSubs={2} />);

    await waitFor(() => expect(clientInstance?.connected).toBe(true));

    const subscribeMock = clientInstance!.subscribe as Mock;
    const unsubscribeMock = clientInstance!.unsubscribe as Mock;

    subscribeMock.mockClear();
    unsubscribeMock.mockClear();

    // Rerender with only 1 sub mounted (one SubChild unmounts)
    rerender(<TestApp activeSubs={1} />);

    // One component unmounted, but the other (sub1) is still there. Should NOT have unsubscribed from the broker!
    expect(unsubscribeMock).not.toHaveBeenCalledWith(`${TOPIC}/multi`);

    // Complete unmount (unmounts sub1, but leaves connector active temporarily)
    rerender(<TestApp activeSubs={0} />);

    // Now both have unmounted. Is client.unsubscribe called?
    expect(unsubscribeMock).toHaveBeenCalledWith(`${TOPIC}/multi`);

    // Note: connector still mounted, so unmount the whole thing.
  });
});
