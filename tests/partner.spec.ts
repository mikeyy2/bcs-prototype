import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** P13 — P-01, P-02, P-03 (WBS 6.1.1, 6.2.1, 6.3.1, 1.3.1). */

async function signInAsPartner(page: Page) {
  await page.goto('./#/login')
  await page.getByRole('button', { name: 'Partner', exact: true }).click()
  await expect(page).toHaveURL(/#\/partner$/)
}

test.describe('P13 partner application', () => {
  test('REQ-PRT-1: the application collects every required field', async ({ page }) => {
    await page.goto('./#/partner/apply')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Partner with BCS')
    for (const label of [
      'Organization name',
      'EIN (tax ID)',
      'Nonprofit status',
      'Website',
      'Primary service area',
      'Describe your services',
    ]) {
      await expect(page.getByLabel(label)).toBeVisible()
    }
    await expect(page.getByText('IRS determination letter')).toBeVisible()
  })

  test('validation blocks an incomplete application', async ({ page }) => {
    await page.goto('./#/partner/apply')
    await page.getByRole('button', { name: 'Submit application' }).click()
    await expect(page.getByRole('alert')).toContainText('organization name')

    await page.getByLabel('Organization name').fill('Story County Bike Library')
    await page.getByRole('button', { name: 'Submit application' }).click()
    await expect(page.getByRole('alert')).toContainText('EIN')
  })

  test('REQ-PRT-2: a complete application reaches the staff queue', async ({ page }) => {
    await page.goto('./#/partner/apply')
    await page.getByLabel('Organization name').fill('Story County Bike Library')
    await page.getByLabel('EIN (tax ID)').fill('12-3456789')
    await page.getByLabel('Email').fill('hello@example.org')
    await page.setInputFiles('input[type="file"]', {
      name: 'irs-letter.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 fake'),
    })
    await page.getByRole('checkbox', { name: /I confirm/ }).check()
    await page.getByRole('button', { name: 'Submit application' }).click()

    await expect(page.getByRole('heading', { name: 'Application received' })).toBeVisible()
  })
})

test.describe('P13 partner console', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsPartner(page)
  })

  test('the dashboard shows listings with their approval status', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ames Food Pantry')
    await expect(page.getByRole('heading', { name: 'My listings' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Saturday Food Pantry Sorting' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Partner totals' })).toBeVisible()
  })

  test('REQ-PRT-4 / REQ-PRT-5: a new listing is created pending and stays private', async ({
    page,
  }) => {
    await page.getByRole('button', { name: '+ New listing' }).click()
    await expect(page).toHaveURL(/#\/partner\/new-listing$/)

    await page.getByLabel('Title').fill('Holiday Grocery Box Drive')
    await page.getByRole('button', { name: 'Submit for approval' }).click()

    await expect(page).toHaveURL(/#\/partner$/)
    const row = page.getByRole('row', { name: /Holiday Grocery Box Drive/ })
    await expect(row).toBeVisible()
    await expect(row.getByText('Pending approval')).toBeVisible()

    // Not visible to the public until staff approve it.
    await page.goto('./#/volunteer')
    await page.getByLabel('Search by title, organization, or category').fill('Holiday Grocery')
    await expect(page.getByText('Nothing matches yet')).toBeVisible()
  })

  test('the listing form validates before submitting', async ({ page }) => {
    await page.goto('./#/partner/new-listing')
    await page.getByRole('button', { name: 'Submit for approval' }).click()
    await expect(page.getByRole('alert')).toContainText('title')
  })

  test('the public preview reflects what is typed', async ({ page }) => {
    await page.goto('./#/partner/new-listing')
    await page.getByLabel('Title').fill('Coat Sorting Evening')
    await expect(page.getByText('Coat Sorting Evening')).toBeVisible()
  })

  test('REQ-VOL-9: marking a shift attended creates the hours record', async ({ page }) => {
    // Register as a volunteer against an Ames Food Pantry listing first.
    await page.goto('./#/login')
    await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
    await page.goto('./#/volunteer/opp-4')
    await page.getByRole('radio').last().check()
    await page.getByRole('checkbox', { name: 'I meet the requirements' }).check()
    await page.getByRole('button', { name: 'Register for this shift' }).click()
    await expect(page.getByText('You are registered.')).toBeVisible()

    await signInAsPartner(page)
    await expect(page.getByRole('heading', { name: 'Volunteer roster' })).toBeVisible()
    await page.getByRole('button', { name: 'Mark attended' }).first().click()
    await expect(page.getByRole('cell', { name: 'Attended' }).first()).toBeVisible()

    await page.goto('./#/login')
    await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
    await page.goto('./#/my-activity')
    await page.getByRole('tab', { name: 'Volunteer hours' }).click()
    // The shift is three hours long, so the total must be non-zero.
    await expect(page.getByText(/[1-9][\d.]* hours/)).toBeVisible()
  })

  test('a volunteer cannot reach the partner console', async ({ page }) => {
    await page.goto('./#/login')
    await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
    await page.goto('./#/partner')
    await page.reload()
    await expect(page).toHaveURL(/#\/login$/)
  })

  for (const [name, route] of [
    ['dashboard', './#/partner'],
    ['new listing', './#/partner/new-listing'],
    ['application', './#/partner/apply'],
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
