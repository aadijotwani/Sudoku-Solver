import React from "react";

const SudokuBoard = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <>
      <div className="bg-white p-6 rounded-3xl shadow-lg shadow-black/20">
        <div className="w-120 max-w-full overflow-hidden rounded-xl border-2 border-[#77758B]">
          {numbers.map((row, rowIndex) => (
            <div key={row} className="grid grid-cols-9">
              {numbers.map((num, colIndex) => (
                <div
                  key={num}
                  className={`
                aspect-square flex items-center justify-center
                text-lg font-medium text-[#27263A]
                border-r border-b border-[#E1DFEB]
                ${colIndex === 2 || colIndex === 5 ? "border-r-2 border-r-[#77758B]" : ""}
                ${rowIndex === 2 || rowIndex === 5 ? "border-b-2 border-b-[#77758B]" : ""}
                ${rowIndex === 0 && colIndex === 2 ? "bg-[#EAE5FF] text-[#6C4BEF]" : ""}
              `}
                >
                  {num}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SudokuBoard;
