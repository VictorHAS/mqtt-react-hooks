import { MqttClient } from 'mqtt';

export interface MqttContext<T> {
  status: string;
  mqtt: MqttClient | undefined;
  messages: Message<T>[];
  lastMessage: Message<T> | undefined;
  addMessage: (message: Message<T>) => void;
}

export interface MessageStructure {
  [key: string]: string;
}

export interface Message<T> {
  topic: string;
  message?: T | MessageStructure;
  id: string;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
