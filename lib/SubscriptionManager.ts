import type { IClientSubscribeOptions, MqttClient } from 'mqtt';
import { matches } from 'mqtt-pattern';

import type { IMessage } from './types';

type ParserMethod = (message: Buffer) => string;

interface Subscription {
  topic: string | string[];
  options: IClientSubscribeOptions;
  callback: (message: IMessage) => void;
}

export class SubscriptionManager {
  private client: MqttClient | null = null;
  private parserMethod?: ParserMethod;

  // Maps a unique subscriber ID to their subscription details
  private subscriptions = new Map<string, Subscription>();

  // Tracks how many subscribers requested a specific topic string (to know when to mqtt subscribe/unsubscribe)
  private activeTopics = new Map<string, number>();

  // Caches the latest IMessage by the actual received topic
  private messageCache = new Map<string, IMessage>();

  public setClient(client: MqttClient | null) {
    if (this.client) {
      this.client.removeAllListeners('message');
    }
    this.client = client;

    if (this.client) {
      this.client.on('message', this.handleMessage.bind(this));

      // Resubscribe to active topics if reconnecting or setting a new client
      for (const topic of this.activeTopics.keys()) {
        this.client.subscribe(topic);
      }
    }
  }

  public setParserMethod(parserMethod?: ParserMethod) {
    this.parserMethod = parserMethod;
  }

  private lastMessageTimestamp = 0;
  private lastMessageId = '';

  private handleMessage(receivedTopic: string, receivedMessage: Buffer) {
    const payloadBufferString = receivedMessage.toString();
    const now = Date.now();

    // Deduplicate identical physical messages sent back-to-back by the broker
    // due to overlapping wildcard subscriptions (MQTT V3/V4 behavior)
    const msgId = `${receivedTopic}:${payloadBufferString}`;
    if (this.lastMessageId === msgId && now - this.lastMessageTimestamp < 100) {
      return;
    }

    this.lastMessageId = msgId;
    this.lastMessageTimestamp = now;

    const payload = this.parserMethod ? this.parserMethod(receivedMessage) : payloadBufferString;
    const message: IMessage = { topic: receivedTopic, message: payload };

    // Update cache (delete first to update iteration order so latest is always at the end)
    this.messageCache.delete(receivedTopic);
    this.messageCache.set(receivedTopic, message);

    // Notify matching subscribers
    for (const sub of this.subscriptions.values()) {
      if ([sub.topic].flat().some((rTopic) => matches(rTopic, receivedTopic))) {
        sub.callback(message);
      }
    }
  }

  public subscribe(
    subscriberId: string,
    topic: string | string[],
    options: IClientSubscribeOptions,
    callback: (message: IMessage) => void,
  ) {
    this.subscriptions.set(subscriberId, { topic, options, callback });

    const topicsToSubscribe = [topic].flat();
    for (const t of topicsToSubscribe) {
      const count = this.activeTopics.get(t) || 0;
      if (count === 0 && this.client?.connected) {
        this.client.subscribe(t, options);
      }
      this.activeTopics.set(t, count + 1);
    }
  }

  public unsubscribe(subscriberId: string) {
    const sub = this.subscriptions.get(subscriberId);
    if (!sub) return;

    const topicsToUnsubscribe = [sub.topic].flat();
    for (const t of topicsToUnsubscribe) {
      const count = (this.activeTopics.get(t) || 1) - 1;
      if (count === 0) {
        this.activeTopics.delete(t);
        if (this.client?.connected) {
          this.client.unsubscribe(t);
        }
      } else {
        this.activeTopics.set(t, count);
      }
    }

    this.subscriptions.delete(subscriberId);
  }

  public getLastMessage(topic: string | string[]): IMessage | undefined {
    // Iterate from newest to oldest
    const messages = Array.from(this.messageCache.values());
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if ([topic].flat().some((rTopic) => matches(rTopic, msg.topic))) {
        return msg;
      }
    }
    return undefined;
  }
}
