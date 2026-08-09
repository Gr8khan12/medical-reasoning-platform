import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import NavBar from './components/NavBar.tsx'
import Home from './pages/Home.tsx'
import SystemPage from './pages/SystemPage.tsx'
import DiseasePage from './pages/DiseasePage.tsx'
import Question from './pages/Question.tsx'
import Concepts from './pages/Concepts.tsx'
import ConceptDetail from './pages/ConceptDetail.tsx'
import Search from './pages/Search.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/:systemName" element={<SystemPage />} />
        <Route path="/:systemName/:diseaseName" element={<DiseasePage />} />
        <Route path="/:systemName/:diseaseName/question" element={<Question />} />
        <Route path="/concepts" element={<Concepts />} />
        <Route path="/concepts/:name" element={<ConceptDetail />} />
        <Route path="/question" element={<Question />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)