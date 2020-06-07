import { MqttClient } from 'mqtt';
import { SetStateAction, Dispatch } from 'react';

export interface MqttContext {
  status: string;
  mqtt: MqttClient | undefined;
  message: Message;
  setMessage: Dispatch<SetStateAction<Message>>;
}

export interface MessageStructure {
  [key: string]: string;
}

export interface Message {
  topic: string;
  message?: string | MessageStructure;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
