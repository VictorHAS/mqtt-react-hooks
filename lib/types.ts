import React from 'react';

import {
  MqttClient,
  IClientOptions,
  IClientSubscribeOptions,
  ClientSubscribeCallback,
  OnMessageCallback,
} from 'mqtt';

export interface Error {
  name: string;
  message: string;
  stack?: string;
}

export interface ConnectorProps {
  brokerUrl: string;
  options?: IClientOptions;
  parserMethod?: (message) => string;
  children: React.ReactNode;
}

export interface SubscriptionProps {
  topic: string | string[];
  client?: MqttClient | null;
  options: IClientSubscribeOptions;
  subscribeCallback?: ClientSubscribeCallback;
  messageCallback?: OnMessageCallback;
  children: React.ReactNode | React.ReactNode[];
}

export interface IMqttContext {
  connectionStatus: string | Error;
  client?: MqttClient | null;
  parserMethod?: (message: any) => string;
}

export interface IMessageStructure {
  [key: string]: string;
}

export interface IMessage {
  topic: string;
  message?: string | IMessageStructure;
}

export interface IUseSubscription {
  topic: string | string[];
  client?: MqttClient | null;
  message?: IMessage;
  connectionStatus: string | Error;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
