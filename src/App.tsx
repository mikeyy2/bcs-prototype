import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RoleProvider } from './app/RoleProvider'
import { DataProvider } from './data/DataProvider'
import { ConsoleLayout } from './components/layout/ConsoleLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { RequireRole } from './components/layout/RequireRole'
import { LogIn } from './routes/LogIn'
import { Donate } from './routes/Donate'
import { EventDetail } from './routes/EventDetail'
import { Events } from './routes/Events'
import { GiveItems } from './routes/GiveItems'
import { Home } from './routes/Home'
import { MyActivity } from './routes/MyActivity'
import { NotBuilt } from './routes/NotBuilt'
import { OpportunityDetail } from './routes/OpportunityDetail'
import { Primitives } from './routes/Primitives'
import { Search } from './routes/Search'
import { ThankYou } from './routes/ThankYou'
import { Volunteer } from './routes/Volunteer'

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
            <Route path="/search" element={<Search />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/volunteer/:id" element={<OpportunityDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/donate/thank-you" element={<ThankYou />} />
            <Route path="/give-items" element={<GiveItems />} />
            <Route
              path="/partner/apply"
              element={<NotBuilt screen="P-01 Partner Application" pkg="P13" />}
            />
            <Route path="/primitives" element={<Primitives />} />

            {/* Member-only */}
            <Route element={<RequireRole allow={['volunteer', 'donor', 'partner', 'staff']} />}>
              <Route path="/my-activity" element={<MyActivity />} />
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
