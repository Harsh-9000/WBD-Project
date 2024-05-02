import express from 'express';
import dotenv from 'dotenv';
import ErrorHandler from './middleware/error.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from "url";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Azura Cart API',
      version: '1.0.0',
      description: 'Documentation for Azura Cart API',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        jwt: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
        },
      },
    },
  },
  apis: ['swagger-spec.js', 'controller/user.js', 'controller/shop.js', 'controller/product.js', 'controller/event.js', 'controller/coupounCode.js', 'controller/order.js', 'controller/withdraw.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Get the directory name using import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'https://wbd-project-client.vercel.app',
    credentials: true
  })
);

// app.use(
//   cors({
//     origin: 'http://localhost:3000',
//     credentials: true
//   })
// );
app.use('/', express.static(path.join(__dirname, './uploads')));
app.use('/test', (req, res) => {
  res.send('Hello world!');
});

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// config
if (process.env.NODE_ENV !== 'PRODUCTION') {
  dotenv.config({
    path: 'config/.env'
  });
}

// import routes
import user from './controller/user.js';
import shop from './controller/shop.js';
import product from './controller/product.js';
import event from './controller/event.js';
import coupon from './controller/coupounCode.js';
import payment from './controller/payment.js';
import order from './controller/order.js';
import withdraw from './controller/withdraw.js';
import reset from './controller/reset.js';

app.use('/api/v2/auth', reset);
app.use('/api/v2/user', user);
app.use('/api/v2/shop', shop);
app.use('/api/v2/product', product);
app.use('/api/v2/event', event);
app.use('/api/v2/coupon', coupon);
app.use('/api/v2/payment', payment);
app.use('/api/v2/order', order);
app.use('/api/v2/withdraw', withdraw);

// it's for ErrorHandling
app.use(ErrorHandler);

export default app;
