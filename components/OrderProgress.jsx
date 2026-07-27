"use client";

import React from "react";
import {
  ORDER_PROGRESS_STEPS,
  getProgressVisualState,
  resolveOrderProgressStage,
  stageLabel,
} from "../lib/order-progress";

/**
 * @param {object} props
 * @param {object} [props.order] Medusa / Woo order
 * @param {string} [props.stage] override stage
 * @param {string} [props.locale]
 * @param {boolean} [props.compact]
 */
export default function OrderProgress({
  order,
  stage: stageProp,
  locale = "zh-TW",
  compact = false,
}) {
  const stage = stageProp || resolveOrderProgressStage(order || {});
  const { currentIndex, completedThrough, canceled } =
    getProgressVisualState(stage);
  const isZh = !locale || locale.startsWith("zh");

  return (
    <div className={`w-full ${compact ? "py-2" : "py-4"}`}>
      <p
        className={`text-center tracking-widest uppercase text-gray-400 mb-4 ${
          compact ? "text-[9px]" : "text-[10px]"
        }`}
      >
        {canceled
          ? stageLabel("canceled", locale)
          : `${isZh ? "目前進度" : "Status"} · ${stageLabel(stage, locale)}`}
      </p>

      <ol className="flex items-start justify-between w-full max-w-lg mx-auto relative px-1">
        {/* connector line */}
        <div
          className="absolute left-[12%] right-[12%] top-[14px] h-px bg-gray-200 -z-0"
          aria-hidden
        />
        <div
          className="absolute left-[12%] top-[14px] h-px bg-black -z-0 transition-all duration-500"
          style={{
            width: canceled
              ? "0%"
              : `${Math.max(0, (completedThrough / 3) * 76)}%`,
          }}
          aria-hidden
        />

        {ORDER_PROGRESS_STEPS.map((step, index) => {
          const done = !canceled && index <= completedThrough;
          const current = !canceled && index === currentIndex;
          const upcoming = !done && !current;

          return (
            <li
              key={step.key}
              className="flex flex-col items-center flex-1 relative z-[1]"
            >
              <span
                className={`flex items-center justify-center rounded-full border transition-colors duration-300 ${
                  compact ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-[11px]"
                } ${
                  done
                    ? "bg-black border-black text-white"
                    : current
                      ? "bg-white border-black text-black ring-2 ring-black/10"
                      : "bg-white border-gray-200 text-gray-300"
                }`}
              >
                {done ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 6.2L4.8 9L10 3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`mt-2 tracking-widest uppercase text-center ${
                  compact ? "text-[9px]" : "text-[10px]"
                } ${
                  done || current
                    ? "text-black font-semibold"
                    : upcoming
                      ? "text-gray-300"
                      : "text-gray-400"
                }`}
              >
                {isZh ? step.labelZh : step.labelEn}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
