import { Schema, model, models } from "mongoose"

const DateAssemblingSchema = new Schema({
    date: {
        type: String,
        required: [true, 'date is required.'],
        unique: true,
        trim: true
    },
    targetCount: {
        type: Number,
        required: [true, 'targetCount is required.'],
        min: 1
    },
    completedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    startedAt: {
        type: Date,
        default: null
    },
    lastPressedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

const DateAssembling = models.DateAssembling || model('DateAssembling', DateAssemblingSchema)

export default DateAssembling
