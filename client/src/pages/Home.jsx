import React from "react";
import SudokuBoard from "../components/SudokuBoard";

const Home = () => {
  return (
    <>
      <div className="min-h-screen bg-[#F7F6FC] flex flex-col items-center">
        {/* Heading */}
        <div className="mt-25 mb-8 text-center">
          <h1 className="text-7xl font-bold tracking-tight text-black">
            Sudoku <span className="text-blue-500">Solver</span>
          </h1>
          <p className="mt-3 text-gray-500">
            Enter a puzzle or Generate random and watch the mag ic happen.
          </p>
        </div>

        {/* Sudoku Board */}
        <SudokuBoard/>
        
      </div>
    </>
  );
};

export default Home;
