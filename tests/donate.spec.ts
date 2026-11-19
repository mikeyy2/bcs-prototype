import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** P9 — D-01 Donate and D-02 Thank You (WBS 2.1.1, 2.1.2, 2.1.3, 9.5.1). */

test.describe('P9 donations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/donate')
  })

  test('REQ-DON-1: four preset amounts plus a custom field', async ({ page }) => {
    for (const amount of ['$25', '$50', '$100', '$250']) {
      await expect(page.getByRole('button', { name: amount, exact: true })).toBeVisible()
    }
    await expect(page.getByLabel('Other amount')).toBeVisible()
  })

  test('REQ-DON-1: a custom amount under $1 is rejected', async ({ page }) => {
    await page.getByLabel('Other amount').fill('0.50')
    await page.getByRole('button', { name: /^Donate/ }).click()
    await expect(page.getByRole('alert')).toContainText('at least $1')
  })

  test('REQ-DON-2 / NFR-SEC-2: no card input exists anywhere (PAY-1)', async ({ page }) => {
    // Structural, not textual: the page explains that no card is collected,
    // so asserting on prose would match that explanation.
    await expect(page.locator('input[autocomplete^="cc-"]')).toHaveCount(0)

    const labels = await page.locator('label').allTextContents()
    expect(labels.filter((l) => /card|cvc|expiry|security code/i.test(l))).toEqual([])

    const inputs = page.locator('input')
    for (let i = 0; i < (await inputs.count()); i += 1) {
      const name = (await inputs.nth(i).getAttribute('name')) ?? ''
      expect(name).not.toMatch(/card|cvc|cvv|expiry/i)
    }

    await expect(page.getByText('No card fields exist anywhere')).toBeVisible()
    await expect(page.locator('[data-mock]').first()).toBeVisible()
  })

  test('a name is required unless the gift is anonymous', async ({ page }) => {
    await page.getByRole('button', { name: /^Donate/ }).click()
    await expect(page.getByRole('alert')).toContainText('Enter your name')
  })

  test('REQ-DON-3: an anonymous gift is recorded as Anonymous', async ({ page }) => {
    await page.getByRole('checkbox', { name: /Give anonymously/ }).check()
    await expect(page.getByLabel('Full name')).toBeDisabled()

    await page.getByRole('button', { name: /^Donate/ }).click()
    await expect(page).toHaveURL(/#\/donate\/thank-you$/)
    await expect(page.getByText('Thank you, friend!')).toBeVisible()
    await expect(page.getByText('Anonymous')).toBeVisible()
  })

  test('REQ-DON-4: no email means no receipt is sent', async ({ page }) => {
    await page.getByRole('checkbox', { name: /Give anonymously/ }).check()
    await page.getByRole('button', { name: /^Donate/ }).click()
    await expect(page.getByText(/no receipt was sent/)).toBeVisible()

    await page.getByRole('button', { name: /Mock outbox/ }).click()
    await expect(page.getByText('No emails yet.')).toBeVisible()
  })

  test('REQ-DON-5: the receipt carries all five required fields', async ({ page }) => {
    await page.getByLabel('Full name').fill('Jordan Diaz')
    await page.getByLabel('Email for receipt').fill('jordan.diaz@example.com')
    await page.getByRole('button', { name: /^Donate/ }).click()

    await expect(page.getByText('Donation receipt')).toBeVisible()
    await expect(page.getByText('Jordan Diaz')).toBeVisible()
    await expect(page.getByText('$50.00').first()).toBeVisible()
    await expect(page.getByText('BCS tax ID (EIN)')).toBeVisible()
    await expect(page.getByText(/mock_pi_/)).toBeVisible()

    await page.getByRole('button', { name: /Mock outbox/ }).click()
    const panel = page.getByRole('dialog', { name: 'Mock outbox' })
    await expect(panel.getByText(/Your donation receipt/)).toBeVisible()
    await expect(panel.getByText(/TBD-6/)).toBeVisible()
  })

  test('the fee option changes the total', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Donate $50.00' })).toBeVisible()
    await page.getByRole('checkbox', { name: /processing fees/ }).check()
    await expect(page.getByRole('button', { name: 'Donate $51.50' })).toBeVisible()
  })

  test('the donation shows up in My Activity', async ({ page }) => {
    await page.goto('./#/login')
    await page.getByRole('button', { name: 'Donor', exact: true }).click()
    await page.goto('./#/donate')
    await page.getByLabel('Full name').fill('Jordan Diaz')
    await page.getByRole('button', { name: /^Donate/ }).click()
    await page.getByRole('button', { name: 'View my activity' }).click()

    await page.getByRole('tab', { name: 'Donations' }).click()
    await expect(page.getByRole('cell', { name: 'Money' })).toBeVisible()
  })

  test('visiting the thank-you page directly falls back to the form', async ({ page }) => {
    await page.goto('./#/donate/thank-you')
    await expect(page).toHaveURL(/#\/donate$/)
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
