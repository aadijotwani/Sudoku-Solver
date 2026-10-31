# Sudoku Solver & Visualizer — Implementation Roadmap

## Project Goal

Build a Sudoku Solver and Visualizer that explains its solving process through recorded, replayable steps.

The implementation will use:
- **Constraint propagation** to reduce candidates and place forced values.
- **Backtracking search** when propagation cannot finish the puzzle.
- **Step recording** so the UI can replay placements, eliminations, guesses, contradictions, and backtracks.
- **React state** to display a selected step without mixing solver logic into JSX.

The goal is to keep the solver algorithm separate from React components while designing the algorithm and step format together.

---

## Current Project Context

The app already has a React + Vite + Tailwind UI, a 9×9 Sudoku board, validation, conflict highlighting, a Validate/Edit Puzzle flow, and sidebar controls for exploring steps.

Relevant files:

```text
src/
├── utils/
│   └── sudokuValidation.js
├── components/
│   ├── SudokuBoard.jsx
│   └── SudokuSidebar.jsx
└── pages/
    └── Home.jsx
```

Keep the existing validation functionality. Validation and solving are different responsibilities:

- **Validation** checks whether entered clues currently violate Sudoku rules.
- **Solving** determines whether a valid puzzle has a solution.
- A board with no duplicate clues is not necessarily solvable.
- A completed board must still be checked for correctness.

Before implementation, inspect current code and adapt names/props to the real project instead of replacing working components blindly.

---

## Architecture Principles

1. Keep algorithm code out of JSX components. Put candidate logic, propagation, search, and step generation in `src/utils/sudokuSolver.js`.
2. Do not mutate React state or the user's original puzzle. The solver works on a deep copy.
3. Record steps while solving; do not reconstruct reasoning afterward.
4. Separate solving from playback. The solver creates steps; the UI displays the selected step.
5. Keep original clues immutable and visually distinguish them from solver-filled values.
6. Test each phase before moving on.
7. Use deterministic cell and candidate ordering for repeatable debugging.
8. Start with Naked Singles and Hidden Singles before advanced techniques such as pairs, pointing pairs, or X-Wing.

---

## Phase 0 — Baseline and Contracts

### Goal
Understand the current implementation and agree on data formats before writing the solver.

### Tasks
- [ ] Confirm the current branch and commit existing validation/locking work.
- [ ] Run the app and confirm the current UI works.
- [ ] Inspect `isValidMove()` and `validateSudoku()`; ensure coordinates are correct:
  - Row conflict: `{ row: row, col: i }`
  - Column conflict: `{ row: i, col: col }`
  - Box conflict: `{ row: i, col: j }`
- [ ] Use a 9×9 array with `0` for empty cells and `1`–`9` for digits.
- [ ] Preserve the original puzzle or derive a `givenCells` mask before solving.
- [ ] Define result statuses: `solved`, `unsolvable`, `invalid`; optionally `multiple-solutions` if uniqueness is implemented.
- [ ] Define a step-event schema before building playback.

### Suggested file layout

```text
src/
├── utils/
│   ├── sudokuValidation.js
│   └── sudokuSolver.js
├── components/
│   ├── SudokuBoard.jsx
│   └── SudokuSidebar.jsx
└── pages/
    └── Home.jsx
```

If the solver grows, split it later. Avoid unnecessary files at the start.

### Deliverable
A documented board format, result contract, and first version of the step schema.

---

## Phase 1 — Candidate Calculation

### Goal
For each empty cell, calculate which digits are allowed by its row, column, and 3×3 box.

### Core concept
For a cell `(row, col)`:
1. Start with digits `1` through `9`.
2. Remove digits already present in its row.
3. Remove digits already present in its column.
4. Remove digits already present in its 3×3 box.
5. Remaining digits are its candidates.

Example: if the row, column, and box collectively contain `1, 2, 3, 4, 6, 8`, candidates are `{5, 7, 9}`.

### Tasks
- [ ] Implement a pure function such as `getCandidates(board, row, col)`.
- [ ] Return an empty list for a filled cell, or document another consistent choice.
- [ ] Keep candidate order deterministic, e.g. ascending `1`–`9`.
- [ ] Do not update React state from this function.
- [ ] Test row exclusions, column exclusions, box exclusions, filled cells, and zero-candidate cells.

### Edge cases
- A cell with no candidates is a contradiction.
- A cell with exactly one candidate is a Naked Single.
- Candidate calculation alone does not solve every Sudoku.

### Deliverable
A tested candidate-calculation function in `src/utils/sudokuSolver.js`.

### Acceptance criteria
- It never changes the input board.
- It excludes digits forbidden by the row, column, and box.
- It returns the same candidates for the same board and cell.
- Later phases can detect a no-candidate result.

---

## Phase 2 — Constraint Propagation

### Goal
Repeatedly apply deterministic rules that force placements or reveal contradictions.

### Techniques for version 1

#### 2.1 Naked Singles
If an empty cell has exactly one candidate, that candidate must go in the cell.

Example: candidates for `(row 2, col 4)` are `{5}`. Place `5`.

