import React from "react";
import SudokuBoard from "../components/SudokuBoard";
import SudokuSidebar from "../components/SudokuSidebar";

const Home = () => {
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
        <SudokuBoard />

        {/* Sudoku Sidebar */}
        <SudokuSidebar />
      </div>
    </main>
  );
};

export default Home;
