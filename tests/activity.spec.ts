import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** P7 — V-03 My Activity (WBS 1.3.2, 8.2.1, 2.3.1). */

async function signIn(page: Page) {
  await page.goto('./#/login')
  await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
}

async function registerForShift(page: Page) {
  await page.goto('./#/volunteer/opp-2')
  await page.getByRole('radio').last().check()
  await page.getByRole('checkbox', { name: 'I meet the requirements' }).check()
  await page.getByRole('button', { name: 'Register for this shift' }).click()
  await expect(page.getByText('You are registered.')).toBeVisible()
}

test.describe('P7 my activity', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('REQ-DSH-1: empty state before anything is booked', async ({ page }) => {
    await page.goto('./#/my-activity')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('My activity')
    await expect(page.getByText('Nothing booked yet.')).toBeVisible()
  })

  test('a registration appears in upcoming with a cancel action (ACT-1)', async ({ page }) => {
    await registerForShift(page)
    await page.goto('./#/my-activity')

    const row = page.getByRole('row', { name: /After-School Reading Buddy/ })
    await expect(row).toBeVisible()
    await expect(row.getByText('Registered')).toBeVisible()
    await expect(row.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

  test('REQ-VOL-7: cancelling releases the slot', async ({ page }) => {
    await registerForShift(page)
    await page.goto('./#/my-activity')
    await page.getByRole('button', { name: 'Cancel' }).first().click()
    await expect(page.getByText('Nothing booked yet.')).toBeVisible()
  })

  test('REQ-DSH-2: the three history tabs all render', async ({ page }) => {
    await registerForShift(page)
    await page.goto('./#/my-activity')

    await page.getByRole('tab', { name: 'Volunteer hours' }).click()
    await expect(page.getByRole('heading', { name: 'Past shifts' })).toBeVisible()
    await expect(page.getByText('Total logged hours = sum of attended shift durations')).toBeVisible()

    await page.getByRole('tab', { name: 'Donations' }).click()
    await expect(page.getByRole('heading', { name: 'My donations' })).toBeVisible()
    await expect(page.getByText('No donations yet.')).toBeVisible()
  })

  test('REQ-VOL-10: logged hours start at zero until attendance is marked', async ({ page }) => {
    await registerForShift(page)
    await page.goto('./#/my-activity')
    const totals = page.getByRole('region', { name: 'Your totals' })
    await expect(totals).toContainText('0.0')
    await expect(totals).toContainText('Total logged hours')
  })

  test('the upcoming count reflects the booking', async ({ page }) => {
    await registerForShift(page)
    await page.goto('./#/my-activity')
    const totals = page.getByRole('region', { name: 'Your totals' })
    await expect(totals).toContainText('Upcoming shifts')
    await expect(totals.getByText('1', { exact: true })).toBeVisible()
  })

  test('a visitor cannot reach my activity', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: 'Log out' }).click()
    await page.goto('./#/my-activity')
    await expect(page).toHaveURL(/#\/login$/)
  })

  test('no critical or serious accessibility violations', async ({ page }) => {
    await registerForShift(page)
    await page.goto('./#/my-activity')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})
