import { MqttClient } from 'mqtt';

export interface IMqttContext {
  connectionStatus: string;
  client?: MqttClient | null;
  message?: IMessage;
}

export interface IUseSubscription {
  topic: string;
  client?: MqttClient | null;
  message?: IMessage;
  connectionStatus: string;
}

export interface IMessageStructure {
  [key: string]: string;
}

export interface IMessage {
  topic: string;
  message?: string | IMessageStructure;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
