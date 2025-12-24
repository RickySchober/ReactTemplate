import React from "react";

import Button from "./Button.js";

import { useLocalStorageState } from "@/lib/hooks.js";
interface TutorialPage {
  image: string;
  title: string;
  body: string;
}

interface MultiTutorialPopupProps {
  pages: TutorialPage[];
  keyName: string;
}

const MultiTutorialPopup: React.FC<MultiTutorialPopupProps> = ({ pages, keyName }) => {
  const [index, setIndex] = React.useState(0);
  const [disableTutor, setDisableTutor] = useLocalStorageState(keyName);
  const [showTutor, setShowTutor] = React.useState<boolean>(!disableTutor);
  const isLast = index === pages.length - 1;
  const isFirst = index === 0;

  const page = pages[index];

  return (
    showTutor && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="relative w-[65%] rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="pb-2 text-4xl font-bold text-blue-300">{page.title}</h2>
          {page.image && (
            <img src={page.image} className="mb-4 w-full rounded-md border border-slate-700" />
          )}
          <p className="mb-2 text-xl font-semibold leading-relaxed text-slate-200">{page.body}</p>

          <div className="mt-2 flex justify-between">
            <Button
              disabled={isFirst}
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              className={
                !isFirst
                  ? "bg-gray-500 hover:bg-gray-600"
                  : "bg-transparent text-transparent hover:bg-transparent"
              }
            >
              Back
            </Button>
            {/* PAGE DOTS */}
            <div className="my-3 flex justify-center gap-2">
              {pages.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition ${
                    i === index ? "bg-blue-400" : "bg-slate-600"
                  }`}
                />
              ))}
            </div>
            <Button
              onClick={() => {
                if (isLast) setShowTutor(false);
                else setIndex((i) => i + 1);
              }}
            >
              {isLast ? "Finish" : "Next"}
            </Button>
          </div>
          <Button
            onClick={() => {
              setDisableTutor(true);
              setShowTutor(false);
            }}
            className="mt-2 w-full bg-transparent text-center text-gray-400 underline hover:bg-transparent"
          >
            Don’t show this tutorial again
          </Button>
        </div>
      </div>
    )
  );
};

export default MultiTutorialPopup;
