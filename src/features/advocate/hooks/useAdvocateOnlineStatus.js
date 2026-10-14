import { useCallback, useEffect, useRef, useState } from "react";
import {
  sendAdvocateHeartbeat,
  updateAdvocateOnlineStatus,
} from "../services/advocateApi";

const HEARTBEAT_INTERVAL_MS = 45_000;

const extractData = (response) =>
  response?.data?.data ?? response?.data ?? response ?? {};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export default function useAdvocateOnlineStatus({
  enabled = true,
  initialIsOnline = true,
  initialLastSeenAt = null,
} = {}) {
  const [isOnline, setIsOnline] = useState(Boolean(initialIsOnline));
  const [lastSeenAt, setLastSeenAt] = useState(initialLastSeenAt || null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [heartbeatError, setHeartbeatError] = useState("");

  const mountedRef = useRef(true);
  const isOnlineRef = useRef(Boolean(initialIsOnline));
  const heartbeatInFlightRef = useRef(false);
  const statusLoadingRef = useRef(false);

  const syncStatus = useCallback((data) => {
    if (!mountedRef.current || !data) return;

    if (typeof data.isOnline === "boolean") {
      isOnlineRef.current = data.isOnline;
      setIsOnline(data.isOnline);
    }

    if (data.lastSeenAt !== undefined) {
      setLastSeenAt(data.lastSeenAt || null);
    }
  }, []);

  const sendHeartbeat = useCallback(async () => {
    if (
      !enabled ||
      !isOnlineRef.current ||
      heartbeatInFlightRef.current
    ) {
      return;
    }

    heartbeatInFlightRef.current = true;

    try {
      const response = await sendAdvocateHeartbeat();

      if (
        response?.success === false ||
        response?.data?.success === false
      ) {
        throw new Error(
          response?.message ||
            response?.data?.message ||
            "Unable to refresh online status.",
        );
      }

      syncStatus(extractData(response));

      if (mountedRef.current) {
        setHeartbeatError("");
      }
    } catch (error) {
      if (mountedRef.current) {
        setHeartbeatError(
          getErrorMessage(
            error,
            "Unable to refresh online status.",
          ),
        );
      }
    } finally {
      heartbeatInFlightRef.current = false;
    }
  }, [enabled, syncStatus]);

  const changeOnlineStatus = useCallback(async (nextStatus) => {
    if (
      typeof nextStatus !== "boolean" ||
      statusLoadingRef.current
    ) {
      return false;
    }

    statusLoadingRef.current = true;

    if (mountedRef.current) {
      setStatusLoading(true);
      setHeartbeatError("");
    }

    try {
      const response = await updateAdvocateOnlineStatus(nextStatus);

      if (
        response?.success === false ||
        response?.data?.success === false
      ) {
        throw new Error(
          response?.message ||
            response?.data?.message ||
            "Unable to update online status.",
        );
      }

      const data = extractData(response);

      isOnlineRef.current = nextStatus;

      if (mountedRef.current) {
        setIsOnline(nextStatus);

        if (data.lastSeenAt !== undefined) {
          setLastSeenAt(data.lastSeenAt || null);
        }
      }

      return true;
    } catch (error) {
      if (mountedRef.current) {
        setHeartbeatError(
          getErrorMessage(
            error,
            "Unable to update online status.",
          ),
        );
      }

      return false;
    } finally {
      statusLoadingRef.current = false;

      if (mountedRef.current) {
        setStatusLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    if (!enabled || !isOnline) {
      return undefined;
    }

    // Refresh lastSeenAt immediately.
    sendHeartbeat();

    const intervalId = window.setInterval(
      sendHeartbeat,
      HEARTBEAT_INTERVAL_MS,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, isOnline, sendHeartbeat]);

  return {
    isOnline,
    lastSeenAt,
    statusLoading,
    heartbeatError,
    changeOnlineStatus,
    sendHeartbeat,
  };
}