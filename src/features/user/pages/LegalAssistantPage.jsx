import { useNavigate } from 'react-router-dom'
import { useAuth } from "../../auth";
import Navbar from '@app/layouts/Navbar'
import IpcWiki from '../components/LegalAssistant'

const IpcWikiPage = () => {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 antialiased">
      <Navbar
        activePage="ipcWiki"
        isLoggedIn={isLoggedIn}
        user={user}
        onLogoClick={() => navigate('/')}
        onIpcWikiClick={() => navigate('/ipc-wiki')}
        onLoginClick={() => navigate('/login')}
        onSignupClick={() => navigate('/signup')}
        onDashboardClick={() => navigate('/')}
      />
      <main className="pt108 pb-20 min-h-screen">
        <IpcWiki user={user} />
      </main>
    </div>
  )
}

export default IpcWikiPage