import Row from '@models/rows';
import connectToDB from "@utils/database"

export const POST = async (req: any) => {
    await connectToDB()
    let { row2 } = await req.json()
    //console.log('POST ROW', row)
    try {

        row2 = {...row2, structure: {...row2.structure, 'Время сборки': new Date(row2.structure['Время сборки'])}}
        delete row2._id
        const result = await Row.create({ ...row2 })
        //console.log(result)

        return new Response(JSON.stringify({ message: 'SUCCESS' }), { status: 201 })
    } catch (error) {
        return new Response('Failed to update Row' + error, { status: 500 })
    }
}