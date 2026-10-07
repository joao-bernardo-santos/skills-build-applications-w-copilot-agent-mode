import mongoose from 'mongoose';
import Activity from '../models/activity.js';
import Leaderboard from '../models/leaderboard.js';
import Team from '../models/team.js';
import User from '../models/user.js';
import Workout from '../models/workout.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';

/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to octofit_db');

    const users = await Promise.all(
      [
        { username: 'alex.runner', email: 'alex.runner@example.com', firstName: 'Alex', lastName: 'Rivera' },
        { username: 'sam.strider', email: 'sam.strider@example.com', firstName: 'Sam', lastName: 'Chen' },
        { username: 'jamie.lifts', email: 'jamie.lifts@example.com', firstName: 'Jamie', lastName: 'Morgan' },
        { username: 'taylor.trails', email: 'taylor.trails@example.com', firstName: 'Taylor', lastName: 'Brooks' },
      ].map((user) =>
        User.findOneAndUpdate({ email: user.email }, { $set: user }, {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }).exec(),
      ),
    );
    const [alex, sam, jamie, taylor] = users;

    const teams = await Promise.all([
      Team.findOneAndUpdate(
        { name: 'OctoFit Trailblazers' },
        { $set: { name: 'OctoFit Trailblazers', members: [alex._id, sam._id], points: 320 } },
        { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
      ).exec(),
      Team.findOneAndUpdate(
        { name: 'OctoFit Wave Runners' },
        { $set: { name: 'OctoFit Wave Runners', members: [jamie._id, taylor._id], points: 285 } },
        { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
      ).exec(),
    ]);

    await Promise.all([
      User.updateOne({ _id: alex._id }, { $set: { team: teams[0]._id } }).exec(),
      User.updateOne({ _id: sam._id }, { $set: { team: teams[0]._id } }).exec(),
      User.updateOne({ _id: jamie._id }, { $set: { team: teams[1]._id } }).exec(),
      User.updateOne({ _id: taylor._id }, { $set: { team: teams[1]._id } }).exec(),
    ]);

    const activities = [
      { user: alex._id, type: 'running', duration: 35, distance: 5.2, points: 90, date: new Date('2026-01-12T08:00:00Z') },
      { user: sam._id, type: 'cycling', duration: 45, distance: 12, points: 85, date: new Date('2026-01-12T09:00:00Z') },
      { user: jamie._id, type: 'strength training', duration: 40, points: 80, date: new Date('2026-01-12T10:00:00Z') },
      { user: taylor._id, type: 'walking', duration: 50, distance: 3.8, points: 75, date: new Date('2026-01-12T11:00:00Z') },
    ];
    await Promise.all(
      activities.map(({ user, type, date, ...activity }) =>
        Activity.findOneAndUpdate(
          { user, type, date },
          { $set: { user, type, date, ...activity } },
          { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
        ).exec(),
      ),
    );

    const leaderboardEntries = [
      { user: alex._id, points: 920, rank: 1 },
      { user: sam._id, points: 840, rank: 2 },
      { user: jamie._id, points: 780, rank: 3 },
      { user: taylor._id, points: 710, rank: 4 },
    ];
    await Promise.all(
      leaderboardEntries.map((entry) =>
        Leaderboard.findOneAndUpdate(
          { user: entry.user },
          { $set: entry },
          { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
        ).exec(),
      ),
    );

    const workouts = [
      {
        title: 'Beginner 5K Builder',
        description: 'Build running endurance with a mix of easy jogging and recovery.',
        type: 'running',
        duration: 30,
        level: 'beginner',
      },
      {
        title: 'Full-Body Strength',
        description: 'A balanced strength session using bodyweight movements.',
        type: 'strength',
        duration: 40,
        level: 'intermediate',
      },
      {
        title: 'Recovery Walk',
        description: 'A low-impact brisk walk to support active recovery.',
        type: 'walking',
        duration: 25,
        level: 'beginner',
      },
    ];
    await Promise.all(
      workouts.map((workout) =>
        Workout.findOneAndUpdate(
          { title: workout.title },
          { $set: workout },
          { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
        ).exec(),
      ),
    );

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
