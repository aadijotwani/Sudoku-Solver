# Sudoku Solver & Visualizer — Project Specification

> **Purpose of this file:** This document is the source of truth for the intended product behavior and implementation decisions. Read it before making architectural or feature changes. If a future request conflicts with this specification, ask the user to clarify rather than silently changing the product direction.

## 1. Product vision

Build an interactive Sudoku Solver Visualizer. Users create their own Sudoku puzzle, validate it, then watch a solving algorithm work through the puzzle step by step. The goal is not merely to display a completed Sudoku board; it is to help users understand how the algorithm solves it.

## 2. Core user workflow

### Stage A — Create a puzzle

- The app initially displays an empty 9×9 Sudoku grid.
- Users enter digits `1`–`9` into any cells they choose.
- Users can replace or delete entered values while editing.
- Validate each proposed digit immediately before accepting it (real-time entry validation).
- If the proposed digit conflicts with an existing non-empty digit in the same row, column, or 3×3 box, reject the entry, show an error toast, and leave the cell's previous value unchanged.
- Check the proposed move against the board while excluding the cell currently being edited, so users can replace an existing digit with another valid digit.
- Real-time validation prevents rule conflicts during entry; the explicit **Validate** button is still required as the final checkpoint before visualization.
- A blank cell is represented internally as `0` and displayed as an empty input.
- The grid should remain editable until the user successfully validates the puzzle.
- While editing, validate each attempted digit immediately. Reject a move that conflicts with another cell in its row, column, or 3×3 box; show an error toast and preserve the cell's previous value.
- Exclude the edited cell itself during duplicate checks, so replacing its value is allowed when the new digit is otherwise valid.

### Stage B — Validate the puzzle

The user explicitly clicks **Validate** in the sidebar to validate the whole current board.

Validation checks the Sudoku constraints:
1. Each row must not contain duplicate non-empty digits.
2. Each column must not contain duplicate non-empty digits.
3. Each 3×3 box must not contain duplicate non-empty digits.

Empty cells are allowed. A partially completed board can pass validation if it has no rule conflicts.

#### Real-time entry conflict

When a user tries to enter a digit that duplicates a non-empty digit in its row, column, or 3×3 box:

- Check the proposed move before updating React state.
- Reject the proposed digit and show an error toast using `react-hot-toast`.
- Preserve the cell's previous valid value (or keep it empty if it was empty).
- A brief visual indication of the conflicting cell/related cell is optional; the toast is required.
- Do not write the conflicting value into the puzzle state.

#### If conflicts are found during explicit validation

- Identify **all** cells involved in conflicts, not only the first conflict found. This is still needed as a defensive/final validation check and for boards loaded or modified through other paths.
- Highlight the conflicting cells on the Sudoku board.
- Show an error toast using `react-hot-toast`.
- Keep the user in editing mode.
- Keep visualization and step-navigation controls locked.
- Keep the **Validate** button available.
- Do not mutate or discard the user's entered values as a side effect of validation.

Real-time checking does not replace whole-board validation. The explicit Validate action remains the gate before visualization.

#### If no conflicts are found

- Show a success toast using `react-hot-toast`.
- Mark the current puzzle as validated.
- Change the sidebar button from **Validate** to **Edit Puzzle**.
- Unlock the visualization section and its controls.
- Do not imply that the puzzle is guaranteed to be solvable: rule-validity and solvability are different checks.

### Stage C — Edit after successful validation

When the user clicks **Edit Puzzle**:

- Return to editing mode.
- Preserve the values the user entered; do not clear the board.
- Clear the previous validation status and conflict highlights.
- Lock visualization controls again.
- Invalidate/clear any solving steps generated for the previous board and reset the current step index.
- Allow the user to change or delete values.
- The user must click **Validate** again before visualization can be used.

### Stage D — Visualize solving

- Visualization becomes available only after successful validation of the current puzzle.
- The user explicitly clicks **Visualise** to start the visualization workflow.
- The solver should generate a sequence of steps that represent its solving process.
- The visualization should make the algorithm's progress understandable, not simply replace the puzzle with the final answer.
- A backtracking algorithm is the planned baseline unless the user chooses another algorithm.
- Keep the user's original puzzle separate from the solver's working board and generated steps. Visualization must not overwrite the original puzzle input.
- The solver must report when a rule-valid puzzle has no solution. It must never fabricate or display an incorrect solution as successful.

