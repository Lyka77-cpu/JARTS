
// ==========================================
// JOB APPLICATION AND RECRUITMENT TRACKING
// ==========================================

// DATABASE (BROWSER LOCAL STORAGE)

let users = JSON.parse(localStorage.getItem("jarts_users")) || [
    {
        id: 1,
        name: "Demo Employee",
        email: "employee@demo.com",
        password: "123456",
        role: "employee"
    },
    {
        id: 2,
        name: "Demo Company",
        email: "employer@demo.com",
        password: "123456",
        role: "employer"
    }
];

let jobs = JSON.parse(localStorage.getItem("jarts_jobs")) || [
    {
        id: 101,
        employerId: 2,
        company: "Demo Company",
        title: "Web Developer",
        location: "Cebu City",
        type: "Full-Time",
        experience: "1-2 Years",
        salary: "₱20,000 - ₱30,000",
        description: "We are looking for a creative web developer to build and maintain websites.",
        skills: "HTML, CSS, JavaScript, PHP",
        image: "",
        date: new Date().toLocaleDateString()
    },
    {
        id: 102,
        employerId: 2,
        company: "Demo Company",
        title: "Graphic Designer",
        location: "Remote",
        type: "Part-Time",
        experience: "Fresh Graduate",
        salary: "₱15,000 - ₱20,000",
        description: "Create attractive graphics, layouts, and promotional materials.",
        skills: "Photoshop, Canva, Creativity",
        image: "",
        date: new Date().toLocaleDateString()
    }
];

let applications = JSON.parse(
    localStorage.getItem("jarts_applications")
) || [];

let notifications = JSON.parse(
    localStorage.getItem("jarts_notifications")
) || [];

let currentUser = null;


// SAVE DATA

function saveData() {
    localStorage.setItem("jarts_users", JSON.stringify(users));
    localStorage.setItem("jarts_jobs", JSON.stringify(jobs));
    localStorage.setItem(
        "jarts_applications",
        JSON.stringify(applications)
    );
    localStorage.setItem(
        "jarts_notifications",
        JSON.stringify(notifications)
    );
}

// SAFE HTML DISPLAY

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function formatStatus(status) {
    return status.replaceAll(" ", "-");
}

function statusBadge(status) {
    return `<span class="status ${formatStatus(status)}">
        ${safe(status)}
    </span>`;
}

function getFileLink(file) {
    if (!file) return "No file uploaded";

    return `<a href="${safe(file.data)}"
        download="${safe(file.name)}"
        target="_blank">View ${safe(file.name)}</a>`;
}


// ==========================================
// AUTHENTICATION
// ==========================================

function showRegister() {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("registerSection").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("registerSection").classList.add("hidden");
    document.getElementById("loginSection").classList.remove("hidden");
}

function register() {
    const role = document.getElementById("regRole").value;
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        alert("Please complete all fields.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        alert("This email is already registered.");
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role
    };

    users.push(newUser);
    saveData();

    alert("Account successfully created!");

    showLogin();
    document.getElementById("loginEmail").value = email;
}

function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const role = document.getElementById("loginRole").value;

    const user = users.find(u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        u.role === role
    );

    if (!user) {
        alert("Invalid login details or incorrect account type.");
        return;
    }

    currentUser = user;

    document.getElementById("authPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");

    document.getElementById("userName").textContent = user.name;
    document.getElementById("userRole").textContent =
        user.role === "employee" ? "Employee Account" : "Employer Account";

    document.getElementById("userAvatar").textContent =
        user.name.charAt(0).toUpperCase();

    buildMenu();

    showPage("dashboard");
}

function logout() {
    currentUser = null;

    document.getElementById("appPage").classList.add("hidden");
    document.getElementById("authPage").classList.remove("hidden");

    document.getElementById("loginPassword").value = "";
}


// ==========================================
// NAVIGATION
// ==========================================

