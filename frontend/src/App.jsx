import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-4 text-2xl font-bold text-center mt-10">Welcome to Shifa Platform</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
