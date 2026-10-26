# HeapLens

**Simplified Dynamic Memory Allocator using Linked Lists**  
*A university Data Structures project demonstrating custom heap allocation, block splitting, coalescing, and external fragmentation.*

---

## Current Status: Phase 1 Complete

- **Phase 1 (C++ Engine & Integration Proof):** Completed and verified.
- **Phase 2 (Design System & Complete Website UI):** Ready to begin.
- **Phase 3 (Real Engine Wiring & Learning Experience):** Pending.
- **Phase 4 (QA, Accessibility, Packaging & Viva Demo):** Pending.

---

## Quickstart

### Prerequisites
- C++ Compiler with C++17 support (e.g. `g++` / MinGW GCC 6.3.0+ or Clang or MSVC)
- Node.js (v18+)

### Build & Run All Tests
```powershell
# Using npm
npm test

# Or using the PowerShell build script
.\build.ps1
```

### Run the Interactive Terminal REPL
Explore the allocator interactively from the command line:
```powershell
npm run repl
```
Commands in REPL:
- `allocate 25` - Allocates 25 units using First Fit and displays traversal trace
- `free 1` - Frees Allocation ID 1 and shows coalescing events
- `state` - Prints pool layout and statistics
- `reset` - Restores pool to initial single-free-block state
- `exit` - Quits REPL

### Run the API Bridge Server
Start the lightweight Node.js HTTP bridge that connects to the live C++ engine:
```powershell
npm start
```
The bridge runs on `http://localhost:3001` with endpoints:
- `GET /api/health` - Bridge and C++ engine status
- `GET /api/state` - Pool layout, block list, and live stats
- `POST /api/allocate` - JSON body: `{ "size": 30 }`
- `POST /api/free` - JSON body: `{ "allocId": 1 }`
- `POST /api/reset` - JSON body: `{ "poolSize": 100 }`

---

## Project Structure
```
HeapLens/
├── docs/
│   ├── PHASE_PLAN_V2.md      # Full 4-phase project roadmap & acceptance criteria
│   └── ARCHITECTURE.md       # C++ design, algorithms, invariants & viva guide
├── src/
│   ├── block.h               # Block metadata struct for singly linked list
│   ├── allocator.h           # Allocator class & result/trace structures
│   ├── allocator.cpp         # First Fit, split, deallocate & coalesce logic
│   ├── json_helper.h         # JSON serialization helper
│   └── main.cpp              # Engine binary CLI (stdio JSON-lines & REPL)
├── tests/
│   ├── test_allocator.cpp    # 12 automated C++ unit tests
│   └── test_integration.js   # Automated Node.js <-> C++ integration proof
├── bridge/
│   └── server.js             # Zero-dependency Node.js HTTP bridge
├── build.ps1                 # PowerShell build & test automation script
├── package.json              # Project scripts & configuration
└── README.md                 # Project documentation
```

---

## Technical Distinction
Standard C++ `new` and `delete` operate via the runtime/OS heap allocator (e.g. `ptmalloc` or Windows Heap Manager). HeapLens models dynamic memory management algorithmically within a custom simulated arena for transparent educational visualization.
