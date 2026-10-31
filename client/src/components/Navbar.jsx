import React from "react";
import { IoExtensionPuzzleOutline } from "react-icons/io5";

const Navbar = () => {
  return (
    <header className="w-full h-18 fixed top-0 left-0 bg-white/95 backdrop-blur-sm border-b border-[#E1DFEB]/70 shadow-[0_1px_3px_0_rgba(32,32,51,0.03)] flex items-center justify-between px-4 sm:px-8 md:px-10 py-3 z-50">
      <div className="flex items-center gap-2.5">
        <span className="text-xl font-extrabold tracking-tight text-[#202033]">
          Sudoku<span className="text-[#6C4BEF]">.</span>
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Secondary: How it Works? */}
        <button
          type="button"
          className="text-xs sm:text-sm font-semibold text-[#77768A] hover:text-[#202033] hover:bg-[#F7F6FC] px-3 sm:px-3.5 h-9 sm:h-10 rounded-xl flex items-center transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF]"
        >
          How it Works?
        </button>

        {/* Primary Action: New Puzzle */}
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold bg-[#6C4BEF] hover:bg-[#5B3CD4] text-white shadow-xs hover:shadow transition-all duration-150 rounded-xl h-9 sm:h-10 px-3 sm:px-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C4BEF] focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <IoExtensionPuzzleOutline className="text-sm sm:text-base" />
          <span>New Puzzle</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
