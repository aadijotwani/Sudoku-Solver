/**
 * Pure Sudoku solving and step-recording engine.
 * Includes Candidate Calculation, Constraint Propagation (Naked Singles),
 * MRV (Minimum Remaining Values) Backtracking, and full snapshot recording.
 */

import { validateSudoku } from "./sudokuValidation.js";

/**
 * Creates a deep clone of a 9x9 Sudoku board.
 * @param {number[][]} board
 * @returns {number[][]}
 */
export const cloneBoard = (board) => board.map((row) => [...row]);

/**
 * Calculates valid candidates for an empty cell at (row, col).
 * Returns [] if the cell is already filled.
 *
 * @param {number[][]} puzzle - 9x9 board
 * @param {number} row - row index (0-8)
 * @param {number} col - column index (0-8)
 * @returns {number[]} list of valid digits (1-9)
 */
export const getCandidate = (puzzle, row, col) => {
  if (puzzle[row][col] !== 0) {
    return [];
  }

  const candidate = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const currRow = puzzle[row];
  const currCol = puzzle.map((r) => r[col]);

  const boxRowStart = Math.floor(row / 3) * 3;
  const boxColStart = Math.floor(col / 3) * 3;
  const box = [];

  for (let i = boxRowStart; i < boxRowStart + 3; i++) {
    for (let j = boxColStart; j < boxColStart + 3; j++) {
      box.push(puzzle[i][j]);
    }
  }

  const remaining = candidate.filter(
    (num) =>
      !currRow.includes(num) && !currCol.includes(num) && !box.includes(num),
  );

  return remaining;
};

// Alias with plural name
export const getCandidates = getCandidate;

/**
 * Standalone constraint propagation function.
 * Mutates the provided puzzle by repeatedly filling Naked Singles.
 * Returns true if propagation succeeded without contradictions, false otherwise.
 *
 * @param {number[][]} puzzle
 * @returns {boolean}
 */
export const propagate = (puzzle) => {
  let changed = true;

  while (changed) {
    changed = false;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle[i][j] === 0) {
          const candidate = getCandidate(puzzle, i, j);

          if (candidate.length === 0) {
            return false;
          }

          if (candidate.length === 1) {
            puzzle[i][j] = candidate[0];
            changed = true;
          }
        }
      }
    }
  }
  return true;
};

// Backwards compatibility alias for original typo
export const propogate = propagate;

/**
 * Internal helper to record a step with a deep snapshot.
 */
const recordStep = (steps, step, stepLimit) => {
  if (stepLimit && steps.length >= stepLimit.max) {
    stepLimit.exceeded = true;
    return;
  }
  steps.push({
    ...step,
    stepIndex: steps.length,
    board: cloneBoard(step.board),
  });
};

/**
 * Constraint propagation with step recording.
 * Fills all Naked Singles until none remain or a contradiction is found.
 *
 * @param {number[][]} board
 * @param {Array<object>} steps
 * @param {object} stepLimit
 * @returns {boolean} false if contradiction found, true otherwise
 */
const propagateWithSteps = (board, steps, stepLimit) => {
  let changed = true;

  while (changed) {
    changed = false;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const candidates = getCandidate(board, r, c);

          if (candidates.length === 0) {
            recordStep(
              steps,
              {
                type: "contradiction",
                action: "dead-end",
                row: r,
                col: c,
                value: null,
                board,
                explanation: `Contradiction: Cell [R${r + 1}, C${c + 1}] has 0 possible candidates remaining.`,
              },
              stepLimit,
            );
            return false;
          }

          if (candidates.length === 1) {
            const forcedValue = candidates[0];
            board[r][c] = forcedValue;
            changed = true;

            recordStep(
              steps,
              {
                type: "forced",
                action: "naked-single",
                row: r,
                col: c,
                value: forcedValue,
                board,
                explanation: `Forced placement (Naked Single): ${forcedValue} is the only valid number for [R${r + 1}, C${c + 1}].`,
              },
              stepLimit,
            );

            if (stepLimit.exceeded) return false;
          }
        }
      }
    }
  }

  return true;
};

/**
 * Recursive backtracking solver using Minimum Remaining Values (MRV).
 *
 * @param {number[][]} board
 * @param {Array<object>} steps
 * @param {object} stepLimit
 * @returns {boolean} true if solved, false if unsolvable
 */
