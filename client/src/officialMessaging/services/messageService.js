import axios from "axios";

const API_BASE = "http://localhost:5001/api/messages";
const AUTH_BASE = "http://localhost:5001/api/auth";

export const createMessage = async (data, token) => {
  return axios.post(API_BASE, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getMyMessages = async (token) => {
  return axios.get(`${API_BASE}/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getLecturerMessages = async (token) => {
  return axios.get(API_BASE, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getMessageById = async (id, token) => {
  return axios.get(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const answerMessage = async (id, answerData, token) => {
  return axios.patch(`${API_BASE}/${id}/answer`, answerData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const updateVisibility = async (id, visibilityData, token) => {
  return axios.patch(`${API_BASE}/${id}/visibility`, visibilityData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const markAsNotified = async (id, token) => {
  return axios.patch(
    `${API_BASE}/${id}/notified`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const deleteMessage = async (id, token) => {
  return axios.delete(`${API_BASE}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPublicMessages = async (params = {}) => {
  return axios.get(`${API_BASE}/public`, { params });
};

export const getLecturersByFacultyAndCourse = async (
  faculty,
  course,
  token
) => {
  return axios.get(`${AUTH_BASE}/lecturers`, {
    params: { faculty, course },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Helper function to download files
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Generate CSV Report
export const generateCSVReport = (messages, filename = "messages-report.csv") => {
  if (!messages.length) {
    console.warn("No messages to export");
    return;
  }

  const headers = [
    "Subject",
    "Student Name",
    "Registration ID",
    "Email",
    "Faculty",
    "Course",
    "Question",
    "Answer",
    "Status",
    "Public FAQ",
    "Created Date",
    "Answered Date",
    "Answered By",
  ];

  const rows = messages.map((msg) => [
    msg.subject || "-",
    msg.studentId?.name || "-",
    msg.studentRegistrationId || "-",
    msg.studentEmail || "-",
    msg.faculty || "-",
    msg.course || "-",
    (msg.question || "-").replace(/"/g, '""'),
    (msg.answer || "-").replace(/"/g, '""'),
    msg.status || "-",
    msg.isPublic ? "Yes" : "No",
    msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "-",
    msg.answeredAt ? new Date(msg.answeredAt).toLocaleString() : "-",
    msg.answeredBy?.name || "-",
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  downloadFile(csvContent, filename, "text/csv");
};

// Generate JSON Report
export const generateJSONReport = (messages, stats, filename = "messages-report.json") => {
  const report = {
    generatedAt: new Date().toISOString(),
    statistics: stats,
    messages: messages.map((msg) => ({
      id: msg._id,
      subject: msg.subject,
      student: {
        name: msg.studentId?.name,
        registrationId: msg.studentRegistrationId,
        email: msg.studentEmail,
      },
      course: {
        faculty: msg.faculty,
        name: msg.course,
        academicYear: msg.academicYear,
        semester: msg.semester,
      },
      question: msg.question,
      answer: msg.answer,
      status: msg.status,
      isPublic: msg.isPublic,
      studentNotified: msg.studentNotified,
      assignedLecturer: msg.lecturerId?.name,
      answeredBy: msg.answeredBy?.name,
      createdAt: msg.createdAt,
      answeredAt: msg.answeredAt,
    })),
  };

  const jsonContent = JSON.stringify(report, null, 2);
  downloadFile(jsonContent, filename, "application/json");
};

// Generate HTML Report (for printing)
export const generateHTMLReport = (messages, stats, filename = "messages-report.html") => {
  const timestamp = new Date().toLocaleString();

  const statsHTML = `
    <div class="stats-section">
      <h2>Dashboard Statistics</h2>
      <table class="stats-table">
        <tr>
          <td>Total Messages:</td>
          <td><strong>${stats.total}</strong></td>
        </tr>
        <tr>
          <td>Open Questions:</td>
          <td><strong>${stats.open}</strong></td>
        </tr>
        <tr>
          <td>Answered Questions:</td>
          <td><strong>${stats.answered}</strong></td>
        </tr>
        <tr>
          <td>Published FAQs:</td>
          <td><strong>${stats.public}</strong></td>
        </tr>
        <tr>
          <td>Private Items:</td>
          <td><strong>${stats.private}</strong></td>
        </tr>
      </table>
    </div>
  `;

  const messagesHTML = messages
    .map(
      (msg) => `
    <div class="message-item">
      <h3>${msg.subject || "Untitled"}</h3>
      <div class="message-meta">
        <span class="badge status-${msg.status.toLowerCase()}">${msg.status}</span>
        <span class="badge ${msg.isPublic ? "public" : "private"}">${msg.isPublic ? "Public FAQ" : "Private"}</span>
        <span class="badge ${msg.studentNotified ? "notified" : "not-notified"}">${msg.studentNotified ? "Student Seen" : "Not Seen"}</span>
      </div>
      <div class="student-info">
        <p><strong>Student:</strong> ${msg.studentId?.name || "-"}</p>
        <p><strong>Email:</strong> ${msg.studentEmail || "-"}</p>
        <p><strong>Registration ID:</strong> ${msg.studentRegistrationId || "-"}</p>
        <p><strong>Faculty:</strong> ${msg.faculty || "-"} • <strong>Course:</strong> ${msg.course || "-"}</p>
      </div>
      <div class="question-section">
        <h4>Question:</h4>
        <p>${(msg.question || "-").replace(/\n/g, "<br>")}</p>
      </div>
      <div class="answer-section">
        <h4>Answer:</h4>
        <p>${(msg.answer || "No answer provided yet").replace(/\n/g, "<br>")}</p>
      </div>
      <div class="timestamps">
        <p><strong>Created:</strong> ${msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "-"}</p>
        <p><strong>Answered:</strong> ${msg.answeredAt ? new Date(msg.answeredAt).toLocaleString() : "-"}</p>
        <p><strong>Answered By:</strong> ${msg.answeredBy?.name || "-"}</p>
      </div>
    </div>
  `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Lecturer Messages Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background-color: #f5f5f5;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #2563eb;
          margin-bottom: 10px;
          font-size: 28px;
        }
        .generated-info {
          color: #666;
          font-size: 12px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .stats-section {
          margin-bottom: 30px;
        }
        .stats-section h2 {
          color: #1f2937;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .stats-table {
          width: 100%;
          border-collapse: collapse;
          background-color: #f9fafb;
        }
        .stats-table tr {
          border-bottom: 1px solid #e5e7eb;
        }
        .stats-table td {
          padding: 10px;
        }
        .stats-table td:first-child {
          font-weight: 600;
          width: 50%;
        }
        .message-item {
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f9fafb;
          border-left: 4px solid #2563eb;
          border-radius: 4px;
          page-break-inside: avoid;
        }
        .message-item h3 {
          color: #1f2937;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .message-meta {
          margin-bottom: 15px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge.status-open {
          background-color: #fef3c7;
          color: #92400e;
        }
        .badge.status-answered {
          background-color: #d1fae5;
          color: #065f46;
        }
        .badge.status-closed {
          background-color: #e5e7eb;
          color: #374151;
        }
        .badge.public {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .badge.private {
          background-color: #f3f4f6;
          color: #4b5563;
        }
        .badge.notified {
          background-color: #d1fae5;
          color: #065f46;
        }
        .badge.not-notified {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .student-info, .question-section, .answer-section, .timestamps {
          margin-bottom: 12px;
        }
        .student-info p, .timestamps p {
          font-size: 12px;
          margin-bottom: 5px;
          color: #555;
        }
        .question-section h4, .answer-section h4 {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .question-section p, .answer-section p {
          font-size: 12px;
          line-height: 1.6;
          color: #333;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .answer-section p {
          background-color: #eff6ff;
          padding: 10px;
          border-radius: 4px;
        }
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📋 Lecturer Messages Report</h1>
        <div class="generated-info">
          <p>Generated on ${timestamp}</p>
          <p>Total Messages in Report: ${messages.length}</p>
        </div>
        ${statsHTML}
        <h2 style="color: #1f2937; margin: 30px 0 15px; font-size: 18px;">Messages</h2>
        ${messagesHTML}
      </div>
    </body>
    </html>
  `;

  downloadFile(htmlContent, filename, "text/html");
};

// Generate PDF Report using jsPDF
export const generatePDFReport = async (messages, stats, filename = "messages-report.pdf") => {
  try {
    const { jsPDF } = await import("jspdf");
    const autoTable = await import("jspdf-autotable").then((m) => m.default);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("Lecturer Messages Report", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 15;

    // Generated info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPosition);
    yPosition += 8;
    doc.text(`Total Messages: ${messages.length}`, 14, yPosition);
    yPosition += 12;

    // Statistics Section
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text("Dashboard Statistics", 14, yPosition);
    yPosition += 10;

    const statsData = [
      ["Total Messages", stats.total.toString()],
      ["Open Questions", stats.open.toString()],
      ["Answered Questions", stats.answered.toString()],
      ["Published FAQs", stats.public.toString()],
      ["Private Items", stats.private.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Count"]],
      body: statsData,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      bodyStyles: { textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Messages Summary Table
    if (messages.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text("Messages Summary", 14, yPosition);
      yPosition += 8;

      const tableData = messages.map((msg) => [
        msg.subject?.substring(0, 25) || "Untitled",
        msg.studentId?.name?.substring(0, 15) || "-",
        msg.faculty?.substring(0, 12) || "-",
        msg.course?.substring(0, 12) || "-",
        msg.status,
        msg.isPublic ? "Yes" : "No",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Subject", "Student", "Faculty", "Course", "Status", "Public"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
        bodyStyles: { textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.getHeight();
          const pageWidthLocal = pageSize.getWidth();
          doc.setFontSize(9);
          doc.setTextColor(150, 150, 150);
          doc.text(`Page ${data.pageNumber}`, pageWidthLocal / 2, pageHeight - 10, { align: "center" });
        },
      });
    }

    doc.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};