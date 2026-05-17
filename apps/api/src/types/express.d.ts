import type { Role } from '@tayralsaad/types';

declare global {
  namespace Express {
    interface Request {
      logger: import('pino').Logger;
      requestId: string;

      log?: import('pino').Logger;
      id?: string | number;

      auth?: {
        userId: string;
        role: Role;
        driverProfileId?: string;
      };
    }
  }
}

export {};
