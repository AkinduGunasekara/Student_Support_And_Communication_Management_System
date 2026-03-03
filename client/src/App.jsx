import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
//import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
      <p class="text-3xl font-bold text-blue-600 bg-green-500 ">
        Click on the Vite and React logos to learn more
      </p>
      <p class="text-4xl font-bold text-blue-600 bg-green-500 mt-10">
        Click on
      </p>
    </>
  )
}

export default App
