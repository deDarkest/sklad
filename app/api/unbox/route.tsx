import connectToDB from '@utils/database'
export const dynamic = 'force-dynamic';
import { ObjectId } from 'mongodb'
import Row from '@models/rows';
import Excel from '@models/excel';
import { NextRequest } from 'next/server';

export const GET = async (req: NextRequest) => {

    try {
        await connectToDB()
        const stringForQR = JSON.parse(req.nextUrl.searchParams.get('stringForQR') as string)

        console.log({stringForQRAPI: stringForQR})

        let excel = await Excel.findOne({_id: new ObjectId(stringForQR.excelId)})

        let rows = await Row.find({excelId: new ObjectId(stringForQR.excelId), 'structure.Номер заказа': stringForQR.orderNum, 'structure.№ коробки': stringForQR.numBox})
        rows = JSON.parse(JSON.stringify(rows))
        rows = rows.map((row: any) => {
            return {'Наименование': row.structure['Наименование В Центре'], 'Кол-во': row.structure['Кол-во']}
        }) as any

        let wsRead = await Row.find({excelId: new ObjectId(stringForQR.excelId), 'structure.Номер заказа': stringForQR.orderNum, $and: [{"structure.№ коробки":{$exists: true}}, {"structure.№ коробки":{$ne: ""}}]}).sort({'structure.№ коробки': -1}).limit(1)
        wsRead = JSON.parse(JSON.stringify(wsRead))
        //console.log({ wsRead })
        
        const countBoxes = wsRead[0].structure['№ коробки']

        let row = await Row.findOne({excelId: new ObjectId(stringForQR.excelId), 'structure.Номер заказа': stringForQR.orderNum, 'structure.№ коробки': stringForQR.numBox})
        row = JSON.parse(JSON.stringify(row))

        const order = {
            date: excel.date,
            for: row.structure['Организация'] && row.structure['Организация'] !== ''
                ? row.structure['Организация'].split(' ООО')[0]
                : excel.for == 'АВРОРА 25-26'
                ? 'МЕБЕЛЬ'
                : excel.for == 'Импульс Мебель'
                ? 'Импульс'
                : excel.for,
            orderNum: stringForQR.orderNum,
            numBox: `${stringForQR.numBox} из ${countBoxes}`
        }

        return new Response(JSON.stringify({order, rows}))
    } catch (error: any) {
        console.log(error)
        return new Response(error, { status: 500 })
    }

}