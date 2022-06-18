import '../src/config/env.js';  // Load environment variables

import { expect, test, } from '@jest/globals';


const CustomerService = (await import('../src/services/customer.js')).default;

import Message from '../src/config/messages.js'


test('signup user', async () => {

    let customer = await CustomerService.SignUp({
        "firstName": "Rakesh",
        "lastName": "Tholiya",
        "email": "rakesh@tholiya.in",
        "password": "abc123",
        "phone": "8980169842"
    });
    expect(customer).toMatchObject({ type: 'success', message: Message.SIGNUP_SUCCESS });

});


test('signup with duplicate email', async () => {

    let customer = await CustomerService.SignUp({
        "firstName": "Rakesh",
        "lastName": "Tholiya",
        "email": "rakesh@tholiya.in",
        "password": "abc123",
        "phone": "8980169842"
    });
    expect(customer).toMatchObject({ type: 'error', message: Message.EMAIL_UNIQUE_ERROR });

});

test('signin user', async () => {

    let login = await CustomerService.SignIn({
        "username": "rakesh@tholiya.in",
        "password": "abc123",
    });
    expect(login).toMatchObject({ type: 'success', message: Message.LOGIN_SUCCESS });

});