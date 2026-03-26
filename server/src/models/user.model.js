import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = ["student", "lecturer", "admin"];
export const FACULTIES = ["Computing", "Engineering", "Business"];
export const COURSES = [
    "Information Technology",
    "Software Engineering",
    "Cyber Security",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Business Management",
    "Accounting",
    "Marketing",
];
export const COURSE_BY_FACULTY = {
    Computing: ["Information Technology", "Software Engineering", "Cyber Security"],
    Engineering: ["Mechanical Engineering", "Civil Engineering", "Electrical Engineering"],
    Business: ["Business Management", "Accounting", "Marketing"],
};

const userSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            match: [/^[A-Za-z]{2}\d{6,8}$/, "Please enter a valid Student ID"],
            required: function () {
                return this.role === "student";
            },
        },
        name: {
            type: String,
            required: true,
            trim: true,
            match: [/^[A-Za-z]+(?:\s[A-Za-z]+)*$/, "Name can contain only alphabetic letters and spaces"],
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
        faculty: {
            type: String,
            enum: FACULTIES,
        },
        course: {
            type: String,
            enum: COURSES,
        },
        year: {
            type: Number,
            min: 1,
            max: 4,
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