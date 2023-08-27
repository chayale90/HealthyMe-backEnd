const app = require('../../app'); 
const request = require('supertest');
const express = require('express');

describe('users', () => {
    test('returns status code 201', async () => {
        const user = {
            // Provide necessary user 
            name: 'Test4 User',
            email: 'test4@example.com',
            password: 'testpassword',
            birth_date: "1987-04-04",
            height: 176,
            weight: [
                {
                    myWeight: 100
                }
            ],
            sex: "female"
        };

        const res = await request(app)
            .post('/users')
            .send(user);
        expect(res.statusCode).toEqual(201);
    });

    test('returns bad request if validUser doesnt correct', async () => {
        const res = await request(app)
            .post('/users')
            .send({});
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual('the validation body is invalid');
    });
});