const solveRecursive = (board, steps, stepLimit) => {
  if (stepLimit.exceeded) return false;

  // 1. Run Constraint Propagation (Naked Singles)
  const propOk = propagateWithSteps(board, steps, stepLimit);
  if (!propOk) {
    return false;
  }

  // 2. Select next cell using MRV (Minimum Remaining Values)
  let minCandidates = null;
  let minRow = -1;
  let minCol = -1;
  let isComplete = true;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        isComplete = false;
        const candidates = getCandidate(board, r, c);

        if (candidates.length === 0) {
          recordStep(
            steps,
            {
              type: "contradiction",
              action: "dead-end",
              row: r,
              col: c,
              value: null,
              board,
              explanation: `Contradiction: Cell [R${r + 1}, C${c + 1}] has 0 candidates remaining.`,
            },
            stepLimit,
          );
          return false;
        }

        if (minCandidates === null || candidates.length < minCandidates.length) {
          minCandidates = candidates;
          minRow = r;
          minCol = c;

          // Cannot be fewer than 2 since naked singles were already propagated
          if (candidates.length === 2) {
            break;
          }
        }
      }
    }
    if (minCandidates && minCandidates.length === 2) {
      break;
    }
  }

  // If no empty cells remain, puzzle is solved!
  if (isComplete) {
    return true;
  }

  // 3. Try each candidate at the MRV cell
  for (const candidate of minCandidates) {
    if (stepLimit.exceeded) return false;

    // Snapshot board BEFORE making the guess, so we can restore all forced values if this guess fails
    const boardBeforeGuess = cloneBoard(board);

    // Apply guess
    board[minRow][minCol] = candidate;

    recordStep(
      steps,
      {
        type: "guess",
        action: "mrv-guess",
        row: minRow,
        col: minCol,
        value: candidate,
        board,
        explanation: `Guessing candidate ${candidate} at [R${minRow + 1}, C${minCol + 1}] (MRV selected: ${minCandidates.length} possibilities [${minCandidates.join(", ")}]).`,
      },
      stepLimit,
    );

    // Recurse
    const success = solveRecursive(board, steps, stepLimit);
    if (success) {
      return true;
    }

    // Backtrack: restore board state to before this guess
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        board[r][c] = boardBeforeGuess[r][c];
      }
    }

    recordStep(
      steps,
      {
        type: "backtrack",
        action: "undo-guess",
        row: minRow,
        col: minCol,
        value: candidate,
        board,
        explanation: `Dead end reached. Backtracking: removing guess ${candidate} and resetting branch at [R${minRow + 1}, C${minCol + 1}].`,
      },
      stepLimit,
    );
  }

  return false;
};

/**
 * Checks if a 9x9 board is fully filled and valid according to Sudoku rules.
 * @param {number[][]} board
 * @returns {boolean}
 */
export const isBoardSolved = (board) => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] < 1 || board[r][c] > 9) return false;
    }
  }

  // Verify rows, cols, boxes
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set();
    const colSet = new Set();
    const boxSet = new Set();
    const boxRowStart = Math.floor(i / 3) * 3;
    const boxColStart = (i % 3) * 3;

    for (let j = 0; j < 9; j++) {
      const rowVal = board[i][j];
      const colVal = board[j][i];
      const bRow = boxRowStart + Math.floor(j / 3);
      const bCol = boxColStart + (j % 3);
      const boxVal = board[bRow][bCol];

      if (rowSet.has(rowVal) || colSet.has(colVal) || boxSet.has(boxVal)) {
        return false;
      }
      rowSet.add(rowVal);
      colSet.add(colVal);
      boxSet.add(boxVal);
    }
  }

  return true;
};

/**
 * Main entry point for solving a Sudoku puzzle.
 * Never mutates the original puzzle.
 * Records every step (initial, forced, guess, contradiction, backtrack, solved/unsolvable).
 *
 * @param {number[][]} puzzle - 9x9 matrix of digits 0-9
 * @param {number} [maxSteps=10000] - safety guard
 * @returns {{ success: boolean, status: string, steps: Array<object>, solution: number[][] | null }}
 */
