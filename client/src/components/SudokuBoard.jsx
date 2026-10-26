import React, { useState } from "react";
import toast from "react-hot-toast";
import { isValidMove } from "../utils/sudokuValidation.js";

const SudokuBoard = ({
  puzzleValue,
  setPuzzleValue,
  conflicts,
  isValidated,
}) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Store the selected cell's position
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

  // Decide the cell's background color
  const getCellColor = (row, col) => {
    const isConflict = conflicts.some(
      (cell) => cell.row === row && cell.col === col,
    );

    if (isConflict) {
      return "bg-red-100 text-red-600 font-semibold";
    }

    if (!isValidated) {
      if (row === selectedCell.row && col === selectedCell.col) {
        return "bg-[#EAE5FF] text-[#6C4BEF] font-semibold";
      }

      if (isRelatedCell(row, col)) {
        return "bg-[#F8F6FE] text-[#202033] hover:bg-[#F0ECFE]";
      }

      return "bg-white text-[#202033] hover:bg-[#F8F6FE]";
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
      toast.error("Please enter valid digit 0-9");
      return;
    }

    if (value === "") {
      const updatedPuzzle = [...puzzleValue];
      updatedPuzzle[row] = [...puzzleValue[row]];
      updatedPuzzle[row][col] = 0;

      setPuzzleValue(updatedPuzzle);
      return;
    }

    const result = isValidMove(puzzleValue, Number(digit), row, col);

    if (result.isValid === false) {
      toast.error(result.reason);
      return;
    }

    const updatedPuzzle = [...puzzleValue];

    updatedPuzzle[row] = [...puzzleValue[row]];
    updatedPuzzle[row][col] = value === "" ? 0 : Number(digit);

    setPuzzleValue(updatedPuzzle);
  };

  return (
    <div className="flex w-full max-w-133.5 items-center justify-center rounded-2xl border border-[#E1DFEB]/70 bg-white p-3.5 shadow-[0_4px_24px_-4px_rgba(32,32,51,0.06)] sm:rounded-3xl sm:p-5 md:p-6">
      <div className="flex aspect-square w-full max-w-[486px] flex-col overflow-hidden rounded-xl border-2 border-[#77758B] bg-white">
        {/* Create 9 rows */}
        {numbers.map((number, rowIndex) => (
          <div key={rowIndex} className="grid flex-1 grid-cols-9">
            {/* Create 9 cells in each row */}
            {numbers.map((number, colIndex) => (
              <input
                key={colIndex}
                type="text"
                inputMode="numeric"
                disabled={isValidated}
                readOnly={isValidated}
                data-row={rowIndex}
                data-col={colIndex}
                value={
                  puzzleValue[rowIndex][colIndex] === 0
                    ? ""
                    : puzzleValue[rowIndex][colIndex]
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
                className={`flex h-full w-full select-none items-center justify-center text-sm font-medium transition-colors duration-150 sm:text-base md:text-lg text-center align-middle disabled:opacity-100 disabled:text-[#202033] ${
                  isValidated
                    ? "cursor-not-allowed"
                    : "cursor-pointer focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6C4BEF]"
                }${getCellBorder(rowIndex, colIndex)} ${getCellColor(rowIndex, colIndex)}`}
              ></input>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SudokuBoard;
