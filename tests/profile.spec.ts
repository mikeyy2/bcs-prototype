import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** P12 — C-03 Profile & Notifications (WBS 9.2.1, 9.2.2). */

async function signIn(page: Page) {
  await page.goto('./#/login')
  await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
  await page.goto('./#/profile')
}

test.describe('P12 profile', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('REQ-PRF-1: contact fields render and persist', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('My account')

    await page.getByLabel('Phone').fill('(515) 555-0199')
    await page.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.getByRole('status')).toContainText('Profile saved')

    await page.reload()
    await expect(page.getByLabel('Phone')).toHaveValue('(515) 555-0199')
  })

  test('REQ-PRF-1: volunteer skills can be toggled and saved', async ({ page }) => {
    const chip = page.getByRole('button', { name: 'Tutoring' })
    const before = await chip.getAttribute('aria-pressed')
    await chip.click()
    await expect(chip).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true')

    await page.getByRole('button', { name: 'Save changes' }).click()
    await page.reload()
    await expect(page.getByRole('button', { name: 'Tutoring' })).toHaveAttribute(
      'aria-pressed',
      before === 'true' ? 'false' : 'true',
    )
  })

  test('REQ-PRF-2: confirmations and receipts are always sent', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click()
    await expect(page.getByText('Registration confirmations')).toBeVisible()
    await expect(page.getByText('Always sent').first()).toBeVisible()
    expect(await page.getByText('Always sent').count()).toBe(2)
  })

  test('REQ-PRF-2: turning reminders off stops the reminder email', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click()
    await page.getByRole('checkbox', { name: /reminders/ }).uncheck()

    await page.goto('./#/volunteer/opp-2')
    await page.getByRole('radio').last().check()
    await page.getByRole('checkbox', { name: 'I meet the requirements' }).check()
    await page.getByRole('button', { name: 'Register for this shift' }).click()

    await page.getByRole('button', { name: /Mock outbox/ }).click()
    const panel = page.getByRole('dialog', { name: 'Mock outbox' })
    await expect(panel.getByText(/You're signed up/)).toBeVisible()
    await expect(panel.getByText(/Reminder:/)).toHaveCount(0)
  })

  test('REQ-PRF-3: deleting the account keeps donations under a replaced name', async ({
    page,
  }) => {
    await page.goto('./#/donate')
    await page.getByLabel('Full name').fill('Jordan Diaz')
    await page.getByRole('button', { name: /^Donate/ }).click()
    await expect(page.getByText('Donation receipt')).toBeVisible()

    await page.goto('./#/profile')
    await page.getByRole('button', { name: 'Delete my account' }).click()
    await expect(page.getByText(/Deleted user/).first()).toBeVisible()

    await page.goto('./#/my-activity')
    await page.getByRole('tab', { name: 'Donations' }).click()
    await expect(page.getByRole('cell', { name: 'Money' })).toBeVisible()
  })

  test('the security panel is honest about there being no password', async ({ page }) => {
    await expect(page.getByText(/no password in this prototype/)).toBeVisible()
  })

  test('logging out from the account nav blocks the profile', async ({ page }) => {
    await page.getByRole('navigation', { name: 'Account sections' })
      .getByRole('button', { name: 'Log out' })
      .click()
    // Settle on C-02 before re-requesting the guarded route.
    await expect(page).toHaveURL(/#\/login$/)

    // Deep-link straight back in with a full load, which is the case that
    // matters: a signed-out visitor opening a guarded URL.
    await page.goto('./#/profile')
    await page.reload()
    await expect(page).toHaveURL(/#\/login$/)
  })

  for (const panel of ['Profile', 'Notifications'] as const) {
    test(`${panel} panel has no critical or serious accessibility violations`, async ({ page }) => {
      await page.getByRole('navigation', { name: 'Account sections' })
        .getByRole('button', { name: panel })
        .click()
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
