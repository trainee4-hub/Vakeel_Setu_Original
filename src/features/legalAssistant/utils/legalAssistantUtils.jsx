import React from "react";

export const LEGAL_THINKING_STEPS = [
  { icon: 'gavel', text: 'Analyzing legal query & factual chronology...' },
  { icon: 'balance', text: 'Reviewing applicable BNS / IPC & statutory provisions...' },
  { icon: 'menu_book', text: 'Examining procedural requirements & legal precedents...' },
  { icon: 'edit_document', text: 'Structuring advocate-grade legal response...' },
  { icon: 'verified_user', text: 'Verifying statutory compliance & final output...' },
];

export const cleanAnswerText = (text) => {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text;
  // 1. Remove divider blocks followed by General Legal Knowledge / disclaimer
  cleaned = cleaned.replace(/\n*---\s*\n*\*{0,2}General Legal Knowledge\*{0,2}[^\n]*[\s\S]*?(?=\n*---\s*|\s*$)/gi, '');
  cleaned = cleaned.replace(/\n*---\s*\n*This answer is based on general legal knowledge[\s\S]*?(?=\n*---\s*|\s*$)/gi, '');
  cleaned = cleaned.replace(/\n*---\s*\n*Yeh jawab general legal knowledge[\s\S]*?(?=\n*---\s*|\s*$)/gi, '');

  // 2. Remove any inline/standalone GK / verification disclaimers
  cleaned = cleaned.replace(/\*{0,2}General Legal Knowledge\*{0,2}\s*(?:\([^)]*\))?/gi, '');
  cleaned = cleaned.replace(/This answer is based on general legal knowledge and has NOT been verified against[^\n]*\n?/gi, '');
  cleaned = cleaned.replace(/Yeh jawab general legal knowledge par based hai aur isse[^\n]*\n?/gi, '');
  cleaned = cleaned.replace(/It may be incomplete, outdated, or not applicable to your specific facts\. Please verify independently or consult a qualified advocate before relying on it\.\s*/gi, '');
  cleaned = cleaned.replace(/Yeh adhura, purana ya aapke case par laagu na ho sake, isliye kisi vakil se salah lein\.\s*/gi, '');
  cleaned = cleaned.replace(/This answer is based on general legal knowledge[^\n]*\n?/gi, '');
  cleaned = cleaned.replace(/\(not from the verified Knowledge Base\)/gi, '');
  cleaned = cleaned.replace(/\(verified Knowledge Base se nahi\)/gi, '');

  // 3. Remove leftover separator lines at the end or double dividers
  cleaned = cleaned.replace(/(?:\n\s*---\s*)+$/g, '');
  cleaned = cleaned.replace(/(?:\n\s*---\s*){2,}/g, '\n\n---\n\n');

  return cleaned.trim();
};

