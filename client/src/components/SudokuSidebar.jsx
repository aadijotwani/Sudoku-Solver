import {
  MdOutlineEdit,
  MdOutlinePause,
  MdOutlinePlayArrow,
  MdOutlineRestartAlt,
  MdOutlineSkipNext,
  MdOutlineSkipPrevious,
} from "react-icons/md";

const SudokuSidebar = ({
  isValidated = false,
  onValidate,
  onEdit,
  solverSteps = [],
  currentStepIndex = 0,
  currentStep = null,
  solverStatus = "idle",
  isPlaying = false,
  onTogglePlay,
  onNextStep,
  onPreviousStep,
  onResetSteps,
  onExploreSteps,
  playbackSpeed = 1,
  setPlaybackSpeed,
}) => {
  const hasSteps = solverSteps && solverSteps.length > 0;
  const totalSteps = hasSteps ? solverSteps.length - 1 : 0;

  // Calculate progress percentage
  const progressPercent = hasSteps
    ? Math.round((currentStepIndex / Math.max(totalSteps, 1)) * 100)
    : solverStatus === "solved"
      ? 100
      : 0;

  // Render badge based on step type
  const renderStepBadge = () => {
    if (!hasSteps || !currentStep) {
      return (
        <span className="rounded-full bg-[#EAE5FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#6C4BEF]">
          Step 0
        </span>
      );
    }

    switch (currentStep.type) {
      case "forced":
        return (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            Naked Single
          </span>
        );
      case "guess":
        return (
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#6C4BEF] border border-indigo-200">
            MRV Guess
          </span>
        );
      case "contradiction":
        return (
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600 border border-red-200">
            Contradiction
          </span>
        );
      case "backtrack":
        return (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            Backtrack
          </span>
        );
      case "solved":
        return (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
            Solved
          </span>
        );
      case "unsolvable":
        return (
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 border border-rose-300">
            Unsolvable
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-[#EAE5FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#6C4BEF]">
            Step {currentStepIndex}
          </span>
        );
    }
  };

  // Thinking process title
  const getThinkingTitle = () => {
    if (!hasSteps || !currentStep) {
      return isValidated ? "Puzzle Validated." : "Your puzzle awaits.";
    }

    switch (currentStep.type) {
      case "forced":
        return "Forced Placement";
      case "guess":
        return `Testing Candidate ${currentStep.value}`;
      case "contradiction":
        return "Dead End Reached";
      case "backtrack":
        return `Backtracking from ${currentStep.value}`;
      case "solved":
        return "Puzzle Solved!";
      case "unsolvable":
        return "No Valid Solution";
      case "limit_reached":
        return "Search Limit Reached";
      case "initial":
        return "Puzzle Ready to Solve";
      default:
        return "Solving Move";
    }
  };

  // Thinking process explanation
  const getThinkingExplanation = () => {
    if (!hasSteps || !currentStep) {
      return isValidated
        ? "Click 'Explore the Steps' to run constraint propagation and recursive backtracking."
        : "Start solving to explore how the algorithm tests possibilities and finds the solution.";
    }
    return currentStep.explanation;
  };

  return (
    <aside className="w-full max-w-[534px] lg:w-[320px] xl:w-[340px] shrink-0 rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(32,32,51,0.06),0_2px_8px_-2px_rgba(32,32,51,0.04)] border border-[#E1DFEB]/70 flex flex-col justify-between">
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
            {renderStepBadge()}
          </div>

          <h3 className="mt-3 text-base sm:text-lg font-bold tracking-tight text-[#202033]">
            {getThinkingTitle()}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-[#77768A] min-h-[48px]">
            {getThinkingExplanation()}
          </p>
        </div>

        {/* Solving Journey */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-[#202033]">
              Solving Journey
            </span>
            <span className="text-xs font-semibold text-[#6C4BEF]">
              {progressPercent}%
            </span>
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E1DFEB]">
            <div
              className="h-full rounded-full bg-[#6C4BEF] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <p className="mt-2 text-[11px] text-[#77768A]">
            {hasSteps
              ? `Step ${currentStepIndex} of ${totalSteps}`
              : isValidated
                ? "Puzzle locked. Ready to explore steps."
                : "Your first move is just one click away."}
          </p>
        </div>
      </div>

      {/* Explore the Steps Section */}
      <div className="mt-6 border-t border-[#E1DFEB]/80 pt-5">
        <h3 className="mb-3 text-xs sm:text-sm font-semibold text-[#202033]">
          Explore the Steps
        </h3>

        {/* If validated and steps not yet generated, offer primary trigger */}
        {isValidated && !hasSteps ? (
          <button
            type="button"
            onClick={onExploreSteps}
            className="w-full flex items-center justify-center gap-2 h-10 sm:h-11 rounded-xl bg-[#6C4BEF] hover:bg-[#5839D6] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Explore the Steps
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {/* Previous Step */}
            <button
              type="button"
              disabled={!isValidated || !hasSteps || currentStepIndex <= 0 || isPlaying}
              onClick={onPreviousStep}
              aria-label="Previous step"
              title="Previous step"
              className="flex h-10 items-center justify-center rounded-xl border border-[#E1DFEB] bg-[#F7F6FC] text-[#77768A] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white hover:enabled:text-[#202033] hover:enabled:border-[#77758B]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF]"
            >
              <MdOutlineSkipPrevious className="text-xl" />
            </button>

            {/* Play / Pause */}
            <button
              type="button"
              disabled={!isValidated || !hasSteps}
              onClick={onTogglePlay}
              aria-label={isPlaying ? "Pause solver" : "Play solver"}
              title={isPlaying ? "Pause" : "Play"}
              className="flex h-10 items-center justify-center rounded-xl bg-[#6C4BEF] text-white shadow-xs transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:bg-[#5839D6] hover:enabled:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF] focus-visible:ring-offset-2"
            >
              {isPlaying ? (
                <MdOutlinePause className="text-2xl" />
              ) : (
                <MdOutlinePlayArrow className="text-2xl" />
              )}
            </button>

            {/* Next Step */}
            <button
              type="button"
              disabled={
                !isValidated ||
                !hasSteps ||
                currentStepIndex >= totalSteps ||
                isPlaying
              }
              onClick={onNextStep}
              aria-label="Next step"
              title="Next step"
              className="flex h-10 items-center justify-center rounded-xl border border-[#E1DFEB] bg-[#F7F6FC] text-[#77768A] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white hover:enabled:text-[#202033] hover:enabled:border-[#77758B]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF]"
            >
              <MdOutlineSkipNext className="text-xl" />
            </button>

            {/* Reset to Step 0 */}
            <button
              type="button"
              disabled={!isValidated || !hasSteps || (currentStepIndex === 0 && !isPlaying)}
              onClick={onResetSteps}
              aria-label="Reset to step 0"
              title="Reset to step 0"
              className="flex h-10 items-center justify-center rounded-xl border border-[#E1DFEB] bg-[#F7F6FC] text-[#77768A] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-white hover:enabled:text-[#202033] hover:enabled:border-[#77758B]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF]"
            >
              <MdOutlineRestartAlt className="text-xl" />
            </button>
          </div>
        )}

        {/* Playback Speed selector */}
        {hasSteps && (
          <div className="mt-3.5 flex items-center justify-between text-xs text-[#77768A]">
            <span className="font-medium text-[11px]">Speed</span>
            <div className="flex items-center gap-1 bg-[#F7F6FC] p-0.5 rounded-lg border border-[#E1DFEB]">
              {[0.5, 1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed && setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors ${
                    playbackSpeed === spd
                      ? "bg-[#6C4BEF] text-white shadow-xs"
                      : "text-[#77768A] hover:text-[#202033]"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-3 text-center text-[11px] leading-4 text-[#77768A]">
          {isValidated
            ? hasSteps
              ? isPlaying
                ? "Playing solving steps automatically..."
                : "Navigate or play through the solving steps."
              : "Click 'Explore the Steps' to start."
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
