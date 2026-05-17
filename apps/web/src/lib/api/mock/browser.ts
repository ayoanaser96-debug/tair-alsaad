import { setupWorker } from "msw/browser";

import { handlers } from "@/lib/api/mock/handlers";

export const worker = setupWorker(...handlers);
