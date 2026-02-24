import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ProgramNavLinks } from './examples/ProgramNavLinks'

const DEMO_PROGRAMS = [
  { id: 1, name: 'Alpha Program' },
  { id: 2, name: 'Beta Program' },
  { id: 3, name: 'Gamma Program' },
]

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <h2>Program Nav (permissions demo)</h2>
      <ProgramNavLinks programs={DEMO_PROGRAMS} />
    </>
  )
}

export default App
