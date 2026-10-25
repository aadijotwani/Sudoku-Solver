export const isValidMove = (puzzle, value, row, col) => {
  //Row Check
  for (let i = 0; i < 9; i++) {
    if (i === col) {
      continue;
    }

    if (puzzle[row][i] === value) {
      return {
        isValid: false,
        reason: `Duplicate element found at index [${row}, ${i}]`,
      };
    }
  }

  //Column Check
  for (let i = 0; i < 9; i++) {
    if (i === row) {
      continue;
    }

    if (puzzle[i][col] === value) {
      return {
        isValid: false,
        reason: `Duplicate element found at index [${i}, ${col}]`,
      };
    }
  }

  //3X3 Box Check
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
        };
      }
    }
  }

  return {
    isValid: true,
    reason: null,
  };
};

