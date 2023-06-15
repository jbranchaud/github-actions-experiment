import { chromium as playwrightChromium } from 'playwright-core';
import {retry} from './src/retry.mjs'

const chromium = (() => {
  const launch = async () => {
    return playwrightChromium.launch({headless: true})
  }

  return { launch }
})()

const baseUrl = 'https://protailwind.com'

function isValidMonetaryValue(value) {
  const re = /^\$?\d+(\.\d{2})?$/;
  return re.test(value);
}

export const testProTailwind = async ({ event, step }) => {
  await step.run('Test Core CTAs', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const body = {};

    await page.goto(baseUrl);

    await page.waitForTimeout(500)

    // Look for the Log In link
    const logInLinkVisible = await page
      .getByRole('link')
      .filter({ hasText: 'Log in' })
      .isVisible()

    if(logInLinkVisible) {
      body.logInLinkVisible = true
    } else {
      throw new Error("Log In link not visible on Pro Tailwind home page");
    }

    // Look for the email sign up form
    const signUpFormVisible = await page
      .getByRole('button')
      .filter({ hasText: 'Sign Up Today' })
      .isVisible()

    if(signUpFormVisible) {
      body.signUpFormVisible = true
    } else {
      throw new Error("Sign Up Form/Button not visible on Pro Tailwind home page");
    }

    return { event, body }
  })

  await step.run('Test Price Display', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const body = {}

    await page.goto(baseUrl);

    await page.getByRole('link').filter({ hasText: 'Pro Workshops' }).click()

    await page.getByRole('link').filter({ hasText: 'Multi-Style Tailwind Components' }).click()

    const headingVisible = await page
      .getByRole('heading')
      .filter({ hasText: 'Multi-Style Tailwind Components' })
      .isVisible()

    if(headingVisible) {
      body.mainHeadingVisible = true
    } else {
      throw new Error("Main heading not visible on Multi-Style Tailwind Components page");
    }

    // Sometimes the pricing takes a moment to load
    await page.waitForTimeout(500)

    const customSleep = async (retryIntervalMs) => { await page.waitForTimeout(retryIntervalMs) }
    const options = { retries: 3, retryIntervalMs: 500, customSleep }
    const {validPricing, text} = await retry(async () => {
      // Find the div with the 'data-price' attribute within the main div
      const pricingDiv = await page.$('div#main-pricing div[data-price]');
      const text = (pricingDiv && await pricingDiv.textContent()) || '';
      const validPricing = isValidMonetaryValue(text)

      if(validPricing) {
        return { validPricing, text }
      } else {
        throw new Error(`A valid price isn't currently displaying after ${options.retries} retries, text: ${text}`)
      }
    }, options)

    // Check if the price is displaying as a valid number
    if (validPricing) {
      body.validPricingVisible = true
    } else {
      await page.screenshot({ path: 'screenshot.png', fullPage: true });
      throw new Error(`Div with 'data-price' attribute not found within the '#main-pricing' div. Instead, found ${text}`);
    }

    return { event, body };
  })

  await step.run('Test View a Tutorial Video', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(baseUrl);

    // Go to Tutorials
    await page.getByRole('link').filter({ hasText: 'Tutorials' }).click()

    // Go to Background Split Alignment
    await page
    .getByRole('link')
    .filter({ hasText: 'Background Split Alignment' })
    .click();

    // Start Learning
    await page
    .getByRole('link')
    .filter({ hasText: 'Start Learning' })
    .click()

    await page.waitForTimeout(500)

    const headingVisible =
      await page
      .getByRole('heading', { name: "Introduction to the Background Split Tutorial" })
      .isVisible()

    if(!headingVisible) {
      await page.screenshot({ path: 'screenshot.png', fullPage: true });
      throw new Error("Heading not visible on first exercise of Intro to Background Split Tutorial");
    }

    await page.waitForTimeout(500)

    const customSleep = async (retryIntervalMs) => { await page.waitForTimeout(retryIntervalMs) }
    const options = { retries: 3, retryIntervalMs: 500, customSleep }
    const {videoTagVisible} = await retry(async () => {
      console.log("Checking for Video tag")
      const videoVisible = await page.locator('video').isVisible()

      if(videoVisible) {
        return { videoTagVisible: true }
      } else {
        throw new Error("Video tag not visible on first exercise of Intro to Background Split Tutorial");
      }
    }, options)

    return { event, body: { videoTagVisible } }
  })
}

(async () => {
  const event = { time: new Date() }
  const run = async (testDescription, testFunction) => {
    console.log(testDescription);
    const result = await testFunction()
    console.log(result)
  }
  const xrun = async (testDescription, _testFunction) => {
    console.log(`Skipping "${testDescription}"`)
  }
  const step = {
    run,
    xrun
  }

  await testProTailwind({ event, step })

  process.exit(0);
})()
