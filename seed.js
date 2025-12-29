require('dotenv').config();
const mongoose = require('mongoose');

const { User, users } = require('./models/user');
const { Book, books } = require('./models/book');
const { Expense, expenses } = require('./models/expense');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed users
    for (const userData of users) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
        console.log(`User ${userData.email} created`);
      }
    }

    // Seed books
    for (const bookData of books) {
      const existing = await Book.findOne({ title: bookData.title });
      if (!existing) {
        await Book.create(bookData);
        console.log(`Book ${bookData.title} created`);
      }
    }

    // Seed expenses
    for (const expenseData of expenses) {
      const existing = await Expense.findOne({ concept: expenseData.concept });
      if (!existing) {
        await Expense.create(expenseData);
        console.log(`Expense ${expenseData.concept} created`);
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seed().catch(console.error);
