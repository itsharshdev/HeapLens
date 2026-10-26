# HeapLens — Phase Plan V2
**Project:** Simplified Dynamic Memory Allocator using Linked Lists  
**Working product name:** HeapLens  
**Goal:** A polished, responsive, genuinely functional educational web app backed by a C++ allocator engine.  
**Development rule:** Exactly four phases. Every phase must finish with working code, verification, and a short report.

---

## 1. Product vision

HeapLens lets a student interact with a simplified heap and see how allocation and deallocation change the linked list of memory blocks.

It must be a real Data Structures project, not a frontend mockup:
- The allocation algorithms and block metadata are implemented in understandable C++.
- The website sends real operations to the C++ engine through a documented integration layer.
- The UI visualizes the engine's returned state; it must not invent allocation results in JavaScript.
- The interface explains what happened and why, so the team can defend the code in a viva.
- It should feel like a thoughtfully designed developer/learning tool, not a generic AI-generated dashboard.

### Important technical distinction
C++ `new` and `delete` normally use the C++ runtime's allocator. They do not automatically allocate from our custom simulated pool. HeapLens's main feature is a **custom simplified allocator**. We may include a small comparison/demo explaining how language-level `new/delete` differ, but must never claim our diagram represents actual physical RAM or the runtime heap.

---

## 2. Scope and feature requirements

### Core allocator
- Configurable fixed-size simulated memory pool (for example, 100 units/bytes).
- Singly linked list of block metadata: start offset, size, free/allocated state, and next pointer.
- First Fit as the primary allocation strategy.
- Allocate: find a sufficiently large free block, split it when appropriate, assign an allocation ID, and return the updated state.
- Deallocate: validate the allocation ID, mark its block free, and merge adjacent free blocks (coalescing).
- Safe handling of invalid sizes, zero/negative sizes, unknown IDs, double-free attempts, and out-of-memory requests.
- Statistics: total free space, largest free block, allocated space, free-block count, and fragmentation indicator.
- Optional Best Fit / Worst Fit only if the core is stable and they can be explained clearly.
- Clear reset operation and deterministic sample scenarios.

### Website
- Dashboard / overview with honest, live engine-derived statistics.
- Memory Playground: request an allocation size, allocate, free by allocation ID, reset, and inspect the resulting pool.
- Memory pool visualization proportional to block sizes, with distinct free/allocated states, labels, legends, and tooltips or accessible details.
- Linked-list explorer showing each block's metadata and traversal order.
- Step-by-step First Fit walkthrough: current block, fit check, decision, split/mark allocated, and final state.
- Fragmentation lab demonstrating why total free space is not the same as the largest contiguous free block.
- Allocation history/event log that corresponds to actual successful and failed operations.
- Helpful validation, loading, empty, success, and error states.
- Responsive desktop/mobile layouts, keyboard support, readable contrast, reduced-motion support, and useful focus states.
- Learning/viva section with concise explanations of structs, pointers, linked lists, splitting, coalescing, and complexity.

### Non-goals unless time remains
- Login, user accounts, cloud database, payments, analytics, AI chatbot, 3D scenes, complex shaders, or decorative animations that do not improve understanding.
- Do not add a database just to make the architecture look more complicated.
- Do not replace the C++ engine with JavaScript logic.

---

## 3. Recommended architecture

**Frontend:** React + TypeScript + Vite. Use the existing styling approach if the project already has one; otherwise choose Tailwind CSS or a small, consistent CSS design-token system. Use Lucide icons if needed. Use SVG/CSS for the memory visualization; 3D is unnecessary.

**Core:** C++17, small classes/structs, clear naming, comments explaining decisions, deterministic tests.

**Integration:** A thin local API/bridge between the React app and the C++ engine. During Phase 1, inspect the installed Windows compiler and choose the simplest reliable approach:
1. Prefer a small C++ service with a documented JSON request/response protocol if the chosen dependencies and build setup are reliable; or
2. Use a Node.js API bridge that communicates with a long-running C++ JSON-lines process if that is easier to build and debug in the current environment.

Do not decide this by guessing. Test a tiny end-to-end prototype before committing to the integration design. Keep all allocation decisions inside C++.

**Testing:** C++ unit tests for allocator edge cases; frontend tests for important interactions; browser-based testing (Playwright CLI or existing browser tooling) for real flows.