### Stage E — Navigate through steps

Once steps have been generated:

- **Forward** moves to the next recorded step.
- **Backward** moves to the previous recorded step.
- The displayed board/state updates to match the selected step.
- Navigation must stay within the valid step range; do not move before the first step or beyond the last step.
- The interface should make the current step understandable (for example, the action or decision made by the algorithm).
- If the puzzle has no solution, clearly report that result rather than presenting a false solution.

## 3. UI state and button behavior

The sidebar controls depend on the current puzzle state.

| State | Main sidebar button | Visualization controls |
|---|---|---|
| Editing, not validated | **Validate** | Locked |
| Validation failed | **Validate** | Locked |
| Validation successful | **Edit Puzzle** | Unlocked |
| User clicks **Edit Puzzle** | **Validate** | Locked until revalidated |
| Revalidation successful | **Edit Puzzle** | Unlocked again |

Additional rules:

- Changing any cell after validation must not leave the puzzle marked as validated. Prefer making the grid read-only while validated and requiring the user to click **Edit Puzzle** first. If the implementation instead permits direct editing, it must immediately invalidate validation and clear stale steps/conflict state. Do not leave this ambiguous in the UI.
- A successful validation unlocks the ability to start visualization. It does not itself start the solver.
- Editing a puzzle invalidates any previously generated solving steps because those steps belong to the previous puzzle state.
- The user can correct conflicting entries and revalidate without resetting the entire board.

## 4. Validation behavior and data contract

Suggested function signature:

```js
validateSudoku(puzzle)
```

Input:
- `puzzle`: a 9×9 array of numbers, where `0` means empty and `1`–`9` are filled digits.

Expected result:
- Return a structured result identifying validity and all conflicting cells.
- A useful shape is:

```js
{
  isValid: false,
  conflictingCells: [
    { row: 0, col: 1 },
    { row: 0, col: 5 }
  ],
  conflicts: [
    {
      type: "row", // "row", "column", or "box"
      cells: [
        { row: 0, col: 1 },
        { row: 0, col: 5 }
      ],
      number: 5
    }
  ]
}
```

- `isValid` should be `true` only when there are no conflicts.
- Include every cell participating in a duplicate group; de-duplicate cell coordinates in `conflictingCells` if a cell conflicts under multiple rules.
- Ignore `0` / empty cells when checking duplicates.
- Validation should not change the input board.
- Keep validation logic in `src/utils/sudokuValidation.js` (adjust the path only if the actual project structure differs).

## 5. Planned code organization

Use this as the target organization, adapting names only when the existing repository requires it:

```text
src/
├── components/
│   ├── SudokuBoard.jsx       # Grid UI, input, selection, conflict highlighting
│   ├── SudokuSidebar.jsx     # Validate/Edit Puzzle, Visualise, Forward/Backward controls
│   └── Navbar.jsx            # Existing navigation/header, if present
├── utils/
│   └── sudokuValidation.js   # Pure Sudoku conflict validation
├── ...                       # Existing files and folders remain in place
├── App.jsx                   # Coordinates shared application state
└── main.jsx                  # React entry point and global Toaster
```

Responsibilities:

- **`SudokuBoard.jsx`**: render the grid; manage or receive grid data; handle cell input, selection, and highlighting. Before committing a proposed digit, call the validation utility to check the move.
- **`sudokuValidation.js`**: contain pure validation logic for both proposed-move checks and whole-board conflict detection; do not import React or UI/toast code here. The UI layer shows toasts based on returned results.
- **Solver module** (to be added): generate solver steps from a validated puzzle without mutating the original puzzle.
- **`SudokuSidebar.jsx`**: render the workflow controls and current validation/visualization status.
- **`App.jsx`**: coordinate state shared between the board, sidebar, validation, and solver.
- **`main.jsx`**: initialize React and render the global `Toaster` once, if that matches the existing app setup.

Keep business logic separate from UI concerns. Prefer one source of truth for the current puzzle and avoid duplicate, unsynchronized copies of state.

## 6. Notifications

Use `react-hot-toast` for user feedback.

- Success toast when validation passes.
- Error toast when validation finds conflicts.
- Clear, appropriate feedback when the solver finds no solution or when visualization cannot proceed.
- Avoid showing success notifications on every keystroke.
- The validation utility should return results; the UI layer is responsible for showing toasts.

## 7. Input behavior

