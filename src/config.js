import { config } from "dotenv";

config();

export default{
    host: process.env.HOST || "",
    database: process.env.DATABASE || "",
    user: process.env.USER || "",
    password: process.env.PASSWORD || "",
    jwtSecret: process.env.JWT_SECRET || "",
    jwtAppSecret: process.env.JWT_APP_SECRET || "",
    tokenExpiration: process.env.TOKEN_EXPIRATION || "",
    emailService: process.env.EMAIL_SERVICE || "",
    email: process.env.EMAIL || "",
    emailPassword: process.env.EMAIL_PASSWORD || "",
    frontHost: process.env.FRONT_HOST || "",
};