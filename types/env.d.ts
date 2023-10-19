export interface Env {
  AIR_LANE_KV: KVNamespace;
  AIR_LANE_DB: D1Database;
  USERNAME: string;
  PASSWORD: string;
}

declare module "@remix-run/server-runtime" {
  export interface AppLoadContext {
    env: Env,
  }
}
