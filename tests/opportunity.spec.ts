import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** P6 — V-02 Opportunity Detail, the main journey (WBS 1.1.3, 1.2.1, 1.2.2, 1.2.3). */

async function signIn(page: Page) {
  await page.goto('./#/login')
  await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
}

/** opp-1 is seeded with its only shift full; opp-2 has open shifts. */
const FULL_DETAIL = './#/volunteer/opp-1'
const DETAIL = './#/volunteer/opp-2'

test.describe('P6 opportunity detail', () => {
  test('REQ-VOL-4: every detail field is present', async ({ page }) => {
    await page.goto(FULL_DETAIL)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Saturday Food Pantry Sorting')
    await expect(page.getByRole('link', { name: 'Ames Food Pantry' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'About this opportunity' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'What you will do' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Requirements' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Choose a shift' })).toBeVisible()
  })

  test('REQ-VOL-5: a full shift cannot be selected', async ({ page }) => {
    await page.goto(FULL_DETAIL)
    await expect(page.getByRole('radio').first()).toBeDisabled()
    await expect(page.getByText('Full', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'All shifts full' })).toBeDisabled()
  })

  test('REQ-VOL-6: a visitor is sent to sign in and returned here', async ({ page }) => {
    await page.goto(DETAIL)
    await page.getByRole('button', { name: 'Register for this shift' }).click()
    await expect(page).toHaveURL(/#\/login$/)

    await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
    await expect(page).toHaveURL(/#\/volunteer\/opp-2$/)
  })

  test('registering requires a shift and the requirements confirmation', async ({ page }) => {
    await signIn(page)
    await page.goto(DETAIL)

    await page.getByRole('button', { name: 'Register for this shift' }).click()
    await expect(page.getByRole('alert')).toContainText('Choose a shift')

    await page.getByRole('radio').last().check()
    await page.getByRole('button', { name: 'Register for this shift' }).click()
    await expect(page.getByRole('alert')).toContainText('meet the requirements')
  })

  test('REQ-VOL-5: registering decreases the shift capacity by one', async ({ page }) => {
    await signIn(page)
    await page.goto(DETAIL)

    const lastShift = page.locator('label', { has: page.getByRole('radio') }).last()
    const before = await lastShift.textContent()
    const remainingBefore = Number(/(\d+) of (\d+) left/.exec(before ?? '')?.[1])

    await page.getByRole('radio').last().check()
    await page.getByRole('checkbox', { name: 'I meet the requirements' }).check()
    await page.getByRole('button', { name: 'Register for this shift' }).click()

    await expect(page.getByText('You are registered.')).toBeVisible()

    await page.reload()
    const after = await page
      .locator('label', { has: page.getByRole('radio') })
      .last()
      .textContent()
    const remainingAfter = Number(/(\d+) of (\d+) left/.exec(after ?? '')?.[1])
    expect(remainingAfter).toBe(remainingBefore - 1)
  })

  test('REQ-VOL-8: confirmation and a 24-hour reminder reach the mock outbox', async ({ page }) => {
    await signIn(page)
    await page.goto(DETAIL)
    await page.getByRole('radio').last().check()
    await page.getByRole('checkbox', { name: 'I meet the requirements' }).check()
    await page.getByRole('button', { name: 'Register for this shift' }).click()
    await expect(page.getByText('You are registered.')).toBeVisible()

    await page.getByRole('button', { name: /Mock outbox/ }).click()
    const panel = page.getByRole('dialog', { name: 'Mock outbox' })
    await expect(panel.getByText(/You're signed up/)).toBeVisible()
    await expect(panel.getByText(/Reminder:/)).toBeVisible()
    await expect(panel.getByText('Scheduled')).toBeVisible()
  })

  test('an unknown id falls back to the catalogue', async ({ page }) => {
    await page.goto('./#/volunteer/does-not-exist')
    await expect(page).toHaveURL(/#\/volunteer$/)
  })

  test('no critical or serious accessibility violations', async ({ page }) => {
    await page.goto(FULL_DETAIL)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})
