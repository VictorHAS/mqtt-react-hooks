## [3.0.0](https://github.com/victorHAS/mqtt-react-hooks/compare/v2.0.1...v3.0.0) (2026-04-14)

### Major Architectural Rewrite
* **Centralized Multiplexing ([SubscriptionManager])**: The library now utilizes a core multiplexing `SubscriptionManager` attached to the `Connector`. This means you can mount hundreds of `useSubscription` hooks across your app and it will strictly only allocate *one* single native `client.on('message')` listener under the hood!
* **Broker Bandwidth Tracking**: The library now performs reference counting on active hook topics. Hooking `smarthome/#` will only `.subscribe()` on the broker once. When the last hook unmounts, the library instantly triggers `.unsubscribe()` natively over the network, minimizing remote payload taxes.
* **Initialization Cache Synchronization**: Fixed UI synchronization flickers. If a hook mounts *after* a payload arrived over the network for that topic, the hook will immediately hydrate the cached message instantly instead of endlessly waiting for the next network event.
* **Duplicate Message Throttling**: Fixed underlying MQTT v3/v4 message duplicates generated across the internet by overlapping subscriptions. Duplicate exact payloads firing within `100ms` periods on overlapping overlapping patterns are ignored.
* **Vite & SSR Interop**: Resolved Vite `esm-cjs` named-export transpilation crashes targeting `mqtt.js` explicitly for `mqtt.connect`.

### Core Upgrades
* **mqtt v5**: Upgraded internal runtime module to `mqtt@^5.15.0`.
* **Build tool**: Replaced heavy Rollup chains with lightning-fast `tsup` configuration exporting `cjs`, `esm`, and deterministic `d.ts`.
* **Testing**: Wrote a full, deterministic Test Suite mocking the event-emitter directly into `Vitest` and removing all external `test.mosquitto.org` dependencies for CI testing.

---

## [2.0.1](https://github.com/victorHAS/mqtt-react-hooks/compare/v2.0.0...v2.0.1) (2021-09-05)

### Bug Fixes

* wrong validation in useSubscription ([859fbe5](https://github.com/victorHAS/mqtt-react-hooks/commit/859fbe5f316b8500abb0d59aa84114376ec18978))
