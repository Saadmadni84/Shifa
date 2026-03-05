import { useState } from 'react'
import { FileText, Image, Download, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { getDocumentDownloadUrl } from '@/api'

const EXT_ICON = {
  pdf: <FileText size={18} className="text-red-500" />,
  jpg: <Image size={18} className="text-blue-500" />,
  jpeg: <Image size={18} className="text-blue-500" />,
  png: <Image size={18} className="text-blue-500" />,
}

export default function AttachmentCard({ document, onAskAbout }) {
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const ext = document.fileName?.split('.').pop()?.toLowerCase() ?? 'pdf'
  const icon = EXT_ICON[ext] ?? <FileText size={18} className="text-gray-500" />

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { url } = await getDocumentDownloadUrl(document.id)
      window.open(url, '_blank')
    } catch {
      // silent
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-200">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{document.fileName}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {document.documentType ?? 'Document'}
            {document.fileSizeBytes && ` · ${(document.fileSizeBytes / 1024).toFixed(0)} KB`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleDownload} disabled={downloading} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          </button>
        </div>
      </div>

      {document.aiAnalysis && (
        <>
          <div className="border-t border-gray-100 px-4 py-2.5">
            <button type="button" onClick={() => setShowAnalysis((o) => !o)} className="w-full flex items-center justify-between text-left group">
              <div className="flex items-center gap-2">
                <span className="text-sm">🤖</span>
                <p className="text-xs font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">AI Analysis</p>
                {document.ocrStatus === 'PROCESSING' && <Loader2 size={12} className="text-purple-500 animate-spin" />}
              </div>
              {showAnalysis ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
          </div>
          {showAnalysis && (
            <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/30">
              <p className="text-xs text-gray-600 leading-relaxed pt-3 whitespace-pre-wrap">{document.aiAnalysis}</p>
              {onAskAbout && (
                <button onClick={() => onAskAbout(`document: ${document.fileName}`)} className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Ask about this document →
                </button>
              )}
            </div>
          )}
        </>
      )}

      {document.ocrStatus === 'PROCESSING' && !document.aiAnalysis && (
        <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
          <Loader2 size={13} className="text-purple-500 animate-spin shrink-0" />
          <p className="text-xs text-gray-500">Analysing document…</p>
        </div>
      )}
    </div>
  )
}
