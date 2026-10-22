import { env } from "../config/env";
import { mockApi } from "./mock";
import { realApi } from "./real";

export const api = env.useMock ? mockApi : realApi;
export const isMockMode = env.useMock;