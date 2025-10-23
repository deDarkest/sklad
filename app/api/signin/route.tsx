import Auth from '@models/auth';
import connectToDB from '@utils/database'
import jwt, { Secret } from "jsonwebtoken"

export const POST = async (req: any) => {
    try {
        await connectToDB()

        const { name, password } = await req.json();
        console.log({ name, password })
        const auth = await Auth.findOne({ name, password })

        if (!auth)
            throw ('Неверный Email или пароль!')

        const token = jwt.sign({ userId: auth._id }, process.env.TOKEN_SECRET as Secret, {
            expiresIn: "30d",
        })

        return new Response(JSON.stringify({ message: 'Успешно!', token, userId: auth._id }), { status: 201 })
    } catch (error: any) {
        console.log(error)
        return new Response(error, { status: 500 })
    }

}