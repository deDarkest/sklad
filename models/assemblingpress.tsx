import { Schema, model, models } from "mongoose"

const AssemblingPressSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        required: [true, 'eventId is required.'],
        ref: 'DateAssembling',
        index: true
    },
    sequence: {
        type: Number,
        required: [true, 'sequence is required.'],
        min: 1
    },
    pressedAt: {
        type: Date,
        required: [true, 'pressedAt is required.']
    },
    durationMs: {
        type: Number,
        default: null,
        min: 0
    }
}, { timestamps: true })

AssemblingPressSchema.index({ eventId: 1, sequence: 1 }, { unique: true })

const AssemblingPress = models.AssemblingPress || model('AssemblingPress', AssemblingPressSchema)

export default AssemblingPress
