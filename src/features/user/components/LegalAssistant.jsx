import React, { useState, useEffect, useRef } from 'react'

const IpcWiki = ({ user }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [connected, setConnected] = useState(true)
  const [chatSessions, setChatSessions] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [attachedFile, setAttachedFile] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraTarget, setCameraTarget] = useState('chat') // 'chat' or 'pdf'
  const [showPdfPanel, setShowPdfPanel] = useState(false)
  const [pdfTitle, setPdfTitle] = useState('Legal Document')
  const [pdfContent, setPdfContent] = useState('')
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [pdfPrompt, setPdfPrompt] = useState('')
  const [pdfPromptLoading, setPdfPromptLoading] = useState(false)
  const [pdfAttachedFile, setPdfAttachedFile] = useState(null)
  const [showPdfAttachMenu, setShowPdfAttachMenu] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const attachMenuRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const pdfFileInputRef = useRef(null)
  const pdfAttachMenuRef = useRef(null)

  const apiUrl = 'http://localhost:8002'  // Python RAG API

  // Close attach menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setShowAttachMenu(false)
      }
      if (pdfAttachMenuRef.current && !pdfAttachMenuRef.current.contains(e.target)) {
        setShowPdfAttachMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAttachedFile(file)
    setShowAttachMenu(false)
  }

  // Handle file selection for PDF panel
  const handlePdfFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfAttachedFile(file)
  }

  // Remove attached file
  const removeAttachment = () => {
    setAttachedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  // Open camera (target: 'chat' or 'pdf')
  const openCamera = async (target = 'chat') => {
    setShowAttachMenu(false)
    setShowPdfAttachMenu(false)
    setCameraTarget(target)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setCameraStream(stream)
      setShowCamera(true)
      // Wait for video element to mount, then attach stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch (err) {
      console.error('Camera access denied:', err)
      alert('Camera access denied. Please allow camera permissions and try again.')
    }
  }

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })
        if (cameraTarget === 'pdf') {
          setPdfAttachedFile(file)
        } else {
          setAttachedFile(file)
        }
      }
      closeCamera()
    }, 'image/jpeg', 0.9)
  }

  // Close camera
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
  }

  // Upload file to API
  const uploadFile = async (file, userMessage = '') => {
    const formData = new FormData()
    formData.append('file', file)
    if (chatId) formData.append('chat_id', chatId)
    if (userMessage) formData.append('message', userMessage)

    const userId = user._id
    const userType = user.role === 'advocate' ? 'advocate' : 'user'
    if (userType === 'advocate') {
      formData.append('advocate_id', userId)
    } else {
      formData.append('user_id', userId)
    }
    formData.append('user_type', userType)

    const res = await fetch(`${apiUrl}/upload`, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }))
      throw new Error(err.detail || 'Upload failed')
    }
    return await res.json()
  }

  const toAsciiDigits = (value = '') => {
    const map = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
    }
    return String(value).replace(/[०-९٠-٩۰-۹]/g, (d) => map[d] || d)
  }

  const normalizePdfOutputText = (value = '') => {
    let text = toAsciiDigits(value)
    text = text.replace(/(दिनांक\s*[:：]\s*)([^\n]+)/g, (_, prefix, rest) => {
      const part = toAsciiDigits(rest)
      const m = part.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/)
      if (!m) return `${prefix}${part}`
      const dd = m[1].padStart(2, '0')
      const mm = m[2].padStart(2, '0')
      const yy = m[3].length === 2 ? `20${m[3]}` : m[3]
      return `${prefix}${dd}-${mm}-${yy}`
    })
    return text
  }
  const detectRequestedLanguage = (prompt = '') => {
    const p = String(prompt || '')
    const pl = p.toLowerCase()
    if (/\bpunjabi\b/.test(pl) || /[\u0A00-\u0A7F]/.test(p)) return 'punjabi'
    if (/\bhindi\b|\u0939\u093f\u0902\u0926\u0940|\u0939\u093f\u0928\u094d\u0926\u0940/i.test(p) || /[\u0900-\u097F]/.test(p)) return 'hindi'
    if (/\benglish\b/.test(pl)) return 'english'
    return 'auto'
  }

  const isHindiLetterRequest = (prompt = '') => {
    const hasLetterIntent = /\b(letter|complaint|application|notice|draft)\b|\u092a\u0924\u094d\u0930|\u0936\u093f\u0915\u093e\u092f\u0924|\u0906\u0935\u0947\u0926\u0928|\u0928\u094b\u091f\u093f\u0938/i.test(prompt)
    return detectRequestedLanguage(prompt) === 'hindi' && hasLetterIntent
  }

  const enforceHindiPleasantTerms = (value = '') => {
    let text = String(value || '').trim()
    if (!text) return text

    const hasSevaMe = /\u0938\u0947\u0935\u093e\s*\u092e\u0947\u0902/.test(text)
    const hasShriman = /\u0936\u094d\u0930\u0940\u092e\u093e\u0928/.test(text)
    const hasMahoday = /\u092e\u0939\u094b\u0926\u092f/.test(text)
    const hasClosing = /\u0906\u092a\u0915\u093e\s+\u0906\u092d\u093e\u0930\u0940|\u092d\u0935\u0926\u0940\u092f/.test(text)

    const lines = text.split('\n')

    if (!hasSevaMe) lines.unshift('\u0938\u0947\u0935\u093e \u092e\u0947\u0902,')
    if (!hasShriman) {
      const sevaIdx = lines.findIndex((l) => /\u0938\u0947\u0935\u093e\s*\u092e\u0947\u0902/.test(l))
      if (sevaIdx >= 0) lines.splice(sevaIdx + 1, 0, '\u0936\u094d\u0930\u0940\u092e\u093e\u0928 \u0925\u093e\u0928\u093e \u092a\u094d\u0930\u092d\u093e\u0930\u0940,')
      else lines.unshift('\u0936\u094d\u0930\u0940\u092e\u093e\u0928 \u0925\u093e\u0928\u093e \u092a\u094d\u0930\u092d\u093e\u0930\u0940,')
    }

    text = lines.join('\n').trim()

    if (!hasMahoday) {
      const subjectMatch = text.match(/(^|\n)\s*\u0935\u093f\u0937\u092f\s*[:：].*$/m)
      if (subjectMatch && subjectMatch.index != null) {
        const insertAt = subjectMatch.index + subjectMatch[0].length
        text = `${text.slice(0, insertAt)}\n\n\u092e\u0939\u094b\u0926\u092f,\n${text.slice(insertAt).trimStart()}`
      } else {
        text = `${text}\n\n\u092e\u0939\u094b\u0926\u092f,`
      }
    }

    if (!hasClosing) text = `${text}\n\n\u0906\u092a\u0915\u093e \u0906\u092d\u093e\u0930\u0940,`
    return text
  }

  const stripHindiPleasantTerms = (value = '') => {
    let text = String(value || '')
    text = text.replace(/^\s*\u0938\u0947\u0935\u093e \u092e\u0947\u0902,\s*\n?/gm, '')
    text = text.replace(/^\s*\u0936\u094d\u0930\u0940\u092e\u093e\u0928 \u0925\u093e\u0928\u093e \u092a\u094d\u0930\u092d\u093e\u0930\u0940,\s*\n?/gm, '')
    text = text.replace(/^\s*\u092e\u0939\u094b\u0926\u092f,?\s*\n?/gm, '')
    text = text.replace(/^\s*(\u0906\u092a\u0915\u093e \u0906\u092d\u093e\u0930\u0940,?|\u092d\u0935\u0926\u0940\u092f,?)\s*$/gm, '')
    return text.trim()
  }

  const buildPdfQuestion = (prompt, attachedFileName = '', attachedText = '') => {
    const trimmed = (prompt || '').trim()
    const requestedLanguage = detectRequestedLanguage(trimmed)
    const isHindi = requestedLanguage === 'hindi'
    const isPunjabi = requestedLanguage === 'punjabi'
    const letterIntent = /\b(letter|complaint|application|notice|draft)\b|\u092a\u0924\u094d\u0930|\u0936\u093f\u0915\u093e\u092f\u0924|\u0906\u0935\u0947\u0926\u0928|\u0A28\u0A4B\u0A1F\u0A3F\u0A38/i.test(trimmed)
    let question = trimmed

    if (attachedText) {
      question += `\n\n[Document: ${attachedFileName}]\n${attachedText.slice(0, 8000)}`
    }

    if (isHindi && letterIntent) {
      question += '\n\n[HINDI LETTER STYLE: Use polite and formal Hindi letter tone. Use appropriate words where relevant: "\u0938\u0947\u0935\u093e \u092e\u0947\u0902," "\u0936\u094d\u0930\u0940\u092e\u093e\u0928" "\u092e\u0939\u094b\u0926\u092f," and closing like "\u0906\u092a\u0915\u093e \u0906\u092d\u093e\u0930\u0940"/"\u092d\u0935\u0926\u0940\u092f". Keep it natural, not repetitive. Date must be in DD-MM-YYYY using English digits 0-9 only.]'
    } else if (isPunjabi && letterIntent) {
      question += '\n\n[PUNJABI LETTER STYLE: Write fully in Punjabi (Gurmukhi script), polite formal tone. Do NOT use Hindi salutations like "\u0938\u0947\u0935\u093e \u092e\u0947\u0902", "\u0936\u094d\u0930\u0940\u092e\u093e\u0928", "\u092e\u0939\u094b\u0926\u092f", "\u0906\u092a\u0915\u093e \u0906\u092d\u093e\u0930\u0940". Date must be in DD-MM-YYYY using English digits 0-9 only.]'
    } else {
      question += '\n\n[DATE FORMAT: Whenever you include a date, use DD-MM-YYYY with English digits 0-9 only.]'
    }

    return question
  }

  // Send prompt to AI and fill the PDF content area
  const handlePdfPrompt = async () => {
    const prompt = pdfPrompt.trim()
    if ((!prompt && !pdfAttachedFile) || pdfPromptLoading || !user) return

    setPdfPromptLoading(true)

    try {
      const userId = user._id
      const userType = user.role === 'advocate' ? 'advocate' : 'user'
      const idField = user.role === 'advocate' ? 'advocate_id' : 'user_id'
      let data

      if (pdfAttachedFile) {
        // Extract text directly from attached file so letter wording is preserved
        const formData = new FormData()
        formData.append('file', pdfAttachedFile)
        const extractRes = await fetch(`${apiUrl}/extract-text`, { method: 'POST', body: formData })
        if (!extractRes.ok) throw new Error('Text extraction failed')
        const extracted = await extractRes.json()
        const extractedText = (extracted?.text || '').trim()

        if (!prompt) {
          setPdfContent(normalizePdfOutputText(extractedText))
          setPdfAttachedFile(null)
          if (pdfFileInputRef.current) pdfFileInputRef.current.value = ''
          setPdfPromptLoading(false)
          return
        }

        // If prompt exists, apply user instruction but preserve letter structure and wording
        const res = await fetch(`${apiUrl}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: buildPdfQuestion(prompt, pdfAttachedFile.name, extractedText),
            [idField]: userId,
            user_type: userType,
            chat_id: chatId,
            disable_memory: true
          })
        })
        if (!res.ok) throw new Error('Server error')
        data = await res.json()

        setPdfAttachedFile(null)
        if (pdfFileInputRef.current) pdfFileInputRef.current.value = ''
      } else {
        // Text-only prompt
        const res = await fetch(`${apiUrl}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: buildPdfQuestion(prompt),
            [idField]: userId,
            user_type: userType,
            chat_id: chatId,
            disable_memory: true
          })
        })
        if (!res.ok) throw new Error('Server error')
        data = await res.json()
      }
      const normalized = normalizePdfOutputText(data.answer)
      const requestedLanguage = detectRequestedLanguage(prompt)
      let finalText = normalized
      if (isHindiLetterRequest(prompt)) {
        finalText = enforceHindiPleasantTerms(finalText)
      } else if (requestedLanguage === 'punjabi') {
        finalText = stripHindiPleasantTerms(finalText)
      }
      setPdfContent(finalText)
    } catch (err) {
      console.error('PDF prompt error:', err)
      alert('Failed to generate document. Please try again.')
    }
    setPdfPromptLoading(false)
  }

  // Generate and download PDF from the panel
  const handleGeneratePdf = async () => {
    if (!pdfContent.trim()) return
    setPdfGenerating(true)
    await downloadPDF(pdfContent, pdfTitle || 'Legal_Document')
    setPdfGenerating(false)
  }

  // Download text as PDF
  const downloadPDF = async (text, title = 'Legal Document') => {
    try {
      const res = await fetch(`${apiUrl}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, title })
      })
      if (!res.ok) {
  let detail = 'PDF generation failed'

  try {
    const err = await res.json()
    detail = err?.detail || detail
  } catch (error) {
    console.warn('Could not parse PDF error response:', error)
  }

  throw new Error(detail)
}
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download failed:', err)
      alert(`Failed to generate PDF: ${err.message || 'Please try again.'}`)
    }
  }

  // Auto-scroll to bottom — only within the messages container, not the whole page
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [messages, loading])

  // Health check
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${apiUrl}/health`)
        const data = await res.json()
        setConnected(!!data.vectorstore_loaded)
      } catch {
        setConnected(false)
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  // Load all chat sessions
  const loadChatSessions = async () => {
    if (!user) return

    try {
      const userId = user._id
      const userType = user.role === 'advocate' ? 'advocate' : 'user'

      const res = await fetch(`${apiUrl}/chats?user_id=${userId}&user_type=${userType}`)
      if (res.ok) {
        const chats = await res.json()
        setChatSessions(chats || [])
        return chats
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err)
    }
    return []
  }

  // Load specific chat by ID
  const loadChatById = async (id) => {
    try {
      const chatRes = await fetch(`${apiUrl}/chats/${id}`)
      if (chatRes.ok) {
        const chatData = await chatRes.json()
        const formattedMessages = chatData.messages.flatMap(msg => [
          { text: msg.question, sender: 'user' },
          { text: msg.answer, sender: 'bot', sources: msg.sources ? JSON.parse(msg.sources) : [] }
        ])
        setMessages(formattedMessages)
        setChatId(id)
      }
    } catch (err) {
      console.error('Failed to load chat:', err)
    }
  }

  // Load chat sessions on mount, always start with a fresh new chat
  useEffect(() => {
    if (!user) return

    const init = async () => {
      await loadChatSessions()
      await startNewChat()
    }

    init()
  }, [user])

  // Send message
  const send = async () => {
    const question = input.trim()
    const hasFile = !!attachedFile

    if ((!question && !hasFile) || loading || !user) return

    // Show user message
    const displayText = hasFile
      ? `${question ? question + '\n' : ''}📎 ${attachedFile.name}`
      : question
    setMessages(prev => [...prev, { text: displayText, sender: 'user' }])
    setInput('')
    const currentFile = attachedFile
    setAttachedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    setLoading(true)

    try {
      let data

      if (currentFile) {
        // Upload file with the user's typed message for language detection
        data = await uploadFile(currentFile, question)
      } else {
        // Text-only query
        const userId = user._id
        const userType = user.role === 'advocate' ? 'advocate' : 'user'
        const idField = user.role === 'advocate' ? 'advocate_id' : 'user_id'

        const res = await fetch(`${apiUrl}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            [idField]: userId,
            user_type: userType,
            chat_id: chatId
          })
        })

        if (!res.ok) throw new Error('Server error')
        data = await res.json()
      }

      // Update chat_id if this was the first message
      if (data.chat_id && data.chat_id !== chatId) {
        setChatId(data.chat_id)
        await loadChatSessions() // Refresh sidebar
      }

      // Display the bot response
      setMessages(prev => [
        ...prev,
        { text: data.answer, sender: 'bot', sources: data.sources }
      ])
    } catch (err) {
      console.error('Send message error:', err)
      setMessages(prev => [
        ...prev,
        {
          text: err.message || 'Sorry, couldn\'t connect to the server. Make sure the Legal RAG API is running.',
          sender: 'bot'
        }
      ])
    }
    setLoading(false)
  }

  // Start new chat — just reset UI; the /query endpoint auto-creates the chat on first message
  const startNewChat = async () => {
    if (!user) {
      console.log('Cannot create chat: user not logged in')
      return
    }
    setChatId(null)
    setMessages([])
  }

  // Delete chat
  const deleteChat = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this chat session?')) return

    try {
      const res = await fetch(`${apiUrl}/chats/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadChatSessions()
        if (chatId === id) {
          // If current chat was deleted, start new one
          await startNewChat()
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err)
    }
  }

  return (
    <div className="h-full bg-slate-50 text-slate-800 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-slate-900 text-white flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={startNewChat}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => loadChatById(session.id)}
              className={`group px-3 py-3 rounded-lg cursor-pointer transition-all ${chatId === session.id
                  ? 'bg-slate-700'
                  : 'hover:bg-slate-800'
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-amber-400 text-sm">chat</span>
                    <span className="text-xs text-slate-400">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{session.title || 'New Chat'}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {session.message_count || 0} message{session.message_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteChat(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-opacity"
                  type="button"
                  title="Delete chat"
                >
                  <span className="material-symbols-outlined text-red-400 text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}

          {chatSessions.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No previous chats.<br />Start a new conversation!
            </div>
          )}
        </div>

        {user && (
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-amber-400">account_circle</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role === 'advocate' ? 'Advocate' : 'User'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-slate-600">menu</span>
            </button>
            <h2 className="text-lg font-bold text-slate-900">Legal AI Chat</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: connected ? '#4ade80' : '#ef4444' }}></span>
            <span className={`text-xs font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-100 mb-6">
                  <span className="material-symbols-outlined text-amber-600 text-4xl">balance</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Welcome to Legal AI Assistant</h4>
                <p className="text-slate-500 text-sm max-w-md">
                  Get instant answers on Constitutional rights, BNS provisions, legal procedures, and landmark cases.
                </p>
                {!user && (
                  <p className="text-amber-600 text-sm font-semibold mt-4">Please log in to start chatting</p>
                )}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${m.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                    : 'bg-slate-100 text-slate-900 border border-slate-200'
                  }`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-5 border-t border-slate-200 bg-white">
            {/* Attachment preview */}
            {attachedFile && (
              <div className="max-w-4xl mx-auto mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <span className="material-symbols-outlined text-blue-600 text-base">
                    {attachedFile.type?.includes('pdf') ? 'picture_as_pdf' : 'image'}
                  </span>
                  <span className="text-blue-800 font-medium truncate max-w-[200px]">{attachedFile.name}</span>
                  <button
                    onClick={removeAttachment}
                    className="p-0.5 hover:bg-blue-200 rounded transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-blue-600 text-base">close</span>
                  </button>
                </div>
              </div>
            )}

            <div className="max-w-4xl mx-auto flex gap-3 items-center">
              {/* PDF Generator button */}
              <button
                onClick={() => setShowPdfPanel(true)}
                disabled={!user}
                className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                type="button"
                title="Generate PDF"
              >
                <span className="material-symbols-outlined text-emerald-600 text-2xl">picture_as_pdf</span>
              </button>

              {/* + Button with menu */}
              <div className="relative" ref={attachMenuRef}>
                <button
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  disabled={!user || loading}
                  className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  type="button"
                  title="Attach file"
                >
                  <span className="material-symbols-outlined text-slate-600 text-2xl">add</span>
                </button>

                {showAttachMenu && (
                  <div className="absolute bottom-14 left-0 bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-52 z-50 animate-in fade-in slide-in-from-bottom-2">
                    <button
                      onClick={openCamera}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-amber-600">photo_camera</span>
                      <span className="text-sm font-medium text-slate-700">Take Photo</span>
                    </button>
                    <button
                      onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-blue-600">upload_file</span>
                      <span className="text-sm font-medium text-slate-700">Upload PDF / Image</span>
                    </button>
                  </div>
                )}

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder={user ? 'Ask about Indian law, rights, legal procedures...' : 'Please log in to ask questions'}
                disabled={!user || loading}
                className="flex-1 px-5 py-3.5 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
              />
              <button
                onClick={send}
                disabled={!user || loading || (!input.trim() && !attachedFile)}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Take Photo</h3>
              <button
                onClick={closeCamera}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-cover"
              />
            </div>
            <div className="flex items-center justify-center py-4 gap-4">
              <button
                onClick={closeCamera}
                className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg flex items-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">photo_camera</span>
                Capture
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* PDF Generator Panel */}
      {showPdfPanel && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center pb-4 px-4 pt-20 overflow-hidden" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 100px)' }}>
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">picture_as_pdf</span>
                <h3 className="text-lg font-bold text-slate-900">PDF Generator</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setPdfContent(''); setPdfTitle('Legal Document'); setPdfPrompt('') }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-500 text-xs font-medium hover:bg-slate-50 transition-colors"
                  type="button"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowPdfPanel(false)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  type="button"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-red-400 hover:text-red-600">close</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Document Title</label>
                <input
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="e.g. Complaint Letter, Legal Notice..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                />
              </div>

              {/* Content textarea */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Document Content</label>
                {pdfContent ? (
                  <textarea
                    value={pdfContent}
                    onChange={(e) => setPdfContent(e.target.value)}
                    rows={14}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-mono leading-relaxed resize-none"
                  />
                ) : (
                  <div className="w-full px-4 py-12 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-3 block">description</span>
                    <p className="text-sm text-slate-400">Describe what you need below and the AI will generate the document here</p>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Prompt Input */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <div className="flex gap-2 items-center">
                {/* + Button with menu */}
                <div className="relative" ref={pdfAttachMenuRef}>
                  <button
                    onClick={() => setShowPdfAttachMenu(!showPdfAttachMenu)}
                    disabled={pdfPromptLoading}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40 transition-all"
                    type="button"
                    title="Attach file"
                  >
                    <span className="material-symbols-outlined text-slate-500 text-xl">add</span>
                  </button>

                  {showPdfAttachMenu && (
                    <div className="absolute bottom-12 left-0 bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-52 z-50">
                      <button
                        onClick={() => openCamera('pdf')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-amber-600">photo_camera</span>
                        <span className="text-sm font-medium text-slate-700">Take Photo</span>
                      </button>
                      <button
                        onClick={() => { pdfFileInputRef.current?.click(); setShowPdfAttachMenu(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-blue-600">upload_file</span>
                        <span className="text-sm font-medium text-slate-700">Upload PDF / Image</span>
                      </button>
                    </div>
                  )}

                  <input
                    ref={pdfFileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,image/*,application/pdf"
                    onChange={handlePdfFileSelect}
                    className="hidden"
                  />
                </div>
                <input
                  type="text"
                  value={pdfPrompt}
                  onChange={(e) => setPdfPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handlePdfPrompt()
                    }
                  }}
                  placeholder="Describe the document you need..."
                  disabled={pdfPromptLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm disabled:bg-slate-100"
                />
                <button
                  onClick={handlePdfPrompt}
                  disabled={(!pdfPrompt.trim() && !pdfAttachedFile) || pdfPromptLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                  type="button"
                  title="Generate content"
                >
                  {pdfPromptLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-lg">send</span>
                  )}
                </button>
                <button
                  onClick={handleGeneratePdf}
                  disabled={!pdfContent.trim() || pdfGenerating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                  type="button"
                  title="Download as PDF"
                >
                  {pdfGenerating ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-lg">download</span>
                  )}
                </button>
              </div>
              {pdfAttachedFile && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <span className="material-symbols-outlined text-emerald-600 text-sm">attach_file</span>
                  <span className="text-emerald-800 font-medium truncate max-w-[200px]">{pdfAttachedFile.name}</span>
                  <button
                    onClick={() => { setPdfAttachedFile(null); if (pdfFileInputRef.current) pdfFileInputRef.current.value = '' }}
                    className="p-0.5 hover:bg-emerald-200 rounded transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-emerald-600 text-sm">close</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IpcWiki



