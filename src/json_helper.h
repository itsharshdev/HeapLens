#ifndef HEAPLENS_JSON_HELPER_H
#define HEAPLENS_JSON_HELPER_H

#include "allocator.h"
#include <string>
#include <sstream>
#include <iomanip>

namespace heaplens {

inline std::string escapeJson(const std::string& s) {
    std::ostringstream o;
    for (char c : s) {
        if (c == '"') o << "\\\"";
        else if (c == '\\') o << "\\\\";
        else if (c == '\b') o << "\\b";
        else if (c == '\f') o << "\\f";
        else if (c == '\n') o << "\\n";
        else if (c == '\r') o << "\\r";
        else if (c == '\t') o << "\\t";
        else if (static_cast<unsigned char>(c) < 32) {
            // omit unprintable control character
        } else {
            o << c;
        }
    }
    return o.str();
}

inline std::string blockToJson(const Block& b) {
    std::ostringstream oss;
    oss << "{"
        << "\"startOffset\":" << b.startOffset << ","
        << "\"size\":" << b.size << ","
        << "\"isFree\":" << (b.isFree ? "true" : "false") << ","
        << "\"allocId\":" << b.allocId
        << "}";
    return oss.str();
}

inline std::string statsToJson(const Stats& s) {
    std::ostringstream oss;
    oss << "{"
        << "\"totalPoolSize\":" << s.totalPoolSize << ","
        << "\"totalAllocated\":" << s.totalAllocated << ","
        << "\"totalFree\":" << s.totalFree << ","
        << "\"largestFreeBlock\":" << s.largestFreeBlock << ","
        << "\"freeBlockCount\":" << s.freeBlockCount << ","
        << "\"allocatedBlockCount\":" << s.allocatedBlockCount << ","
        << "\"externalFragmentationPercent\":" << std::fixed << std::setprecision(2) << s.externalFragmentationPercent
        << "}";
    return oss.str();
}

inline std::string stepTraceToJson(const StepTrace& t) {
    std::ostringstream oss;
    oss << "{"
        << "\"stepIndex\":" << t.stepIndex << ","
        << "\"blockOffset\":" << t.blockOffset << ","
        << "\"blockSize\":" << t.blockSize << ","
        << "\"isFree\":" << (t.isFree ? "true" : "false") << ","
        << "\"allocId\":" << t.allocId << ","
        << "\"decision\":\"" << escapeJson(t.decision) << "\","
        << "\"reason\":\"" << escapeJson(t.reason) << "\""
        << "}";
    return oss.str();
}

inline std::string coalesceEventToJson(const CoalesceEvent& e) {
    std::ostringstream oss;
    oss << "{"
        << "\"leftOffset\":" << e.leftOffset << ","
        << "\"leftSize\":" << e.leftSize << ","
        << "\"rightOffset\":" << e.rightOffset << ","
        << "\"rightSize\":" << e.rightSize << ","
        << "\"newSize\":" << e.newSize << ","
        << "\"message\":\"" << escapeJson(e.message) << "\""
        << "}";
    return oss.str();
}

inline std::string blocksArrayToJson(const std::vector<Block>& blocks) {
    std::ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < blocks.size(); ++i) {
        if (i > 0) oss << ",";
        oss << blockToJson(blocks[i]);
    }
    oss << "]";
    return oss.str();
}

inline std::string stateToJson(const Allocator& alloc, const std::string& action = "getState") {
    Stats s = alloc.getStats();
    auto blocks = alloc.getBlocks();

    std::ostringstream oss;
    oss << "{"
        << "\"success\":true,"
        << "\"action\":\"" << escapeJson(action) << "\","
        << "\"poolSize\":" << alloc.getPoolSize() << ","
        << "\"nextAllocId\":" << alloc.getNextAllocId() << ","
        << "\"stats\":" << statsToJson(s) << ","
        << "\"blocks\":" << blocksArrayToJson(blocks)
        << "}";
    return oss.str();
}

inline std::string allocationResultToJson(const Allocator& alloc, const AllocationResult& res) {
    Stats s = alloc.getStats();
    auto blocks = alloc.getBlocks();

    std::ostringstream oss;
    oss << "{"
        << "\"success\":" << (res.success ? "true" : "false") << ","
        << "\"action\":\"allocate\","
        << "\"allocId\":" << res.allocId << ","
        << "\"allocatedOffset\":" << res.allocatedOffset << ","
        << "\"allocatedSize\":" << res.allocatedSize << ","
        << "\"errorMessage\":\"" << escapeJson(res.errorMessage) << "\","
        << "\"trace\":[";
    for (size_t i = 0; i < res.trace.size(); ++i) {
        if (i > 0) oss << ",";
        oss << stepTraceToJson(res.trace[i]);
    }
    oss << "],"
        << "\"stats\":" << statsToJson(s) << ","
        << "\"blocks\":" << blocksArrayToJson(blocks)
        << "}";
    return oss.str();
}

inline std::string deallocationResultToJson(const Allocator& alloc, const DeallocationResult& res) {
    Stats s = alloc.getStats();
    auto blocks = alloc.getBlocks();

    std::ostringstream oss;
    oss << "{"
        << "\"success\":" << (res.success ? "true" : "false") << ","
        << "\"action\":\"free\","
        << "\"freedId\":" << res.freedId << ","
        << "\"freedOffset\":" << res.freedOffset << ","
        << "\"freedSize\":" << res.freedSize << ","
        << "\"errorMessage\":\"" << escapeJson(res.errorMessage) << "\","
        << "\"coalesceEvents\":[";
    for (size_t i = 0; i < res.coalesceEvents.size(); ++i) {
        if (i > 0) oss << ",";
        oss << coalesceEventToJson(res.coalesceEvents[i]);
    }
    oss << "],"
        << "\"stats\":" << statsToJson(s) << ","
        << "\"blocks\":" << blocksArrayToJson(blocks)
        << "}";
    return oss.str();
}

inline std::string errorToJson(const std::string& action, const std::string& err) {
    std::ostringstream oss;
    oss << "{"
        << "\"success\":false,"
        << "\"action\":\"" << escapeJson(action) << "\","
        << "\"error\":\"" << escapeJson(err) << "\""
        << "}";
    return oss.str();
}

} // namespace heaplens

#endif // HEAPLENS_JSON_HELPER_H
