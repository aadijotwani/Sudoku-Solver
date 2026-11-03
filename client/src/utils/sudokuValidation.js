export const isValidMove = (puzzle, value, row, col) => {
  // Row Check
  for (let i = 0; i < 9; i++) {
    if (i === col) {
      continue;
    }

    if (puzzle[row][i] === value) {
      return {
        isValid: false,
        reason: `Duplicate element found at index [${row}, ${i}]`,
        index: { row: row, col: i },
      };
    }
  }

  // Column Check
  for (let i = 0; i < 9; i++) {
    if (i === row) {
      continue;
    }

    if (puzzle[i][col] === value) {
      return {
        isValid: false,
        reason: `Duplicate element found at index [${i}, ${col}]`,
        index: { row: i, col: col },
      };
    }
  }

  // 3x3 Box Check
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let i = boxStartRow; i < boxStartRow + 3; i++) {
    for (let j = boxStartCol; j < boxStartCol + 3; j++) {
      if (i === row && j === col) {
        continue;
      }

      if (puzzle[i][j] === value) {
        return {
          isValid: false,
          reason: `Duplicate element found at index [${i}, ${j}]`,
          index: { row: i, col: j },
        };
      }
    }
  }

  return {
    isValid: true,
    reason: null,
  };
};

export const validateSudoku = (puzzle) => {
  const conflicts = [];
  const conflictKeys = new Set();

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (puzzle[i][j] === 0) {
        continue;
      }

      const result = isValidMove(puzzle, puzzle[i][j], i, j);

      if (result.isValid === false) {
        const key1 = `${i}-${j}`;
        if (!conflictKeys.has(key1)) {
          conflictKeys.add(key1);
          conflicts.push({ row: i, col: j });
        }
        const key2 = `${result.index.row}-${result.index.col}`;
        if (!conflictKeys.has(key2)) {
          conflictKeys.add(key2);
          conflicts.push(result.index);
        }
      }
    }
  }

  if (conflicts.length > 0) {
    return {
      isValid: false,
      conflicts,
    };
  }

  return {
    isValid: true,
    conflicts: [],
  };
};
