'use server'

import connectToDB from "@utils/database"
import { cookies } from "next/headers"
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import axios from "axios";
import Excel from "@models/excel";
import { ObjectId } from 'mongodb'
import Pallete from "@models/pallete";
import PalleteComponent from "@components/PalleteComponent";
import Row from "@models/rows";
import XLSX from 'xlsx';
import * as fs from 'fs';
import { mkdir } from "fs/promises";
import { join } from "path";

async function getServerSideProps(excelId: any) {
    'use server'
  
    try {
        console.log('LOAD LAYOUT EXCEL NAMES')
        await connectToDB()
        
  
        const token = cookies().get("token")
        //console.log({token})
        if (!token || !token.value) {
          throw({error: 'not token'})
        }
  
        const data = jwt.verify(token?.value as string, process.env.TOKEN_SECRET as Secret) as JwtPayload
      //console.log({data})
  
        const response = await axios.get(`${process.env.NEXTAUTH_URL}/api/auth?userId=${data.userId}`)
        let auth = response.data
        auth = JSON.parse(JSON.stringify(auth))
        //console.log({ auth })
        if (!auth) {
          throw({error: 'not auth'})
        }
  
        let excel = await Excel.findOne({_id: new ObjectId(excelId)})
        excel = JSON.parse(JSON.stringify(excel))

        /*let palletes = await Pallete.find({excelId: new ObjectId(excelId)}).sort({palletenumber: 1, order: 1, box: 1})
        palletes = JSON.parse(JSON.stringify(palletes))

        let newPalletes = [] as any

        for(let pallete of palletes) {
          let wsRead = await Row.find({excelId: new ObjectId(pallete.excelId), 'structure.Номер заказа': pallete.order, 'structure.№ коробки': {$exists: true}}).sort({'structure.№ коробки': -1}).limit(1)
          wsRead = JSON.parse(JSON.stringify(wsRead))
          //console.log({ wsRead })

          const countBoxes = wsRead[0].structure['№ коробки']

          newPalletes.push({...pallete, box: `${pallete.box} из ${countBoxes}`})
        }*/

        let wsRead = await Row.find({excelId: new ObjectId(excelId), "structure.Возим": true, "structure.№ коробки": {$exists: true}})
        wsRead = JSON.parse(JSON.stringify(wsRead))

        //console.log({wsRead})

        let orders = await Row.aggregate([
          {
            $match: { 
              excelId: new ObjectId(excelId), 
              $and: [{"structure.Номер заказа":{$exists:true}, "structure.Возим": true},{"structure.Номер заказа":{$ne:"Общий итог"}}] 
            }
          },
          { $group: { _id: "$structure.Номер заказа" } },
          { $sort: { _id: 1 } }
        ])
        orders = JSON.parse(JSON.stringify(orders))
  
        return {excel, rows: wsRead, orders, isValid: true, auth, basicUrl: process.env.NEXTAUTH_URL}
  
    } catch (error) {
      console.log('LOAD LAYOUT GSSP', error)
      return {isValid: false}
    }
}

async function createPallete(qr: any) {
    'use server'

    await Row.updateMany({excelId: new ObjectId(qr.excelId), 'structure.Номер заказа': qr.order, 'structure.№ коробки': qr.box},{$set:{'structure.№ паллета': qr.palletenumber, 'structure.Сборка': 'pallete', 'structure.Время сборки': new Date()}, $push:{history:{date: new Date(), value: 'pallete', profile: qr.profile}}})

    const existsPallete = await Pallete.findOne({excelId: new ObjectId(qr.excelId), order: qr.order, box: qr.box})

    if(!existsPallete)
        await Pallete.create({...qr, excelId: new ObjectId(qr.excelId), box: `${qr.box}`})
      
    let palletes = await Pallete.find({excelId: new ObjectId(qr.excelId)})
    palletes = JSON.parse(JSON.stringify(palletes))

    let newPalletes = [] as any

    for(let pallete of palletes) {
      let wsRead = await Row.find({excelId: new ObjectId(pallete.excelId), 'structure.Номер заказа': pallete.order, 'structure.№ коробки': {$exists: true}}).sort({'structure.№ коробки': -1}).limit(1)
      wsRead = JSON.parse(JSON.stringify(wsRead))
      //console.log({ wsRead })

      const countBoxes = wsRead[0].structure['№ коробки']

      newPalletes.push({...pallete, box: `${pallete.box} из ${countBoxes}`})
    }

    return newPalletes
}

async function numberOfPallete(excelId: any) {
    'use server'

    let pallete = await Pallete.find({excelId: new ObjectId(excelId)}).sort({palletenumber: -1}).limit(1)
    pallete = JSON.parse(JSON.stringify(pallete))
    //console.log({ pallete })
        
    const countPallete = pallete[0] ? Number(pallete[0].palletenumber) : 0

    return countPallete + 1
}

async function createExcel(ordersExcel: any[], name: string) {
  'use server'

  // 1️⃣ Очистка имени файла от запрещённых символов
  const safeName = name.replace(/[<>:"\/\\|?*]+/g, '');
  const fileName = `${safeName}.xlsx`;
  const downloadPath = join(process.cwd(), 'public', 'download');
  const filePath = join(downloadPath, fileName);

  // 2️⃣ Создаём папку, если её нет
  await mkdir(downloadPath, { recursive: true }).catch(console.error);

  // 3️⃣ Генерируем данные для таблицы
  const headers = Object.keys(ordersExcel[0]);
  const dataRows = ordersExcel.map(obj => headers.map(header => obj[header]));

  const sheetData = [
    [name],  // Заголовок (будет объединён)
    headers, // Заголовки таблицы
    ...dataRows // Данные
  ];

  // 4️⃣ Создаём рабочий лист
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // 5️⃣ Объединяем заголовок на всю ширину
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

  // 6️⃣ Автоширина колонок
  ws["!cols"] = headers.map(header => ({
    wch: Math.max(
      header.length,
      ...ordersExcel.map(row => String(row[header] || '').length)
    ) + 2
  }));

  // 7️⃣ Добавляем стили (через `cell.s` в `XLSX.writeFile()`)
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet0');

  // 8️⃣ Записываем файл
  XLSX.set_fs(fs);
  XLSX.writeFile(wb, filePath);

  // 9️⃣ Возвращаем ссылку на скачивание
  return `${process.env.NEXTAUTH_URL}/api/xlsx?filename=/download/${fileName}`;
}

export default async function Page(ctx: any) {

    const props = await getServerSideProps(ctx.searchParams.excelId)
  
    return (
      <PalleteComponent isValid={props.isValid} rows={props.rows} orders={props.orders} excel={props.excel} auth={props.auth} createPallete={createPallete} numberOfPallete={numberOfPallete} createExcel={createExcel}></PalleteComponent>
    );

}