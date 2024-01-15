import { logDevReady } from "@remix-run/cloudflare";
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

interface Env {
  STAGE: string;
  // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
  WORKER: Fetcher;
}
declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    env: Env;
  }
}

if (process.env.NODE_ENV === "development") {
  logDevReady({ ...build, isSpaMode: false });
}

export const onRequest = createPagesFunctionHandler<Env>({
  build: { ...build, isSpaMode: false },
  getLoadContext: (context) => ({ env: context.env }),
  mode: build.mode,
});
