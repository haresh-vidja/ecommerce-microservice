import CustomerService from '../services/customer.js';  // Import the CustomerService
import { verifyAuthToken } from './middlewares/index.js';  // Import the verifyAuthToken middleware
import validate from './validation/index.js'
import { SignUp } from './validation/customer-schema.js'

export default (app) => {

    // Route handler for POST /signup endpoint
    app.post('/signup', validate(SignUp), async (req, res, next) => {        
        console.log(req.body);
        const data = await CustomerService.SignUp(req.body);  // Call SignUp method from CustomerService
        res.json(data);  // Send the response as JSON
    });
    
    
    // Route handler for GET /profile endpoint
    app.get('/profile', async (req, res, next) => {
        const { _id } = req.query;
        const data = await CustomerService.GetProfile({ _id });  // Call GetProfile method from CustomerService
        res.json(data);  // Send the response as JSON
    });
    
    // Middleware to verify authentication token for all subsequent routes
    app.use(verifyAuthToken);
    // Route handler for GET /whoami endpoint
    app.get('/whoami', async (req, res, next) => {
        try {
            // Send a response indicating the service identity
            return res.status(200).send('/customer : I am Customer Service');
        } catch (error) {
            // If an error occurs, pass it to the error handling middleware
            next(error);
        }
    });
};
