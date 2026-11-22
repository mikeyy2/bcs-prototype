import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** P8 — E-01, E-02, E-02a (WBS 3.1.1, 3.1.2, 3.2.1, 3.2.2). */

async function signIn(page: Page) {
  await page.goto('./#/login')
  await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
}

/** evt-3 Holiday Gift Wrapping Night is seeded at capacity. */
const FULL_EVENT = './#/events/evt-3'
const OPEN_EVENT = './#/events/evt-1'

test.describe('P8 events calendar', () => {
  test('REQ-EVT-1: events are listed, as a grid on desktop and a list on phones', async ({
    page,
  }, testInfo) => {
    await page.goto('./#/events')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Community events')

    // DEVIATION RESP-1: the seven-column grid is replaced by a chronological
    // list below 820px, since Figma designs no mobile calendar.
    if (testInfo.project.name === 'desktop') {
      await expect(page.getByText('Sun', { exact: true })).toBeVisible()
    }
    // Both layouts are in the DOM; only one is displayed, so match the visible one.
    await expect(page.locator('a[href*="#/events/evt-"]:visible').first()).toBeVisible()
  })

  test('REQ-EVT-1: the category filter narrows the calendar', async ({ page }) => {
    await page.goto('./#/events')
    const before = await page.locator('a[href*="#/events/evt-"]').count()
    await page.getByRole('button', { name: 'memorial service' }).click()
    const after = await page.locator('a[href*="#/events/evt-"]').count()
    expect(after).toBeLessThan(before)
  })

  test('the month can be paged forward and back', async ({ page }) => {
    await page.goto('./#/events')
    const label = page.getByRole('status')
    const first = await label.textContent()
    await page.getByRole('button', { name: 'Next month' }).click()
    await expect(label).not.toHaveText(first ?? '')
    await page.getByRole('button', { name: 'Previous month' }).click()
    await expect(label).toHaveText(first ?? '')
  })

  test('a full event is marked Full in the calendar', async ({ page }) => {
    await page.goto('./#/events')
    // Seeded events are dated relative to today, so the full one can sit in
    // this month or the next depending on when the suite runs.
    const full = page.getByRole('link', { name: /Full/ })
    if ((await full.count()) === 0) {
      await page.getByRole('button', { name: 'Next month' }).click()
    }
    await expect(full.first()).toBeVisible()
  })
})

test.describe('P8 event detail and RSVP', () => {
  test('REQ-EVT-2: the detail page carries every required field', async ({ page }) => {
    await page.goto(OPEN_EVENT)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/Hosted by/)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'About this event' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Accessibility' })).toBeVisible()
    await expect(page.getByRole('progressbar', { name: 'Seats taken' })).toBeVisible()
  })

  test('REQ-EVT-4: a full event disables RSVP and says so', async ({ page }) => {
    await page.goto(FULL_EVENT)
    await expect(page.getByRole('heading', { name: 'Registration closed' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Event full' })).toBeDisabled()
    await expect(page.getByText(/Full · 0 of/)).toBeVisible()
  })

  test('a visitor is sent to sign in and returned to the event', async ({ page }) => {
    await page.goto(OPEN_EVENT)
    await page.getByRole('button', { name: 'RSVP to this event' }).click()
    await expect(page).toHaveURL(/#\/login$/)
    await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
    await expect(page).toHaveURL(/#\/events\/evt-1$/)
  })

  test('REQ-EVT-3: RSVP with guests drops capacity by that many seats', async ({ page }) => {
    await signIn(page)
    await page.goto(OPEN_EVENT)

    const seats = page.getByText(/of \d+ seats left/)
    const before = Number(/(\d+) of (\d+) seats left/.exec((await seats.textContent()) ?? '')?.[1])

    await page.getByLabel('Number of guests').fill('2')
    await page.getByRole('button', { name: 'RSVP to this event' }).click()

    // E-02a overlay
    const overlay = page.getByRole('dialog')
    await expect(overlay).toBeVisible()
    await expect(overlay.getByText(/You’re going!/)).toBeVisible()

    await overlay.getByRole('button', { name: 'Back to event' }).click()
    const after = Number(/(\d+) of (\d+) seats left/.exec((await seats.textContent()) ?? '')?.[1])
    expect(after).toBe(before - 3)
  })

  test('REQ-EVT-3: guests above the host limit are rejected', async ({ page }) => {
    await signIn(page)
    await page.goto(OPEN_EVENT)
    await page.getByLabel('Number of guests').fill('9')
    await page.getByRole('button', { name: 'RSVP to this event' }).click()
    await expect(page.getByRole('alert')).toContainText('up to 2 guests')
  })

  test('the E-02a overlay closes on Escape', async ({ page }) => {
    await signIn(page)
    await page.goto(OPEN_EVENT)
    await page.getByRole('button', { name: 'RSVP to this event' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('REQ-NTF-1: the RSVP confirmation and reminder reach the mock outbox', async ({ page }) => {
    await signIn(page)
    await page.goto(OPEN_EVENT)
    await page.getByRole('button', { name: 'RSVP to this event' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Back to event' }).click()

    await page.getByRole('button', { name: /Mock outbox/ }).click()
    const panel = page.getByRole('dialog', { name: 'Mock outbox' })
    await expect(panel.getByText(/RSVP confirmed/)).toBeVisible()
    await expect(panel.getByText(/Reminder:/)).toBeVisible()
  })

  test('the RSVP appears in My Activity', async ({ page }) => {
    await signIn(page)
    await page.goto(OPEN_EVENT)
    await page.getByRole('button', { name: 'RSVP to this event' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'My activity' }).click()
    await expect(page).toHaveURL(/#\/my-activity$/)
    await expect(page.getByRole('cell', { name: /RSVP/ })).toBeVisible()
  })

  test('an unknown event id falls back to the calendar', async ({ page }) => {
    await page.goto('./#/events/nope')
    await expect(page).toHaveURL(/#\/events$/)
  })

  for (const [name, route] of [
    ['calendar', './#/events'],
    ['detail', OPEN_EVENT],
    ['full event', FULL_EVENT],
  ] as const) {
    test(`${name} has no critical or serious accessibility violations`, async ({ page }) => {
      await page.goto(route)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      const blocking = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )
      expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([])
    })
  }
})
