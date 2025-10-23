import Excel from '@models/excel';
import connectToDB from '@utils/database'
import { readFile } from 'fs/promises';
import { join } from 'path';
export const dynamic = 'force-dynamic';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { ObjectId } from 'mongodb'
import Row from '@models/rows';
import qr from 'qrcode'
import { createCanvas } from 'canvas';
import * as https from 'https'

function expandShortLink() {
    return new Promise((resolve, reject) => {
        const req = https.request('https://clck.ru/3FVYVe', { method: 'HEAD' }, (res) => {
            // Итоговый URL будет в заголовке `location` или `res.url`
            const finalUrl = res.headers.location || 'https://clck.ru/3FVYVe';
            resolve(finalUrl);
        });

        req.on('error', (e) => {
            reject(`Error expanding short link: ${e.message}`);
        });

        req.end();
    });
}

export const GET = async (request: Request) => {

    try {
        await connectToDB()
        const { searchParams } = new URL(request.url)
        let box = searchParams.get('box') as any
        box = JSON.parse(box)

        let excel = await Excel.findOne({_id: new ObjectId(box.excelId)})

        let row = await Row.findOne({excelId: new ObjectId(box.excelId), "structure.Номер заказа": box.selectOrder, 'structure.№ коробки': box.numBox})
        row = JSON.parse(JSON.stringify(row))

      /*  let rows = await Row.find({excelId: new ObjectId(box.excelId), 'structure.Номер заказа': box.selectOrder, 'structure.№ коробки': box.numBox})
        rows = JSON.parse(JSON.stringify(rows))
        rows = rows.map((row: any) => {
            return {'Наименование': row.structure['Наименование В Центре'], 'Кол-во': row.structure['Кол-во']}
        })*/

        let stringForQR = JSON.stringify({
            excelId: box.excelId,
            orderNum: box.selectOrder,
            numBox: box.numBox,
         //   rows
        })

       const finalUrl =  await expandShortLink() as any
        console.log('Original URL:', decodeURIComponent(decodeURIComponent(finalUrl)))

        const path = join(process.cwd(), `/public/pdf/шаблон.pdf`)
        const dataFile = await readFile(path)

        const existingPdfBytes = await toArrayBuffer(dataFile)

        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

        const path2 = join(process.cwd(), `/fonts`, `Montserrat-Light.ttf`)
        const fontBytes = await readFile(path2) as any
        const path3 = join(process.cwd(), `/fonts`, `Montserrat-Bold.ttf`)
        const fontBytesBold = await readFile(path3) as any

        pdfDoc.registerFontkit(fontkit);
        const customFont = await pdfDoc.embedFont(Buffer.from(fontBytes));
        const customFontBold = await pdfDoc.embedFont(Buffer.from(fontBytesBold));

        const pages = pdfDoc.getPages()
        const firstPage = pages[0]
        const { width, height } = firstPage.getSize()

        /*ВАРИАНТ С МАЛЕНЬКИМ КУАРОМ*/
        const response1 = await fetch(`https://clck.ru/--?url=${encodeURI(`${process.env.NEXTAUTH_URL}/unbox?stringForQR=${stringForQR}`)}`)
        let expandedUrl = await response1.text()

        const qrFileUrl = await qrCreate(expandedUrl)

        const pngImageBytes = await fetch(qrFileUrl).then((res) => res.arrayBuffer());

        const pngImage = await pdfDoc.embedPng(pngImageBytes)
        const pngDims = pngImage.scale(0.5)

        /*firstPage.drawText('ДОМА ХОРОШО', {
            x: 50,
            y: height - 100,
            size: 48,
            font: customFontBold,
            color: rgb(0, 0, 0)
        })

        firstPage.drawText(excel.date, {
            x: width - 280,
            y: height - 100,
            size: 48,
            font: customFontBold,
            color: rgb(0, 0, 0)
        })

        firstPage.drawText('Заказ:  ' + box.selectOrder, {
            x: 60,
            y: height - 180,
            size: 36,
            font: customFont,
            color: rgb(0, 0, 0)
        })

        firstPage.drawText('Место: ' + box.numBox.toString(), {
            x: 60,
            y: height - 240,
            size: 36,
            font: customFont,
            color: rgb(0, 0, 0)
        })

        firstPage.drawImage(pngImage, {
            x: width - 200,
            y: height - 240,
            width: pngDims.width,
            height: pngDims.height,
        })*/


        firstPage.drawText('дата отгрузки', {
            x: 36,
            y: height / 2 + 85,
            size: 36,
            font: customFont,
            color: rgb(0, 0, 0)
        })
        firstPage.drawText(excel.date, {
            x: width / 2 - 100,
            y: height / 2 + 83,
            size: 36,
            font: customFontBold,
            color: rgb(0, 0, 0)
        })
        
        firstPage.drawText('организация', {
            x: 42,
            y: height / 2 + 18,
            size: 36,
            font: customFont,
            color: rgb(0, 0, 0)
        })
        firstPage.drawText(row.structure['Организация'] && row.structure['Организация'] != '' ? row.structure['Организация'].split(' ООО')[0] : excel.for, {
            x: width / 2 - 100,
            y: height / 2 + 16,
            size: 36,
            font: customFontBold,
            color: rgb(0, 0, 0)
        })

        firstPage.drawText('заказ №', {
            x: 74,
            y: height / 2 - 60,
            size: 36,
            font: customFont,
            color: rgb(0, 0, 0)
        })
        firstPage.drawText(box.selectOrder, {
            x: width / 2 - 100,
            y: height / 2 - 58,
            size: 36,
            font: customFontBold,
            color: rgb(0, 0, 0)
        })

        firstPage.drawText('место №', {
            x: 70,
            y: height / 2 - 127,
            size: 36,
            font: customFont,
            color: rgb(0, 0, 0)
        })
        firstPage.drawText(box.numBox.toString(), {
            x: width / 2 - 100,
            y: height / 2 - 125,
            size: 36,
            font: customFontBold,
            color: rgb(0, 0, 0)
        })

        
        firstPage.drawImage(pngImage, {
            x: firstPage.getWidth() - pngDims.width - 50,
            y: firstPage.getHeight() / 2 - pngDims.height + 60,
            width: pngDims.width,
            height: pngDims.height,
          })

        const pdfBytes = await pdfDoc.save()

        return new Response(pdfBytes)
    } catch (error: any) {
        console.log(error)
        return new Response(error, { status: 500 })
    }

}

async function toArrayBuffer(buffer: any) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
}

async function qrCreate(stringForQR: any) {
    'use server'

    //console.log(`https://t.me/${botInfo.result.username}/?start=ref_firstaction`)
    const canvas = createCanvas(260, 260)
    //console.log({ canvas })
    qr.toCanvas(
        canvas,
        `${stringForQR}`,
        {
            errorCorrectionLevel: "L",
            margin: 0,
            color: {
                dark: "#000000",
                light: "#ffffff",
            },
            width: 260
        }
    )

    const dataURL = canvas.toDataURL("image/png")

    return dataURL

}