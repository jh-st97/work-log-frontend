import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/common.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BrowserRouter가 있어야 App.tsx의 Routes/Route, useNavigate 같은 라우팅 기능이 동작한다 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
