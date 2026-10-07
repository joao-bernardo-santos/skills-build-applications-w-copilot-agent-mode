import { model, Schema } from 'mongoose';

const workoutSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    level: { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
  },
  { timestamps: true },
);

export default model('Workout', workoutSchema, 'workouts');
