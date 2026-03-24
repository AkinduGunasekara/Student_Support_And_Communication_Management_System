import { useMemo, useState } from "react";
import { toast } from "sonner";

const FACULTY_OPTIONS = [
  "Computing",
  "Engineering",
  "Business",
];

const COURSE_OPTIONS = {
  Computing: ["IT", "SE", "Cyber Security", "Data Science"],
  Engineering: [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
  ],
  Business: ["Business Management", "Accounting", "Marketing"],
};

const REG_ID_REGEX = /^.{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export default function QuestionForm({
  onSubmit,
  initialValues = {},
  loading = false,
  submitLabel = "Submit Question",
}) {
  const [formData, setFormData] = useState({
    studentRegistrationId: initialValues.studentRegistrationId || "",
    studentEmail: initialValues.studentEmail || "",
    academicYear: initialValues.academicYear || "",
    semester: initialValues.semester || "",
    faculty: initialValues.faculty || "",
    course: initialValues.course || "",
    subject: initialValues.subject || "",
    question: initialValues.question || "",
  });

  const [errors, setErrors] = useState({});

  const availableCourses = useMemo(() => {
    return formData.faculty ? COURSE_OPTIONS[formData.faculty] || [] : [];
  }, [formData.faculty]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "faculty") {
      setFormData((prev) => ({
        ...prev,
        faculty: value,
        course: "",
      }));

      setErrors((prev) => ({
        ...prev,
        faculty: "",
        course: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    const regId = formData.studentRegistrationId.trim();
    const email = formData.studentEmail.trim().toLowerCase();
    const subject = formData.subject.trim();
    const question = formData.question.trim();

    if (!regId) {
      newErrors.studentRegistrationId = "Student Registration ID is required";
    } else if (!REG_ID_REGEX.test(regId)) {
      newErrors.studentRegistrationId =
        "Registration ID format is invalid. Example: IT12345678";
    }

    if (!email) {
      newErrors.studentEmail = "Student email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.studentEmail = "Please enter a valid email address";
    }

    if (!formData.academicYear) {
      newErrors.academicYear = "Academic year is required";
    } else if (![1, 2, 3, 4].includes(Number(formData.academicYear))) {
      newErrors.academicYear = "Academic year must be between 1 and 4";
    }

    if (!formData.semester) {
      newErrors.semester = "Semester is required";
    } else if (![1, 2].includes(Number(formData.semester))) {
      newErrors.semester = "Semester must be 1 or 2";
    }

    if (!formData.faculty) {
      newErrors.faculty = "Faculty is required";
    }

    if (!formData.course) {
      newErrors.course = "Course is required";
    }

    if (!subject) {
      newErrors.subject = "Subject is required";
    } else if (subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    } else if (subject.length > 150) {
      newErrors.subject = "Subject must be 150 characters or less";
    }

    if (!question) {
      newErrors.question = "Question is required";
    } else if (question.length < 10) {
      newErrors.question = "Question must be at least 10 characters";
    } else if (question.length > 2000) {
      newErrors.question = "Question must be 2000 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validate();
    if (!isValid) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const payload = {
      studentRegistrationId: formData.studentRegistrationId.trim(),
      studentEmail: formData.studentEmail.trim().toLowerCase(),
      academicYear: Number(formData.academicYear),
      semester: Number(formData.semester),
      faculty: formData.faculty,
      course: formData.course,
      subject: formData.subject.trim(),
      question: formData.question.trim(),
    };

    try {
      await onSubmit(payload);

      setFormData({
        studentRegistrationId: "",
        studentEmail: initialValues.studentEmail || "",
        academicYear: "",
        semester: "",
        faculty: "",
        course: "",
        subject: "",
        question: "",
      });

      setErrors({});
    } catch (error) {
      // parent handles api error toast
    }
  };

  const inputClass = (fieldName) =>
    `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
      errors[fieldName]
        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
        : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    }`;

  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-600">Official Messaging</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Ask a Question
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Submit your academic or official question to the relevant lecturer or
          department.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Student Registration ID
            </label>
            <input
              type="text"
              name="studentRegistrationId"
              value={formData.studentRegistrationId}
              onChange={handleChange}
              placeholder="Example: IT12345678"
              className={inputClass("studentRegistrationId")}
            />
            {errors.studentRegistrationId && (
              <p className="mt-2 text-xs text-red-600">
                {errors.studentRegistrationId}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Student Email
            </label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleChange}
              placeholder="example@student.edu"
              className={inputClass("studentEmail")}
            />
            {errors.studentEmail && (
              <p className="mt-2 text-xs text-red-600">
                {errors.studentEmail}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Academic Year
            </label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              className={inputClass("academicYear")}
            >
              <option value="">Select year</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
            {errors.academicYear && (
              <p className="mt-2 text-xs text-red-600">
                {errors.academicYear}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Semester
            </label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className={inputClass("semester")}
            >
              <option value="">Select semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
            {errors.semester && (
              <p className="mt-2 text-xs text-red-600">{errors.semester}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Faculty
            </label>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              className={inputClass("faculty")}
            >
              <option value="">Select faculty</option>
              {FACULTY_OPTIONS.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
            {errors.faculty && (
              <p className="mt-2 text-xs text-red-600">{errors.faculty}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Course
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              disabled={!formData.faculty}
              className={`${inputClass("course")} disabled:cursor-not-allowed disabled:bg-slate-100`}
            >
              <option value="">
                {formData.faculty ? "Select course" : "Select faculty first"}
              </option>
              {availableCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            {errors.course && (
              <p className="mt-2 text-xs text-red-600">{errors.course}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            maxLength={150}
            placeholder="Enter your subject"
            className={inputClass("subject")}
          />
          <div className="mt-2 flex items-center justify-between">
            {errors.subject ? (
              <p className="text-xs text-red-600">{errors.subject}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-slate-500">
              {formData.subject.length}/150 characters
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Question
          </label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleChange}
            maxLength={2000}
            rows={7}
            placeholder="Type your question clearly with all important details..."
            className={inputClass("question")}
          />
          <div className="mt-2 flex items-center justify-between">
            {errors.question ? (
              <p className="text-xs text-red-600">{errors.question}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-slate-500">
              {formData.question.length}/2000 characters
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-500">
            Make sure your question is clear, polite, and related to academic or
            official matters.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-w-[170px] items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}