**Persistence:** In-memory state is enough for the core project. Do not introduce a database unless a specific requirement justifies it.

**Build and run:** Provide one clear documented way to start the app locally, plus separate commands for C++ tests and frontend tests. Never claim a command passed unless it was actually run.

---

## 4. Four phases

## Phase 1 — C++ Allocator Engine + Integration Proof

### Build
1. Inspect the existing folder, toolchain, and files before changing anything.
2. Define the block metadata structure and linked-list invariants.
3. Implement pool initialization, First Fit allocation, splitting, deallocation, coalescing, reset, and statistics.
4. Add allocation IDs and clear error responses.
5. Add automated tests for:
   - initial pool state;
   - exact-fit allocation;
   - allocation that splits a block;
   - allocation failure when no contiguous block fits;
   - invalid size;
   - valid deallocation;
   - invalid/double free;
   - coalescing two and three adjacent free blocks;
   - repeated allocate/free sequences;
   - pool boundaries and statistics.
6. Choose and prove the frontend-to-C++ integration approach with a minimal request/response test. Keep the interface documented and keep allocator logic in C++.
7. Add a short architecture note and a small viva explanation for every core function.

### Acceptance criteria
- C++ compiles with the selected compiler.
- All allocator tests pass.
- The engine can accept an operation and return a valid, inspectable state through the chosen integration bridge.
- No UI work is allowed to conceal a failing core engine.
- Provide exact build/test commands and actual results.

### Deliverable
A working C++ allocator, tests, and a verified integration spike. Commit this milestone before moving on.

---

## Phase 2 — Design System + Complete Website UI

### Design direction
Create a polished, restrained technical-learning interface. Prioritize hierarchy, spacing, typography, useful data visualization, clear interaction states, and strong mobile layout. Choose a coherent visual direction using the installed UI/UX skill rather than copying a generic SaaS dashboard. Make it distinctive but appropriate for a university DS project.

### Build
- Set up the React + TypeScript + Vite frontend.
- Create design tokens for colors, type, spacing, borders, radii, shadows, and motion.
- Build the app shell and navigation.
- Build the Dashboard, Memory Playground, Linked-List Explorer, Algorithm Walkthrough, Fragmentation Lab, and Learn/Viva views (use routes if that makes the information architecture clearer).
- Build reusable buttons, inputs, cards/panels, status messages, legends, tables, and empty/error/loading states.
- Use a real proportional memory-block visualization with labels/details, not random decorative charts.
- Make all layouts usable at narrow mobile widths and standard laptop/desktop widths.
- Use realistic seeded example content only for an explicitly labelled demo/preview state. Clearly distinguish it from live engine state.

### Acceptance criteria
- Every visible control has a defined behavior or is clearly non-interactive.
- No placeholder links, dead buttons, fake statistics, or “coming soon” screens presented as completed features.
- Main routes render without console errors.
- UI matches the documented design system and works on mobile and desktop.
- Frontend components are ready to receive state from the API; no duplicate allocator algorithm in the UI.

### Deliverable
A complete, consistent website shell and functional UI controls, ready for real engine wiring. Commit the milestone.

---

## Phase 3 — Real Engine Wiring + Learning Experience

### Build
- Connect all allocation/free/reset actions to the real C++ engine through the Phase 1 bridge.
- Render memory blocks, linked-list nodes, statistics, allocation IDs, errors, and history from real responses.
- Make First Fit walkthrough steps correspond to actual traversal/decision points. If the engine does not expose trace events yet, add a simple trace/result structure in C++ rather than inventing steps in React.
- Add scenarios that demonstrate splitting, coalescing, allocation failure, and external fragmentation.
- Add optional allocation strategies only if tested and clearly selectable.
- Keep state transitions deterministic. Reset should restore the initial state; errors must not corrupt the allocator.
- Add clear explanations of the data structures, pointer/link updates, algorithm steps, and time complexity.
- Handle server unavailable, malformed response, invalid input, and allocation failure without crashing.
- Document the request/response contract and how to run both sides.

### Acceptance criteria
- Allocate/free actions in the browser change the actual C++ engine state.
- Refresh/restart behavior is documented; do not imply persistence if state is in-memory.
- Statistics and diagrams always agree with the engine.
- History records real operations, including failed attempts where appropriate.
- No business logic for memory allocation is duplicated in TypeScript.
- Test a complete browser flow from fresh state through allocate, free, coalesce, and reset.

