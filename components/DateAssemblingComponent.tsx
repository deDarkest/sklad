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

    return (
        <main className="min-h-[100svh] bg-slate-950 p-4 text-white sm:p-6">
            <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-5xl flex-col">
                <PageHeader
                    data={data}
                    activeEvent={activeEvent}
                    isSaving={isSaving}
                    selectEvent={selectEvent}
                    openForm={() => {
                        setError('')
                        setIsAddingEvent(true)
                    }}
                />
                {error && !isAddingEvent && (
                    <div role="alert" className="mx-auto mt-4 w-full max-w-xl rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">
                        {error}
                    </div>
                )}
                <Counter
                    activeEvent={activeEvent}
                    completed={completed}
                    isSaving={isSaving}
                    progress={progress}
                    latestPress={latestPress}
                    markPackage={markPackage}
                />
                <Statistics activeEvent={activeEvent} stats={data?.stats} />
            </div>
            {isAddingEvent && (
                <EventForm
                    activeEvent={activeEvent}
                    date={date}
                    targetCount={targetCount}
                    isSaving={isSaving}
                    error={error}
                    setDate={setDate}
                    setTargetCount={setTargetCount}
                    submitEvent={submitEvent}
                    close={() => {
                        setError('')
                        setIsAddingEvent(false)
                    }}
                />
            )}
        </main>
    )
}

function PageHeader({ data, activeEvent, isSaving, selectEvent, openForm }: any) {
    return (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">Vcentre Склад</p>
                <h1 className="mt-1 text-xl font-bold sm:text-2xl">Сборка пакетов</h1>
            </div>
            <div className="flex gap-2">
                {data?.events?.length > 0 && (
                    <select
                        aria-label="Событие сборки"
                        className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm sm:min-w-56"
                        value={activeEvent?._id || ''}
                        disabled={isSaving}
                        onChange={(event) => void selectEvent(event.target.value)}
                    >
                        {data.events.map((item: any) => (
                            <option key={item._id} value={item._id}>
                                {formatEventDate(item.date)} · {item.completedCount}/{item.targetCount}
                            </option>
                        ))}
                    </select>
                )}
                <button
                    type="button"
                    className="shrink-0 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"
                    disabled={isSaving}
                    onClick={openForm}
                >
                    + Событие
                </button>
            </div>
        </header>
    )
}

function Counter({ activeEvent, completed, isSaving, progress, latestPress, markPackage }: any) {
    if (!activeEvent) {
        return (
            <section className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="rounded-full bg-slate-900 p-6 text-4xl">📦</div>
                <h2 className="mt-5 text-2xl font-bold">Событий пока нет</h2>
                <p className="mt-2 text-sm text-slate-400">Создайте событие и укажите план сборки.</p>
            </section>
        )
    }

    return (
        <section className="flex flex-1 flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-slate-400">План на {formatEventDate(activeEvent.date)}</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                {completed ? 'План выполнен' : 'Отмечайте каждый готовый пакет'}
            </h2>
            <button
                type="button"
                aria-label={completed ? 'План выполнен' : 'Добавить собранный пакет'}
                disabled={completed || isSaving}
                onClick={() => void markPackage()}
                className={
                    'my-6 flex aspect-square w-[min(70vw,20rem)] touch-manipulation select-none flex-col items-center justify-center rounded-full border-[10px] shadow-2xl transition active:scale-95 sm:my-8 ' +
                    (completed
                        ? 'border-emerald-400/40 bg-emerald-500/20'
                        : 'border-emerald-400 bg-emerald-500 text-slate-950') +
                    (isSaving ? ' scale-95 opacity-80' : '')
                }
            >
                <span className="text-6xl font-black tabular-nums sm:text-7xl">{activeEvent.completedCount}</span>
                <span className="mt-1 text-lg font-bold opacity-80">из {activeEvent.targetCount}</span>
                <span className="mt-4 text-xs font-bold uppercase tracking-[0.2em]">
                    {completed ? 'Готово' : isSaving ? 'Сохраняю' : 'Нажать'}
                </span>
            </button>
            <div className="w-full max-w-xl">
                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-400 transition-[width]" style={{ width: progress + '%' }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>{progress}%</span>
                    <span>Осталось: {Math.max(0, activeEvent.targetCount - activeEvent.completedCount)}</span>
                </div>
            </div>
            {!completed && (
                <p className="mt-5 hidden rounded-full border border-slate-700 bg-slate-900 px-5 py-2 text-sm text-slate-300 sm:block">
                    Нажмите <kbd className="mx-1 rounded bg-slate-700 px-2 py-0.5 font-mono">Пробел</kbd>
                </p>
            )}
            <p className="mt-4 text-xs text-slate-500">Последняя отметка: {formatPressTime(latestPress?.pressedAt)}</p>
        </section>
    )
}

function Statistics({ activeEvent, stats }: any) {
    if (!activeEvent) return null

    const values = [
        ['Минимум', stats?.minDurationMs],
        ['Среднее', stats?.averageDurationMs],
        ['Максимум', stats?.maxDurationMs]
    ]

    return (
        <section aria-label="Статистика скорости" className="grid grid-cols-3 gap-2 sm:gap-4">
            {values.map(([label, value]) => (
                <div key={label as string} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-center sm:p-5">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 sm:text-xs">{label}</p>
                    <p className="mt-1 text-sm font-bold tabular-nums sm:text-xl">
                        {formatDuration(value as number | null)}
                    </p>
                </div>
            ))}
        </section>
    )
}

function EventForm({
    activeEvent,
    date,
    targetCount,
    isSaving,
    error,
    setDate,
    setTargetCount,
    submitEvent,
    close
}: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <form onSubmit={submitEvent} className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8">
                <h2 className="text-center text-2xl font-bold">Новое событие</h2>
                <p className="mt-2 text-center text-sm text-slate-400">Задайте план сборки на выбранную дату</p>

                <label className="mt-6 block text-sm font-medium text-slate-300">
                    Дата
                    <input
                        required
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-emerald-400"
                    />
                </label>

                <label className="mt-4 block text-sm font-medium text-slate-300">
                    Сколько пакетов собрать
                    <input
                        required
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="1000000"
                        step="1"
                        value={targetCount}
                        onChange={(event) => setTargetCount(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-emerald-400"
                    />
                </label>

                <div className="mt-6 flex gap-3">
                    {activeEvent && (
                        <button
                            type="button"
                            className="flex-1 rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300"
                            disabled={isSaving}
                            onClick={close}
                        >
                            Отмена
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 disabled:opacity-50"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Создаю…' : 'Создать'}
                    </button>
                </div>

                {error && <p role="alert" className="mt-4 text-center text-sm text-red-300">{error}</p>}
            </form>
        </div>
    )
}