function buildMenu() {
    let menu = document.getElementById("sidebarMenu");

    if (currentUser.role === "employee") {
        menu.innerHTML = `
            <button onclick="showPage('dashboard')">▦ Dashboard</button>
            <button onclick="showPage('jobs')">⌕ Find Jobs</button>
            <button onclick="showPage('applications')">▤ My Applications</button>
            <button onclick="showPage('notifications')">♧ Notifications</button>
            <button onclick="showPage('interviews')">◷ Interview Schedule</button>
            <button onclick="showPage('settings')">⚙ Settings</button>
        `;
    } else {
        menu.innerHTML = `
            <button onclick="showPage('dashboard')">▦ Dashboard</button>
            <button onclick="showPage('postJob')">＋ Post a Job</button>
            <button onclick="showPage('myJobs')">▤ My Job Postings</button>
            <button onclick="showPage('applicants')">♙ Applicants</button>
            <button onclick="showPage('notifications')">♧ Notifications</button>
            <button onclick="showPage('interviews')">◷ Interviews</button>
            <button onclick="showPage('settings')">⚙ Settings</button>
        `;
    }
}

function showPage(page) {
    const content = document.getElementById("pageContent");

    document.querySelectorAll("#sidebarMenu button").forEach(btn => {
        btn.classList.toggle(
            "active",
            btn.getAttribute("onclick")?.includes(`'${page}'`)
        );
    });

    const pages = {
        dashboard: currentUser.role === "employee"
            ? employeeDashboard : employerDashboard,
        jobs: findJobsPage,
        applications: myApplicationsPage,
        postJob: postJobPage,
        myJobs: myJobsPage,
        applicants: applicantsPage,
        notifications: notificationsPage,
        interviews: interviewsPage,
        settings: settingsPage
    };

    const titles = {
        dashboard: "Dashboard",
        jobs: "Find Jobs",
        applications: "My Applications",
        postJob: "Post a Job",
        myJobs: "My Job Postings",
        applicants: "Applicants",
        notifications: "Notifications",
        interviews: "Interview Schedule",
        settings: "Settings"
    };

    document.getElementById("pageTitle").textContent = titles[page] || "Dashboard";

    document.getElementById("pageSubtitle").textContent =
        `Welcome, ${currentUser.name}!`;

    document.getElementById("notificationCount").textContent =
        notifications.filter(n => n.userId === currentUser.id && !n.read).length;

    content.innerHTML = "";

    if (pages[page]) {
        content.innerHTML = pages[page]();
    } else {
        content.innerHTML = `<div class="empty-state">Page not found.</div>`;
    }
}


// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function notify(userId, title, message) {
    notifications.unshift({
        id: Date.now() + Math.random(),
        userId,
        title,
        message,
        date: new Date().toLocaleString(),
        read: false
    });

    saveData();
}


// ==========================================
// EMPLOYEE DASHBOARD
// ==========================================

function employeeDashboard() {
    const mine = applications.filter(
        a => a.employeeId === currentUser.id
    );

    const pending = mine.filter(a => a.status === "Pending").length;
    const review = mine.filter(a => a.status === "Under Review").length;
    const hired = mine.filter(a => a.status === "Hired").length;

    return `
        <div class="stats-grid">
            <div class="stat-card">
                <p>Total Applications</p>
                <h2>${mine.length}</h2>
            </div>
            <div class="stat-card">
                <p>Pending</p>
                <h2>${pending}</h2>
            </div>
            <div class="stat-card">
                <p>Under Review</p>
                <h2>${review}</h2>
            </div>
            <div class="stat-card">
                <p>Hired</p>
                <h2>${hired}</h2>
            </div>
        </div>

        <div class="section-heading">
            <h3>Recently Posted Jobs</h3>
            <button class="primary-btn" onclick="showPage('jobs')">
                Explore Jobs
            </button>
        </div>

        ${renderJobCards(jobs.slice().reverse().slice(0, 4))}
    `;
}


// ==========================================
// EMPLOYER DASHBOARD
// ==========================================

