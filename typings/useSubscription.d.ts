import { IClientSubscribeOptions } from 'mqtt';
import { IMessage } from './types';
export default function useSubscription(topic: string, options?: IClientSubscribeOptions): {
    mqtt: import("mqtt").Client | undefined;
    topic: string;
    lastMessage: IMessage | undefined;
};
//# sourceMappingURL=useSubscription.d.ts.map