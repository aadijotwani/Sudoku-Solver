import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  MdClose,
  MdOutlineCelebration,
  MdOutlineEmojiEvents,
} from "react-icons/md";
import SudokuBoard from "../components/SudokuBoard";
import SudokuSidebar from "../components/SudokuSidebar";
import { validateSudoku } from "../utils/sudokuValidation.js";
import {
  cloneBoard,
  generateRandomPuzzle,
  solveSudoku,
} from "../utils/sudokuSolver.js";

const Home = ({ newPuzzleTrigger = 0 }) => {
  const createEmptyPuzzle = () =>
    Array.from({ length: 9 }, () => Array(9).fill(0));

  const [puzzleValue, setPuzzleValue] = useState(createEmptyPuzzle);
  const [initialPuzzle, setInitialPuzzle] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [isValidated, setIsValidated] = useState(false);

  // Solving and step visualization state
  const [solverSteps, setSolverSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [solverStatus, setSolverStatus] = useState("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Display custom congratulations notification using vector icons
  const showCongratsToast = (
    message = "Congratulations! The puzzle has been solved completely with all constraints satisfied.",
    title = "Puzzle Solved!",
    icon = <MdOutlineCelebration className="text-2xl text-[#6C4BEF]" />,
  ) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-2 scale-95"
          } max-w-sm w-full bg-white shadow-[0_12px_32px_-4px_rgba(32,32,51,0.14)] rounded-2xl pointer-events-auto flex items-center p-4 border border-[#E1DFEB] transition-all duration-200`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#EAE5FF] flex items-center justify-center shrink-0 mr-3 border border-[#6C4BEF]/20">
            {icon}
          </div>
          <div className="flex-1 pr-2">
            <p className="text-sm font-bold tracking-tight text-[#202033]">
              {title}
            </p>
            <p className="text-xs text-[#77768A] mt-0.5 leading-snug">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="text-[#77768A] hover:text-[#202033] p-1.5 rounded-lg hover:bg-[#F7F6FC] transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <MdClose className="text-base" />
          </button>
        </div>
      ),
      { id: "puzzle-completion-toast", duration: 5000 },
    );
  };

  // Generate a fresh random puzzle
  const handleGenerateRandomPuzzle = () => {
    toast.dismiss("puzzle-completion-toast");
    const newPuzzle = generateRandomPuzzle();
    setIsPlaying(false);
    setIsValidated(false);
    setConflicts([]);
    setSolverSteps([]);
    setCurrentStepIndex(0);
    setSolverStatus("idle");
    setInitialPuzzle(null);
    setPuzzleValue(newPuzzle);
    toast.success("Generated a new puzzle! Click Validate to solve.");
  };

  // Listen for New Puzzle trigger from Navbar
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    handleGenerateRandomPuzzle();
  }, [newPuzzleTrigger]);

  // Validate current board
  const handleValidation = () => {
    const result = validateSudoku(puzzleValue);

    if (result.isValid === false) {
      setConflicts(result.conflicts);
      setIsValidated(false);
      setSolverSteps([]);
      setCurrentStepIndex(0);
      setSolverStatus("idle");
      setIsPlaying(false);
      toast.error("Conflict found! Check the highlighted cells.");
      return;
    }

    setConflicts([]);
    setIsValidated(true);
    setInitialPuzzle(cloneBoard(puzzleValue));
    setSolverSteps([]);
    setCurrentStepIndex(0);
    setSolverStatus("ready");
    setIsPlaying(false);

    // Check if fully solved manually
    let isFullyFilled = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzleValue[r][c] === 0) isFullyFilled = false;
      }
    }

    if (isFullyFilled) {
      showCongratsToast(
        "Congratulations! You completed and solved the entire Sudoku puzzle!",
        "Brilliant Work!",
        <MdOutlineEmojiEvents className="text-2xl text-[#6C4BEF]" />,
      );
    } else {
      toast.success("Sudoku is Valid! You can now explore solving steps.");
    }
  };

  // Return to editing mode
  const handleEdit = () => {
    toast.dismiss("puzzle-completion-toast");
    setIsPlaying(false);
    setIsValidated(false);
    setConflicts([]);
    setSolverSteps([]);
    setCurrentStepIndex(0);
    setSolverStatus("idle");
    setInitialPuzzle(null);
  };

  // Generate solving steps
  const handleExploreSteps = () => {
    if (!isValidated) {
      toast.error("Please validate the puzzle first.");
      return;
    }

    const boardToSolve = initialPuzzle
      ? cloneBoard(initialPuzzle)
      : cloneBoard(puzzleValue);

    const result = solveSudoku(boardToSolve);

    setSolverSteps(result.steps);
    setCurrentStepIndex(0);
    setSolverStatus(result.status);
    setIsPlaying(false);

    if (result.status === "solved") {
      toast.success(
        `Generated ${result.steps.length - 1} steps to reach solution!`,
      );
    } else if (result.status === "unsolvable") {
      toast.error("This puzzle has no valid solution.");
    } else if (result.status === "limit_reached") {
      toast.error("Step limit reached. Showing partial exploration.");
    } else {
      toast.error("Unable to solve puzzle.");
    }

    return result;
  };

  // Play / Pause toggle
  const handleTogglePlay = () => {
    if (!isValidated) return;

    if (solverSteps.length === 0) {
      const res = handleExploreSteps();
      if (res && res.steps.length > 0) {
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // If at the end, restart from beginning
      if (currentStepIndex >= solverSteps.length - 1) {
        setCurrentStepIndex(0);
      }
      setIsPlaying(true);
    }
  };

  // Next step
  const handleNextStep = () => {
    if (!isValidated) return;

    if (solverSteps.length === 0) {
      handleExploreSteps();
      return;
    }

    if (currentStepIndex < solverSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // Previous step
  const handlePreviousStep = () => {
    if (!isValidated) return;

    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Reset steps to step 0
  const handleResetSteps = () => {
    toast.dismiss("puzzle-completion-toast");
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  // Trigger custom congrats notification when reaching the solved step
  useEffect(() => {
    if (
      solverSteps.length > 0 &&
      currentStepIndex === solverSteps.length - 1 &&
      solverSteps[currentStepIndex]?.type === "solved"
    ) {
      showCongratsToast(
        "Congratulations! The puzzle has been solved completely with all constraints satisfied.",
        "Puzzle Solved!",
        <MdOutlineCelebration className="text-2xl text-[#6C4BEF]" />,
      );
    }
  }, [currentStepIndex, solverSteps]);

  // Playback timer effect
  useEffect(() => {
    if (!isPlaying) return;

    if (
      solverSteps.length === 0 ||
      currentStepIndex >= solverSteps.length - 1
    ) {
      const stopTimer = setTimeout(() => setIsPlaying(false), 0);
      return () => clearTimeout(stopTimer);
    }

    const baseDelay = 350;
    const delay = Math.max(30, Math.round(baseDelay / playbackSpeed));

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= solverSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, solverSteps.length, playbackSpeed]);

  // Determine which board to display
  const hasRecordedSteps = solverSteps && solverSteps.length > 0;
  const displayedBoard =
    hasRecordedSteps && solverSteps[currentStepIndex]?.board
      ? solverSteps[currentStepIndex].board
      : puzzleValue;

  const currentStep = hasRecordedSteps ? solverSteps[currentStepIndex] : null;

  return (
    <main className="min-h-screen bg-[#F7F6FC] pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Heading */}
      <div className="mb-7 sm:mb-9 text-center max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#202033]">
          Sudoku <span className="text-[#6C4BEF]">Solver</span>
        </h1>
        <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-[#77768A] font-normal leading-relaxed">
          Enter a puzzle, explore the algorithm, and watch every move unfold.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8">
        {/* Sudoku Board */}
        <SudokuBoard
          puzzleValue={displayedBoard}
          setPuzzleValue={setPuzzleValue}
          conflicts={conflicts}
          isValidated={isValidated}
          initialPuzzle={initialPuzzle}
          currentStep={currentStep}
        />

        {/* Sudoku Sidebar */}
        <SudokuSidebar
          isValidated={isValidated}
          onValidate={handleValidation}
          onEdit={handleEdit}
          solverSteps={solverSteps}
          currentStepIndex={currentStepIndex}
          currentStep={currentStep}
          solverStatus={solverStatus}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onNextStep={handleNextStep}
          onPreviousStep={handlePreviousStep}
          onResetSteps={handleResetSteps}
          onExploreSteps={handleExploreSteps}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
        />
      </div>
    </main>
  );
};

export default Home;
