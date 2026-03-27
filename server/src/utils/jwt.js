import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};