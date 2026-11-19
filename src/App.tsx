import { HashRouter, Route, Routes } from 'react-router-dom'
import { Placeholder } from './routes/Placeholder'
import { Primitives } from './routes/Primitives'

/**
 * HashRouter, not BrowserRouter: GitHub Pages has no server-side rewrite, so
 * hash routes are what keeps an inner page working after a refresh.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Placeholder />} />
        <Route path="/primitives" element={<Primitives />} />
      </Routes>
    </HashRouter>
  )
}
