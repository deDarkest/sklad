import connectToDB from '@utils/database'
import Auth from "@models/auth";
import { NextRequest } from 'next/server';

export const GET = async (req: NextRequest) => {
    await connectToDB()
    //console.log('GET AUTH', { req: req.nextUrl.searchParams })
    const userId = req.nextUrl.searchParams.get('userId')
    try {

        let auth = await Auth.findById(userId);
        return new Response(JSON.stringify(auth), { status: 200 })

    } catch (error: any) {

        console.log('GET AUTH', error)
        return new Response(error, { status: 500 })

    }
}