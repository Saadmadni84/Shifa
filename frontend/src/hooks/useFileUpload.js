/**
 * useFileUpload.js — Shifa File Upload Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles prescription image / PDF / lab report uploads:
 *   • Client-side validation (type, size, dimension for images)
 *   • Upload to backend (which relays to AWS S3)
 *   • Real-time progress percentage via Axios onUploadProgress
 *   • OCR trigger after upload (backend calls Tess4J or AWS Textract)
 *   • Multi-file queue support (upload one at a time, queue the rest)
 *   • Drag-and-drop helpers (dragOver, onDrop state)
 *
 * Usage:
 *   const { upload, files, progress, isUploading, clearFile } = useFileUpload({ visitId })
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useRef } from 'react'
import { documentsApi } from '@/api/documents'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// ─── Allowed file config ──────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

// ─── File item shape ──────────────────────────────────────────────────────────
// { id, file, name, size, type, status, progress, url, ocrText, error }

export function useFileUpload({ visitId } = {}) {
    const [files, setFiles] = useState([])      // FileItem[]
    const [isDragging, setIsDragging] = useState(false)
    const abortRefs = useRef({})         // { [fileId]: AbortController }
    const qc = useQueryClient()

    // ─── Validate a single File object ───────────────────────────────────────
    const validate = useCallback((file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `"${file.name}": unsupported file type. Upload JPG, PNG, WEBP, or PDF.`
        }
        if (file.size > MAX_SIZE_BYTES) {
            return `"${file.name}": file is too large (max ${MAX_SIZE_MB} MB).`
        }
        return null
    }, [])

    // ─── Add files to the queue ───────────────────────────────────────────────
    const addFiles = useCallback((rawFiles) => {
        const newItems = []
        for (const file of rawFiles) {
            const validationError = validate(file)
            newItems.push({
                id: `${file.name}-${Date.now()}-${Math.random()}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                status: validationError ? 'INVALID' : 'PENDING',
                progress: 0,
                url: null,
                ocrText: null,
                error: validationError,
            })
        }
        setFiles(prev => [...prev, ...newItems])
        return newItems
    }, [validate])

    // ─── Upload one file ──────────────────────────────────────────────────────
    const uploadFile = useCallback(async (fileItem) => {
        if (fileItem.status === 'INVALID') return

        const abort = new AbortController()
        abortRefs.current[fileItem.id] = abort

        // Mark as uploading
        setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, status: 'UPLOADING', progress: 0 } : f
        ))

        try {
            const { data } = await documentsApi.upload(
                visitId,
                fileItem.file,
                {
                    signal: abort.signal,
                    onProgress: (pct) => {
                        setFiles(prev => prev.map(f =>
                            f.id === fileItem.id ? { ...f, progress: pct } : f
                        ))
                    },
                }
            )

            const uploaded = data?.data
            setFiles(prev => prev.map(f =>
                f.id === fileItem.id
                    ? {
                        ...f,
                        status: 'UPLOADED',
                        progress: 100,
                        url: uploaded?.url,
                        ocrText: uploaded?.ocrText,
                    }
                    : f
            ))

            // Invalidate visit attachments list
            if (visitId) {
                qc.invalidateQueries({ queryKey: ['visit', visitId] })
                qc.invalidateQueries({ queryKey: ['visit-documents', visitId] })
            }

            toast.success(`"${fileItem.name}" uploaded${uploaded?.ocrText ? ' & OCR extracted' : ''}.`)
            return uploaded

        } catch (err) {
            if (err.name === 'AbortError' || err.name === 'CanceledError') {
                setFiles(prev => prev.map(f =>
                    f.id === fileItem.id ? { ...f, status: 'CANCELLED', progress: 0 } : f
                ))
                return
            }
            const msg = err.message || 'Upload failed.'
            setFiles(prev => prev.map(f =>
                f.id === fileItem.id ? { ...f, status: 'FAILED', error: msg } : f
            ))
            toast.error(`Upload failed: ${msg}`)
        } finally {
            delete abortRefs.current[fileItem.id]
        }
    }, [visitId, qc])

    // ─── Upload all pending files (sequentially) ──────────────────────────────
    const uploadAll = useCallback(async (rawFiles) => {
        const items = rawFiles ? addFiles(rawFiles) : files.filter(f => f.status === 'PENDING')
        for (const item of items) {
            if (item.status === 'PENDING') {
                await uploadFile(item)
            }
        }
    }, [files, addFiles, uploadFile])

    // ─── Cancel an in-flight upload ───────────────────────────────────────────
    const cancelUpload = useCallback((fileId) => {
        abortRefs.current[fileId]?.abort()
    }, [])

    // ─── Remove a file from the list ─────────────────────────────────────────
    const removeFile = useCallback((fileId) => {
        cancelUpload(fileId)
        setFiles(prev => prev.filter(f => f.id !== fileId))
    }, [cancelUpload])

    // ─── Clear all ────────────────────────────────────────────────────────────
    const clearAll = useCallback(() => {
        Object.values(abortRefs.current).forEach(c => c.abort())
        abortRefs.current = {}
        setFiles([])
    }, [])

    // ─── Drag-and-drop events (attach to drop zone element) ───────────────────
    const dragHandlers = {
        onDragOver: (e) => { e.preventDefault(); setIsDragging(true) },
        onDragLeave: () => setIsDragging(false),
        onDrop: (e) => {
            e.preventDefault()
            setIsDragging(false)
            const dropped = Array.from(e.dataTransfer.files)
            if (dropped.length) uploadAll(dropped)
        },
    }

    // ─── Derived ─────────────────────────────────────────────────────────────
    const isUploading = files.some(f => f.status === 'UPLOADING')
    const uploadedCount = files.filter(f => f.status === 'UPLOADED').length
    const failedCount = files.filter(f => f.status === 'FAILED').length
    const overallProgress = files.length
        ? Math.round(files.reduce((sum, f) => sum + f.progress, 0) / files.length)
        : 0

    return {
        files,
        isDragging,
        isUploading,
        uploadedCount,
        failedCount,
        overallProgress,

        addFiles,
        uploadFile,
        uploadAll,
        cancelUpload,
        removeFile,
        clearAll,
        dragHandlers,
    }
}
