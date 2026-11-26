import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../auth";
import IpcWiki from '../components/LegalAssistant'

const IpcWikiPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 antialiased">
      <main className="pb-20 min-h-screen">
        <IpcWiki user={user} />
      </main>
    </div>
  )
}

export default IpcWikiPage