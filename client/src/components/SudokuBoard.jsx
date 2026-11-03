import { useState } from "react";
import toast from "react-hot-toast";
import { isValidMove } from "../utils/sudokuValidation.js";

const SudokuBoard = ({
  puzzleValue,
  setPuzzleValue,
  conflicts = [],
  isValidated = false,
  initialPuzzle = null,
  currentStep = null,
}) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Store the selected cell's position (in editing mode)
  const [selectedCell, setSelectedCell] = useState({
    row: 0,
    col: 0,
  });

  // Check if a cell belongs to the selected cell's row, column, or box
  const isRelatedCell = (row, col) => {
    const sameRow = row === selectedCell.row;
    const sameColumn = col === selectedCell.col;

    const sameBox =
      Math.floor(row / 3) === Math.floor(selectedCell.row / 3) &&
      Math.floor(col / 3) === Math.floor(selectedCell.col / 3);

    return sameRow || sameColumn || sameBox;
  };

  // Decide the cell's background and text color
  const getCellColor = (row, col) => {
    // 1. Conflict highlighting takes top priority
    const isConflict = conflicts.some(
      (cell) => cell.row === row && cell.col === col,
    );

    if (isConflict) {
      return "bg-red-100 text-red-600 font-semibold";
    }

    // 2. Editing mode (before puzzle is locked/validated)
    if (!isValidated) {
      if (row === selectedCell.row && col === selectedCell.col) {
        return "bg-[#EAE5FF] text-[#6C4BEF] font-semibold";
      }

      if (isRelatedCell(row, col)) {
        return "bg-[#F8F6FE] text-[#202033] hover:bg-[#F0ECFE]";
      }

      return "bg-white text-[#202033] hover:bg-[#F8F6FE]";
    }

    // 3. Validated / Visualization mode
    // Active cell in the current step
    if (currentStep && currentStep.row === row && currentStep.col === col) {
      switch (currentStep.type) {
        case "forced":
          return "bg-emerald-100 text-emerald-800 font-bold ring-2 ring-inset ring-emerald-500";
        case "guess":
          return "bg-indigo-100 text-[#6C4BEF] font-bold ring-2 ring-inset ring-[#6C4BEF]";
        case "contradiction":
          return "bg-red-100 text-red-600 font-bold ring-2 ring-inset ring-red-500";
        case "backtrack":
          return "bg-amber-100 text-amber-800 font-bold ring-2 ring-inset ring-amber-500";
        default:
          return "bg-[#EAE5FF] text-[#6C4BEF] font-bold ring-2 ring-inset ring-[#6C4BEF]";
      }
    }

    // Given clues (initial puzzle entries)
    const isInitialClue =
      initialPuzzle && initialPuzzle[row] && initialPuzzle[row][col] !== 0;
    if (isInitialClue) {
      return "bg-[#F7F6FC] text-[#202033] font-bold";
    }

    // Placed digits by the solver
    if (puzzleValue[row] && puzzleValue[row][col] !== 0) {
      return "bg-white text-[#6C4BEF] font-semibold";
    }

    return "bg-white text-[#202033]";
  };

  // Decide the cell's borders
  const getCellBorder = (row, col) => {
    let border = "";

    if (col !== 8) {
      if (col === 2 || col === 5) {
        border += " border-r-2 border-r-[#77758B]";
      } else {
        border += " border-r border-r-[#C3C2D6]";
      }
    }

    if (row !== 8) {
      if (row === 2 || row === 5) {
        border += " border-b-2 border-b-[#77758B]";
      } else {
        border += " border-b border-b-[#C3C2D6]";
      }
    }

    return border;
  };

  const handleChange = (e) => {
    if (isValidated) return;

    const value = e.target.value;
    const row = Number(e.target.dataset.row);
    const col = Number(e.target.dataset.col);

    const digit = value.slice(-1);

    if (value !== "" && !/^[1-9]$/.test(digit)) {
      toast.error("Please enter a valid digit 1-9");
      return;
    }

    if (value === "") {
      const updatedPuzzle = puzzleValue.map((r, rIdx) =>
        rIdx === row ? r.map((c, cIdx) => (cIdx === col ? 0 : c)) : [...r],
      );
      setPuzzleValue(updatedPuzzle);
      return;
    }

    const result = isValidMove(puzzleValue, Number(digit), row, col);

    if (result.isValid === false) {
      toast.error(result.reason);
      return;
    }

    const updatedPuzzle = puzzleValue.map((r, rIdx) =>
      rIdx === row ? r.map((c, cIdx) => (cIdx === col ? Number(digit) : c)) : [...r],
    );

    setPuzzleValue(updatedPuzzle);
  };

  return (
    <div className="flex w-full max-w-133.5 items-center justify-center rounded-2xl border border-[#E1DFEB]/70 bg-white p-3.5 shadow-[0_4px_24px_-4px_rgba(32,32,51,0.06)] sm:rounded-3xl sm:p-5 md:p-6">
      <div className="flex aspect-square w-full max-w-[486px] flex-col overflow-hidden rounded-xl border-2 border-[#77758B] bg-white">
        {/* 9 rows */}
        {numbers.map((_, rowIndex) => (
          <div key={rowIndex} className="grid flex-1 grid-cols-9">
            {/* 9 cells in each row */}
            {numbers.map((_, colIndex) => (
              <input
                key={colIndex}
                type="text"
                inputMode="numeric"
                disabled={isValidated}
                readOnly={isValidated}
                data-row={rowIndex}
                data-col={colIndex}
                value={
                  puzzleValue[rowIndex] &&
                  puzzleValue[rowIndex][colIndex] !== 0
                    ? puzzleValue[rowIndex][colIndex]
                    : ""
                }
                onFocus={(e) => {
                  if (isValidated) return;
                  setSelectedCell({
                    row: rowIndex,
                    col: colIndex,
                  });
                  e.target.select();
                }}
                onChange={handleChange}
                className={`flex h-full w-full select-none items-center justify-center text-sm font-medium transition-colors duration-150 sm:text-base md:text-lg text-center align-middle disabled:opacity-100 ${
                  isValidated
                    ? "cursor-default"
                    : "cursor-pointer focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6C4BEF]"
                }${getCellBorder(rowIndex, colIndex)} ${getCellColor(rowIndex, colIndex)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SudokuBoard;
