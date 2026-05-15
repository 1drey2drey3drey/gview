import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import GameDetail from './pages/GameDetail.jsx'
import PlayGame from './pages/PlayGame.jsx'
import SubmitGame from './pages/SubmitGame.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import NotFound from './pages/NotFound.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/game/:slug" element={<GameDetail />} />
            <Route path="/play/:slug" element={<PlayGame />} />
            <Route path="/submit"     element={<SubmitGame />} />
            <Route path="/admin"      element={<AdminPanel />} />
            <Route path="*"           element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
