import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import Home from './pages/Home.jsx'
import GameDetail from './pages/GameDetail.jsx'
import PlayGame from './pages/PlayGame.jsx'
import SubmitGame from './pages/SubmitGame.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import GameJamsPage from './pages/GameJamsPage.jsx'
import NotFound from './pages/NotFound.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/game/:slug"  element={<GameDetail />} />
              <Route path="/play/:slug"  element={<PlayGame />} />
              <Route path="/submit"      element={<SubmitGame />} />
              <Route path="/register"    element={<Register />} />
              <Route path="/login"       element={<Login />} />
              <Route path="/profile"     element={<Profile />} />
              <Route path="/admin"       element={<AdminPanel />} />
              <Route path="/jams"        element={<GameJamsPage />} />
              <Route path="*"            element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
