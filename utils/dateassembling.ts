import AssemblingPress from '@models/assemblingpress'
import DateAssembling from '@models/dateassembling'
import connectToDB from '@utils/database'
import mongoose from 'mongoose'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function serialize<T>(value: T): T {
    return JSON.parse(JSON.stringify(value))
}

function validateDate(date: string) {
    if (!DATE_PATTERN.test(date)) return false

    const [year, month, day] = date.split('-').map(Number)
    const parsed = new Date(Date.UTC(year, month - 1, day))

    return parsed.getUTCFullYear() === year
        && parsed.getUTCMonth() === month - 1
        && parsed.getUTCDate() === day
}

export async function getDateAssemblingData(eventId?: string | null) {
    await connectToDB()

    const events = serialize(await DateAssembling.find({}).sort({ date: -1, createdAt: -1 }).lean()) as any[]
    const requestedEvent = eventId && mongoose.isValidObjectId(eventId)
        ? events.find((event) => event._id.toString() === eventId)
        : null
    const selectedEvent = requestedEvent
        || events.find((event) => event.completedCount < event.targetCount)
        || events[0]
        || null

    if (!selectedEvent) {
        return {
            events,
            selectedEvent: null,
            presses: [],
            stats: {
                averageDurationMs: null,
                minDurationMs: null,
                maxDurationMs: null,
                trackedPackages: 0
            }
        }
    }

    const presses = serialize(
        await AssemblingPress.find({ eventId: selectedEvent._id }).sort({ sequence: 1 }).lean()
    ) as any[]
    const durations = presses
        .map((press) => press.durationMs)
        .filter((duration): duration is number => typeof duration === 'number' && duration >= 0)

    return {
        events,
        selectedEvent,
        presses,
        stats: {
            averageDurationMs: durations.length
                ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
                : null,
            minDurationMs: durations.length ? Math.min(...durations) : null,
            maxDurationMs: durations.length ? Math.max(...durations) : null,
            trackedPackages: durations.length
        }
    }
}

export async function createDateAssemblingEvent(dateValue: unknown, targetValue: unknown) {
    await connectToDB()

    const date = typeof dateValue === 'string' ? dateValue.trim() : ''
    const targetCount = Number(targetValue)

    if (!validateDate(date)) {
        throw new Error('Укажите корректную дату')
    }

    if (!Number.isInteger(targetCount) || targetCount < 1 || targetCount > 1000000) {
        throw new Error('Количество должно быть целым числом от 1 до 1 000 000')
    }

    try {
        const event = await DateAssembling.create({ date, targetCount })
        return getDateAssemblingData(event._id.toString())
    } catch (error: any) {
        if (error?.code === 11000) {
            throw new Error('Событие на эту дату уже существует')
        }
        throw error
    }
}

export async function markAssembledPackage(eventId: unknown) {
    await connectToDB()

    if (typeof eventId !== 'string' || !mongoose.isValidObjectId(eventId)) {
        throw new Error('Некорректное событие сборки')
    }

    const pressedAt = new Date()
    const eventBeforePress = await DateAssembling.findOneAndUpdate(
        {
            _id: eventId,
            $expr: { $lt: ['$completedCount', '$targetCount'] }
        },
        {
            $inc: { completedCount: 1 },
            $set: { lastPressedAt: pressedAt }
        },
        { new: false }
    ).lean() as any

    if (!eventBeforePress) {
        const event = await DateAssembling.findById(eventId).lean() as any
        if (!event) throw new Error('Событие сборки не найдено')
        throw new Error('План по этому событию уже выполнен')
    }

    const sequence = eventBeforePress.completedCount + 1
    const previousPressedAt = eventBeforePress.lastPressedAt
        ? new Date(eventBeforePress.lastPressedAt)
        : null
    const durationMs = previousPressedAt
        ? Math.max(0, pressedAt.getTime() - previousPressedAt.getTime())
        : null

    await AssemblingPress.create({
        eventId,
        sequence,
        pressedAt,
        durationMs
    })

    const eventUpdates: Record<string, Date> = {}
    if (sequence === 1) eventUpdates.startedAt = pressedAt
    if (sequence === eventBeforePress.targetCount) eventUpdates.completedAt = pressedAt

    if (Object.keys(eventUpdates).length) {
        await DateAssembling.updateOne({ _id: eventId }, { $set: eventUpdates })
    }

    return getDateAssemblingData(eventId)
}
