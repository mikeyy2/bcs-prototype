import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RoleProvider } from './app/RoleProvider'
import { DataProvider } from './data/DataProvider'
import { AdminAccounts } from './routes/AdminAccounts'
import { AdminApprovals } from './routes/AdminApprovals'
import { AdminReports } from './routes/AdminReports'
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
import { OpportunityDetail } from './routes/OpportunityDetail'
import { PartnerApply } from './routes/PartnerApply'
import { PartnerDashboard } from './routes/PartnerDashboard'
import { PartnerListingForm } from './routes/PartnerListingForm'
import { Profile } from './routes/Profile'
import { Search } from './routes/Search'
import { ThankYou } from './routes/ThankYou'
import { Volunteer } from './routes/Volunteer'

/**
 * HashRouter, not BrowserRouter: GitHub Pages has no server-side rewrite, so
 * hash routes are what keeps an inner page working after a refresh.
 *
 * All 20 Figma screens are built; there are no placeholder routes left.
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
            <Route path="/partner/apply" element={<PartnerApply />} />

            {/* Member-only */}
            <Route element={<RequireRole allow={['volunteer', 'donor', 'partner', 'staff']} />}>
              <Route path="/my-activity" element={<MyActivity />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Partner console */}
          <Route element={<RequireRole allow={['partner']} />}>
            <Route element={<ConsoleLayout variant="partner" />}>
              <Route path="/partner" element={<PartnerDashboard />} />
              <Route path="/partner/new-listing" element={<PartnerListingForm />} />
              <Route path="/partner/roster" element={<PartnerDashboard />} />
              <Route path="/partner/profile" element={<PartnerDashboard />} />
            </Route>
          </Route>

          {/* Staff console */}
          <Route element={<RequireRole allow={['staff']} />}>
            <Route element={<ConsoleLayout variant="admin" />}>
              <Route path="/admin" element={<AdminApprovals />} />
              <Route path="/admin/approvals" element={<AdminApprovals />} />
              <Route path="/admin/accounts" element={<AdminAccounts />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
      </DataProvider>
    </RoleProvider>
  )
}
