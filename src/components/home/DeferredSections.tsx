"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

const LiveDataSection = dynamic(() => import("./LiveDataSection"));
const PollTrendSection = dynamic(() => import("./PollTrendSection"));
const PartyMapSection = dynamic(() => import("./PartyMapSection"));
const Methodology = dynamic(() => import("./Methodology"));

function DeferredBlock({ id, children, minHeight, eager = false }: { id: string; children: ReactNode; minHeight: number; eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    if (window.location.hash === `#${id}`) {
      setVisible(true);
      return;
    }

    const revealHashTarget = () => {
      if (window.location.hash === `#${id}`) setVisible(true);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "700px 0px" });
    observer.observe(element);
    window.addEventListener("hashchange", revealHashTarget);
    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", revealHashTarget);
    };
  }, [id, visible]);

  return <div id={id} ref={ref} className="scroll-mt-20" style={!visible ? { minHeight } : undefined}>{visible ? children : <div className="mx-auto mt-16 max-w-page px-4 sm:px-6 lg:px-8" aria-hidden="true"><div className="h-28 rounded-2xl border border-line bg-surface/60" /></div>}</div>;
}

export default function DeferredSections() {
  return <>
    <DeferredBlock id="live-data" minHeight={520}><LiveDataSection /></DeferredBlock>
    <DeferredBlock id="trend" minHeight={480} eager><PollTrendSection /></DeferredBlock>
    <DeferredBlock id="history" minHeight={420}><PartyMapSection /></DeferredBlock>
    <DeferredBlock id="methodology" minHeight={360}><Methodology /></DeferredBlock>
  </>;
}
