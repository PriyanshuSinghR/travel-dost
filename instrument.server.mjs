import * as Sentry from "@sentry/react-router";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://ed6a573604ddc6112e355f99b86f8d62@o4509574332874752.ingest.us.sentry.io/4509574342836224",

  sendDefaultPii: true,

  _experiments: { enableLogs: true },

  integrations: [nodeProfilingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
