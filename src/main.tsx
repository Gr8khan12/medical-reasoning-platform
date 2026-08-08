import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './Home.tsx'
import SystemPage from './SystemPage.tsx'
import DiseasePage from './DiseasePage.tsx'
import Question from './Question.tsx'
import Concepts from './Concepts.tsx'
import ConceptDetail from './ConceptDetail.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:systemName" element={<SystemPage />} />
        <Route path="/:systemName/:diseaseName" element={<DiseasePage />} />
        <Route path="/:systemName/:diseaseName/question" element={<Question />} />
        <Route path="/concepts" element={<Concepts />} />
        <Route path="/concepts/:name" element={<ConceptDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)