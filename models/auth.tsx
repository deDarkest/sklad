import { Schema, model, models } from "mongoose"

const AuthSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Username is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    img: {
        type: String
    }
})

const Auth = models.Auth || model('Auth', AuthSchema)

export default Auth