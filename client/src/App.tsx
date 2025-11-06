import { useState } from 'react'
import viteLogo from '/vite.svg'
import './styles/App.css'
import Login from './components/Login'

function App() {
  const [user, setUser] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Participium</h1>
      <Login/>
    </>
  )
}

export default App