function employerDashboard() {
    const mine = jobs.filter(j => j.employerId === currentUser.id);

    const jobIds = mine.map(j => j.id);

    const applicants = applications.filter(
        a => jobIds.includes(a.jobId)
    );

    const pending = applicants.filter(
        a => a.status === "Pending"
    ).length;

    const hired = applicants.filter(
        a => a.status === "Hired"
    ).length;

    return `
        <div class="stats-grid">
            <div class="stat-card">
                <p>Posted Jobs</p>
                <h2>${mine.length}</h2>
            </div>
            <div class="stat-card">
                <p>Total Applicants</p>
                <h2>${applicants.length}</h2>
            </div>
            <div class="stat-card">
                <p>Pending Reviews</p>
                <h2>${pending}</h2>
            </div>
            <div class="stat-card">
                <p>Hired Applicants</p>
                <h2>${hired}</h2>
            </div>
        </div>

        <div class="section-heading">
            <h3>Quick Actions</h3>
        </div>

        <div class="panel">
            <p>Manage your recruitment process and find the right candidates.</p>
            <div class="job-actions">
                <button class="primary-btn" onclick="showPage('postJob')">
                    + Create Job Posting
                </button>
                <button class="secondary-btn" onclick="showPage('applicants')">
                    View Applicants
                </button>
            </div>
        </div>

        <div class="section-heading">
            <h3>Your Recent Job Postings</h3>
        </div>

        ${renderJobCards(mine.slice().reverse().slice(0, 4), true)}
    `;
}


// ==========================================
// JOB LISTINGS
// ==========================================

