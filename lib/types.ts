import { MqttClient } from 'mqtt';

export interface MqttContext {
  status: string;
  mqtt: MqttClient | undefined;
  messages: Message[];
  addMessage: (message: Message) => void;
}

export interface Message {
  topic: string;
  message?: string | number;
  id: string;
}
