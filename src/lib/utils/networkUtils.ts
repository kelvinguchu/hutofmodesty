export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
  timeout?: number;
}

export interface NetworkError extends Error {
  status?: number;
  isNetworkError?: boolean;
  isRetryable?: boolean;
  code?: string;
}

const defaultRetryCondition = (error: any): boolean => {
  if (error.isNetworkError) return true;
  if (error.status >= 500 && error.status < 600) return true;
  if (error.status === 408) return true;
  if (error.status === 429) return true;
  if (error.name === "AbortError") return true;
  if (error.code === "ECONNRESET") return true;
  return false;
};

const calculateDelay = (
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffFactor: number
): number => {
  const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, maxDelay);
};

export const isOnline = (): boolean => {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
};

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition,
    timeout = 30000,
  } = retryOptions;

  let lastError: NetworkError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (!isOnline()) {
        const error = new Error("No internet connection") as NetworkError;
        error.isNetworkError = true;
        error.isRetryable = true;
        throw error;
      }

      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(timeout),
      });

      if (response.ok) {
        return response;
      }

      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`
      ) as NetworkError;
      error.status = response.status;
      error.isRetryable = retryCondition(error);

      if (attempt === maxRetries || !error.isRetryable) {
        throw error;
      }

      lastError = error;
    } catch (error: any) {
      if (
        error.name === "TypeError" ||
        error.name === "AbortError" ||
        error.message.includes("fetch") ||
        error.code === "ECONNRESET"
      ) {
        const networkError = new Error(error.message) as NetworkError;
        networkError.isNetworkError = true;
        networkError.isRetryable = true;
        networkError.code = error.code;
        lastError = networkError;
      } else {
        lastError = error as NetworkError;
      }

      if (attempt === maxRetries || !retryCondition(lastError)) {
        throw lastError;
      }
    }

    if (attempt < maxRetries) {
      const delay = calculateDelay(attempt, baseDelay, maxDelay, backoffFactor);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export async function apiCall<T = any>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(
    url,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    },
    retryOptions
  );

  if (!response.ok) {
    const error = new Error(
      `API call failed: ${response.status} ${response.statusText}`
    ) as NetworkError;
    error.status = response.status;
    throw error;
  }

  return response.json();
}

class OfflineQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  add(operation: () => Promise<any>) {
    this.queue.push(operation);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0 && isOnline()) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          if ((error as NetworkError).isRetryable) {
            this.queue.unshift(operation);
            break;
          }
        }
      }
    }

    this.isProcessing = false;
  }

  onOnline() {
    this.processQueue();
  }
}

export const offlineQueue = new OfflineQueue();

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    offlineQueue.onOnline();
  });
}
