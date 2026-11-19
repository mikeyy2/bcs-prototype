import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** P0 — the scaffold and GitHub Pages routing behave. */
test.describe('P0 scaffold', () => {
  test('index loads under the Pages base path', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Best Community Services',
    )
  })

  test('an inner route survives a full refresh', async ({ page }) => {
    await page.goto('./#/primitives')
    await expect(page.getByRole('heading', { name: 'BCS component library' })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'BCS component library' })).toBeVisible()
    expect(page.url()).toContain('#/primitives')
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('./#/primitives')
    await expect(page.getByRole('heading', { name: 'BCS component library' })).toBeVisible()
    expect(errors).toEqual([])
  })
})

/** P1 — the component library renders every variant and is reachable by keyboard. */
test.describe('P1 primitives', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/primitives')
  })

  test('buttons render enabled and disabled variants', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Find opportunities' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Learn more' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Event full' })).toBeDisabled()
  })

  test('all 19 badge labels render', async ({ page }) => {
    const section = page.locator('section', { hasText: 'Badge — 3:57' })
    await expect(section.locator('span').filter({ hasText: /^Published$/ })).toBeVisible()
    await expect(section.locator('span').filter({ hasText: /^Revoked$/ })).toBeVisible()
    await expect(section.locator('span').filter({ hasText: /^Full$/ })).toBeVisible()
  })

  test('input error state is announced to assistive tech', async ({ page }) => {
    const amount = page.getByLabel('Donation amount')
    await expect(amount).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('alert')).toContainText('at least $1')
  })

  test('every mocked feature carries a visible Mock label', async ({ page }) => {
    const mocks = page.getByText('Mock', { exact: true })
    expect(await mocks.count()).toBeGreaterThan(0)
    await expect(mocks.first()).toBeVisible()
  })

  test('interactive elements take visible keyboard focus', async ({ page }) => {
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus-visible')
    await expect(focused).toBeVisible()
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
