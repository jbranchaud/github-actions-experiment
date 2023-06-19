type CheckFunction = ({event, step}: { event: any; step: any}) => Promise<void>

export const runHealthChecks = async (checksFn: CheckFunction) => {
  const event = { time: new Date() }
  const run = async (testDescription: string, testFunction: () => Promise<any>) => {
    console.log(testDescription);
    const result = await testFunction()
    console.log(result)
  }
  const xrun = async (testDescription: string, _testFunction: () => Promise<any>) => {
    console.log(`Skipping "${testDescription}"`)
  }
  const step = {
    run,
    xrun
  }

  await checksFn({ event, step })

  process.exit(0);
}
