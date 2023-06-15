/**
 * Runs the function `fn`
 * and retries automatically if it fails.
 *
 * Tries max `1 + retries` times
 * with `retryIntervalMs` milliseconds between retries.
 *
 * From https://mtsknn.fi/blog/js-retry-on-fail/
 */
const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))

export const retry = async (
  fn,
  options,
) => {
  const { retries, retryIntervalMs, customSleep } = options

  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }
    if(Boolean(customSleep)) {
      await customSleep(retryIntervalMs)
    } else {
      await sleep(retryIntervalMs)
    }
    return retry(fn, { ...options, retries: retries - 1 })
  }
}
