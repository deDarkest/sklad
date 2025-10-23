import Row from '@models/rows';
import connectToDB from "@utils/database"

export const POST = async (req: any) => {
    await connectToDB()
    let { row } = await req.json()
    //console.log('POST ROW', row)
    try {

        row = {...row, structure: {...row.structure, 'Время сборки': new Date(row.structure['Время сборки'])}}

        const result = await Row.updateOne({ _id: row._id }, { $set: { ...row } }, {upsert: true})
        //console.log(result)

        return new Response(JSON.stringify({ message: 'SUCCESS' }), { status: 201 })
    } catch (error) {
        return new Response('Failed to update Row' + error, { status: 500 })
    }
}