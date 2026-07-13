'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

type ServerResult = { ok: boolean; data?: any; error?: string }

type Props = {
    initialData: any
    initialError?: string
    createEvent: (date: string, targetCount: number) => Promise<ServerResult>
    addPackage: (eventId: string) => Promise<ServerResult>
    loadEvent: (eventId: string) => Promise<ServerResult>
}

function localDateValue() {
    const now = new Date()
    return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
    ].join('-')
}

function formatEventDate(date: string) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(new Date(date + 'T00:00:00'))
}

function formatDuration(duration: number | null | undefined) {
    if (typeof duration !== 'number') return '—'
    if (duration < 1000) return duration + ' мс'
    if (duration < 60000) return (duration / 1000).toFixed(duration < 10000 ? 1 : 0) + ' сек'

    const minutes = Math.floor(duration / 60000)
    const seconds = Math.round((duration % 60000) / 1000)
    return minutes + ' мин ' + seconds + ' сек'
}

function formatPressTime(value?: string | null) {
    if (!value) return 'Замер ещё не начат'
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(value))
}

export default function DateAssemblingComponent({
    initialData,
    initialError,
    createEvent,
    addPackage,
    loadEvent
}: Props) {
    const [data, setData] = useState(initialData)
    const [date, setDate] = useState(localDateValue)
    const [targetCount, setTargetCount] = useState('100')
    const [isAddingEvent, setIsAddingEvent] = useState(!initialData?.selectedEvent)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState(initialError || '')
    const savingRef = useRef(false)

    const activeEvent = data?.selectedEvent
    const completed = activeEvent
        ? activeEvent.completedCount >= activeEvent.targetCount
        : false
    const progress = activeEvent
        ? Math.min(100, Math.round((activeEvent.completedCount / activeEvent.targetCount) * 100))
        : 0
    const latestPress = useMemo(() => {
        if (!data?.presses?.length) return null
        return data.presses[data.presses.length - 1]
    }, [data?.presses])

    const markPackage = useCallback(async () => {
        if (!activeEvent || completed || savingRef.current || isAddingEvent) return

        savingRef.current = true
        setIsSaving(true)
        setError('')
        try {
            const result = await addPackage(activeEvent._id)
            if (!result.ok || !result.data) {
                setError(result.error || 'Не удалось добавить пакет')
                return
            }
            setData(result.data)
        } finally {
            savingRef.current = false
            setIsSaving(false)
        }
    }, [activeEvent, addPackage, completed, isAddingEvent])

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.code !== 'Space' || event.repeat || isAddingEvent) return
            const target = event.target as HTMLElement | null
            if (target?.closest('input, select, textarea, button, a')) return

            event.preventDefault()
            void markPackage()
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [isAddingEvent, markPackage])

    const submitEvent = async (event: FormEvent) => {
        event.preventDefault()
        if (savingRef.current) return

        savingRef.current = true
        setIsSaving(true)
        setError('')
        try {
            const result = await createEvent(date, Number(targetCount))
            if (!result.ok || !result.data) {
                setError(result.error || 'Не удалось создать событие')
                return
            }
            setData(result.data)
            setIsAddingEvent(false)
        } finally {
            savingRef.current = false
            setIsSaving(false)
        }
    }

    const selectEvent = async (eventId: string) => {
        if (savingRef.current) return

        savingRef.current = true
        setIsSaving(true)
        setError('')
        try {
            const result = await loadEvent(eventId)
            if (!result.ok || !result.data) {
                setError(result.error || 'Не удалось загрузить событие')
                return
            }
            setData(result.data)
        } finally {
            savingRef.current = false
            setIsSaving(false)
        }
    }

    return null
}
