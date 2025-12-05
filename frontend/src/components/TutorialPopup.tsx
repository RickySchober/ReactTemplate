import * as React from "react";

interface TutorialPage {
  image: string;
  title: string;
  body: string;
}

interface MultiTutorialPopupProps {
  pages: TutorialPage[];
  onClose: () => void;
  onDisable: () => void;
}

const MultiTutorialPopup: React.FC<MultiTutorialPopupProps> = ({
  pages,
  onClose,
  onDisable,
}) => {
  const [index, setIndex] = React.useState(0);

  const isLast = index === pages.length - 1;
  const isFirst = index === 0;

  const page = pages[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-[65%] rounded-xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl">
        {/* TITLE */}
        <h2 className="mb-2 text-4xl font-bold text-blue-300">{page.title}</h2>
        {/* IMAGE */}
        {page.image && (
          <img
            src={page.image}
            className="mb-4 w-full rounded-md border border-slate-700 object-cover"
            alt={page.title}
          />
        )}
        {/* BODY */}
        <p className="mb-2 text-xl font-semibold leading-relaxed text-slate-200">
          {page.body}
        </p>

        {/* BUTTONS */}
        <div className="mt-2 flex justify-between">
          {/* Back */}
          {isFirst ? (
            <button className="bg-transparent px-4 py-2 font-semibold text-transparent">
              Back
            </button>
          ) : (
            <button
              disabled={isFirst}
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              className={
                "cursor-default rounded-md bg-gray-500 px-4 py-2 text-lg font-semibold"
              }
            >
              Back
            </button>
          )}
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
          {/* Next / Finish */}
          <button
            onClick={() => {
              if (isLast) onClose();
              else setIndex((i) => i + 1);
            }}
            className="rounded-md bg-blue-400 px-4 py-2 text-lg font-semibold text-white hover:bg-blue-500"
          >
            {isLast ? "Finish" : "Next"}
          </button>
        </div>

        {/* DISABLE */}
        <button
          onClick={onDisable}
          className="mt-2 w-full text-center text-lg text-gray-400 underline hover:text-gray-200"
        >
          Don’t show this tutorial again
        </button>
      </div>
    </div>
  );
};

export default MultiTutorialPopup;
