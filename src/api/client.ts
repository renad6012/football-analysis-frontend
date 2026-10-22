import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import { ApiError } from "./errors";
import type { ApiErrorBody } from "../types/backend";

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
});

const reject = (code: ConstructorParameters<typeof ApiError>[0], message: string) =>
  Promise.reject(new ApiError(code, message));

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return reject("timeout", "The request took too long. Please try again.");
    }
    if (!error.response) {
      return reject("network", "Can't reach the server. Check your connection and try again.");
    }

    const { status, data } = error.response;

    if (status === 401) {
      return reject("unauthorized", "Your session has expired. Please sign in again.");
    }
    if (status === 404) {
      return reject(
        "not_found",
        data?.error === "VIDEO_NOT_FOUND"
          ? "We couldn't find the uploaded video. Please upload it again."
          : "We couldn't find this analysis. It may have been removed."
      );
    }
    if (status === 422) {
      return reject(
        "validation",
        data?.message ?? "This video can't be processed. Please try a different file."
      );
    }
    if (status === 400) {
      return reject(
        "validation",
        data?.details?.[0]?.message ?? "Some of the submitted data is invalid."
      );
    }
    if (status >= 500) {
      return reject("server", "Something went wrong on our side. Please try again later.");
    }
    return reject("unknown", "Something went wrong. Please try again.");
  }
);