#### 2.2 Hidden Singles
For a row, column, or 3×3 box, if a digit can fit in only one empty cell in that unit, it must be placed there—even if that cell has other candidates.

Example: digit `7` is a candidate in only one empty cell in a row. Place `7` there.

### Propagation loop
Repeat until:
1. **Solved:** no empty cells remain and the board obeys Sudoku rules.
2. **Contradiction:** an empty cell has no candidates, or a missing digit has no possible location in a unit.
3. **Stalled:** no Naked Single or Hidden Single can be found.

After a placement, recompute candidates. Recomputing the whole board is acceptable for a first 9×9 implementation.

### Tasks
- [ ] Find and place Naked Singles.
- [ ] Find Hidden Singles in rows, columns, and boxes.
- [ ] Detect empty cells with zero candidates.
- [ ] Detect a missing digit in a unit with no possible cell.
- [ ] Continue until solved, contradiction, or stalled.
- [ ] Record each placement with its technique and a short explanation.
- [ ] Keep the working board local to the solver.

### Suggested step event
```js
{
  type: "placement",
  row: 2,
  col: 4,
  value: 5,
  technique: "naked-single",
  reason: "Only candidate for this cell"
}
```

For Hidden Singles, use `hidden-single-row`, `hidden-single-column`, or `hidden-single-box`.

### Deliverable
A propagation function that returns the updated board, status (`solved`, `contradiction`, or `stalled`), and recorded steps.

### Acceptance criteria
- Forced placements obey Sudoku rules.
- The function terminates when no supported technique can progress.
- Contradictions are reported rather than ignored.
- Every placement has an explanation.

---

## Phase 3 — Backtracking Search

### Goal
Solve puzzles that propagation cannot finish by exploring candidates and undoing choices when they lead to contradictions.

### Search strategy
Use **Minimum Remaining Values (MRV)**: choose an empty cell with the fewest candidates to reduce branching.

### High-level algorithm
1. Run constraint propagation.
2. If solved, return success.
3. If contradiction, return failure to the previous decision.
4. If stalled, choose an empty cell with the fewest candidates.
5. Record a guess and try one candidate.
6. Apply propagation again.
7. If it fails, record a contradiction and backtrack.
8. Undo that branch and try the next candidate.
9. Continue until solved or all branches fail.

### Tasks
- [ ] Implement MRV cell selection.
- [ ] Try candidates in stable order initially (ascending digits).
- [ ] Record guess events before exploring a candidate.
- [ ] Record contradiction events when a branch fails.
- [ ] Record backtrack events when a guess is undone.
- [ ] Ensure failed branches cannot leak board mutations into other branches. Use a board copy per branch or carefully restore state.
- [ ] Return a clear `solved` or `unsolvable` result.
- [ ] Optionally count solutions up to two to distinguish unique from multiple-solution puzzles, only if required.

### Suggested events
```js
{ type: "guess", row: 4, col: 3, value: 2, technique: "mrv" }
{ type: "contradiction", row: 4, col: 3, value: 2, reason: "No candidates remain" }
{ type: "backtrack", row: 4, col: 3, value: 2, reason: "Undo failed guess" }
```

### Deliverable
A solver that solves valid solvable puzzles and reports unsolvable puzzles.

### Acceptance criteria
- Solves standard Sudoku puzzles.
- Does not mutate the caller's original board.
- Correctly undoes failed guesses.
- Detects unsolvable puzzles.
- Produces ordered events.

---

## Phase 4 — Step Recording Contract

### Goal
Make solver events reliable and easy for the UI to replay.

### Recommended event types
- `placement`: a digit is placed.
- `guess`: a candidate is tried as a decision.
- `contradiction`: a branch or board state is impossible.
- `backtrack`: a failed choice is undone.
- `solved`: the puzzle has been completed.
- Optional later: `candidate-elimination`, `propagation-start`, `propagation-end`.

### Suggested schema
```js
{
  type: "placement",
  row: 2,
  col: 4,
  value: 5,
  technique: "naked-single",
  reason: "Only candidate remaining for this cell",
  board: optionalSnapshot
}
```

### Playback design decision

**Approach A — Full board snapshot per step (recommended for v1)**
- Record a copied 9×9 board after each meaningful event.
- Easy to implement and debug.
- Uses more memory, but a Sudoku board is small.

**Approach B — Events only**
- Store the action and apply/reverse events in the UI.
- More memory-efficient, but requires careful reversible state handling.
- Can be considered later.

For v1, use snapshots. Make deep copies with `board.map(row => [...row])`, not references to the same mutable board.

### Deliverable
A consistent step list where every step can be displayed independently.

### Acceptance criteria
- Any step reproduces the correct board state.
- Previous/Next does not mutate the solver's final result.
- Backtracking visibly restores the prior board state.
- Steps remain in generation order.

---

## Phase 5 — Connect Solver State to React

### Goal
Connect the pure solver to the UI without mixing algorithm code into JSX.

