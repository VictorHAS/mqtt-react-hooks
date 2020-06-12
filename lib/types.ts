import { MqttClient } from 'mqtt';

export interface IMqttContext {
  connectionStatus: string;
  mqtt?: MqttClient;
}

export interface IuseSubscription {
  lastMessage: IMessage;
  topic: string;
}

export interface IMessageStructure {
  [key: string]: string;
}

export interface IMessage {
  topic: string;
  message?: string | IMessageStructure;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
