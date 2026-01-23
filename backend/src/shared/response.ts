/**
 * Standard success API response
 */
export function successResponse<T>(data: T) {
  return {
    success: true,
    data,
    error: null,
  };
}
