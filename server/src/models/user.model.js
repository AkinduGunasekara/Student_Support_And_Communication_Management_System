import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = ["student", "lecturer", "admin"];

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+@.+\..+/, "Please enter a valid email address"],
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            trim: true,
            select: false,
        },
        role: {
            type: String,
            enum: USER_ROLES,
            default: "student",
            required: true,
        },
        department: String,
        course: String,
        year: Number,
        canCreateEvents: {
         type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    });

    // Compare password for login
    userSchema.methods.comparePassword = function (candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    };

    const User = mongoose.model("User", userSchema);
    export default User;