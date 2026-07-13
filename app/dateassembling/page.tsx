'use server'

import DateAssemblingComponent from '@components/DateAssemblingComponent'
import {
    createDateAssemblingEvent,
    getDateAssemblingData,
    markAssembledPackage
} from '@utils/dateassembling'

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Не удалось выполнить операцию'
}

async function createEvent(date: string, targetCount: number) {
    'use server'
    try {
        return { ok: true, data: await createDateAssemblingEvent(date, targetCount) }
    } catch (error) {
        return { ok: false, error: getErrorMessage(error) }
    }
}

async function addPackage(eventId: string) {
    'use server'
    try {
        return { ok: true, data: await markAssembledPackage(eventId) }
    } catch (error) {
        return { ok: false, error: getErrorMessage(error) }
    }
}

async function loadEvent(eventId: string) {
    'use server'
    try {
        return { ok: true, data: await getDateAssemblingData(eventId) }
    } catch (error) {
        return { ok: false, error: getErrorMessage(error) }
    }
}

export default async function Page() {
    try {
        const initialData = await getDateAssemblingData()

        return (
            <DateAssemblingComponent
                initialData={initialData}
                createEvent={createEvent}
                addPackage={addPackage}
                loadEvent={loadEvent}
            />
        )
    } catch (error) {
        return (
            <DateAssemblingComponent
                initialData={null}
                initialError={getErrorMessage(error)}
                createEvent={createEvent}
                addPackage={addPackage}
                loadEvent={loadEvent}
            />
        )
    }
}
