/**
 * useNewVisit.js — Shifa New Visit Creation Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates the complete "new visit" flow:
 *
 *   Step 1: Doctor selects / creates patient
 *   Step 2: Doctor enters notes (text or voice dictation)
 *   Step 3: Doctor uploads prescription image (optional)
 *   Step 4: Submit → backend creates visit + triggers AI processing
 *   Step 5: Redirect to visit detail page (polling AI status)
 *
 * Manages:
 *   • Multi-step form state (currentStep, goNext, goBack)
 *   • react-hook-form integration (pass formMethods to each step)
 *   • Visit submission mutation
 *   • Patient quick-add inline (without leaving the flow)
 *   • Auto-save draft to localStorage (5 min timeout)
 *
 * Usage:
 *   const { currentStep, formMethods, isSubmitting, submit, goNext, goBack } = useNewVisit()
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { visitsApi } from '@/api/visits'
import { patientsApi } from '@/api/patients'
import toast from 'react-hot-toast'

// ─── Steps ────────────────────────────────────────────────────────────────────
export const STEPS = {
    PATIENT: 0,
    NOTES: 1,
    UPLOAD: 2,
    REVIEW: 3,
}
export const TOTAL_STEPS = Object.keys(STEPS).length

// ─── Validation schema ────────────────────────────────────────────────────────
const visitSchema = z.object({
    // Step 0 — Patient
    patientId: z.string().uuid('Select or add a patient.').optional(),
    newPatient: z.object({
        firstName: z.string().min(2, 'First name required'),
        lastName: z.string().min(1, 'Last name required'),
        phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
        dob: z.string().optional(),
        language: z.string().default('hi'),
    }).optional(),

    // Step 1 — Notes
    chiefComplaint: z.string().min(5, 'Please describe the chief complaint.'),
    clinicalNotes: z.string().min(10, 'Notes are too short.'),
    diagnosis: z.string().optional(),
    medications: z.string().optional(),   // free-text; AI will structure

    // Step 2 — Upload (handled outside form — see useFileUpload)

    // Step 3 — Review
    language: z.string().default('hi'),
    sendImmediately: z.boolean().default(false),
})

const DRAFT_KEY = 'shifa_new_visit_draft'
const DRAFT_TTL = 5 * 60 * 1_000   // 5 minutes

export function useNewVisit() {
    const navigate = useNavigate()
    const qc = useQueryClient()

    const [currentStep, setCurrentStep] = useState(STEPS.PATIENT)
    const [createdPatientId, setCreatedPatientId] = useState(null)
    const [attachmentIds, setAttachmentIds] = useState([])   // from useFileUpload

    // ─── React Hook Form ──────────────────────────────────────────────────────
    const formMethods = useForm({
        resolver: zodResolver(visitSchema),
        mode: 'onChange',
        defaultValues: loadDraft(),
    })

    const { handleSubmit, watch, getValues, formState: { errors, isValid } } = formMethods

    // ─── Auto-save draft ──────────────────────────────────────────────────────
    useEffect(() => {
        const sub = watch((values) => {
            saveDraft(values)
        })
        return () => sub.unsubscribe()
    }, [watch])

    // ─── Step navigation ──────────────────────────────────────────────────────
    const goNext = useCallback(() => {
        setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS - 1))
    }, [])

    const goBack = useCallback(() => {
        setCurrentStep(s => Math.max(s - 1, 0))
    }, [])

    const goTo = useCallback((step) => {
        setCurrentStep(Math.max(0, Math.min(step, TOTAL_STEPS - 1)))
    }, [])

    // ─── Inline patient creation ──────────────────────────────────────────────
    const { mutateAsync: createInlinePatient, isPending: isCreatingPatient } = useMutation({
        mutationFn: (data) => patientsApi.create(data),
        onSuccess: (res) => {
            const id = res.data?.data?.id
            setCreatedPatientId(id)
            formMethods.setValue('patientId', id)
            qc.invalidateQueries({ queryKey: ['patients'] })
            toast.success('Patient added!')
            goNext()
        },
        onError: (err) => toast.error(`Could not add patient: ${err.message}`),
    })

    // ─── Submit visit ─────────────────────────────────────────────────────────
    const { mutateAsync: submitVisit, isPending: isSubmitting } = useMutation({
        mutationFn: async (formData) => {
            const payload = {
                patientId: formData.patientId ?? createdPatientId,
                chiefComplaint: formData.chiefComplaint,
                clinicalNotes: formData.clinicalNotes,
                diagnosis: formData.diagnosis,
                medications: formData.medications,
                language: formData.language,
                attachmentIds,
            }
            return visitsApi.createVisit(payload)
        },
        onSuccess: (res) => {
            const visitId = res.data?.data?.id
            clearDraft()
            qc.invalidateQueries({ queryKey: ['recent-visits'] })
            qc.invalidateQueries({ queryKey: ['doctor-stats'] })
            toast.success('Visit created! AI is processing…')
            navigate(`/doctor/visits/${visitId}`)
        },
        onError: (err) => toast.error(`Visit creation failed: ${err.message}`),
    })

    const onSubmit = handleSubmit(submitVisit)

    return {
        // Form
        formMethods,
        errors,
        isValid,

        // Step control
        currentStep,
        totalSteps: TOTAL_STEPS,
        isFirstStep: currentStep === 0,
        isLastStep: currentStep === TOTAL_STEPS - 1,
        goNext,
        goBack,
        goTo,

        // Patient
        createdPatientId,
        createInlinePatient,
        isCreatingPatient,

        // Attachments
        attachmentIds,
        setAttachmentIds,

        // Submit
        isSubmitting,
        onSubmit,
    }
}

// ─── Draft helpers ────────────────────────────────────────────────────────────
function saveDraft(values) {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
            values,
            savedAt: Date.now(),
        }))
    } catch { /* storage full — ignore */ }
}

function loadDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY)
        if (!raw) return {}
        const parsed = JSON.parse(raw)
        if (Date.now() - parsed.savedAt > DRAFT_TTL) {
            localStorage.removeItem(DRAFT_KEY)
            return {}
        }
        return parsed.values ?? {}
    } catch {
        return {}
    }
}

function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
}
