import React from "react";
import {
  MdOutlineEdit,
  MdOutlinePlayArrow,
  MdOutlineSkipNext,
  MdOutlineSkipPrevious,
} from "react-icons/md";

const SudokuSidebar = ({ isValidated, onValidate, onEdit }) => {
  return (
    <aside
      className="w-full max-w-[534px] lg:w-[320px] xl:w-[340px] shrink-0 rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(32,32,51,0.06),0_2px_8px_-2px_rgba(32,32,51,0.04)] border border-[#E1DFEB]/70 flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="border-b border-[#E1DFEB]/80 pb-4 text-center">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#202033]">
            Inside the <span className="text-[#6C4BEF]">Solver</span>
          </h2>
          <p className="mt-1 text-xs text-[#77768A] font-normal">
            Every move has a reason.
          </p>
        </div>

        {/* Thinking Process */}
        <div className="mt-5 sm:mt-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#77768A]">
              Thinking Process
            </span>

            <span className="rounded-full bg-[#EAE5FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#6C4BEF]">
              Step 0
            </span>
          </div>

          <h3 className="mt-3 text-base sm:text-lg font-bold tracking-tight text-[#202033]">
            Your puzzle awaits.
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-[#77768A]">
            Start solving to explore how the algorithm tests possibilities and
            finds the solution.
          </p>
        </div>

        {/* Solving Journey */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-[#202033]">
              Solving Journey
            </span>

            <span className="text-xs font-semibold text-[#6C4BEF]">0%</span>
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E1DFEB]">
            <div
              className="h-full w-0 rounded-full bg-[#6C4BEF] transition-all duration-300"
              role="progressbar"
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <p className="mt-2 text-[11px] text-[#77768A]">
            Your first move is just one click away.
          </p>
        </div>
      </div>

      {/* Explore the Steps */}
      <div className="mt-6 border-t border-[#E1DFEB]/80 pt-5">
        <h3 className="mb-3.5 text-xs sm:text-sm font-semibold text-[#202033]">
          Explore the Steps
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            disabled={!isValidated}
            aria-label="Previous step"
            className="flex h-10 items-center justify-center rounded-xl border border-[#E1DFEB] bg-[#F7F6FC] text-[#77768A] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white hover:enabled:text-[#202033] hover:enabled:border-[#77758B]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF]"
          >
            <MdOutlineSkipPrevious className="text-xl" />
          </button>

          <button
            type="button"
            disabled={!isValidated}
            aria-label="Play solver"
            className="flex h-10 items-center justify-center rounded-xl bg-[#6C4BEF] text-white shadow-xs transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:bg-[#5839D6] hover:enabled:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF] focus-visible:ring-offset-2"
          >
            <MdOutlinePlayArrow className="text-2xl" />
          </button>

          <button
            type="button"
            disabled={!isValidated}
            aria-label="Next step"
            className="flex h-10 items-center justify-center rounded-xl border border-[#E1DFEB] bg-[#F7F6FC] text-[#77768A] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white hover:enabled:text-[#202033] hover:enabled:border-[#77758B]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF]"
          >
            <MdOutlineSkipNext className="text-xl" />
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] leading-4 text-[#77768A]">
          {isValidated
            ? "Start the solver to explore every move."
            : "Validate the puzzle first to explore steps."}
        </p>

        {/* Validate or Edit Button */}
        {isValidated ? (
          <button
            type="button"
            name="edit"
            onClick={onEdit}
            className="mt-4 w-full flex items-center justify-center gap-2 h-10 sm:h-11 rounded-xl border border-[#6C4BEF] bg-[#F7F5FF] hover:bg-[#ECE7FE] text-[#6C4BEF] text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <MdOutlineEdit className="text-base" />
            Edit Puzzle
          </button>
        ) : (
          <button
            type="button"
            name="validate"
            onClick={onValidate}
            className="mt-4 w-full flex items-center justify-center h-10 sm:h-11 rounded-xl bg-[#6C4BEF] hover:bg-[#5839D6] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Validate
          </button>
        )}
      </div>
    </aside>
  );
};

export default SudokuSidebar;
