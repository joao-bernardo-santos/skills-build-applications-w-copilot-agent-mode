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

    const sampleUsers = [
      { username: 'alex.runner', email: 'alex.runner@example.com', firstName: 'Alex', lastName: 'Rivera' },
      { username: 'sam.strider', email: 'sam.strider@example.com', firstName: 'Sam', lastName: 'Chen' },
      { username: 'jamie.lifts', email: 'jamie.lifts@example.com', firstName: 'Jamie', lastName: 'Morgan' },
      { username: 'taylor.trails', email: 'taylor.trails@example.com', firstName: 'Taylor', lastName: 'Brooks' },
    ];
    const emails = sampleUsers.map(({ email }) => email);
    const existingUsers = await User.find({ email: { $in: emails } }).exec();
    const usersByEmail = new Map(existingUsers.map((user) => [user.email, user]));
    const missingUsers = sampleUsers.filter((user) => !usersByEmail.has(user.email));
    const insertedUsers = await User.insertMany(missingUsers);
    for (const user of insertedUsers) {
      usersByEmail.set(user.email, user);
    }

    const getUser = (email: string) => {
      const user = usersByEmail.get(email);
      if (!user) {
        throw new Error(`Could not create or find seed user: ${email}`);
      }
      return user;
    };
    const alex = getUser('alex.runner@example.com');
    const sam = getUser('sam.strider@example.com');
    const jamie = getUser('jamie.lifts@example.com');
    const taylor = getUser('taylor.trails@example.com');

    const teamNames = ['OctoFit Trailblazers', 'OctoFit Wave Runners'];
    await Team.deleteMany({ name: { $in: teamNames } }).exec();
    const teams = await Team.insertMany([
      { name: teamNames[0], members: [alex._id, sam._id], points: 320 },
      { name: teamNames[1], members: [jamie._id, taylor._id], points: 285 },
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
    await Activity.deleteMany({
      $or: activities.map(({ user, type, date }) => ({ user, type, date })),
    }).exec();
    await Activity.insertMany(activities);

    const leaderboardEntries = [
      { user: alex._id, points: 920, rank: 1 },
      { user: sam._id, points: 840, rank: 2 },
      { user: jamie._id, points: 780, rank: 3 },
      { user: taylor._id, points: 710, rank: 4 },
    ];
    await Leaderboard.deleteMany({ user: { $in: leaderboardEntries.map(({ user }) => user) } }).exec();
    await Leaderboard.insertMany(leaderboardEntries);

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
    await Workout.deleteMany({ title: { $in: workouts.map(({ title }) => title) } }).exec();
    await Workout.insertMany(workouts);

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