- Accept only single digits `1`–`9` in a cell.
- Allow deleting a cell to make it empty.
- Typing a new digit into an occupied cell should replace the previous digit naturally.
- Do not depend on taking the last character of a multi-character string (`slice(-1)`) as the long-term input strategy; it is a workaround and can mishandle pasted input.
- Prefer selecting the existing text on focus or using a robust single-character input handler, and ensure invalid input does not overwrite the last valid cell value.
- If the UI is in the successfully validated state, use the **Edit Puzzle** action before permitting further edits (recommended). On entering edit mode, preserve all existing digits.

## 8. Implementation principles

- Work incrementally, one feature at a time.
- Before changing code, inspect the relevant current components and state flow.
- Do not rewrite working UI or unrelated components when a small change will solve the task.
- Keep validation deterministic and testable.
- Prefer pure functions for validation and solving logic.
- Test edge cases: duplicates in one row, one column, and one 3×3 box; multiple simultaneous conflicts; a valid incomplete board; an empty board; a rule-valid but unsolvable board; editing after validation; and stale solver steps after edits.
- When explaining code to the user, use clear, sequential explanations and avoid introducing unrelated abstractions.
- Do not implement automatic validation while the user types.
- Do not start solving immediately after validation; the user must click **Visualise**.
- Do not add features the user has not requested without discussing them first.

## 9. Current known implementation context

Based on the conversation so far:

- Frontend uses React, Vite, and Tailwind CSS.
- The grid component is named `SudokuBoard.jsx`.
- The board uses a 9×9 `puzzleValue` state, with `0` representing an empty cell.
- `selectedCell` tracks the selected row and column.
- Input cells use `data-row` and `data-col` attributes.
- `react-hot-toast` has been installed/imported or is being integrated; verify the actual repository before assuming setup is complete.
- The user created a new validation file named `sudokuValidation.js` and added an initial row-checking function during discussion. That function is only a preliminary attempt and does not yet implement the complete validation contract above. Inspect it and update it when implementation resumes.
- Existing components may have additional UI or styling details not described here. Preserve those unless a change is necessary and requested.

## 10. Product decisions to preserve

1. Users design the puzzle themselves; do not assume they need automatic puzzle generation.
2. Validation is explicit and triggered by the sidebar button.
3. Validation checks the whole board and reports all conflicts, not only the first.
4. Successful validation changes **Validate** to **Edit Puzzle** and unlocks visualization.
5. Clicking **Edit Puzzle** preserves the entered numbers but invalidates validation and old solver steps.
6. The user explicitly clicks **Visualise** to generate/show the solving process.
7. Forward and Backward controls let the user explore the recorded algorithm steps.
8. Rule validation and solvability are separate concepts.
9. The main product goal is to help users understand the algorithm, not just obtain a solution.

## 11. Before future implementation work

At the start of a new feature or resumed coding session:

1. Read this specification.
2. Inspect the current files and actual implementation before assuming code is unchanged.
3. Identify which workflow stage the feature belongs to.
4. Make the smallest coherent change.
5. Explain what changed and why in straightforward language.
6. Test the relevant behavior and report anything not yet implemented.
7. If a request conflicts with this specification or a product decision is ambiguous, ask the user before changing the intended workflow.


## 12. Clarification: real-time entry checks versus full-board validation

The product uses **both** mechanisms:

- **During entry:** Check only the proposed digit against the relevant row, column, and 3×3 box. If it creates a duplicate, reject the entry immediately, show an error toast, and preserve the cell's previous value. This is not a full-board validation and does not unlock visualization.
- **On clicking Validate:** Run whole-board validation and collect all conflicts as a final checkpoint. If valid, switch to the validated state and unlock visualization. If invalid, show/highlight conflicts and remain in editing mode.
- **On clicking Visualise:** Generate the solving steps only after successful explicit validation.

The real-time move-checking utility can have a signature such as:

```js
isValidMove(puzzle, row, col, number)
```

It should return a result indicating whether the proposed digit is allowed at that position. It must ignore the target cell itself when checking for duplicates, which is essential when replacing an existing value. Keep this function pure; toast notifications belong in the component/UI layer.

The full-board validator remains a separate operation, for example:

```js
validateSudoku(puzzle)
```

It returns the overall validity and all conflicting cells/groups. This remains useful as a final guard and for boards loaded or modified through paths other than ordinary cell entry.
