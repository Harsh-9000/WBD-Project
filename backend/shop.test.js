import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Event from './model/event.js';
import router from './controller/event.js';
import FormData from "form-data"
import fs from "fs"
import path from "path"

const app = express();
app.use(express.json());
app.use('/api/v2/event', router);

// Use a different database for testing or clear the database after each test to keep it clean
beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect('mongodb://127.0.0.1:27017/test', {});
});

afterEach(async () => {
  // Clear the database after each test
  await Event.deleteMany({});
});

afterAll(async () => {
  // Close the database connection after all tests
  await mongoose.connection.close();
});


describe('GET /api/v2/event/get-all-events', () => {
  test('It should get all events', async () => {
    await Event.create([
      {
        name: 'Test Event 1',
        description: 'Test Event Description 1',
        category: 'Test Category 1',
        start_Date: new Date(),
        Finish_Date: new Date(),
        discountPrice: 100,
        stock: 10,
        shopId: 'shopId',
        shop: { name: 'Test Shop' },
      },
      {
        name: 'Test Event 2',
        description: 'Test Event Description 2',
        category: 'Test Category 2',
        start_Date: new Date(),
        Finish_Date: new Date(),
        discountPrice: 150,
        stock: 20,
        shopId: 'shopId',
        shop: { name: 'Test Shop' },
      },
    ]);

    const response = await request(app).get('/api/v2/event/get-all-events');

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.events.length).toBe(2);
  });
});

// Add more tests for other endpoints similarly
