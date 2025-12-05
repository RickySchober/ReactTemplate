/* Simple component to display trade status as a progress bar.
 */
import * as React from "react";
import { TradeStatus } from "../../types";

export const TRADE_STEPS: TradeStatus[] = [
  TradeStatus.PENDING,
  TradeStatus.PROPOSE,
  TradeStatus.SHIP,
  TradeStatus.RECEIVE,
  TradeStatus.COMPLETED,
];
export function getStatusIndex(status: TradeStatus): number {
  return TRADE_STEPS.indexOf(status);
}
interface Props {
  status: TradeStatus;
}
const StatusBar: React.FC<Props> = ({ status }) => {
  const currentIndex = getStatusIndex(status);

  const isCanceled = status === TradeStatus.CANCELED;

  return (
    <div className={`flex w-full flex-col items-center gap-2`}>
      {/* Circles & Lines */}
      <div className="flex w-full max-w-xl items-center justify-between">
        {TRADE_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          const circleColor = isCanceled
            ? "bg-red-500 border-red-700"
            : isCompleted
              ? "bg-green-500 border-green-700"
              : isCurrent
                ? "bg-blue-500 border-blue-700"
                : "bg-gray-200 border-gray-400";

          return (
            <React.Fragment key={step}>
              {/* Circle */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border font-bold text-white ${circleColor}`}
              >
                {idx + 1}
              </div>

              {/* Line between circles */}
              {idx < TRADE_STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 ${
                    isCanceled
                      ? "bg-red-300"
                      : idx < currentIndex
                        ? "bg-green-400"
                        : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Labels */}
      <div className="w-5/4 flex max-w-2xl justify-between text-xs font-medium">
        {TRADE_STEPS.map((step) => (
          <div
            key={step}
            className={`flex-1 text-center ${
              isCanceled
                ? "text-red-600"
                : step === status
                  ? "text-blue-600"
                  : "text-gray-600"
            }`}
          >
            {step.toUpperCase()}
          </div>
        ))}
      </div>

      {isCanceled && (
        <div className="mt-1 text-sm font-bold text-red-600">
          TRADE CANCELED
        </div>
      )}
    </div>
  );
};
export default StatusBar;
