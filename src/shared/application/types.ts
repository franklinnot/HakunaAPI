export interface Respuesta<T> {
  success?: boolean | null;
  data?: T | null;
  error?: string | string[] | null | object;
}

export function crearRespuesta<T>({
  success = null,
  data = null,
  error = null,
}: Respuesta<T>): Respuesta<T> {
  return {
    success,
    data,
    error,
  };
}
