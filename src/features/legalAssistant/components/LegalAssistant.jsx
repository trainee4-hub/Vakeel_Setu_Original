import React, { useState, useEffect, useRef } from 'react'
import {
  LEGAL_THINKING_STEPS,
  cleanAnswerText,
  detectDocumentTitle,
  isLegalDraft,
  QUICK_PROMPTS,
  normalizePdfOutputText,
  detectRequestedLanguage,
  isHindiLetterRequest,
  enforceHindiPleasantTerms,
  stripHindiPleasantTerms,
  buildPdfQuestion,
} from '../utils/legalAssistantUtils'
import FormattedLegalMessage from './FormattedLegalMessage'

export { FormattedLegalMessage }

const IpcWiki = ({ user }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [thinkingIndex, setThinkingIndex] = useState(0)
  const [chatId, setChatId] = useState(null)
  const [connected, setConnected] = useState(true)
  const [chatSessions, setChatSessions] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [downloadingPdfIndex, setDownloadingPdfIndex] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [selectedLang, setSelectedLang] = useState('auto')
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

  // Cycle thinking status words during generation
  useEffect(() => {
    if (!loading) {
      setThinkingIndex(0)
      return
    }
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % LEGAL_THINKING_STEPS.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [loading])
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const attachMenuRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const pdfFileInputRef = useRef(null)
  const pdfAttachMenuRef = useRef(null)

  const apiUrl = import.meta.env.VITE_LEGAL_AI_API_URL || 'http://localhost:8000'

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

  // Upload file and query chat with file context
  const uploadFile = async (file, userMessage = '') => {
    const formData = new FormData()
    formData.append('file', file)
    const activeSessionId = chatId || crypto.randomUUID()
    const userId = user?._id || user?.id || user?.userId

    let extractedText = ''
    try {
      const extractRes = await fetch(`${apiUrl}/documents/extract`, {
        method: 'POST',
        body: formData
      })
      if (extractRes.ok) {
        const extJson = await extractRes.json()
        extractedText = extJson.text || ''
      }
    } catch (e) {
      console.warn('Extraction notice:', e)
    }

    const fullQuestion = userMessage
      ? `${userMessage}\n\n[संलग्न दस्तावेज़ सामग्री / Attached File: ${file.name}]:\n${extractedText.slice(0, 12000)}`
      : `कृपया इस संलग्न दस्तावेज़ (${file.name}) का विस्तृत कानूनी विश्लेषण करें और इसके मुख्य बिंदु एवं विधिक प्रावधान बताएं:\n\n${extractedText.slice(0, 12000)}`

    const res = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: fullQuestion,
        session_id: activeSessionId,
        language: selectedLang || 'auto',
        user_id: userId ? String(userId) : undefined
      })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Document processing failed' }))
      throw new Error(err.detail || 'Document processing failed')
    }
    return await res.json()
  }


  // Send prompt to AI and fill the PDF content area
  const handlePdfPrompt = async () => {
    const prompt = pdfPrompt.trim()
    if ((!prompt && !pdfAttachedFile) || pdfPromptLoading || !user) return

    setPdfPromptLoading(true)

    try {
      const userId = user._id || user.id || user.userId
      let data

      if (pdfAttachedFile) {
        // Extract text directly from attached file so letter wording is preserved
        const formData = new FormData()
        formData.append('file', pdfAttachedFile)
        const extractRes = await fetch(`${apiUrl}/documents/extract`, { method: 'POST', body: formData })
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
        const res = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: buildPdfQuestion(prompt, pdfAttachedFile.name, extractedText),
            user_id: userId ? String(userId) : undefined,
            session_id: chatId || undefined,
            language: 'auto'
          })
        })
        if (!res.ok) throw new Error('Server error')
        data = await res.json()

        setPdfAttachedFile(null)
        if (pdfFileInputRef.current) pdfFileInputRef.current.value = ''
      } else {
        // Text-only prompt
        const res = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: buildPdfQuestion(prompt),
            user_id: userId ? String(userId) : undefined,
            session_id: chatId || undefined,
            language: 'auto'
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

  // Handle PDF download from draft (supports both official /draft/export and /generate-pdf)
  const handleDownloadPdf = async (text, index, draftObj = null) => {
    try {
      setDownloadingPdfIndex(index)
      const title = detectDocumentTitle(text)

      // 1. If backend draft_id exists, call official /draft/export from LegalDraftEngine
      const targetDraftId = draftObj?.draft_id
      if (targetDraftId) {
        try {
          const exportRes = await fetch(`${apiUrl}/draft/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              draft_id: targetDraftId,
              session_id: draftObj?.session_id || chatId || undefined,
              format: 'pdf',
              watermark: false
            })
          })
          if (exportRes.ok) {
            const blob = await exportRes.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            let downloadName = `${title.replace(/\s+/g, '_')}.pdf`
            const disposition = exportRes.headers.get('content-disposition')
            if (disposition && disposition.includes('filename=')) {
              const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
              if (match && match[1]) downloadName = match[1].replace(/['"]/g, '').trim()
            }
            a.download = downloadName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            return
          } else {
            console.warn('Backend /draft/export status:', exportRes.status)
          }
        } catch (err) {
          console.warn('Backend /draft/export fallback to /generate-pdf:', err)
        }
      }

      // 2. Direct Weasyprint PDF generation fallback
      await downloadPDF(cleanAnswerText(text), title)
    } finally {
      setDownloadingPdfIndex(null)
    }
  }

  // Download editable Word (.doc / .docx)
  const downloadWordDoc = async (text, title = 'Legal_Document', draftObj = null) => {
    // 1. If backend draft_id exists, try calling official /draft/export for docx
    const targetDraftId = draftObj?.draft_id
    if (targetDraftId) {
      try {
        const exportRes = await fetch(`${apiUrl}/draft/export`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draft_id: targetDraftId,
            session_id: draftObj?.session_id || chatId || undefined,
            format: 'docx',
            watermark: false
          })
        })
        if (exportRes.ok) {
          const blob = await exportRes.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          let downloadName = `${title.replace(/\s+/g, '_')}.docx`
          const disposition = exportRes.headers.get('content-disposition')
          if (disposition && disposition.includes('filename=')) {
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
            if (match && match[1]) downloadName = match[1].replace(/['"]/g, '').trim()
          }
          a.download = downloadName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          return
        }
      } catch (err) {
        console.warn('Backend /draft/export docx fallback to client doc:', err)
      }
    }

    // 2. Client-side .doc generation
    const cleaned = cleanAnswerText(text)
    const paragraphs = cleaned.split('\n').map(p => {
      const line = p.trim()
      if (!line) return '<br/>'
      if (/^\*\*([^*]+)\*\*[:\s]*$/.test(line)) {
        const h = line.replace(/^\*\*|\*\*[:\s]*$/g, '')
        return `<h3 style="margin-top:16px; margin-bottom:6px; color:#0f172a; font-size:13pt;"><b>${h}</b></h3>`
      }
      return `<p style="margin:6px 0; font-size:12pt; line-height:1.6;">${line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</p>`
    }).join('\n')

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; padding: 40px; color: #000; }
  h3 { font-family: Arial, sans-serif; }
</style>
</head>
<body>
${paragraphs}
</body>
</html>`
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Copy full cleaned message to clipboard
  const handleCopyText = (text, index) => {
    const cleaned = cleanAnswerText(text)
    navigator.clipboard.writeText(cleaned)
    setCopiedIndex(index)
    setTimeout(() => {
      setCopiedIndex(null)
    }, 2000)
  }

  // Print draft directly
  const handlePrintText = (text) => {
    const cleaned = cleanAnswerText(text)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const content = cleaned.split('\n').map(p => {
      const line = p.trim()
      if (!line) return '<br>'
      if (/^\*\*([^*]+)\*\*[:\s]*$/.test(line)) {
        const h = line.replace(/^\*\*|\*\*[:\s]*$/g, '')
        return `<h3 style="margin-top:16px; margin-bottom:6px; font-weight:bold; font-size:13pt;">${h}</h3>`
      }
      return `<p style="margin:6px 0; line-height:1.7;">${line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</p>`
    }).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Legal Document Draft</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.7; padding: 40px 60px; color: #111; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
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
        setConnected(data.status === 'ok' || data.status === 'degraded' || data.components?.llm === 'ok')
      } catch {
        setConnected(false)
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [apiUrl])

  // Load all chat sessions
  const loadChatSessions = async () => {
    if (!user) return

    try {
      const userId = user._id || user.id || user.userId
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
        const parseSources = (s) => {
          if (!s) return []
          if (Array.isArray(s)) return s
          try { return JSON.parse(s) } catch { return [] }
        }
        const formattedMessages = (chatData.messages || []).flatMap(msg => [
          { text: msg.question, sender: 'user' },
          {
            text: cleanAnswerText(msg.answer),
            sender: 'bot',
            sources: parseSources(msg.sources),
            draft: msg.draft || null
          }
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
    const init = async () => {
      if (user) {
        await loadChatSessions()
      }
      await startNewChat()
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Send message
  const send = async () => {
    const question = input.trim()
    const hasFile = !!attachedFile

    if ((!question && !hasFile) || loading) return

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
        const userId = user?._id || user?.id || user?.userId || 'user'
        const activeSessionId = chatId || crypto.randomUUID()

        const res = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            session_id: activeSessionId,
            language: selectedLang || 'auto',
            user_id: userId ? String(userId) : undefined
          })
        })

        if (!res.ok) throw new Error('Server error')
        data = await res.json()
      }

      // Update chat_id if this was the first message
      const currentChatId = data.session_id || data.chat_id || chatId
      if (currentChatId && currentChatId !== chatId) {
        setChatId(currentChatId)
      }

      // Display the bot response
      setMessages(prev => [
        ...prev,
        {
          text: cleanAnswerText(data.answer),
          sender: 'bot',
          sources: data.citations || data.sources || [],
          draft: data.draft || null
        }
      ])

      // Refresh chat sessions list in sidebar
      loadChatSessions()
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

  // Start new chat — reset chat session state
  const startNewChat = async () => {
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
    <div className="h-full w-full bg-slate-50 text-slate-800 flex overflow-hidden notranslate" translate="no">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-slate-900 text-white flex flex-col h-full overflow-hidden shrink-0 notranslate`} translate="no">
        <div className="p-3 border-b border-slate-800 shrink-0">
          <button
            onClick={startNewChat}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 notranslate" translate="no">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => loadChatById(session.id)}
              className={`group px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${chatId === session.id
                ? 'bg-slate-800 text-white font-medium'
                : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="material-symbols-outlined text-amber-400 text-sm shrink-0">chat_bubble_outline</span>
                  <p className="text-xs font-medium truncate">{session.title || 'New Chat'}</p>
                </div>
                <button
                  onClick={(e) => deleteChat(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-all shrink-0"
                  type="button"
                  title="Delete chat"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}

          {chatSessions.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs">
              No previous chats.<br />Start a new conversation!
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 notranslate" translate="no">
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-slate-600">menu</span>
            </button>
            <h2 className="text-base font-bold text-slate-900">Legal AI Chat</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: connected ? '#4ade80' : '#ef4444' }}></span>
            <span className={`text-xs font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <main className="flex-1 flex flex-col overflow-hidden min-h-0 notranslate" translate="no">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 notranslate" translate="no">
            <div className="max-w-6xl w-full mx-auto space-y-5">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-500 shadow-xl border border-slate-700/60 mb-6">
                    <span className="material-symbols-outlined text-4xl">balance</span>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Legal AI Assistant</h4>
                  <p className="text-slate-500 text-sm max-w-lg leading-relaxed mb-6">
                    Get instant advocate-level answers on Indian Constitutional rights, BNS provisions, FIR / complaint drafting, court procedures, and legal notice generation.
                  </p>

                  {/* Quick Legal Draft / Consultation Starters */}
                  <div className="w-full max-w-3xl text-left mt-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm text-amber-600">lightbulb</span>
                      Quick Legal Draft & Consultation Starters
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {QUICK_PROMPTS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setInput(p.prompt)
                            inputRef.current?.focus()
                          }}
                          className="p-3 bg-white hover:bg-amber-50/50 rounded-xl border border-slate-200 hover:border-amber-300 text-left transition-all shadow-sm hover:shadow group flex flex-col justify-between"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="material-symbols-outlined text-amber-600 text-lg group-hover:scale-110 transition-transform">
                              {p.icon}
                            </span>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                              {p.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                            {p.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {!user && (
                    <p className="text-amber-600 text-sm font-semibold mt-6 bg-amber-50 border border-amber-200/60 px-4 py-2 rounded-xl">
                      Please log in to start chatting with Legal AI
                    </p>
                  )}
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {/* Bot Avatar (left) */}
                  {m.sender !== 'user' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-500 shadow-md mt-0.5 border border-slate-700/60">
                      <span className="material-symbols-outlined text-lg">balance</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm notranslate transition-all ${m.sender === 'user'
                    ? 'bg-blue-600 text-white shadow-blue-500/10'
                    : 'bg-white text-slate-900 border border-slate-200/90 shadow-slate-100'
                    }`} translate="no">
                    <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold">
                      {m.sender !== 'user' ? (
                        <span className="text-slate-700 flex items-center gap-1.5">
                          <span>Vakeel<span className="text-amber-600 font-bold">Setu</span> AI</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60 font-medium">Legal Assistant</span>
                        </span>
                      ) : (
                        <span className="text-blue-100 font-medium flex items-center gap-1">
                          <span>You</span>
                        </span>
                      )}
                    </div>

                    {m.sender === 'user' ? (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</div>
                    ) : (
                      (() => {
                        const isDraftMessage = isLegalDraft(m.text, m.draft)
                        return (
                          <div>
                            {/* DRAFT ONLY: Header Banner with Document Title & Quick Download */}
                            {isDraftMessage && (
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-amber-200/70 bg-gradient-to-r from-amber-50/90 via-amber-100/40 to-transparent -mx-5 -mt-2 px-5 pt-2 rounded-t-xl">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-amber-600 text-lg">gavel</span>
                                  <div>
                                    <div className="text-xs font-bold text-slate-900 tracking-wide uppercase flex items-center gap-1.5">
                                      <span>विधिक मसौदा / Legal Draft</span>
                                      {m.draft?.draft_id ? (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                          <span className="material-symbols-outlined text-[12px]">verified</span> Draft Engine
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-300">
                                          Legal Assistant
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-amber-800 font-medium">
                                      {m.draft?.template_name || detectDocumentTitle(m.text).replace(/_/g, ' ')}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleDownloadPdf(m.text, i, m.draft)}
                                    disabled={downloadingPdfIndex === i}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                    title="Download as PDF"
                                  >
                                    {downloadingPdfIndex === i ? (
                                      <>
                                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                        <span>Downloading...</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                        <span>Download PDF</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Formatted Clean Legal Message */}
                            <FormattedLegalMessage text={m.text} />

                            {/* DRAFT ONLY: Action Toolbar with Download PDF, Word, Copy Draft, Print */}
                            {isDraftMessage ? (
                              <div className="mt-4 pt-3 border-t border-amber-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* PDF Download Button */}
                                  <button
                                    onClick={() => handleDownloadPdf(m.text, i, m.draft)}
                                    disabled={downloadingPdfIndex === i}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-sm transition-all hover:shadow active:scale-95 disabled:opacity-50"
                                    title={m.draft?.draft_id ? "Download verified Court PDF Draft" : "Download formal PDF draft"}
                                  >
                                    {downloadingPdfIndex === i ? (
                                      <>
                                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                        <span>Generating PDF...</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                        <span>{m.draft?.draft_id ? "Download Court Draft (PDF)" : "Download PDF"}</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Word/Doc Download Button */}
                                  <button
                                    onClick={() => downloadWordDoc(m.text, m.draft?.template_name || detectDocumentTitle(m.text), m.draft)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all active:scale-95"
                                    title={m.draft?.draft_id ? "Download official Word Document (.docx)" : "Download editable Word Document (.doc)"}
                                  >
                                    <span className="material-symbols-outlined text-sm text-blue-600">description</span>
                                    <span>{m.draft?.draft_id ? "Word (.docx)" : "Word (.doc)"}</span>
                                  </button>

                                  {/* Copy Draft */}
                                  <button
                                    onClick={() => handleCopyText(m.text, i)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all active:scale-95"
                                    title="Copy draft to clipboard"
                                  >
                                    <span className="material-symbols-outlined text-sm text-slate-600">
                                      {copiedIndex === i ? 'check' : 'content_copy'}
                                    </span>
                                    <span>{copiedIndex === i ? 'Copied!' : 'Copy Draft'}</span>
                                  </button>

                                  {/* Print Draft */}
                                  <button
                                    onClick={() => handlePrintText(m.text)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all active:scale-95"
                                    title="Print this document"
                                  >
                                    <span className="material-symbols-outlined text-sm">print</span>
                                    <span>Print</span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-1 text-[11px] text-amber-850 font-medium">
                                  <span className="material-symbols-outlined text-emerald-600 text-xs">verified</span>
                                  <span>Draft Ready for Filing</span>
                                </div>
                              </div>
                            ) : (
                              /* NORMAL CHAT MESSAGE: Subtle, clean copy action only */
                              <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
                                <button
                                  onClick={() => handleCopyText(m.text, i)}
                                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
                                  title="Copy answer"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    {copiedIndex === i ? 'check' : 'content_copy'}
                                  </span>
                                  <span>{copiedIndex === i ? 'Copied' : 'Copy'}</span>
                                </button>
                                <span className="text-[10px] text-slate-400">Legal AI Assistant</span>
                              </div>
                            )}
                          </div>
                        )
                      })()
                    )}
                  </div>

                  {/* User Avatar (right) */}
                  {m.sender === 'user' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md mt-0.5 font-bold text-sm border border-blue-500/50">
                      {user?.fullName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || (
                        <span className="material-symbols-outlined text-base">person</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Dynamic Legal Thinking Indicator (ChatGPT Style) */}
              {loading && (
                <div className="flex items-start gap-3 justify-start animate-in fade-in duration-300">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-500 shadow-md mt-0.5 border border-slate-700/60">
                    <span className="material-symbols-outlined text-lg animate-spin" style={{ animationDuration: '3s' }}>
                      balance
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 shadow-sm max-w-[85%] notranslate" translate="no">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-700">Vakeel<span className="text-amber-600 font-bold">Setu</span> AI</span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Analyzing
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium py-1">
                      <span className="material-symbols-outlined text-amber-600 text-lg animate-pulse">
                        {LEGAL_THINKING_STEPS[thinkingIndex].icon}
                      </span>
                      <span className="transition-all duration-300 text-slate-800">
                        {LEGAL_THINKING_STEPS[thinkingIndex].text}
                      </span>
                    </div>
                    <div className="flex gap-1.5 mt-2.5">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="px-4 sm:px-8 lg:px-12 py-3.5 border-t border-slate-200 bg-white shrink-0 notranslate" translate="no">
            {/* Attachment preview */}
            {attachedFile && (
              <div className="max-w-6xl w-full mx-auto mb-2">
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

            <div className="max-w-6xl w-full mx-auto flex gap-3 items-center">
              {/* PDF Generator button */}
              {/* <button
                onClick={() => setShowPdfPanel(true)}
                disabled={!user}
                className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                type="button"
                title="Generate PDF"
              >
                <span className="material-symbols-outlined text-emerald-600 text-2xl">picture_as_pdf</span>
              </button> */}

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

              {/* Language Preference Selector */}
              <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                {[
                  { id: 'auto', label: 'Auto' },
                  { id: 'hi', label: 'हिंदी' },
                  { id: 'en', label: 'EN' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedLang(item.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedLang === item.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={`Preferred language: ${item.label}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

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
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center pb-4 px-4 pt-20 overflow-hidden notranslate" translate="no" style={{ zIndex: 9999 }}>
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