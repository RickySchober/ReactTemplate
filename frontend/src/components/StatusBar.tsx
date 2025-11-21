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
    <div className={`w-full flex flex-col items-center gap-2`}>
      {/* Circles & Lines */}
      <div className="flex items-center justify-between w-full max-w-xl">
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
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-white font-bold ${circleColor}`}
              >
                {idx + 1}
              </div>

              {/* Line between circles */}
              {idx < TRADE_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 ${
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
      <div className="flex justify-between w-5/4 max-w-2xl text-xs font-medium">
        {TRADE_STEPS.map((step) => (
          <div
            key={step}
            className={`text-center flex-1 ${
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
        <div className="text-red-600 font-bold mt-1 text-sm">
          TRADE CANCELED
        </div>
      )}
    </div>
  );
};
export default StatusBar;
