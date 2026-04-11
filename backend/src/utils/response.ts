/**
 * Format response sukses.
 * Contoh: res.status(200).json(successResponse(data, 'Berhasil'))
 */
export function successResponse<T>(data: T, message = 'Success') {
  return {
    success: true as const,
    message,
    data,
  };
}

/**
 * Format response error.
 * Contoh: res.status(400).json(errorResponse('Validasi gagal', errors))
 */
export function errorResponse(message: string, errors?: unknown) {
  return {
    success: false as const,
    message,
    ...(errors !== undefined && { errors }),
  };
}

/**
 * Format response dengan paginasi.
 * Contoh: res.json(paginatedResponse(items, total, page, limit))
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success',
) {
  return {
    success: true as const,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
