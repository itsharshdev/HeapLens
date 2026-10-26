# HeapLens — A Visual Dynamic Memory Allocator

**A high-precision educational instrument demonstrating dynamic memory management using a singly linked-list allocator.**  
*Semester Data Structures & Algorithms Project — Computer Engineering*

---

## 1. Overview & Vision

Dynamic memory management (`malloc`/`free` or `new`/`delete`) is one of the most critical abstractions in systems software. Traditional university courses explain heap allocators through static chalkboard diagrams that obscure the pointer mechanics of block traversal, dynamic splitting, and coalescing.

**HeapLens** bridges this gap: it pairs a compiled **C++17 dynamic memory allocator** with a real-time, interactive frontend featuring **3D spatial visualization**, an **interactive First Fit trace player**, a **deallocation & coalescing inspector**, and an **educational strategy comparator**.

> **Important Technical Distinction:**  
> HeapLens models memory allocation *algorithmically* over a simulated contiguous arena. It does not replace or hook system memory (`ptmalloc`, `VirtualAlloc`, or `mmap`), making it safe, transparent, and completely inspectable.

---

## 2. End-to-End Architecture

HeapLens maintains strict architectural separation between presentation, IPC bridging, and the core algorithmic engine:

```
┌─────────────────────────────────────────────────────────────┐
│                 1. React 18 + TypeScript UI                 │
│         (Three.js 3D Arena, 2D Partition Map, Hash Router)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST (Port 5173 -> 3001)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             2. Zero-Dependency Node.js Bridge               │
│        (HTTP Server, IPC Child Process Supervisor)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Bidirectional stdio JSON-Lines
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            3. Authoritative C++17 Allocator Engine          │
│       (build/heaplens_engine.exe --bridge: Single Source)   │
└─────────────────────────────────────────────────────────────┘
```

1. **Frontend Layer (`src-ui/`)**: Built with React 18, TypeScript, and Three.js. Provides dual 2D/3D visualizations, an interactive First Fit trace player, coalescing breakdown diagrams, and three design themes. No memory allocation logic is ever duplicated in TypeScript.
2. **Bridge Layer (`bridge/server.js`)**: A lightweight, zero-dependency Node.js HTTP bridge that runs on port 3001. It supervises the persistent C++ child process and translates HTTP API calls into JSON-lines piped to `stdin`/`stdout`.
3. **Core Engine (`src/`)**: A compiled C++17 allocator managing a contiguous memory pool via a singly linked list of `Block` metadata structs. Enforces strict pool boundaries, First Fit candidate traversal, dynamic splitting, single-pass coalescing, and invariant checks.

---

## 3. Core Features & Capabilities

- **3D Contiguous Memory Bus Arena**: Interactive Three.js scene featuring real-time block geometry, wireframe bevels, tactile hover elevation, mouse-parallax camera orbit, and an amber scan pulse for active trace steps.
- **Proportional 2D Memory Map**: Pixel-accurate contiguous memory strip with exact hex address boundaries (`0x00` through `0x64`) and click-to-inspect block cards.
- **Interactive First Fit Trace Player**: Step through the exact decision points emitted by the C++ engine: Play, Pause, Step Forward, Step Backward, Restart, and Speed toggle (`0.5x`, `1x`, `2x`).
- **Deallocation & Coalescing Inspector**: Visualizes single-stage (2 adjacent blocks) and two-stage (3 adjacent blocks) coalescing with pointer bypass diagrams.
- **Guided Educational Scenarios**:
  - `1. Block Splitting`: Allocates 35u from a clean 100u pool to demonstrate node division.
  - `2. Coalescing (3 Blocks)`: Allocates 5 blocks, frees outer blocks, and frees the middle block to trigger true 3-block coalescing.
  - `3. External Fragmentation`: Allocates and frees alternating blocks to prove why a 35u allocation fails when total free space is 40u but largest contiguous block is only 20u.
- **Strategy Comparator**: Educational model comparing First Fit (HeapLens live engine) against theoretical Best Fit and Worst Fit over configurable request sizes.
- **Three Fully Supported Themes**:
  - **Obsidian Dark** (Default)
  - **Laboratory Light** (High contrast, paper-clean)
  - **HeapLens Lab** (Authentic CRT phosphor terminal)

---

## 4. Algorithmic Complexity

| Operation | Time Complexity | Space Complexity | Implementation Mechanism |
| :--- | :---: | :---: | :--- |
| **First Fit Allocate** | $O(N)$ worst, $O(1)$ best | $O(1)$ | Linear traversal from `m_head`; stops on first free block $\ge$ size; splits remainder in $O(1)$. |
| **Deallocate (by ID)** | $O(N)$ | $O(1)$ | Scans linked list for `allocId`, validates state, marks `isFree = true`, and triggers coalescing. |
| **Adjacent Coalescing** | $O(N)$ | $O(1)$ | Single-pass while loop; merges adjacent free nodes and frees redundant metadata node. |
| **Reset Pool** | $O(N)$ | $O(1)$ | Deletes all allocated nodes and restores a single free block spanning $[0, \text{poolSize})$. |