function renderJobCards(list, employerMode = false) {
    if (!list.length) {
        return `<div class="empty-state">No job postings available.</div>`;
    }

    return `
        <div class="job-grid">
            ${list.map(job => `
                <div class="job-card">
                    <img class="job-image"
                        src="${safe(job.image || 'https://placehold.co/600x300/e6f7f4/0f766e?text=Job+Opportunity')}"
                        alt="Job image">

                    <div class="job-details">
                        <h3>${safe(job.title)}</h3>
                        <p>${safe(job.company)} • ${safe(job.location)}</p>

                        <div class="job-meta">
                            <span class="tag">${safe(job.type)}</span>
                            <span class="tag">${safe(job.experience)}</span>
                        </div>

                        <p><b>Salary:</b> ${safe(job.salary)}</p>
                        <p>${safe(job.description)}</p>

                        <div class="job-actions">
                            <button class="primary-btn"
                                onclick="viewJob(${job.id})">
                                View Details
                            </button>

                            ${employerMode ? `
                                <button class="secondary-btn"
                                    onclick="showPage('applicants')">
                                    Applicants
                                </button>
                            ` : ""}
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

function findJobsPage() {
    return `
        <div class="panel">
            <div class="section-heading">
                <h3>Find Your Next Opportunity</h3>
            </div>

            <input id="jobSearch"
                placeholder="Search job title, company, or location..."
                oninput="searchJobs()">
        </div>

        <div class="section-heading">
            <h3>Available Jobs (${jobs.length})</h3>
        </div>

        <div id="jobResults">
            ${renderJobCards(jobs.slice().reverse())}
        </div>
    `;
}

function searchJobs() {
    const query = document.getElementById("jobSearch").value.toLowerCase();

    const filtered = jobs.filter(job =>
        [job.title, job.company, job.location, job.skills]
            .some(value => value.toLowerCase().includes(query))
    );

    document.getElementById("jobResults").innerHTML =
        renderJobCards(filtered);
}


// ==========================================
// VIEW JOB DETAILS
// ==========================================

function viewJob(id) {
    const job = jobs.find(j => j.id === id);

    if (!job) return;

    const alreadyApplied = applications.some(a =>
        a.jobId === id && a.employeeId === currentUser.id
    );

    openModal(`
        <h2>${safe(job.title)}</h2>
        <p class="muted">${safe(job.company)} • ${safe(job.location)}</p>

        <hr>

        <h3>Job Description</h3>
        <p>${safe(job.description)}</p>

        <h3>Required Skills</h3>
        <p>${safe(job.skills)}</p>

        <h3>Experience Required</h3>
        <p>${safe(job.experience)}</p>

        <h3>Salary</h3>
        <p>${safe(job.salary)}</p>

        <h3>Employment Type</h3>
        <p>${safe(job.type)}</p>

        ${currentUser.role === "employee" ? `
            <button class="primary-btn full"
                onclick="applyForJob(${job.id})"
                ${alreadyApplied ? "disabled" : ""}>
                ${alreadyApplied ? "Already Applied" : "Apply for this Job"}
            </button>
        ` : ""}
    `);
}


// ==========================================
// APPLY FOR A JOB
// ==========================================

function applyForJob(jobId) {
    if (applications.some(a =>
        a.jobId === jobId && a.employeeId === currentUser.id
    )) {
        alert("You already applied for this job.");
        return;
    }

    openModal(`
        <h2>Submit Job Application</h2>
        <p class="muted">Complete your information and upload your resume.</p>

        <form id="applicationForm">
            <label>Full Name</label>
            <input name="name" value="${safe(currentUser.name)}" required>

            <label>Contact Number</label>
            <input name="contact" placeholder="Enter contact number" required>

            <label>Short Introduction</label>
            <textarea name="introduction"
                placeholder="Tell the employer about yourself..."
                required></textarea>

            <label>Resume (PDF or DOC/DOCX)</label>
            <input type="file" name="resume"
                accept=".pdf,.doc,.docx" required>

            <label>Portfolio (Optional)</label>
            <input type="file" name="portfolio"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">

            <button class="primary-btn full" type="submit">
                Submit Application
            </button>
        </form>
    `);

    document.getElementById("applicationForm").onsubmit = async function(e) {
        e.preventDefault();

        const form = e.target;
        const resume = form.resume.files[0];
        const portfolio = form.portfolio.files[0];

        if (!resume) {
            alert("Please upload your resume.");
            return;
        }

        const allowed = ["pdf", "doc", "docx"];

        if (!allowed.includes(resume.name.split(".").pop().toLowerCase())) {
            alert("Resume must be PDF or DOC/DOCX.");
            return;
        }

        if (resume.size > 2 * 1024 * 1024 ||
            (portfolio && portfolio.size > 2 * 1024 * 1024)) {
            alert("Each file must be 2MB or smaller.");
            return;
        }

        const job = jobs.find(j => j.id === jobId);

        const application = {
            id: Date.now(),
            jobId,
            employeeId: currentUser.id,
            employerId: job.employerId,
            name: form.name.value.trim(),
            contact: form.contact.value.trim(),
            introduction: form.introduction.value.trim(),
            resume: await readFile(resume),
            portfolio: portfolio ? await readFile(portfolio) : null,
            status: "Pending",
            signature: "",
            signedDate: "",
            interviewDate: "",
            interviewTime: "",
            interviewLocation: "",
            date: new Date().toLocaleDateString()
        };

        applications.push(application);

        notify(
            job.employerId,
            "New Job Application",
            `${application.name} applied for ${job.title}.`
        );

        saveData();
        closeModal();

        alert("Your application was successfully submitted!");
        showPage("applications");
    };
}


// READ UPLOADED FILE

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve({
            name: file.name,
            data: reader.result
        });

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


// ==========================================
// EMPLOYEE APPLICATION TRACKING
// ==========================================

function myApplicationsPage() {
    const mine = applications.filter(
        a => a.employeeId === currentUser.id
    );

    if (!mine.length) {
        return `<div class="empty-state">
            <h3>No Applications Yet</h3>
            <p>Explore available jobs and submit your first application.</p>
            <button class="primary-btn" onclick="showPage('jobs')">
                Find Jobs
            </button>
        </div>`;
    }

    return `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Job Position</th>
                        <th>Company</th>
                        <th>Date Applied</th>
                        <th>Status</th>
                        <th>Interview</th>
                    </tr>
                </thead>
                <tbody>
                    ${mine.map(a => {
                        const job = jobs.find(j => j.id === a.jobId);

                        return `
                            <tr>
                                <td>${safe(job?.title || "Deleted Job")}</td>
                                <td>${safe(job?.company || "N/A")}</td>
                                <td>${safe(a.date)}</td>
                                <td>${statusBadge(a.status)}</td>
                                <td>
                                    ${a.interviewDate
                                        ? safe(a.interviewDate + " " + a.interviewTime)
                                        : "Not scheduled"}
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}


// ==========================================
// EMPLOYER: POST A JOB
// ==========================================

function postJobPage() {
    return `
        <div class="panel">
            <h3>Create a Job Opportunity</h3>
            <p class="muted">Provide complete details about the position.</p>

            <form id="jobForm">
                <label>Job Title</label>
                <input name="title" placeholder="e.g. Web Developer" required>

                <label>Company Name</label>
                <input name="company" value="${safe(currentUser.name)}" required>

                <label>Job Location</label>
                <input name="location" placeholder="e.g. Cebu City / Remote" required>

                <label>Employment Type</label>
                <select name="type">
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                    <option>Remote</option>
                </select>

                <label>Experience Required</label>
                <input name="experience"
                    placeholder="e.g. Fresh Graduate or 2 Years" required>

                <label>Salary Range</label>
                <input name="salary"
                    placeholder="e.g. ₱20,000 - ₱30,000" required>

                <label>Job Description</label>
                <textarea name="description"
                    placeholder="Describe the job responsibilities..."
                    required></textarea>

                <label>Required Skills</label>
                <textarea name="skills"
                    placeholder="e.g. HTML, CSS, JavaScript, Communication..."
                    required></textarea>

                <label>Upload Job Photo / Banner</label>
                <input type="file" name="image"
                    accept="image/*">

                <button class="primary-btn full" type="submit">
                    Publish Job Posting
                </button>
            </form>
        </div>
    `;
}

document.addEventListener("submit", async function(e) {
    if (e.target.id !== "jobForm") return;

    e.preventDefault();

    const form = e.target;
    const image = form.image.files[0];

    if (image && !image.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
    }

    if (image && image.size > 2 * 1024 * 1024) {
        alert("Image must be 2MB or smaller.");
        return;
    }

    const newJob = {
        id: Date.now(),
        employerId: currentUser.id,
        company: form.company.value.trim(),
        title: form.title.value.trim(),
        location: form.location.value.trim(),
        type: form.type.value,
        experience: form.experience.value.trim(),
        salary: form.salary.value.trim(),
        description: form.description.value.trim(),
        skills: form.skills.value.trim(),
        image: image ? await readFile(image).then(f => f.data) : "",
        date: new Date().toLocaleDateString()
    };

    jobs.push(newJob);

    saveData();

    alert("Your job posting has been published!");
    showPage("myJobs");
});


// ==========================================
// EMPLOYER: MY JOB POSTINGS
// ==========================================

function myJobsPage() {
    const mine = jobs.filter(j => j.employerId === currentUser.id);

    if (!mine.length) {
        return `<div class="empty-state">
            <h3>No Job Postings Yet</h3>
            <button class="primary-btn" onclick="showPage('postJob')">
                Post Your First Job
            </button>
        </div>`;
    }

    return `
        <div class="section-heading">
            <h3>Your Published Jobs</h3>
            <button class="primary-btn" onclick="showPage('postJob')">
                + Add New Job
            </button>
        </div>

        ${mine.map(job => {
            const count = applications.filter(a => a.jobId === job.id).length;

            return `
                <div class="panel" style="margin-bottom:15px">
                    <h3>${safe(job.title)}</h3>
                    <p class="muted">${safe(job.location)} • ${safe(job.type)}</p>
                    <p>${count} applicant(s)</p>

                    <div class="job-actions">
                        <button class="primary-btn"
                            onclick="viewJob(${job.id})">
                            View Job
                        </button>
                        <button class="secondary-btn"
                            onclick="viewJobApplicants(${job.id})">
                            View Applicants
                        </button>
                        <button class="danger-btn"
                            onclick="deleteJob(${job.id})">
                            Delete Posting
                        </button>
                    </div>
                </div>
            `;
        }).join("")}
    `;
}

function deleteJob(id) {
    if (!confirm("Delete this job posting? Its applications will remain in the system.")) return;

    jobs = jobs.filter(j =>
        !(j.id === id && j.employerId === currentUser.id)
    );

    saveData();
    showPage("myJobs");
}


// ==========================================
// EMPLOYER: APPLICANT MANAGEMENT
// ==========================================

function applicantsPage(jobId = null) {
    const myJobIds = jobs
        .filter(j => j.employerId === currentUser.id)
        .map(j => j.id);

    const list = applications.filter(a =>
        a.employerId === currentUser.id &&
        myJobIds.includes(a.jobId) &&
        (jobId === null || a.jobId === jobId)
    );

    if (!list.length) {
        return `<div class="empty-state">
            <h3>No Applicants Yet</h3>
            <p>Applicants who submit applications to your jobs will appear here.</p>
        </div>`;
    }

    return `
        <div class="section-heading">
            <h3>Submitted Applications (${list.length})</h3>
        </div>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Applicant</th>
                        <th>Job Position</th>
                        <th>Date Applied</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.map(a => {
                        const job = jobs.find(j => j.id === a.jobId);

                        return `
                            <tr>
                                <td>${safe(a.name)}</td>
                                <td>${safe(job?.title || "Deleted Job")}</td>
                                <td>${safe(a.date)}</td>
                                <td>${statusBadge(a.status)}</td>
                                <td>
                                    <button class="primary-btn"
                                        onclick="reviewApplicant(${a.id})">
                                        Review
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function viewJobApplicants(id) {
    document.getElementById("pageContent").innerHTML =
        applicantsPage(id);

    document.getElementById("pageTitle").textContent = "Job Applicants";
}


// ==========================================
// REVIEW APPLICANT
// ==========================================

function reviewApplicant(id) {
    const a = applications.find(x => x.id === id);

    if (!a) return;

    const job = jobs.find(j => j.id === a.jobId);

    // AUTOMATIC RULE:
    // When employer opens a pending application,
    // its status automatically becomes Under Review.

    if (a.status === "Pending") {
        a.status = "Under Review";

        notify(
            a.employeeId,
            "Application Under Review",
            `Your application for ${job?.title || "a job"} is now being reviewed by the employer.`
        );

        saveData();
    }

    openModal(`
        <h2>Applicant Information</h2>
        <p class="muted">Application for ${safe(job?.title || "Deleted Job")}</p>

        <hr>

        <h3>${safe(a.name)}</h3>
        <p><b>Contact:</b> ${safe(a.contact)}</p>
        <p><b>Introduction:</b> ${safe(a.introduction)}</p>
        <p><b>Date Applied:</b> ${safe(a.date)}</p>
        <p><b>Status:</b> ${statusBadge(a.status)}</p>

        <hr>

        <h3>Submitted Documents</h3>
        <p>Resume: ${getFileLink(a.resume)}</p>
        <p>Portfolio: ${getFileLink(a.portfolio)}</p>

        <hr>

        <h3>Message to Applicant</h3>

        <p class="muted">
            Send a short message or feedback about this application.
        </p>

        <textarea
            id="employerMessage"
            maxlength="300"
            placeholder="Write a short message to the applicant..."
        >${safe(a.employerMessage || "")}</textarea>

        <small class="muted">
            Maximum of 300 characters.
        </small>

        <button
            class="primary-btn full"
            type="button"
            onclick="sendApplicantMessage(${a.id})"
        >
            Send Message to Applicant
        </button>

        ${a.employerMessage ? `
            <div class="notification-item">
                <b>Previously Sent Message</b>
                <p>${safe(a.employerMessage)}</p>
                <small class="muted">
                    ${safe(a.employerMessageDate || "")}
                </small>
            </div>
        ` : ""}

        <hr>

        <h3>Application Approval</h3>

        <label>Employer Full Name / Authorized Signatory</label>

        <input
            id="signatureName"
            value="${safe(a.signature)}"
            placeholder="Enter authorized signatory name"
        >

        <p class="muted">
            By signing, you confirm that you have reviewed this application.
        </p>

        <button
            class="success-btn"
            onclick="signApplication(${a.id})"
        >
            ✍ Sign Application
        </button>

        ${a.signedDate ? `
            <p class="muted">
                Signed by ${safe(a.signature)}
                on ${safe(a.signedDate)}
            </p>
        ` : ""}

        <hr>

        <h3>Update Application Status</h3>

        <div class="job-actions">

            <button
                class="success-btn"
                onclick="updateStatus(${a.id}, 'Shortlisted')"
            >
                Shortlist
            </button>

            <button
                class="success-btn"
                onclick="updateStatus(${a.id}, 'Hired')"
            >
                Hire Applicant
            </button>

            <button
                class="danger-btn"
                onclick="updateStatus(${a.id}, 'Rejected')"
            >
                Reject
            </button>

        </div>

        <hr>

        <h3>Schedule an Interview</h3>

        <form id="interviewForm">

            <label>Interview Date</label>

            <input
                type="date"
                name="date"
                min="${new Date().toISOString().split("T")[0]}"
                required
            >

            <label>Interview Time</label>

            <input type="time" name="time" required>

            <label>Interview Location / Meeting Link</label>

            <input
                name="location"
                placeholder="Office address or meeting link"
                required
            >

            <button class="primary-btn full" type="submit">
                Schedule Interview
            </button>

        </form>
    `);

    document.getElementById("interviewForm").onsubmit = function(e) {
        e.preventDefault();

        const form = e.target;

        a.interviewDate = form.date.value;
        a.interviewTime = form.time.value;
        a.interviewLocation = form.location.value.trim();

        notify(
            a.employeeId,
            "Interview Scheduled!",
            `Your interview for ${job?.title || "a job"} is scheduled on ${a.interviewDate} at ${a.interviewTime}. Location: ${a.interviewLocation}.`
        );

        saveData();
        closeModal();

        alert("Interview successfully scheduled!");

        showPage("applicants");
    };
}

// ==========================================
// SEND MESSAGE TO APPLICANT
// ==========================================

function sendApplicantMessage(id) {

    const a = applications.find(x => x.id === id);

    if (!a) return;

    const messageField = document.getElementById("employerMessage");

    const message = messageField
        ? messageField.value.trim()
        : "";

    if (!message) {
        alert("Please enter a message.");
        return;
    }

    if (message.length > 300) {
        alert("Message must not exceed 300 characters.");
        return;
    }

    const job = jobs.find(j => j.id === a.jobId);

    // Save employer message
    a.employerMessage = message;

    a.employerMessageDate = new Date().toLocaleString();

    // Send notification to applicant
    notify(
        a.employeeId,
        "Message from Employer",
        `Regarding your application for ${job?.title || "a job"}: ${message}`
    );

    saveData();

    alert("Message successfully sent to the applicant!");

    // Refresh applicant review window
    reviewApplicant(id);
}

// ==========================================
// SIGN APPLICATION
// ==========================================

function signApplication(id) {
    const a = applications.find(x => x.id === id);

    const name = document.getElementById("signatureName").value.trim();

    if (!name) {
        alert("Please enter the authorized signatory name.");
        return;
    }

    if (a.signature) {
        alert("This application has already been signed.");
        return;
    }

    a.signature = name;
    a.signedDate = new Date().toLocaleDateString();

    const job = jobs.find(j => j.id === a.jobId);

    notify(
        a.employeeId,
        "Application Reviewed and Signed",
        `Your application for ${job?.title || "a job"} has been reviewed and signed by the employer.`
    );

    saveData();

    alert("Application successfully signed!");

    reviewApplicant(id);
}


// ==========================================
// UPDATE APPLICATION STATUS
// ==========================================

function updateStatus(id, newStatus) {
    const a = applications.find(x => x.id === id);

    if (!a) return;

    if (newStatus === "Hired" && !a.signature) {
        alert("Please sign the application before hiring the applicant.");
        return;
    }

    a.status = newStatus;

    const job = jobs.find(j => j.id === a.jobId);

    notify(
        a.employeeId,
        "Application Status Updated",
        `Your application for ${job?.title || "a job"} is now ${newStatus}.`
    );

    saveData();

    alert("Application status updated!");

    closeModal();
    showPage("applicants");
}


// ==========================================
// NOTIFICATIONS
// ==========================================

function notificationsPage() {
    const mine = notifications.filter(
        n => n.userId === currentUser.id
    );

    mine.forEach(n => n.read = true);

    saveData();

    if (!mine.length) {
        return `<div class="empty-state">
            <h3>No Notifications</h3>
            <p>You are all caught up!</p>
        </div>`;
    }

    return mine.map(n => `
        <div class="notification-item">
            <b>🔔 ${safe(n.title)}</b>
            <p>${safe(n.message)}</p>
            <small class="muted">${safe(n.date)}</small>
        </div>
    `).join("");
}


// ==========================================
// INTERVIEW SCHEDULE
// ==========================================

function interviewsPage() {
    const mine = applications.filter(a =>
        currentUser.role === "employee"
            ? a.employeeId === currentUser.id
            : a.employerId === currentUser.id
    ).filter(a => a.interviewDate);

    if (!mine.length) {
        return `<div class="empty-state">
            <h3>No Scheduled Interviews</h3>
            <p>Scheduled interviews will appear here.</p>
        </div>`;
    }

    return `
        <div class="panel">
            <h3>Interview Calendar</h3>
            <br>

            ${mine.map(a => {
                const job = jobs.find(j => j.id === a.jobId);

                return `
                    <div class="notification-item">
                        <b>${safe(a.name)} - ${safe(job?.title || "Deleted Job")}</b>
                        <p>📅 ${safe(a.interviewDate)}</p>
                        <p>🕒 ${safe(a.interviewTime)}</p>
                        <p>📍 ${safe(a.interviewLocation)}</p>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}


// ==========================================
// SETTINGS
// ==========================================

function settingsPage() {
    return `
        <div class="panel">
            <h3>Account Settings</h3>

            <label>Full Name / Company Name</label>
            <input id="settingsName" value="${safe(currentUser.name)}">

            <label>Email Address</label>
            <input value="${safe(currentUser.email)}" disabled>

            <label>Account Type</label>
            <input value="${safe(currentUser.role)}" disabled>

            <button class="primary-btn" onclick="saveSettings()">
                Save Changes
            </button>

            <hr style="margin:25px 0">

            <h3>About JARTS</h3>
            <p class="muted">
                Job Application and Recruitment Tracking System
                is a platform designed to connect job seekers
                with employers and organize the recruitment process.
            </p>

            <p class="muted">Privacy: Your information is stored locally
            in this browser in this prototype.</p>
        </div>
    `;
}

function saveSettings() {
    const name = document.getElementById("settingsName").value.trim();

    if (!name) {
        alert("Name cannot be empty.");
        return;
    }

    currentUser.name = name;

    const user = users.find(u => u.id === currentUser.id);
    user.name = name;

    saveData();

    document.getElementById("userName").textContent = name;
    document.getElementById("userAvatar").textContent =
        name.charAt(0).toUpperCase();

    alert("Settings updated!");
    showPage("settings");
}


// ==========================================
// MODAL CONTROLS
// ==========================================

function openModal(content) {
    document.getElementById("modalBody").innerHTML = content;
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}


// ==========================================
// INITIALIZATION
// ==========================================

saveData();
