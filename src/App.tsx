import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RoleProvider } from './app/RoleProvider'
import { DataProvider } from './data/DataProvider'
import { ConsoleLayout } from './components/layout/ConsoleLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { RequireRole } from './components/layout/RequireRole'
import { LogIn } from './routes/LogIn'
import { Home } from './routes/Home'
import { NotBuilt } from './routes/NotBuilt'
import { Primitives } from './routes/Primitives'

/**
 * HashRouter, not BrowserRouter: GitHub Pages has no server-side rewrite, so
 * hash routes are what keeps an inner page working after a refresh.
 *
 * Screens not yet built render <NotBuilt>, so navigation is complete from P2
 * onward and each later package swaps one placeholder for the real screen.
 */
export default function App() {
  return (
    <RoleProvider>
      <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/search" element={<NotBuilt screen="S-01 Search Results" pkg="P11" />} />
            <Route
              path="/volunteer"
              element={<NotBuilt screen="V-01 Volunteer Opportunities" pkg="P5" />}
            />
            <Route
              path="/volunteer/:id"
              element={<NotBuilt screen="V-02 Opportunity Detail" pkg="P6" />}
            />
            <Route path="/events" element={<NotBuilt screen="E-01 Events Calendar" pkg="P8" />} />
            <Route
              path="/events/:id"
              element={<NotBuilt screen="E-02 Event Detail & RSVP" pkg="P8" />}
            />
            <Route path="/donate" element={<NotBuilt screen="D-01 Donate" pkg="P9" />} />
            <Route
              path="/donate/thank-you"
              element={<NotBuilt screen="D-02 Thank You & Receipt" pkg="P9" />}
            />
            <Route path="/give-items" element={<NotBuilt screen="D-03 Give Items" pkg="P10" />} />
            <Route
              path="/partner/apply"
              element={<NotBuilt screen="P-01 Partner Application" pkg="P13" />}
            />
            <Route path="/primitives" element={<Primitives />} />

            {/* Member-only */}
            <Route element={<RequireRole allow={['volunteer', 'donor', 'partner', 'staff']} />}>
              <Route
                path="/my-activity"
                element={<NotBuilt screen="V-03 My Activity" pkg="P7" />}
              />
              <Route
                path="/profile"
                element={<NotBuilt screen="C-03 Profile & Notifications" pkg="P12" />}
              />
            </Route>
          </Route>

          {/* Partner console */}
          <Route element={<RequireRole allow={['partner']} />}>
            <Route element={<ConsoleLayout variant="partner" />}>
              <Route path="/partner" element={<NotBuilt screen="P-02 Partner Dashboard" pkg="P13" />} />
              <Route
                path="/partner/new-listing"
                element={<NotBuilt screen="P-03 Create a Listing" pkg="P13" />}
              />
              <Route path="/partner/roster" element={<NotBuilt screen="Partner roster" pkg="P13" />} />
              <Route
                path="/partner/profile"
                element={<NotBuilt screen="Partner profile" pkg="P13" />}
              />
            </Route>
          </Route>

          {/* Staff console */}
          <Route element={<RequireRole allow={['staff']} />}>
            <Route element={<ConsoleLayout variant="admin" />}>
              <Route path="/admin" element={<NotBuilt screen="A-01 Approval Queue" pkg="P14" />} />
              <Route
                path="/admin/approvals"
                element={<NotBuilt screen="A-01 Approval Queue" pkg="P14" />}
              />
              <Route
                path="/admin/accounts"
                element={<NotBuilt screen="A-02 Accounts & Partners" pkg="P14" />}
              />
              <Route path="/admin/reports" element={<NotBuilt screen="A-03 Reports" pkg="P14" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
      </DataProvider>
    </RoleProvider>
  )
}
