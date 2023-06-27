export async function httpPost<T>(
  url: string,
  data: Record<string, unknown>,
  headers?: HeadersInit
): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers,
  })
  const result = await response.json()
  return result
}
