import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** P2 — app shell, mock sign-in and role-based access (WBS 9.4.1, 9.1.1, 9.1.3). */

async function continueAs(page: import('@playwright/test').Page, label: string) {
  await page.goto('./#/login')
  await page.getByRole('button', { name: label, exact: true }).click()
}

test.describe('P2 shell', () => {
  test('header and footer appear on every public route', async ({ page }) => {
    for (const route of ['./', './#/volunteer', './#/events', './#/donate', './#/search']) {
      await page.goto(route)
      await expect(page.getByRole('banner')).toBeVisible()
      await expect(page.getByRole('contentinfo')).toBeVisible()
    }
  })

  test('header navigation reaches each section (DEVIATION NAV-1)', async ({ page }) => {
    await page.goto('./')
    const nav = page.getByRole('navigation', { name: 'Main' })

    await nav.getByRole('link', { name: 'Volunteer' }).click()
    await expect(page).toHaveURL(/#\/volunteer$/)

    await nav.getByRole('link', { name: 'Events' }).click()
    await expect(page).toHaveURL(/#\/events$/)

    await nav.getByRole('link', { name: 'Donate' }).click()
    await expect(page).toHaveURL(/#\/donate$/)
  })

  test('About stays inert because it has no Figma frame', async ({ page }) => {
    await page.goto('./')
    const about = page.getByRole('navigation', { name: 'Main' }).getByText('About', { exact: true })
    await expect(about).toHaveAttribute('aria-disabled', 'true')
  })

  test('footer links reach the screens that do exist', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('link', { name: 'Give Items' }).click()
    await expect(page).toHaveURL(/#\/give-items$/)
  })

  test('skip link is the first thing keyboard focus reaches', async ({ page }) => {
    await page.goto('./')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  })
})

test.describe('P2 mock sign-in', () => {
  test('the Continue as row is labelled as mocked', async ({ page }) => {
    await page.goto('./#/login')
    await expect(page.getByText('PROTOTYPE SHORTCUT · CONTINUE AS')).toBeVisible()
    await expect(page.locator('[data-mock]').first()).toBeVisible()
  })

  test('each role lands on the screen Figma points it at', async ({ page }) => {
    await continueAs(page, 'Volunteer')
    await expect(page).toHaveURL(/#\/my-activity$/)

    await continueAs(page, 'Partner')
    await expect(page).toHaveURL(/#\/partner$/)

    await continueAs(page, 'BCS Staff')
    await expect(page).toHaveURL(/#\/admin$/)
  })

  test('the chosen role survives a refresh', async ({ page }) => {
    await continueAs(page, 'Volunteer')
    await page.reload()
    await expect(page.getByTestId('role-tag')).toHaveText('Volunteer')
  })

  test('logging out clears the role and returns to C-02', async ({ page }) => {
    await continueAs(page, 'Volunteer')
    await page.goto('./')
    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page).toHaveURL(/#\/login$/)
    await expect(page.getByRole('banner').getByRole('link', { name: 'Log In', exact: true })).toBeVisible()
  })
})

test.describe('P2 role-based access (REQ-AUTH-5)', () => {
  test('a visitor cannot open the staff console', async ({ page }) => {
    await page.goto('./#/admin')
    await expect(page).toHaveURL(/#\/login$/)
  })

  test('a volunteer cannot open the staff console', async ({ page }) => {
    await continueAs(page, 'Volunteer')
    await page.goto('./#/admin')
    await expect(page).toHaveURL(/#\/login$/)
    await expect(page.getByText(/for BCS Staff accounts/)).toBeVisible()
  })

  test('a partner cannot open the staff console but can open its own', async ({ page }) => {
    await continueAs(page, 'Partner')
    await expect(page).toHaveURL(/#\/partner$/)
    await page.goto('./#/admin')
    await expect(page).toHaveURL(/#\/login$/)
  })

  test('staff reach the console and see the admin sidebar', async ({ page }) => {
    await continueAs(page, 'BCS Staff')
    await expect(page.getByRole('navigation', { name: 'Staff console' })).toBeVisible()
    await expect(page.getByText('BCS STAFF CONSOLE')).toBeVisible()
  })

  test('the partner console shows the partner sidebar', async ({ page }) => {
    await continueAs(page, 'Partner')
    await expect(page.getByRole('navigation', { name: 'Partner console' })).toBeVisible()
    await expect(page.getByText('PARTNER CONSOLE · Ames Food Pantry')).toBeVisible()
  })
})

test.describe('P2 accessibility', () => {
  for (const [name, route] of [
    ['home shell', './'],
    ['log in', './#/login'],
  ] as const) {
    test(`${name} has no critical or serious violations`, async ({ page }) => {
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
