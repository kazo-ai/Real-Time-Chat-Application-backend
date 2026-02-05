import { useState } from 'react'
import './App.css'
import Chat from './components/chat';



function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='w-screen min-h-screen overflow-x-hidden bg-black px-120'>
     <Chat/>
    </div>
  )
}

export default App
