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
import Bookmarks from './pages/Bookmarks.tsx'
import TopicPage from './pages/TopicPage.tsx'
import Lectures from './pages/Lectures.tsx'
import LectureDetail from './pages/LectureDetail.tsx'
import TopicOverview from './pages/TopicOverview.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/question" element={<Question />} />
        <Route path="/concepts" element={<Concepts />} />
        <Route path="/concepts/:name" element={<ConceptDetail />} />
        <Route path="/lectures" element={<Lectures />} />
        <Route path="/lectures/:id" element={<LectureDetail />} />
        <Route path="/topic/:topicId" element={<TopicPage />} />
        <Route path="/disease/:diseaseId" element={<DiseasePage />} />
        <Route path="/disease/:diseaseId/question" element={<Question />} />
        <Route path="/:systemName/question" element={<Question />} />
        <Route path="/:systemName" element={<SystemPage />} />
        <Route path="/topic/:topicId/overview" element={<TopicOverview />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)