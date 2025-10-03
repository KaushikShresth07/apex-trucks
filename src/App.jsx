import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { User } from "@/api/entities"
import { useEffect } from "react"

function App() {
  useEffect(() => {
    // Initialize authentication from localStorage
    User.initAuth()
  }, [])

  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 