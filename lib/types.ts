import { MqttClient } from 'mqtt';

export interface MqttContext {
  status: string;
  mqtt: MqttClient | undefined;
}

export interface SubscribeContext {
  messages: Message[] | undefined;
  topic: string;
}

export interface Message {
  topic: string;
  message?: string | number;
  id: string;
}