---

## 5. Prerequisites & Quickstart

### Prerequisites
- **C++ Compiler**: GCC with C++17 support (MinGW GCC 6.3.0+ on Windows, Clang, or MSVC)
- **Node.js**: v18.0.0 or higher
- **Web Browser**: Google Chrome, Microsoft Edge, or Chromium

### Installation & Launch

1. **Clone the repository and install dependencies:**
   ```powershell
   git clone https://github.com/your-username/HeapLens.git
   cd HeapLens
   npm install
   ```

2. **Start the API Bridge Server:**
   ```powershell
   npm start
   ```
   *Runs on `http://localhost:3001` and launches the C++ child process.*

3. **Start the Vite Frontend (in a second terminal):**
   ```powershell
   npm run dev
   ```
   *Opens the web app at `http://localhost:5173`.*

4. **Run Terminal REPL (Optional):**
   ```powershell
   npm run repl
   ```
   *Interactive command-line interface to test the C++ engine directly (`allocate 25`, `free 1`, `state`, `reset`).*

---

## 6. Verification & Automated Testing

HeapLens includes 3 layers of automated tests:

### A. C++ Unit Tests (12/12 Passing)
```powershell
npm run test:cpp
```
*Tests pool boundaries, exact fit, block splitting, OOM fragmentation, invalid inputs, deallocation, double-free prevention, 2- and 3-block coalescing, and traversal traces.*

### B. End-to-End Integration Proof (7/7 Passing)
```powershell
npm run test:integration
```
*Tests live IPC communication between Node.js and the compiled `build/heaplens_engine.exe` binary over stdio JSON-lines.*

### C. Playwright Multi-Viewport Browser QA (15/15 Passing)
```powershell
npm run test:browser
```
*Launches system Chromium to verify:*
- Desktop (1440x900)
- Laptop/Tablet (1024x768)
- Mobile (390x844)
- 0 Console Errors and 0 Page Errors.

---

## 7. Viva & Project Defense Guide

When presenting HeapLens for university project defense, follow this structured demonstration flow:

### Step 1: Motivation & Problem Statement
- **Explanation**: "In C++, `new` and `delete` request heap memory. Under the hood, memory allocators must track which regions of memory are free and which are occupied without wasting memory. HeapLens simulates an explicit, singly linked-list dynamic memory allocator over a contiguous arena."

### Step 2: Allocation & Splitting Demo
1. Navigate to `/#/playground`.
2. Click **Scenario 1: Block Splitting**.
3. **Observation**: Point to the 3D Arena and 2D map. Show how the 100-unit free block splits into 35 units allocated at offset `0x00` and 65 units of free remainder at offset `0x23`.
4. Point to the **Trace Player**: Step forward to show how the First Fit algorithm evaluated the candidate block and made the split decision.

### Step 3: Deallocation & 3-Block Coalescing Demo
1. In Playground, click **Scenario 2: Coalescing (3 Blocks)**.
2. **Observation**: Explain: "5 blocks were allocated. Blocks #2 and #4 were freed, leaving block #3 isolated in the center. When block #3 is freed, the allocator inspects both its left and right neighbors. Because both are free, it executes a two-stage merge, synthesizing a 60-unit contiguous block in $O(1)$ pointer redirection without copying memory data."
3. Inspect the **Coalescing Inspector** card showing the exact offset and size math.

### Step 4: External Fragmentation Defense
1. In Playground, click **Scenario 3: External Fragmentation**.
2. **Observation**: The pool contains 40 units of total free space, but split as two isolated 20-unit blocks. A request for 35 units fails with:
   > `Allocation failure: no free block has at least 35 contiguous units (largest free block is 20 units)`.
3. Explain the formula:
   $$\text{External Fragmentation \%} = \left(1.0 - \frac{\text{LargestFreeBlock}}{\text{TotalFreeSpace}}\right) \times 100\% = \left(1.0 - \frac{20}{40}\right) \times 100\% = 50.0\%$$

### Step 5: Singly Linked-List Invariants
1. Navigate to `/#/linked-list`.
2. Review the **Verified Invariants HUD**:
   - **Contiguity Invariant**: $\text{startOffset}[i] = \text{startOffset}[i-1] + \text{size}[i-1]$.
   - **Total Coverage Invariant**: $\sum \text{size} = 100$ units.
   - **Coalescing Invariant**: No two adjacent free blocks coexist.
3. Review the C++ `Block` struct code panel mapping directly to `src/block.h`.

---

## 8. License & Authors

- **Course**: Data Structures & Algorithms (Semester III/IV)
- **Engine**: C++17 Standard Compliant
- **License**: MIT Open Source
