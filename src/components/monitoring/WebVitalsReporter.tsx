"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";

const RELEASE = process.env.NEXT_PUBLIC_RELEASE ?? "local";

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify({ ...payload, path: window.location.pathname, release: RELEASE });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/telemetry", new Blob([body], { type: "application/json" }));
  } else {
    void fetch("/api/telemetry", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
  }
}

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (Math.random() > 0.1) return;
    send({ type: "web-vital", name: metric.name, value: metric.value, rating: metric.rating, navigationType: metric.navigationType });
  });

  useEffect(() => {
    const onError = () => send({ type: "client-error", category: "error" });
    const onRejection = () => send({ type: "client-error", category: "unhandled-rejection" });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