### Tasks
- [ ] Keep the original puzzle separate from the solver's working board.
- [ ] Preserve original clues and identify given cells.
- [ ] Add state for solver steps and current step index.
- [ ] Compute the solver result when the user starts exploring.
- [ ] Display the snapshot associated with the selected step.
- [ ] Do not let playback mutate the original puzzle.
- [ ] On Edit Puzzle, clear old steps, reset the index, unlock inputs, and invalidate the previous solver result.
- [ ] Decide whether solving starts on validation or when the user starts exploring. Prefer a clear, predictable flow.

### Suggested state (adapt to existing names)
```js
const [solverSteps, setSolverSteps] = useState([]);
const [currentStepIndex, setCurrentStepIndex] = useState(0);
const [solverStatus, setSolverStatus] = useState("idle");
```

The displayed board can be derived from the selected snapshot rather than mutated independently in several places.

### Deliverable
The UI shows the board state associated with the selected solver step.

### Acceptance criteria
- Validation and solving remain separate.
- The initial puzzle remains unchanged.
- Edit Puzzle clears stale playback data.
- Re-running starts from the current puzzle, not a previous final state.

---

## Phase 6 — Previous, Next, Play/Pause

### Goal
Connect existing sidebar controls to recorded steps.

### Tasks
- [ ] Previous selects `currentStepIndex - 1`, bounded at zero.
- [ ] Next selects `currentStepIndex + 1`, bounded at the last step.
- [ ] Play advances steps on a timer.
- [ ] Pause stops and clears the timer.
- [ ] Stop playback at the final step.
- [ ] Disable Previous at the first step and Next at the last step.
- [ ] Prevent multiple concurrent timers.
- [ ] Reset playback for a new puzzle or when Edit Puzzle is clicked.
- [ ] Keep board, progress indicator, and status synchronized.

### Deliverable
Working step navigation and playback.

### Acceptance criteria
- Controls cannot go outside the step range.
- Pause reliably stops playback.
- Starting playback twice does not create duplicate intervals.
- The final step displays the solved board if a solution exists.

---

## Phase 7 — Visual Explanations and Highlighting

### Goal
Make every step understandable, not just animated.

### Tasks
- [ ] Highlight the active cell for placement/guess events.
- [ ] Style guesses and backtracking differently from forced placements.
- [ ] Show the current technique: Naked Single, Hidden Single, Guess, Contradiction, or Backtrack.
- [ ] Show a short reason, such as “Only candidate remaining for this cell.”
- [ ] If candidate overlays are added, derive them from the selected step's board snapshot.
- [ ] Keep validation conflict highlights separate from solver-step highlights.
- [ ] Ensure selected-cell styling does not hide conflict or solver highlighting.
- [ ] Preserve the existing minimalist design.

### Deliverable
The user can see which cell changed, what happened, and why.

### Acceptance criteria
- Every event has a visible explanation.
- A guess is not presented as a logically forced placement.
- Backtracking visibly removes a failed choice.

---

## Phase 8 — Results, Edge Cases, and Testing

### Goal
Verify correctness across normal and abnormal inputs.

### Required tests
- [ ] A puzzle solved by propagation alone, if available.
- [ ] A puzzle requiring backtracking.
- [ ] An already-completed valid Sudoku.
- [ ] An invalid board with duplicate clues.
- [ ] A board with no solution despite no initial duplicate clues.
- [ ] A puzzle with a zero-candidate cell.
- [ ] An empty board; handle it without freezing the UI. It has many solutions.
- [ ] Edit Puzzle after steps are generated.
- [ ] Run the solver on multiple different puzzles.
- [ ] Previous/Next boundary behavior.
- [ ] Play/Pause timer cleanup.

### Correctness notes
- A full board is solved only if all rows, columns, and boxes obey the rules.
- No duplicate clues does not guarantee solvability.
- An empty Sudoku has many solutions; do not enumerate all solutions.
- If uniqueness checking is added, stop after finding two solutions.
- Consider a step limit or simplified display if the event history becomes very large.

### Deliverable
A tested solver and playback flow with explicit result statuses.

---

## Phase 9 — Final Integration and Cleanup

### Goal
Make the feature reliable and ready to demonstrate.

### Tasks
- [ ] Run all tests.
- [ ] Run `npm run build`.
- [ ] Fix build/lint errors.
- [ ] Verify existing validation still works.
- [ ] Verify board lock/unlock and sidebar controls.
- [ ] Verify solver success and unsolvable states.
- [ ] Verify final board matches the returned solution.
- [ ] Remove temporary test buttons and debug logs.
- [ ] Review accessibility and visible disabled states.
- [ ] Update README with algorithm, techniques, controls, and limitations.
- [ ] Commit work in focused commits.

### Deliverable
A working Sudoku Solver and Visualizer demonstrated end to end.

---

## Recommended Implementation Order

1. Baseline checks and contracts.
2. Candidate calculation.
3. Constraint propagation: Naked Singles.
4. Constraint propagation: Hidden Singles.
5. Contradiction detection.
6. Backtracking with MRV.
7. Step snapshots and explanations.
8. React integration.
9. Previous/Next.
10. Play/Pause and progress.
11. Visual explanations and polish.
12. Edge-case tests and final build.

**Work incrementally:** test pure logic first, then connect it to the UI. Keep solver logic separate from React and record visualization data as the algorithm runs.
