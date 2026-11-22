import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** Regressions for defects found during the P16 agent-browser QA pass. */

async function signIn(page: Page, role: string) {
  await page.goto('./#/login')
  await page.getByRole('button', { name: role, exact: true }).click()
}

test.describe('QA regressions', () => {
  /**
   * QA-1 — clearing the custom donation amount left the form on $0.00 with no
   * preset selected, so the only way forward was to retype an amount.
   */
  test('QA-1: clearing the custom amount restores a preset', async ({ page }) => {
    await page.goto('./#/donate')
    await expect(page.getByRole('button', { name: 'Donate $50.00' })).toBeVisible()

    await page.getByLabel('Other amount').fill('75')
    await expect(page.getByRole('button', { name: 'Donate $75.00' })).toBeVisible()

    await page.getByLabel('Other amount').fill('')
    await expect(page.getByRole('button', { name: 'Donate $50.00' })).toBeVisible()
    expect(await page.locator('[aria-pressed="true"]').count()).toBeGreaterThan(0)
  })

  /**
   * QA-2 — rejecting a listing the partner submitted in this session sent no
   * email and left the partner's own table showing "Pending approval", because
   * the decision only looked the item up among the seeded queue entries.
   */
  test('QA-2: deciding a partner-submitted listing emails and updates the partner', async ({
    page,
  }) => {
    await signIn(page, 'Partner')
    await page.goto('./#/partner/new-listing')
    await page.getByLabel('Title').fill('Holiday Grocery Box Drive')
    await page.getByRole('button', { name: 'Submit for approval' }).click()
    await page.waitForURL(/#\/partner$/)

    await signIn(page, 'BCS Staff')
    const row = page.getByRole('row', { name: /Holiday Grocery Box Drive/ })
    await row.getByRole('button', { name: 'Review' }).click()
    await page.getByLabel('Reason (required to reject)').fill('Please add a minimum age.')
    await page.getByRole('button', { name: 'Reject' }).click()

    await page.getByRole('button', { name: /Mock outbox/ }).click()
    const panel = page.getByRole('dialog', { name: 'Mock outbox' })
    await expect(panel.getByText(/Not approved: Holiday Grocery Box Drive/)).toBeVisible()
    await expect(panel.getByText(/Please add a minimum age/)).toBeVisible()
    await page.keyboard.press('Escape')

    // The partner sees the decision and the reason.
    await signIn(page, 'Partner')
    const partnerRow = page.getByRole('row', { name: /Holiday Grocery Box Drive/ })
    await expect(partnerRow.getByText('Rejected')).toBeVisible()
    await expect(partnerRow.getByText(/Please add a minimum age/)).toBeVisible()
    await expect(partnerRow.getByRole('button', { name: 'Fix & resubmit' })).toBeVisible()
  })

  /**
   * QA-3 — C-01 was built from the Figma layer tree, which does not carry
   * fills, so the hero rendered on white with a teal button and the cards
   * and CTAs were untinted. Comparing the render against the frame caught it.
   */
  test('QA-3: the hero is a primary band with an accent call to action', async ({ page }) => {
    await page.goto('./')
    const hero = page.locator('section').first()
    await expect(hero).toHaveCSS('background-color', 'rgb(15, 82, 87)')

    const cta = page.getByRole('button', { name: 'Find opportunities' })
    await expect(cta).toHaveCSS('background-color', 'rgb(232, 131, 58)')
    // Figma's white label on that orange is 2.71:1, so the label is dark.
    await expect(cta).toHaveCSS('color', 'rgb(28, 43, 45)')
  })

  test('QA-3b: opportunity photo placeholders are tinted by category', async ({ page }) => {
    await page.goto('./')
    const tints = await page
      .getByRole('img')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor))
    expect(new Set(tints).size).toBeGreaterThan(1)
  })

  test('QA-2b: approving a partner-submitted listing marks it published', async ({ page }) => {
    await signIn(page, 'Partner')
    await page.goto('./#/partner/new-listing')
    await page.getByLabel('Title').fill('Spring Pantry Restock')
    await page.getByRole('button', { name: 'Submit for approval' }).click()
    await page.waitForURL(/#\/partner$/)

    await signIn(page, 'BCS Staff')
    await page
      .getByRole('row', { name: /Spring Pantry Restock/ })
      .getByRole('button', { name: 'Review' })
      .click()
    await page.getByRole('button', { name: 'Approve' }).click()

    await signIn(page, 'Partner')
    await expect(
      page.getByRole('row', { name: /Spring Pantry Restock/ }).getByText('Published'),
    ).toBeVisible()
  })
})