export const solveSudoku = (puzzle, maxSteps = 10000) => {
  if (
    !puzzle ||
    puzzle.length !== 9 ||
    puzzle.some((row) => !row || row.length !== 9)
  ) {
    return {
      success: false,
      status: "invalid",
      steps: [],
      solution: null,
      error: "Invalid board dimensions.",
    };
  }

  const workingBoard = cloneBoard(puzzle);
  const steps = [];
  const stepLimit = { max: maxSteps, exceeded: false };

  // Step 0: Initial puzzle state
  steps.push({
    type: "initial",
    action: "initial",
    stepIndex: 0,
    row: null,
    col: null,
    value: null,
    board: cloneBoard(workingBoard),
    explanation: "Initial puzzle state. Ready to explore solving steps.",
  });

  // Check if puzzle has initial rule conflicts
  const validation = validateSudoku(workingBoard);
  if (!validation.isValid) {
    steps.push({
      type: "invalid",
      action: "conflict",
      stepIndex: steps.length,
      row: validation.conflicts[0]?.row ?? null,
      col: validation.conflicts[0]?.col ?? null,
      value: null,
      board: cloneBoard(workingBoard),
      explanation: "Puzzle contains conflicting numbers violating Sudoku rules.",
    });
    return {
      success: false,
      status: "invalid",
      steps,
      solution: null,
      error: "Puzzle contains conflicting numbers.",
    };
  }

  // Check if puzzle has empty cells
  let hasEmptyCell = false;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (workingBoard[r][c] === 0) {
        hasEmptyCell = true;
        break;
      }
    }
    if (hasEmptyCell) break;
  }

  // If already complete, check validity
  if (!hasEmptyCell) {
    if (isBoardSolved(workingBoard)) {
      steps.push({
        type: "solved",
        action: "solved",
        stepIndex: steps.length,
        row: null,
        col: null,
        value: null,
        board: cloneBoard(workingBoard),
        explanation: "Puzzle is already completely and correctly solved!",
      });
      return {
        success: true,
        status: "solved",
        steps,
        solution: cloneBoard(workingBoard),
      };
    } else {
      steps.push({
        type: "unsolvable",
        action: "unsolvable",
        stepIndex: steps.length,
        row: null,
        col: null,
        value: null,
        board: cloneBoard(workingBoard),
        explanation: "Completed puzzle violates Sudoku constraints.",
      });
      return {
        success: false,
        status: "invalid",
        steps,
        solution: null,
      };
    }
  }

  const solved = solveRecursive(workingBoard, steps, stepLimit);

  if (stepLimit.exceeded) {
    steps.push({
      type: "limit_reached",
      action: "limit",
      stepIndex: steps.length,
      row: null,
      col: null,
      value: null,
      board: cloneBoard(workingBoard),
      explanation: `Solving halted: step limit of ${maxSteps} reached.`,
    });
    return {
      success: false,
      status: "limit_reached",
      steps,
      solution: null,
    };
  }

  if (solved && isBoardSolved(workingBoard)) {
    steps.push({
      type: "solved",
      action: "solved",
      stepIndex: steps.length,
      row: null,
      col: null,
      value: null,
      board: cloneBoard(workingBoard),
      explanation: "Puzzle solved successfully! All constraints satisfied.",
    });

    return {
      success: true,
      status: "solved",
      steps,
      solution: cloneBoard(workingBoard),
    };
  }

  steps.push({
    type: "unsolvable",
    action: "unsolvable",
    stepIndex: steps.length,
    row: null,
    col: null,
    value: null,
    board: cloneBoard(puzzle),
    explanation: "No valid solution exists for this puzzle configuration.",
  });

  return {
    success: false,
    status: "unsolvable",
    steps,
    solution: null,
  };
};

/**
 * Fisher-Yates array shuffle helper.
 */
const shuffleArray = (arr) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Curated fallbacks in case random generation needs an instant backup
const SAMPLE_PUZZLES = [
  [
    [0, 0, 0, 2, 6, 0, 7, 0, 1],
    [6, 8, 0, 0, 7, 0, 0, 9, 0],
    [1, 9, 0, 0, 0, 4, 5, 0, 0],
    [8, 2, 0, 1, 0, 0, 0, 4, 0],
    [0, 0, 4, 6, 0, 2, 9, 0, 0],
    [0, 5, 0, 0, 0, 3, 0, 2, 8],
    [0, 0, 9, 3, 0, 0, 0, 7, 4],
    [0, 4, 0, 0, 5, 0, 0, 3, 6],
    [7, 0, 3, 0, 1, 8, 0, 0, 0],
  ],
  [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  [
    [0, 2, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 6, 0, 0, 0, 0, 3],
    [0, 7, 4, 0, 8, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 0, 0, 2],
    [0, 8, 0, 0, 4, 0, 0, 1, 0],
    [6, 0, 0, 5, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 7, 8, 0],
    [5, 0, 0, 0, 0, 9, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 4, 0],
  ],
];

/**
 * Generates a random valid and solvable 9x9 Sudoku puzzle.
 * Fills diagonal 3x3 blocks, solves to obtain a full board,
 * then removes digits while ensuring solvability.
 *
 * @returns {number[][]} 9x9 matrix representing the puzzle
 */
export const generateRandomPuzzle = () => {
  for (let attempt = 0; attempt < 8; attempt++) {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));

    // Fill three independent diagonal 3x3 blocks with random permutations
    for (let box = 0; box < 9; box += 3) {
      const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      let idx = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          board[box + r][box + c] = numbers[idx++];
        }
      }
    }

    // Solve to get a full valid solution
    const solved = solveSudoku(board);
    if (!solved.success || !solved.solution) continue;

    const fullBoard = cloneBoard(solved.solution);

    // Keep between 28 and 34 clues
    const cluesCount = 28 + Math.floor(Math.random() * 7);
    const toRemove = 81 - cluesCount;

    const positions = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push([r, c]);
      }
    }
    const shuffledPositions = shuffleArray(positions);

    const puzzle = cloneBoard(fullBoard);
    for (let i = 0; i < toRemove; i++) {
      const [r, c] = shuffledPositions[i];
      puzzle[r][c] = 0;
    }

    // Verify it is solvable by our solver
    const verify = solveSudoku(puzzle);
    if (verify.success) {
      return puzzle;
    }
  }

  // Fallback to random pick from sample puzzles
  const fallback =
    SAMPLE_PUZZLES[Math.floor(Math.random() * SAMPLE_PUZZLES.length)];
  return cloneBoard(fallback);
};
