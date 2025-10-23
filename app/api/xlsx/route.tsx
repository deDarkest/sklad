import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export const GET = async (request: Request) => {

    try {
        const { searchParams } = new URL(request.url)
        const fileName = searchParams.get('filename')


        const path = join(process.cwd(), `/public${fileName}`)
        const dataFile = await readFile(path)

        return new Response(dataFile, { headers: { 'content-type': 'application/vnd.ms-excel' }})
    } catch (error: any) {
        console.log(error)
        return new Response(error, { status: 500 })
    }

}