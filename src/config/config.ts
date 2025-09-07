import dotenv from "dotenv"

dotenv.config()

const config = {
    jwt: {
        secret: process.env.JWT_SECRET,
        expires_in: process.env.JWT_EXPIRES_IN,
    },
    mongo:{
        uri: process.env.MONGO_URI
    },
    port: process.env.PORT || 3000
}

export {config}