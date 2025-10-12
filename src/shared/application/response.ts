export interface IRespuesta<T> {
  success: boolean;
  data: T | null;
  error?: string | string[] | object | null;
}

export function crearRespuesta<T>({
  success = false,
  data = null,
  error = null,
}: {
  success: boolean;
  data?: T | null;
  error?: string | string[] | object | null;
}): IRespuesta<T> {
  return {
    success,
    data,
    error,
  };
}
