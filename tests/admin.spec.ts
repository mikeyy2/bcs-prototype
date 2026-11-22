import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** P14 — A-01, A-02, A-03 (WBS 7.1.1–7.1.3, 7.2.1, 7.4.1–7.4.3). */

async function signInAsStaff(page: Page) {
  await page.goto('./#/login')
  await page.getByRole('button', { name: 'BCS Staff', exact: true }).click()
  await expect(page).toHaveURL(/#\/admin$/)
}

test.describe('P14 approval queue', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsStaff(page)
  })

  test('REQ-ADM-4: one queue carries every submission type', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Approval queue')
    await expect(page.getByText('Nothing goes live until it is approved here.')).toBeVisible()
    await expect(page.getByRole('button', { name: /^Partner applications/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Listings/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^In-kind offers/ })).toBeVisible()
  })

  test('the type filter narrows the queue', async ({ page }) => {
    const review = page.getByRole('button', { name: 'Review' })
    await expect(review.first()).toBeVisible()
    const before = await review.count()

    await page.getByRole('button', { name: /^Partner applications/ }).click()
    const after = await review.count()
    expect(after).toBeLessThan(before)
  })

  test('REQ-ADM-4: rejecting without a reason is blocked', async ({ page }) => {
    await page.getByRole('button', { name: 'Review' }).first().click()
    await page.getByRole('button', { name: 'Reject' }).click()
    await expect(page.getByRole('alert')).toContainText('reason')
  })

  test('REQ-ADM-4: rejecting with a reason clears the item and emails the reason', async ({
    page,
  }) => {
    const review = page.getByRole('button', { name: 'Review' })
    await expect(review.first()).toBeVisible()
    const before = await review.count()

    await review.first().click()
    await page.getByLabel('Reason (required to reject)').fill('Please add a minimum age.')
    await page.getByRole('button', { name: 'Reject' }).click()

    await expect(page.getByRole('button', { name: 'Review' })).toHaveCount(before - 1)

    await page.getByRole('button', { name: /Mock outbox/ }).click()
    const panel = page.getByRole('dialog', { name: 'Mock outbox' })
    await expect(panel.getByText(/Not approved/)).toBeVisible()
    await expect(panel.getByText(/Please add a minimum age/)).toBeVisible()
  })

  test('approving removes the item from the queue', async ({ page }) => {
    const review = page.getByRole('button', { name: 'Review' })
    await expect(review.first()).toBeVisible()
    const before = await review.count()

    await review.first().click()
    await page.getByRole('button', { name: 'Approve' }).click()
    await expect(page.getByRole('button', { name: 'Review' })).toHaveCount(before - 1)
  })

  test('a partner-submitted listing arrives in the staff queue', async ({ page }) => {
    await page.goto('./#/login')
    await page.getByRole('button', { name: 'Partner', exact: true }).click()
    await page.goto('./#/partner/new-listing')
    await page.getByLabel('Title').fill('Holiday Grocery Box Drive')
    await page.getByRole('button', { name: 'Submit for approval' }).click()

    await signInAsStaff(page)
    await expect(page.getByRole('cell', { name: 'Holiday Grocery Box Drive' })).toBeVisible()
  })
})

test.describe('P14 accounts and partners', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsStaff(page)
    await page.goto('./#/admin/accounts')
  })

  test('REQ-ADM-1: accounts can be searched, suspended and reactivated', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Accounts & partners')

    await page.getByLabel('Search by name or email').fill('Priya')
    await expect(page.getByRole('cell', { name: 'Priya Shah' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Jordan Diaz' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Suspend' }).first().click()
    await expect(page.getByRole('status')).toContainText('Account suspended')
    await expect(page.getByRole('button', { name: 'Reactivate' }).first()).toBeVisible()
  })

  test('REQ-ADM-2: revoking a partner unpublishes all of its listings', async ({ page }) => {
    const row = page.getByRole('row', { name: /Ames Food Pantry/ })
    await row.getByRole('button', { name: 'Revoke' }).click()
    await expect(page.getByRole('status')).toContainText('unpublished')

    await page.goto('./#/volunteer')
    await page.getByLabel('Search by title, organization, or category').fill('Ames Food Pantry')
    await expect(page.getByText('Nothing matches yet')).toBeVisible()
  })

  test('REQ-ADM-3: a staff account can be created with a role', async ({ page }) => {
    await page.getByLabel('Full name').fill('Alex Mercer')
    await page.getByLabel('Work email').fill('a.mercer@example.org')
    await page.getByLabel('Role').fill('Driver')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByRole('status')).toContainText('Staff account created')
    await expect(page.getByRole('cell', { name: 'Alex Mercer' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Driver' })).toBeVisible()
  })

  test('creating a staff account validates its fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByRole('alert')).toContainText('name and a work email')
  })
})

test.describe('P14 reports', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsStaff(page)
    await page.goto('./#/admin/reports')
  })

  test('REQ-ADM-7: both reports render with an empty state', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reports')
    await expect(page.getByText('No records in this range yet.')).toBeVisible()

    await page.getByRole('button', { name: 'Donations' }).click()
    await expect(page.getByRole('heading', { name: 'Donations' })).toBeVisible()
  })

  test('REQ-ADM-7: the donation total matches the underlying records', async ({ page }) => {
    await page.goto('./#/donate')
    await page.getByLabel('Full name').fill('Jordan Diaz')
    await page.getByRole('button', { name: /^Donate/ }).click()
    await expect(page.getByText('Donation receipt')).toBeVisible()

    await signInAsStaff(page)
    await page.goto('./#/admin/reports')
    await page.getByRole('button', { name: 'Donations' }).click()

    const totals = page.getByRole('region', { name: 'Report totals' })
    await expect(totals).toContainText('$50.00')
    await expect(page.getByRole('cell', { name: 'Jordan Diaz' })).toBeVisible()
  })

  test('REQ-DON-3: an anonymous gift shows as Anonymous in the staff report', async ({ page }) => {
    await page.goto('./#/donate')
    await page.getByRole('checkbox', { name: /Give anonymously/ }).check()
    await page.getByRole('button', { name: /^Donate/ }).click()

    await signInAsStaff(page)
    await page.goto('./#/admin/reports')
    await page.getByRole('button', { name: 'Donations' }).click()
    await expect(page.getByRole('cell', { name: 'Anonymous' })).toBeVisible()
  })

  test('REQ-ADM-7: the CSV export downloads', async ({ page }) => {
    const waitForDownload = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export CSV' }).click()
    const download = await waitForDownload
    expect(download.suggestedFilename()).toBe('bcs-hours-report.csv')
  })

  test('the deferred third report is named rather than silently missing', async ({ page }) => {
    await expect(page.getByText(/service-usage and fee-revenue report/)).toBeVisible()
  })
})

test.describe('P14 accessibility', () => {
  for (const [name, route] of [
    ['approval queue', './#/admin'],
    ['accounts', './#/admin/accounts'],
    ['reports', './#/admin/reports'],
  ] as const) {
    test(`${name} has no critical or serious violations`, async ({ page }) => {
      await signInAsStaff(page)
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
