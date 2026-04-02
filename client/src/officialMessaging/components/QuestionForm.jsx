import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../AuthContext.jsx";
import { getLecturersByFacultyAndCourse } from "../services/messageService";
import { X } from "lucide-react";

const FACULTY_OPTIONS = ["Computing", "Engineering", "Business"];

const COURSE_OPTIONS = {
  Computing: [
    "Information Technology",
    "Software Engineering",
    "Cyber Security",
  ],
  Engineering: [
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ],
  Business: ["Business Management", "Accounting", "Marketing"],
};

const REG_ID_REGEX = /^[A-Za-z0-9]{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function QuestionForm({
  onSubmit,
  initialValues = {},
  loading = false,
  submitLabel = "Submit Question",
}) {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    studentRegistrationId: initialValues.studentRegistrationId || "",
    studentEmail: initialValues.studentEmail || "",
    academicYear: initialValues.academicYear || "",
    semester: initialValues.semester || "",
    faculty: initialValues.faculty || "",
    course: initialValues.course || "",
    lecturerId: initialValues.lecturerId || "",
    subject: initialValues.subject || "",
    question: initialValues.question || "",
  });

  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [dragOverImage, setDragOverImage] = useState(false);
  const [dragOverFile, setDragOverFile] = useState(false);

  const [lecturers, setLecturers] = useState([]);
  const [lecturerLoading, setLecturerLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const availableCourses = useMemo(() => {
    return formData.faculty ? COURSE_OPTIONS[formData.faculty] || [] : [];
  }, [formData.faculty]);

  useEffect(() => {
    const fetchLecturers = async () => {
      if (!formData.faculty || !formData.course || !token) {
        setLecturers([]);
        return;
      }

      try {
        setLecturerLoading(true);
        const res = await getLecturersByFacultyAndCourse(
          formData.faculty,
          formData.course,
          token
        );
        setLecturers(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to load lecturers";
        toast.error(message);
        setLecturers([]);
      } finally {
        setLecturerLoading(false);
      }
    };

    fetchLecturers();
  }, [formData.faculty, formData.course, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "faculty") {
      setFormData((prev) => ({
        ...prev,
        faculty: value,
        course: "",
        lecturerId: "",
      }));

      setErrors((prev) => ({
        ...prev,
        faculty: "",
        course: "",
        lecturerId: "",
      }));
      return;
    }

    if (name === "course") {
      setFormData((prev) => ({
        ...prev,
        course: value,
        lecturerId: "",
      }));

      setErrors((prev) => ({
        ...prev,
        course: "",
        lecturerId: "",
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

  const validateFile = (file, isImage) => {
    const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
    const fileTypeLabel = isImage ? "image" : "document";

    if (!allowedTypes.includes(file.type)) {
      const formats = isImage ? "PNG, JPG, GIF" : "PDF, DOC, DOCX";
      toast.error(`Invalid ${fileTypeLabel} format. Allowed: ${formats}`);
      return false;
    }

    if (file.size > maxSize) {
      const maxMB = isImage ? 5 : 10;
      toast.error(`File size exceeds ${maxMB}MB limit`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isDocument = ALLOWED_FILE_TYPES.includes(file.type);

    if (!isImage && !isDocument) {
      toast.error("Invalid file type. Please select an image or document.");
      return;
    }

    if (isImage && !validateFile(file, true)) return;
    if (isDocument && !validateFile(file, false)) return;

    setAttachment(file);

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview({
          type: "image",
          data: e.target.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview({
        type: "document",
        name: file.name,
        size: (file.size / 1024).toFixed(2),
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOverImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && ALLOWED_IMAGE_TYPES.includes(file.type)) {
      handleFileSelect(file);
    } else {
      toast.error("Please drop an image file (PNG, JPG, GIF)");
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOverFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && ALLOWED_FILE_TYPES.includes(file.type)) {
      handleFileSelect(file);
    } else {
      toast.error("Please drop a document file (PDF, DOC, DOCX)");
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
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
        "Student Registration ID must contain exactly 10 letters/numbers";
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

    if (!formData.lecturerId) {
      newErrors.lecturerId = "Please select a lecturer";
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

    // Use FormData to send file
    const payload = new FormData();
    payload.append("studentRegistrationId", formData.studentRegistrationId.trim());
    payload.append("studentEmail", formData.studentEmail.trim().toLowerCase());
    payload.append("academicYear", Number(formData.academicYear));
    payload.append("semester", Number(formData.semester));
    payload.append("faculty", formData.faculty);
    payload.append("course", formData.course);
    payload.append("lecturerId", formData.lecturerId);
    payload.append("subject", formData.subject.trim());
    payload.append("question", formData.question.trim());

    if (attachment) {
      payload.append("attachment", attachment);
    }

    try {
      await onSubmit(payload);

      setFormData({
        studentRegistrationId: "",
        studentEmail: initialValues.studentEmail || "",
        academicYear: "",
        semester: "",
        faculty: "",
        course: "",
        lecturerId: "",
        subject: "",
        question: "",
      });

      setAttachment(null);
      setAttachmentPreview(null);
      setLecturers([]);
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
        <p className="mt-2 text-sm text-slate-600">
          Submit your academic or official question with optional file attachments.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Form fields... */}
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
              maxLength={10}
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
            Lecturer
          </label>
          <select
            name="lecturerId"
            value={formData.lecturerId}
            onChange={handleChange}
            disabled={!formData.faculty || !formData.course || lecturerLoading}
            className={`${inputClass("lecturerId")} disabled:cursor-not-allowed disabled:bg-slate-100`}
          >
            <option value="">
              {lecturerLoading
                ? "Loading lecturers..."
                : lecturers.length > 0
                ? "Select lecturer"
                : "No lecturers available"}
            </option>
            {lecturers.map((lecturer) => (
              <option key={lecturer._id} value={lecturer._id}>
                {lecturer.name} ({lecturer.email})
              </option>
            ))}
          </select>
          {errors.lecturerId && (
            <p className="mt-2 text-xs text-red-600">{errors.lecturerId}</p>
          )}
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
            <p className="text-xs text-slate-600">
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
            <p className="text-xs text-slate-600">
              {formData.question.length}/2000 characters
            </p>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            📎 Attachments (Optional)
          </h3>

          {attachmentPreview ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {attachmentPreview.type === "image" ? (
                    <div className="space-y-3">
                      <img
                        src={attachmentPreview.data}
                        alt="Preview"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                      <p className="text-sm font-semibold text-slate-700">
                        ✓ {attachmentPreview.name}
                      </p>
                      <p className="text-xs text-emerald-600">
                        Image ready to upload
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-200">
                          <svg
                            className="h-6 w-6 text-emerald-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            ✓ {attachmentPreview.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            {attachmentPreview.size} KB
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-600">
                        Document ready to upload
                      </p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="rounded-full bg-red-100 p-2 hover:bg-red-200"
                >
                  <X className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Image Upload */}
              <label
                onDrop={handleImageDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverImage(true);
                }}
                onDragLeave={() => setDragOverImage(false)}
                className={`rounded-2xl border-2 border-dashed p-4 text-center transition cursor-pointer ${
                  dragOverImage
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300 bg-white hover:border-blue-400"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg
                    className="h-6 w-6 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs text-slate-600">
                    Drag & drop or <span className="font-semibold text-blue-600">browse</span>
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* File Upload */}
              <label
                onDrop={handleFileDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverFile(true);
                }}
                onDragLeave={() => setDragOverFile(false)}
                className={`rounded-2xl border-2 border-dashed p-4 text-center transition cursor-pointer ${
                  dragOverFile
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300 bg-white hover:border-blue-400"
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg
                    className="h-6 w-6 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-xs text-slate-600">
                    Drag & drop or <span className="font-semibold text-blue-600">browse</span>
                  </p>
                  <p className="text-xs text-slate-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4">
          <p className="text-sm text-slate-600">
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