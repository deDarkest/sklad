import { createDateAssemblingEvent, getDateAssemblingData, markAssembledPackage } from '@utils/dateassembling'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

function errorResponse(error: unknown) {
    const message = error instanceof Error ? error.message : 'Не удалось выполнить операцию'
    const isClientError = [
        'Укажите корректную дату',
        'Количество должно быть целым числом от 1 до 1 000 000',
        'Событие на эту дату уже существует',
        'Некорректное событие сборки',
        'Событие сборки не найдено',
        'План по этому событию уже выполнен'
    ].includes(message)

    return Response.json({ error: message }, { status: isClientError ? 400 : 500 })
}

export async function GET(req: NextRequest) {
    try {
        const data = await getDateAssemblingData(req.nextUrl.searchParams.get('eventId'))
        return Response.json(data)
    } catch (error) {
        return errorResponse(error)
    }
}

export async function POST(req: NextRequest) {
    try {
        const { date, targetCount } = await req.json()
        const data = await createDateAssemblingEvent(date, targetCount)
        return Response.json(data, { status: 201 })
    } catch (error) {
        return errorResponse(error)
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { eventId } = await req.json()
        const data = await markAssembledPackage(eventId)
        return Response.json(data)
    } catch (error) {
        return errorResponse(error)
    }
}
