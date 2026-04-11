import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useLiveProcessData
 * ------------------
 * Polls your FastAPI endpoint at a configurable interval and returns
 * the latest data along with connection status.
 *
 * Usage:
 *   const { data, status, lastUpdated } = useLiveProcessData<SolidHandlingData>(
 *     "/api/process/solid-handling",
 *     { interval: 2500, fallback: mockData }
 *   );
 *
 * FastAPI endpoint should return JSON matching the data shape.
 * Set VITE_API_BASE_URL in your .env file, e.g.:
 *   VITE_API_BASE_URL=http://localhost:8000
 */

export type FetchStatus = "idle" | "loading" | "live" | "error" | "stale";

interface Options<T> {
  /** Poll interval in ms. Default 2500 */
  interval?: number;
  /** Fallback data to show while loading or on error */
  fallback: T;
  /** Whether to start polling immediately. Default true */
  enabled?: boolean;
  /** Auth token if your FastAPI uses bearer auth */
  authToken?: string;
}

interface Result<T> {
  data: T;
  status: FetchStatus;
  lastUpdated: Date | null;
  error: string | null;
  refetch: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export function useLiveProcessData<T>(
  endpoint: string,
  options: Options<T>
): Result<T> {
  const { interval = 2500, fallback, enabled = true, authToken } = options;

  const [data, setData] = useState<T>(fallback);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      setStatus(prev => prev === "live" ? "live" : "loading");

      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const res = await fetch(`${API_BASE}${endpoint}`, {
        signal: abortRef.current.signal,
        headers,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const json: T = await res.json();
      setData(json);
      setStatus("live");
      setLastUpdated(new Date());
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setStatus("error");
      console.warn(`[useLiveProcessData] ${endpoint}: ${msg}`);
    }
  }, [endpoint, authToken]);

  useEffect(() => {
    if (!enabled) return;

    fetchData();
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchData, interval, enabled]);

  return { data, status, lastUpdated, error, refetch: fetchData };
}

/**
 * useWebSocketProcessData
 * -----------------------
 * For sub-second updates or server-push scenarios.
 * Connect to a FastAPI WebSocket endpoint.
 *
 * FastAPI side:
 *   @app.websocket("/ws/solid-handling")
 *   async def ws_solid(websocket: WebSocket):
 *       await websocket.accept()
 *       while True:
 *           data = get_live_data()
 *           await websocket.send_json(data)
 *           await asyncio.sleep(1)
 */
export function useWebSocketProcessData<T>(
  wsPath: string,
  fallback: T
): Result<T> {
  const [data, setData] = useState<T>(fallback);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const WS_BASE = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000")
    .replace(/^http/, "ws");

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(`${WS_BASE}${wsPath}`);
    wsRef.current = ws;

    ws.onopen = () => setStatus("live");
    ws.onmessage = (e) => {
      try {
        setData(JSON.parse(e.data) as T);
        setLastUpdated(new Date());
        setError(null);
      } catch {
        setError("Parse error");
      }
    };
    ws.onerror = () => { setStatus("error"); setError("WebSocket error"); };
    ws.onclose = () => {
      setStatus("stale");
      // Auto-reconnect after 3s
      setTimeout(connect, 3000);
    };
  }, [wsPath, WS_BASE]);

  useEffect(() => {
    connect();
    return () => { wsRef.current?.close(); };
  }, [connect]);

  return { data, status, lastUpdated, error, refetch: connect };
}