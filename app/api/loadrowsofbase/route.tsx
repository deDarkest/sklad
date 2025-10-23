import Excel from '@models/excel';
import Row from '@models/rows';
import connectToDB from '@utils/database'
import { readFile } from 'fs/promises';
import { join } from 'path';
export const dynamic = 'force-dynamic';
import * as XLSX from 'xlsx'
import { ObjectId } from 'mongodb'

export const GET = async (request: Request) => {

    try {
        await connectToDB()
        const { searchParams } = new URL(request.url)
        const excelId = searchParams.get('excelId') as any
        console.log({excelId})

        let wsRead = await Row.find({excelId: new ObjectId(excelId)})
        wsRead = JSON.parse(JSON.stringify(wsRead))

        return new Response(JSON.stringify(wsRead), { status: 200 })
    } catch (error: any) {
        console.log(error)
        return new Response(error, { status: 500 })
    }

}