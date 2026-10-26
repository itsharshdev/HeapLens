#include "allocator.h"
#include "json_helper.h"
#include <iostream>
#include <string>
#include <sstream>
#include <cctype>
#include <cstdlib>

using namespace heaplens;

// Simple string field extractor from JSON without heavy external dependencies
static std::string extractJsonString(const std::string& json, const std::string& key) {
    std::string needle = "\"" + key + "\"";
    size_t pos = json.find(needle);
    if (pos == std::string::npos) return "";

    pos += needle.length();
    // skip whitespace and colon
    while (pos < json.length() && (std::isspace(json[pos]) || json[pos] == ':')) {
        pos++;
    }
    if (pos >= json.length() || json[pos] != '"') return "";
    pos++; // skip opening quote

    std::string result;
    while (pos < json.length()) {
        char c = json[pos];
        if (c == '\\' && pos + 1 < json.length()) {
            result += json[pos + 1];
            pos += 2;
        } else if (c == '"') {
            break;
        } else {
            result += c;
            pos++;
        }
    }
    return result;
}

// Simple integer field extractor from JSON
static long long extractJsonInt(const std::string& json, const std::string& key, long long defaultVal = -1) {
    std::string needle = "\"" + key + "\"";
    size_t pos = json.find(needle);
    if (pos == std::string::npos) return defaultVal;

    pos += needle.length();
    // skip whitespace and colon
    while (pos < json.length() && (std::isspace(json[pos]) || json[pos] == ':')) {
        pos++;
    }
    if (pos >= json.length()) return defaultVal;

    size_t start = pos;
    if (json[pos] == '-' || json[pos] == '+') pos++;
    while (pos < json.length() && std::isdigit(json[pos])) {
        pos++;
    }

    if (pos > start) {
        try {
            return std::stoll(json.substr(start, pos - start));
        } catch (...) {
            return defaultVal;
        }
    }
    return defaultVal;
}

// Execute JSON command line and return JSON response line
static std::string processJsonCommand(Allocator& alloc, const std::string& line) {
    std::string action = extractJsonString(line, "action");
    if (action.empty()) {
        return errorToJson("unknown", "Missing or invalid 'action' in JSON command.");
    }

    if (action == "ping") {
        return "{\"success\":true,\"action\":\"ping\",\"message\":\"HeapLens C++ Engine is active\"}";
    }

    if (action == "init" || action == "reset") {
        long long poolSize = extractJsonInt(line, "poolSize", -1);
        if (poolSize > 0) {
            alloc.reset(static_cast<size_t>(poolSize));
        } else {
            alloc.reset();
        }
        return stateToJson(alloc, action);
    }

    if (action == "getState") {
        return stateToJson(alloc, "getState");
    }

    if (action == "allocate") {
        long long size = extractJsonInt(line, "size", -1);
        if (size <= 0) {
            return allocationResultToJson(alloc, AllocationResult{
                false, 0, 0, 0, "Invalid size: must specify a positive integer 'size'.", {}
            });
        }
        AllocationResult res = alloc.allocate(static_cast<size_t>(size));
        return allocationResultToJson(alloc, res);
    }

    if (action == "free" || action == "deallocate") {
        long long allocId = extractJsonInt(line, "allocId", -1);
        if (allocId <= 0) {
            return deallocationResultToJson(alloc, DeallocationResult{
                false, static_cast<int>(allocId), 0, 0, "Invalid allocId: must specify a positive integer 'allocId'.", {}
            });
        }
        DeallocationResult res = alloc.deallocate(static_cast<int>(allocId));
        return deallocationResultToJson(alloc, res);
    }

    return errorToJson(action, "Unrecognized action: " + action);
}

