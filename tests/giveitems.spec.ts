import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** P10 — D-03 Give Items (WBS 2.2.1, 2.2.2). */

test.describe('P10 in-kind donations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/give-items')
  })

  test('REQ-DON-6: the offer form collects category, description, quantity and condition', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Give items')
    await expect(page.getByLabel('Category')).toBeVisible()
    await expect(page.getByLabel('Description')).toBeVisible()
    await expect(page.getByLabel('Quantity')).toBeVisible()
    await expect(page.getByLabel('Condition')).toBeVisible()
  })

  test('the photo upload is labelled as mocked', async ({ page }) => {
    await expect(page.getByText('Drag photos here or browse (optional)')).toBeVisible()
    await expect(page.getByText('the image itself is not stored')).toBeVisible()
  })

  test('REQ-DON-7: booked slots cannot be selected', async ({ page }) => {
    const booked = page.getByRole('button', { name: /Booked/ })
    await expect(booked.first()).toBeDisabled()
  })

  test('validation blocks an incomplete offer', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit offer' }).click()
    await expect(page.getByRole('alert')).toContainText('Describe what you are giving')

    await page.getByLabel('Description').fill('Winter coats, adult sizes')
    await page.getByRole('button', { name: 'Submit offer' }).click()
    await expect(page.getByRole('alert')).toContainText('Pick an open drop-off time')
  })

  test('REQ-DON-7: a submitted offer books the slot and makes it unavailable', async ({ page }) => {
    await page.getByLabel('Description').fill('Winter coats, adult sizes')
    await page.getByLabel('Quantity').fill('6')

    // Several slots share a day name, so count booked slots rather than
    // matching one by its label.
    const bookedBefore = await page.getByRole('button', { name: /Booked/ }).count()

    await page.getByRole('button', { name: /Open$/ }).first().click()
    await page.getByRole('button', { name: 'Submit offer' }).click()
    await expect(page.getByText('Offer submitted.')).toBeVisible()

    await page.reload()
    const bookedAfter = await page.getByRole('button', { name: /Booked/ }).count()
    expect(bookedAfter).toBe(bookedBefore + 1)
    for (const slot of await page.getByRole('button', { name: /Booked/ }).all()) {
      await expect(slot).toBeDisabled()
    }
  })

  test('the summary updates as the form is filled in', async ({ page }) => {
    await page.getByLabel('Description').fill('Winter coats')
    await page.getByLabel('Quantity').fill('6')
    await expect(page.getByText('6 × Winter coats')).toBeVisible()
  })

  test('the offer reaches the mock outbox and My Activity', async ({ page }) => {
    await page.goto('./#/login')
    await page.getByRole('button', { name: 'Donor', exact: true }).click()
    await page.goto('./#/give-items')

    await page.getByLabel('Description').fill('Winter coats, adult sizes')
    await page.getByRole('button', { name: /Open$/ }).first().click()
    await page.getByRole('button', { name: 'Submit offer' }).click()
    await expect(page.getByText('Offer submitted.')).toBeVisible()

    await page.getByRole('button', { name: /Mock outbox/ }).click()
    const panel = page.getByRole('dialog', { name: 'Mock outbox' })
    await expect(panel.getByText(/We received your donation offer/)).toBeVisible()
    await expect(panel.getByText(/Drop-off time confirmed/)).toBeVisible()
    await page.keyboard.press('Escape')

    await page.goto('./#/my-activity')
    await page.getByRole('tab', { name: 'Donations' }).click()
    await expect(page.getByRole('cell', { name: 'Items' })).toBeVisible()
  })

  test('no critical or serious accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})