### Deliverable
A fully integrated app with meaningful learning features. Commit the milestone.

---

## Phase 4 — QA, Accessibility, Packaging + Viva Demo

### Build and verify
1. Run all C++ tests and frontend tests.
2. Run production build and fix errors/warnings that affect correctness.
3. Use Playwright CLI or existing browser automation to test the real application; take screenshots at desktop and mobile widths.
4. Test the complete critical flow:
   - open the app;
   - allocate a small block;
   - allocate another block;
   - free the first block;
   - create adjacent free blocks and verify coalescing;
   - demonstrate fragmentation or allocation failure;
   - reset;
   - confirm stats, list, diagram, and history agree.
5. Test invalid inputs, unknown IDs, double-free, service failure, keyboard navigation, focus visibility, contrast, and reduced-motion preference.
6. Fix visible layout defects, console errors, overflow, and dead controls.
7. Add README instructions, architecture diagram/description, algorithm pseudocode, complexity table, known limitations, test commands, and screenshots.
8. Prepare a concise demo script and viva answers grounded in the actual code.

### Acceptance criteria
- All critical tests pass and the report distinguishes passed, failed, skipped, and untested checks.
- Browser QA uses the running app and real inputs, not just static code inspection.
- No known critical issue remains in the main allocate/free/reset flow.
- A teammate can clone/open the project, follow the README, run it, and explain the core algorithm.
- The final demo uses a reliable seeded scenario and does not depend on internet access unless explicitly documented.

### Deliverable
A stable, demo-ready university project with test evidence, documentation, and viva preparation. Commit the final milestone.

---

## 5. Skills: install and use them intentionally

Antigravity supports agent skills through a folder containing `SKILL.md`. The default workspace location is `.agents/skills/<skill-folder>/`. Skills give the agent reusable instructions; they do not guarantee correct code, and you still need to verify results.

### Recommended now: UI/UX Pro Max
Official repository: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

In a terminal opened at the HeapLens project root:
```powershell
npm install -g ui-ux-pro-max-cli
uipro init --ai antigravity
```
If you do not want a global installation, try:
```powershell
npx ui-ux-pro-max-cli init --ai antigravity
```
Then confirm that `.agents/skills/ui-ux-pro-max/SKILL.md` (or the path printed by the installer) exists. Open Antigravity's Customizations/skills view and confirm it is detected. If it is not detected, restart/reload the workspace and inspect the installer's output.

### Recommended: Web Design Guidelines
Official repository: https://github.com/vercel-labs/agent-skills

Install the specific skill, not every skill in the repository:
```powershell
npx skills add vercel-labs/agent-skills --skill web-design-guidelines
```
If it is installed outside Antigravity's recognized workspace skill path, move/copy the skill folder into `.agents/skills/web-design-guidelines/` and ensure `SKILL.md` is directly inside that folder. Do not delete the original until Antigravity detects the workspace copy.

### Recommended later: Playwright CLI
Official repository: https://github.com/microsoft/playwright-cli

Install during Phase 4 (or when browser testing begins):
```powershell
npm install -g @playwright/cli@latest
playwright-cli --help
playwright-cli install --skills=agents
```
If the command's current version uses a different accepted option, inspect `playwright-cli install --help` and follow the installed version's output. Browser testing can also use another already-working Playwright setup; do not install two overlapping systems without a reason.

### Other skills / visual libraries
- Taste/design skills: optional. First verify the exact repository, current install instructions, license, and Antigravity support. Do not run an install command copied from an unverified blog or similarly named repository.
- “Antigravity Awesome Skills”: optional catalog, not a requirement. Install only individual skills that clearly help this project; avoid bulk-installing everything.
- React Three Fiber, shader gradients, liquid-glass libraries, animated liquid logos: not needed for the core project. Add one only if it solves a specific design problem and does not compromise clarity, performance, or time.
- Before installing any skill/library, inspect its README, `SKILL.md`, dependencies, license, and whether it overlaps with something already installed.

Useful official references:
- Antigravity skills documentation: https://antigravity.google/docs/skills?app=antigravity-ide
- UI/UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Vercel agent skills: https://github.com/vercel-labs/agent-skills
- Playwright CLI: https://github.com/microsoft/playwright-cli

---

## 6. Quick setup checklist (Windows)

