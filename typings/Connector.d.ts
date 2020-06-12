import { IClientOptions } from 'mqtt';
import React from 'react';
interface Props {
    brokerUrl?: string | object;
    options?: IClientOptions | undefined;
    children: React.ReactNode;
}
export default function Connector({ children, brokerUrl, options, }: Props): JSX.Element;
export {};
//# sourceMappingURL=Connector.d.ts.map