import type { IClientOptions, MqttClient } from 'mqtt';
import type { SubscriptionManager } from './SubscriptionManager';

export interface MqttError {
  name: string;
  message: string;
  stack?: string;
}

export interface ConnectorProps {
  brokerUrl: string;
  options?: IClientOptions;
  parserMethod?: (message: Buffer) => string;
  children: React.ReactNode;
}

export interface IMqttContext {
  connectionStatus: string | MqttError;
  client: MqttClient | null;
  parserMethod?: (message: Buffer) => string;
  manager?: SubscriptionManager;
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
  connectionStatus: string | MqttError;
}
