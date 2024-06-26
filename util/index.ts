export async function invokeAsyncAndPrintTimeConsuming<T>(promise: Promise<T>) {
  const startedAt = performance.now();
  const result = await promise;
  const finishedAt = performance.now();
  const timeConsumption = finishedAt - startedAt;

  console.info(`Time consumption: ${timeConsumption.toFixed(2)} milliseconds`);

  return result;
}