export const renderInlineMarkdown = (text) => {
  if (!text || typeof text !== 'string') return '';
  const tokens = text.split(/(\*\*[^*]+?\*\*)/g);
  return tokens.map((tok, idx) => {
    if (tok.startsWith('**') && tok.endsWith('**') && tok.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    return tok;
  });
};

export const detectDocumentTitle = (text) => {
  if (!text) return 'Legal_Document';
  const lower = text.toLowerCase();
  if (lower.includes('पुलिस शिकायत') || lower.includes('police complaint') || lower.includes('प्राथमिकी') || lower.includes('fir')) {
    return 'Police_Complaint_Draft';
  }
  if (lower.includes('विधिक नोटिस') || lower.includes('legal notice')) {
    return 'Legal_Notice_Draft';
  }
  if (lower.includes('किरायानामा') || lower.includes('rent agreement') || lower.includes('lease agreement')) {
    return 'Rent_Agreement_Draft';
  }
  if (lower.includes('शपथ पत्र') || lower.includes('affidavit')) {
    return 'Affidavit_Draft';
  }
  if (lower.includes('उपभोक्ता शिकायत') || lower.includes('consumer complaint')) {
    return 'Consumer_Complaint_Draft';
  }
  if (lower.includes('आरटीआई') || lower.includes('rti application')) {
    return 'RTI_Application_Draft';
  }
  if (lower.includes('चेक बाउंस') || lower.includes('cheque bounce')) {
    return 'Cheque_Bounce_Notice';
  }
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const cleanLine = line.replace(/^[#*\s]+|[#*\s]+$/g, '');
    if (cleanLine.length > 3 && cleanLine.length < 50 && !cleanLine.startsWith('यह') && !cleanLine.startsWith('Here')) {
      return cleanLine.replace(/[^\w\u0900-\u097F\s-]/g, '').trim().replace(/\s+/g, '_') || 'Legal_Document';
    }
  }
  return 'Legal_Draft';
};

export const isLegalDraft = (text, draftObj = null) => {
  if (draftObj) {
    if (draftObj.draft_id) return true;
    if (draftObj.full_text && draftObj.full_text.length > 50) return true;
    if (['preview', 'approved', 'locked', 'exported', 'preview_ready'].includes(draftObj.stage)) return true;
  }

  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 120) return false;

  const hasAddress = /\*\*(प्रति|सेवा में|to)\b/i.test(text) || /^(प्रति|सेवा में|to,)/im.test(text);
  const hasSubject = /\*\*(विषय|subject)\b/i.test(text) || /^(विषय:|subject:)/im.test(text);
  const hasPrayer = /\*\*(प्रार्थना|relief|prayer)\b/i.test(text) || /(अतः श्रीमान|अतः निवेदन|prayer:)/i.test(text);
  const hasNoticeMarker = /(legal notice|विधिक नोटिस|notice under section)/i.test(text) && hasSubject;
  const hasAgreementMarker = /(rent agreement|lease agreement|किराया अनुबंध|किरायानामा)/i.test(text) && /(witnesseth|शर्तें|terms and conditions)/i.test(text);
  const hasDraftIntro = /(मसौदा|draft|प्रारूप)[\s\S]{1,60}:/i.test(text) && (hasSubject || hasAddress || hasPrayer);

  if ((hasAddress && hasSubject) || (hasSubject && hasPrayer) || hasDraftIntro || hasNoticeMarker || hasAgreementMarker) {
    return true;
  }

  return false;
};

export const QUICK_PROMPTS = [
  {
    icon: 'local_police',
    title: 'Police Complaint / FIR',
    desc: 'थाना प्रभारी को औपचारिक शिकायत मसौदा तैयार करें',
    prompt: 'थाना प्रभारी को चोरी की घटना के संबंध में पुलिस शिकायत (FIR) का औपचारिक मसौदा तैयार कीजिए।'
  },
  {
    icon: 'mark_email_unread',
    title: 'Legal Notice (विधिक नोटिस)',
    desc: 'किरायेदार को 15 दिन में मकान खाली करने का नोटिस',
    prompt: 'किरायेदार को बकाया किराया चुकाने एवं 15 दिन में मकान खाली करने का विधिक नोटिस (Legal Notice) तैयार करें।'
  },
  {
    icon: 'payments',
    title: 'Cheque Bounce Notice',
    desc: 'Section 138 NI Act के अंतर्गत चेक बाउंस का विधिक नोटिस',
    prompt: 'Negotiable Instruments Act की धारा 138 के तहत चेक अनादरण (Cheque Bounce) का विधिक नोटिस तैयार करें।'
  },
  {
    icon: 'home_work',
    title: 'Rent Agreement Draft',
    desc: 'मकान मालिक एवं किरायेदार के बीच 11 महीने का किरायानामा',
    prompt: 'मकान मालिक और किरायेदार के बीच 11 माह का मानक किराया अनुबंध (Rent Agreement) ड्राफ्ट करें।'
  },
  {
    icon: 'shopping_bag',
    title: 'Consumer Forum Complaint',
    desc: 'दोषपूर्ण उत्पाद पर उपभोक्ता आयोग में शिकायत',
    prompt: 'उपभोक्ता संरक्षण अधिनियम 2019 के अंतर्गत दोषपूर्ण उत्पाद हेतु उपभोक्ता आयोग में शिकायत का प्रारूप बनाएं।'
  },
  {
    icon: 'gavel',
    title: 'BNS vs IPC Query',
    desc: 'भारतीय न्याय संहिता और आईपीसी की मुख्य धाराओं की तुलना',
    prompt: 'IPC धारा 420 और भारतीय न्याय संहिता (BNS) की संबंधित धारा 318 के मुख्य प्रावधानों व अंतर को समझाइए।'
  }
];

export const toAsciiDigits = (value = '') => {
  const map = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };
  return String(value).replace(/[०-९٠-٩۰-۹]/g, (d) => map[d] || d);
};

