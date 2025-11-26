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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-2xl w-[65%] border border-slate-700 relative">
        {/* TITLE */}
        <h2 className="text-4xl font-bold mb-2 text-blue-300">{page.title}</h2>
        {/* IMAGE */}
        {page.image && (
          <img
            src={page.image}
            className="w-full object-cover rounded-md mb-4 border border-slate-700"
            alt={page.title}
          />
        )}
        {/* BODY */}
        <p className="mb-2 text-xl font-semibold text-slate-200 leading-relaxed">
          {page.body}
        </p>

        {/* BUTTONS */}
        <div className="flex justify-between mt-2">
          {/* Back */}
          {isFirst ? (
            <button className="px-4 py-2 font-semibold text-transparent bg-transparent">
              Back
            </button>
          ) : (
            <button
              disabled={isFirst}
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              className={
                "px-4 py-2 rounded-md font-semibold text-lg bg-gray-500 cursor-default"
              }
            >
              Back
            </button>
          )}
          {/* PAGE DOTS */}
          <div className="flex justify-center gap-2 my-3">
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
            className="px-4 py-2 text-lg bg-blue-400 text-white font-semibold rounded-md hover:bg-blue-500"
          >
            {isLast ? "Finish" : "Next"}
          </button>
        </div>

        {/* DISABLE */}
        <button
          onClick={onDisable}
          className="mt-2 text-lg text-gray-400 hover:text-gray-200 underline w-full text-center"
        >
          Don’t show this tutorial again
        </button>
      </div>
    </div>
  );
};

export default MultiTutorialPopup;