// Interactive terminal REPL for student viva and local testing
static void runInteractiveRepl(Allocator& alloc) {
    std::cout << "========================================================\n";
    std::cout << "  HeapLens C++ Dynamic Memory Allocator Engine (Interactive)\n";
    std::cout << "  Pool capacity: " << alloc.getPoolSize() << " units\n";
    std::cout << "  Commands:\n";
    std::cout << "    allocate <size>   - Allocate memory block using First Fit\n";
    std::cout << "    free <id>         - Free allocation by ID and coalesce\n";
    std::cout << "    state             - Display block linked list and stats\n";
    std::cout << "    reset [size]      - Reset pool to initial empty state\n";
    std::cout << "    json <json_cmd>   - Process a raw JSON protocol command\n";
    std::cout << "    exit / quit       - Terminate session\n";
    std::cout << "========================================================\n";

    std::string line;
    while (true) {
        std::cout << "\nheaplens> " << std::flush;
        if (!std::getline(std::cin, line)) break;

        std::istringstream iss(line);
        std::string cmd;
        if (!(iss >> cmd)) continue;

        if (cmd == "exit" || cmd == "quit") {
            std::cout << "Exiting HeapLens engine.\n";
            break;
        } else if (cmd == "allocate" || cmd == "alloc") {
            size_t sz = 0;
            if (!(iss >> sz) || sz == 0) {
                std::cout << "Usage: allocate <positive_size>\n";
                continue;
            }
            AllocationResult res = alloc.allocate(sz);
            if (res.success) {
                std::cout << "[SUCCESS] Allocated " << res.allocatedSize
                          << " units at offset " << res.allocatedOffset
                          << " with Allocation ID " << res.allocId << "\n";
            } else {
                std::cout << "[FAILED] " << res.errorMessage << "\n";
            }
            std::cout << "Traversal Steps (" << res.trace.size() << "):\n";
            for (const auto& step : res.trace) {
                std::cout << "  Step " << step.stepIndex << ": Offset " << step.blockOffset
                          << ", Size " << step.blockSize
                          << " (" << (step.isFree ? "Free" : "Allocated ID " + std::to_string(step.allocId))
                          << ") -> [" << step.decision << "] " << step.reason << "\n";
            }
        } else if (cmd == "free") {
            int id = 0;
            if (!(iss >> id) || id <= 0) {
                std::cout << "Usage: free <positive_id>\n";
                continue;
            }
            DeallocationResult res = alloc.deallocate(id);
            if (res.success) {
                std::cout << "[SUCCESS] Freed Allocation ID " << res.freedId
                          << " at offset " << res.freedOffset
                          << " (size " << res.freedSize << ")\n";
                if (!res.coalesceEvents.empty()) {
                    std::cout << "Coalescing Events (" << res.coalesceEvents.size() << "):\n";
                    for (const auto& evt : res.coalesceEvents) {
                        std::cout << "  * " << evt.message << "\n";
                    }
                }
            } else {
                std::cout << "[FAILED] " << res.errorMessage << "\n";
            }
        } else if (cmd == "state" || cmd == "stats") {
            Stats s = alloc.getStats();
            std::cout << "--- Pool Statistics ---\n";
            std::cout << "  Total Capacity: " << s.totalPoolSize << " units\n";
            std::cout << "  Allocated:      " << s.totalAllocated << " units (" << s.allocatedBlockCount << " blocks)\n";
            std::cout << "  Free:           " << s.totalFree << " units (" << s.freeBlockCount << " blocks)\n";
            std::cout << "  Largest Free:   " << s.largestFreeBlock << " units\n";
            std::cout << "  Fragmentation:  " << s.externalFragmentationPercent << "%\n";
            std::cout << "--- Linked List Blocks ---\n";
            auto blocks = alloc.getBlocks();
            for (size_t i = 0; i < blocks.size(); ++i) {
                const auto& b = blocks[i];
                std::cout << "  [" << i << "] Offset " << b.startOffset
                          << ".." << (b.startOffset + b.size)
                          << " (size " << b.size << ") -> "
                          << (b.isFree ? "FREE" : "ALLOCATED (ID " + std::to_string(b.allocId) + ")")
                          << "\n";
            }
        } else if (cmd == "reset") {
            size_t newSz = 0;
            if (iss >> newSz) {
                alloc.reset(newSz);
                std::cout << "Reset pool with new size " << newSz << " units.\n";
            } else {
                alloc.reset();
                std::cout << "Reset pool to initial capacity (" << alloc.getPoolSize() << " units).\n";
            }
        } else if (cmd == "json") {
            std::string jsonPayload;
            std::getline(iss, jsonPayload);
            std::cout << processJsonCommand(alloc, jsonPayload) << "\n";
        } else {
            std::cout << "Unknown command '" << cmd << "'. Type 'state', 'allocate', 'free', 'reset', or 'exit'.\n";
        }
    }
}

int main(int argc, char* argv[]) {
    bool interactive = false;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--interactive" || arg == "-i") {
            interactive = true;
        } else if (arg == "--help" || arg == "-h") {
            std::cout << "HeapLens C++ Dynamic Memory Allocator Engine\n";
            std::cout << "Usage:\n";
            std::cout << "  heaplens_engine [options]\n";
            std::cout << "Options:\n";
            std::cout << "  --bridge          Run in JSON-lines stdio protocol mode (default)\n";
            std::cout << "  --interactive, -i Run in terminal interactive REPL mode\n";
            std::cout << "  --help, -h        Show this help message\n";
            return 0;
        }
    }

    Allocator alloc(100);

    if (interactive) {
        runInteractiveRepl(alloc);
    } else {
        // Standard JSON-lines bridge mode over stdin / stdout
        std::string line;
        while (std::getline(std::cin, line)) {
            if (line.empty()) continue;
            std::string response = processJsonCommand(alloc, line);
            std::cout << response << "\n" << std::flush;
        }
    }

    return 0;
}
