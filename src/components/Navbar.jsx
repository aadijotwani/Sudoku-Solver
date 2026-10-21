import React from "react";
import { MdOutlineDarkMode, MdOutlineWbSunny } from "react-icons/md";
import { IoExtensionPuzzleOutline } from "react-icons/io5";

const Navbar = () => {
  return (
    <>
      <div className="w-full h-18 fixed top-0 left-0 bg-white shadow-md flex items-center justify-between px-10 py-3">
        <div className="text-xl">Logo</div>
        <div className="flex items-center justify-between gap-8">
          <button className="text-xl bg-blue-100 rounded-2xl px-3 h-11 flex items-center hover:bg-blue-200 transition-colors duration-400 shadow-sm">
            <MdOutlineWbSunny />
          </button>
          <button className="flex items-center justify-center gap-2 text-lg font-semibold bg-blue-100  hover:bg-blue-200 transition-colors duration-400 rounded-2xl h-11 px-3 shadow-sm">
            <IoExtensionPuzzleOutline className="text-lg" />{" "}
            New Puzzle
          </button>
          <button className="text-lg font-semibold h-11 bg-blue-100  hover:bg-blue-200 transition-colors duration-400 px-3 rounded-2xl flex items-center shadow-sm">How it Works?</button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