### Step A — Create/open the project
1. Create/open a folder named `HeapLens` in Antigravity.
2. Create `docs/` inside the project and save this file as `docs/PHASE_PLAN_V2.md`.
3. Initialize Git if this is a new project. Do not overwrite existing work without inspecting it.

### Step B — Check tools in PowerShell
Run:
```powershell
node --version
npm --version
git --version
g++ --version
cmake --version
python --version
```
React/Vite needs Node.js and npm. The C++ engine needs a working C++ compiler. If a command is missing, report that exact command/output before installing more tools.

### Step C — Install the two design skills
Run the UI/UX Pro Max commands above from the project root. Then install Web Design Guidelines. Verify that Antigravity sees both skills before starting implementation. Restart/reload the workspace if needed.

### Step D — Give Antigravity the Phase 0 / Phase 1 kickoff prompt below
Do not ask it to build the entire project in one mega-prompt. Use the phase prompts in sequence, check the acceptance criteria, and commit each working milestone.

---

## 7. First Antigravity prompt — setup + Phase 1 kickoff

Paste this into Antigravity after the file is saved and the skills are installed:

> You are the senior C++ engineer, frontend engineer, product designer, and QA lead for **HeapLens**, a university Data Structures project that implements a simplified dynamic memory allocator using linked lists.
>
> Read `docs/PHASE_PLAN_V2.md` completely before acting. The project has exactly four phases. Follow the phase acceptance criteria. Do not silently expand scope or start later phases early.
>
> **Skills:** Before making UI or UX decisions, find and read the installed `ui-ux-pro-max` skill and use its design-system/search workflow. Before implementing or reviewing the interface, use `web-design-guidelines` if installed. When browser QA begins, use the installed Playwright CLI skill or existing browser-testing tools. If a named skill is missing, tell me the exact missing path and continue only with a clearly stated fallback; do not pretend a skill was used.
>
> **First inspect, do not blindly scaffold:** inspect the current folder, Git status, available files, Node/npm, Python, compiler, CMake, and installed skills. Preserve existing work. Do not overwrite files without inspecting them. If this is an empty workspace, say so.
>
> **Begin with Phase 1 only:** design and implement a simple, readable C++17 allocator using a custom fixed-size pool and linked-list block metadata. Implement First Fit, splitting, free by allocation ID, adjacent-block coalescing, reset, statistics, validation, and useful error responses. Add tests for normal cases and edge cases. Keep the C++ code appropriate for second-year Computer Engineering students and explain every major function in plain language.
>
> Prove the frontend-to-C++ integration approach with the smallest working request/response prototype. Inspect the actual Windows toolchain and choose the simplest reliable bridge; do not assume a library or compiler is installed. The C++ engine must own all allocation decisions. React must not independently simulate allocator logic.
>
> Do not build the full frontend yet. Do not add authentication, a database, 3D, shaders, liquid-glass effects, AI features, or decorative complexity. Do not claim tests passed unless you ran them and show the command and result.
>
> Finish by reporting: files created/changed, architecture decision and reason, exact build/test commands, actual test results, integration proof, unresolved issues, and the next action. Stop at the Phase 1 acceptance criteria and wait for my review.

---

## 8. Reusable prompt for each next phase

After reviewing and committing the previous phase, paste:

> Read `docs/PHASE_PLAN_V2.md` and inspect the current project state and Git diff. Use the appropriate installed skills for this phase, explicitly read their `SKILL.md` files, and follow their guidance. Implement **Phase [2/3/4] only**. Preserve working behavior and the C++ allocator. Run the phase's acceptance checks; report commands and actual results. Do not fake functionality, skip tests silently, claim unverified browser checks, or start the next phase. At the end, list changed files, completed criteria, failures/limitations, and the exact next step.

---

## 9. Project-wide rules for the agent

- Read the plan and relevant existing code before editing.
- Make focused changes and preserve working code.
- Keep C++ algorithms understandable and explainable by the student team.
- Keep the frontend as a view/controller; C++ owns allocator decisions.
- Use skills when relevant, and state when a skill is unavailable rather than pretending.
- Prefer accessible, responsive, polished design over generic AI dashboard patterns.
- Use real browser interaction and screenshots for visual QA.
- Do not invent data, test results, or integration behavior.
- Avoid unnecessary dependencies and installations.
- Run tests after meaningful changes; report failures honestly.
- Keep secrets out of source control.
- Commit each phase only after its acceptance criteria are verified.