export const normalizePdfOutputText = (value = '') => {
  let text = toAsciiDigits(value);
  text = text.replace(/(दिनांक\s*[:：]\s*)([^\n]+)/g, (_, prefix, rest) => {
    const part = toAsciiDigits(rest);
    const m = part.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
    if (!m) return `${prefix}${part}`;
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const yy = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${prefix}${dd}-${mm}-${yy}`;
  });
  return text;
};

export const detectRequestedLanguage = (prompt = '') => {
  const p = String(prompt || '');
  const pl = p.toLowerCase();
  if (/\bpunjabi\b/.test(pl) || /[\u0A00-\u0A7F]/.test(p)) return 'punjabi';
  if (/\bhindi\b|\u0939\u093f\u0902\u0926\u0940|\u0939\u093f\u0928\u094d\u0926\u0940/i.test(p) || /[\u0900-\u097F]/.test(p)) return 'hindi';
  if (/\benglish\b/.test(pl)) return 'english';
  return 'auto';
};

export const isHindiLetterRequest = (prompt = '') => {
  const hasLetterIntent = /\b(letter|complaint|application|notice|draft)\b|\u092a\u0924\u094d\u0930|\u0936\u093f\u0915\u093e\u092f\u0924|\u0906\u0935\u0947\u0926\u0928|\u0928\u094b\u091f\u093f\u0938/i.test(prompt);
  return detectRequestedLanguage(prompt) === 'hindi' && hasLetterIntent;
};

export const enforceHindiPleasantTerms = (value = '') => {
  let text = String(value || '').trim();
  if (!text) return text;

  const hasSevaMe = /\u0938\u0947\u0935\u093e\s*\u092e\u0947\u0902/.test(text);
  const hasShriman = /\u0936\u094d\u0930\u0940\u092e\u093e\u0928/.test(text);
  const hasMahoday = /\u092e\u0939\u094b\u0926\u092f/.test(text);
  const hasClosing = /\u0906\u092a\u0915\u093e\s+\u0906\u092d\u093e\u0930\u0940|\u092d\u0935\u0926\u0940\u092f/.test(text);

  const lines = text.split('\n');

  if (!hasSevaMe) lines.unshift('\u0938\u0947\u0935\u093e \u092e\u0947\u0902,');
  if (!hasShriman) {
    const sevaIdx = lines.findIndex((l) => /\u0938\u0947\u0935\u093e\s*\u092e\u0947\u0902/.test(l));
    if (sevaIdx >= 0) lines.splice(sevaIdx + 1, 0, '\u0936\u094d\u0930\u0940\u092e\u093e\u0928 \u0925\u093e\u0928\u093e \u092a\u094d\u0930\u092d\u093e\u0930\u0940,');
    else lines.unshift('\u0936\u094d\u0930\u0940\u092e\u093e\u0928 \u0925\u093e\u0928\u093e \u092a\u094d\u0930\u092d\u093e\u0930\u0940,');
  }

  text = lines.join('\n').trim();

  if (!hasMahoday) {
    const subjectMatch = text.match(/(^|\n)\s*\u0935\u093f\u0937\u092f\s*[:：].*$/m);
    if (subjectMatch && subjectMatch.index != null) {
      const insertAt = subjectMatch.index + subjectMatch[0].length;
      text = `${text.slice(0, insertAt)}\n\n\u092e\u0939\u094b\u0926\u092f,\n${text.slice(insertAt).trimStart()}`;
    } else {
      text = `${text}\n\n\u092e\u0939\u094b\u0926\u092f,`;
    }
  }

  if (!hasClosing) text = `${text}\n\n\u0906\u092a\u0915\u093e \u0906\u092d\u093e\u0930\u0940,`;
  return text;
};

export const stripHindiPleasantTerms = (value = '') => {
  let text = String(value || '');
  text = text.replace(/^\s*\u0938\u0947\u0935\u093e \u092e\u0947\u0902,\s*\n?/gm, '');
  text = text.replace(/^\s*\u0936\u094d\u0930\u0940\u092e\u093e\u0928 \u0925\u093e\u0928\u093e \u092a\u094d\u0930\u092d\u093e\u0930\u0940,\s*\n?/gm, '');
  text = text.replace(/^\s*\u092e\u0939\u094b\u0926\u092f,?\s*\n?/gm, '');
  text = text.replace(/^\s*(\u0906\u092a\u0915\u093e \u0906\u092d\u093e\u0930\u0940,?|\u092d\u0935\u0926\u0940\u092f,?)\s*$/gm, '');
  return text.trim();
};

export const buildPdfQuestion = (prompt, attachedFileName = '', attachedText = '') => {
  const trimmed = (prompt || '').trim();
  const requestedLanguage = detectRequestedLanguage(trimmed);
  const isHindi = requestedLanguage === 'hindi';
  const isPunjabi = requestedLanguage === 'punjabi';
  const letterIntent = /\b(letter|complaint|application|notice|draft)\b|\u092a\u0924\u094d\u0930|\u0936\u093f\u0915\u093e\u092f\u0924|\u0906\u0935\u0947\u0926\u0928|\u0A28\u0A4B\u0A1F\u0A3F\u0A38/i.test(trimmed);
  let question = trimmed;

  if (attachedText) {
    question += `\n\n[Document: ${attachedFileName}]\n${attachedText.slice(0, 8000)}`;
  }

  if (isHindi && letterIntent) {
    question += '\n\n[HINDI LETTER STYLE: Use polite and formal Hindi letter tone. Use appropriate words where relevant: "\u0938\u0947\u0935\u093e \u092e\u0947\u0902," "\u0936\u094d\u0930\u0940\u092e\u093e\u0928" "\u092e\u0939\u094b\u0926\u092f," and closing like "\u0906\u092a\u0915\u093e \u0906\u092d\u093e\u0930\u0940"/"\u092d\u0935\u0926\u0940\u092f". Keep it natural, not repetitive. Date must be in DD-MM-YYYY using English digits 0-9 only.]';
  } else if (isPunjabi && letterIntent) {
    question += '\n\n[PUNJABI LETTER STYLE: Write fully in Punjabi (Gurmukhi script), polite formal tone. Do NOT use Hindi salutations like "\u0938\u0947\u0935\u093e \u092e\u0947\u0902", "\u0936\u094d\u0930\u0940\u092e\u093e\u0928", "\u092e\u0939\u094b\u0926\u092f", "\u0906\u092a\u0915\u093e \u0906\u092d\u093e\u0930\u0940". Date must be in DD-MM-YYYY using English digits 0-9 only.]';
  } else {
    question += '\n\n[DATE FORMAT: Whenever you include a date, use DD-MM-YYYY with English digits 0-9 only.]';
  }

  return question;
};
