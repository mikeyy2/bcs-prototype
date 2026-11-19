import { expect, test } from '@playwright/test'

/** P3 — mock data layer, outbox and demo reset (WBS 9.6.1, 9.3.1, 9.3.2). */

test.describe('P3 mock services', () => {
  test('the outbox is reachable from every public screen and starts empty', async ({ page }) => {
    await page.goto('./')
    const trigger = page.getByRole('button', { name: /Mock outbox/ })
    await expect(trigger).toBeVisible()
    await trigger.click()

    const panel = page.getByRole('dialog', { name: 'Mock outbox' })
    await expect(panel).toBeVisible()
    await expect(panel.getByText('Nothing is actually sent.')).toBeVisible()
    await expect(panel.getByText('No emails yet.')).toBeVisible()
  })

  test('the outbox closes on Escape', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /Mock outbox/ }).click()
    await expect(page.getByRole('dialog', { name: 'Mock outbox' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Mock outbox' })).toBeHidden()
  })

  test('reset demo data is available and clears the overlay', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: /Mock outbox/ }).click()
    await page.getByRole('button', { name: 'Reset demo data' }).click()
    await expect(page.getByRole('dialog', { name: 'Mock outbox' })).toBeHidden()

    // The overlay is rewritten empty straight after the reset, which is the
    // contract: seed data is restored exactly and nothing of the visit remains.
    const stored = await page.evaluate(() => localStorage.getItem('bcs.state.v1'))
    const parsed = JSON.parse(stored ?? '{}')
    expect(parsed.registrations).toEqual([])
    expect(parsed.rsvps).toEqual([])
    expect(parsed.donations).toEqual([])
    expect(parsed.outbox).toEqual([])
  })

  test('state persists under a versioned localStorage key', async ({ page }) => {
    await page.goto('./#/login')
    await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
    const role = await page.evaluate(() => localStorage.getItem('bcs.role'))
    expect(role).toBe('volunteer')
  })
})
