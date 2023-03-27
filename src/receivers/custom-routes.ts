import { ServerResponse } from 'http';
import { CustomRouteInitializationError } from '../errors';
import { ParamsIncomingMessage } from './ParamsIncomingMessage';

export interface CustomRoute {
  path: string;
  method: string | string[];
  handler: (req: ParamsIncomingMessage, res: ServerResponse) => void;
}

export interface ReceiverRoutes {
  [url: string]: {
    [method: string]: (req: ParamsIncomingMessage, res: ServerResponse) => void;
  };
}

export function buildReceiverRoutes(customRoutes: CustomRoute[]): ReceiverRoutes {
  const routes: ReceiverRoutes = {};

  validateCustomRoutes(customRoutes);

  customRoutes.forEach((r) => {
    const methodObj = Array.isArray(r.method) ?
      r.method.reduce((o, key) => ({ ...o, [key.toUpperCase()]: r.handler }), {}) :
      { [r.method.toUpperCase()]: r.handler };
    routes[r.path] = routes[r.path] ? { ...routes[r.path], ...methodObj } : methodObj;
  });

  return routes;
}

function validateCustomRoutes(customRoutes: CustomRoute[]): void {
  const requiredKeys: (keyof CustomRoute)[] = ['path', 'method', 'handler'];
  const missingKeys: (keyof CustomRoute)[] = [];

  // Check for missing required keys
  customRoutes.forEach((route) => {
    requiredKeys.forEach((key) => {
      if (route[key] === undefined && !missingKeys.includes(key)) {
        missingKeys.push(key);
      }
    });
  });

  if (missingKeys.length > 0) {
    const errorMsg = `One or more routes in customRoutes are missing required keys: ${missingKeys.join(', ')}`;
    throw new CustomRouteInitializationError(errorMsg);
  }
}
