// Test imports
import {
  createSuccessResponse,
  createErrorResponse,
  paginateData,
  filterAndSort,
  buildSortComparator,
  HTTP_STATUS,
  ErrorCode,
} from "./lib/api/handlers.js";

// This will verify that all functions are properly exported
console.log("✓ createSuccessResponse:", typeof createSuccessResponse);
console.log("✓ createErrorResponse:", typeof createErrorResponse);
console.log("✓ paginateData:", typeof paginateData);
console.log("✓ filterAndSort:", typeof filterAndSort);
console.log("✓ buildSortComparator:", typeof buildSortComparator);
console.log("✓ HTTP_STATUS:", typeof HTTP_STATUS);
console.log("✓ ErrorCode:", typeof ErrorCode);
