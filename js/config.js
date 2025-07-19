// CT5 Pride Volunteer Roles Configuration
// This file is automatically updated by the admin panel

export const roles = [
    {
        "id": "company-secretary",
        "title": "Company Secretary",
        "category": "governance",
        "department": "Board of Directors",
        "status": "open",
        "icon": "volunteers",
        "summary": "Support our Board of Directors as Company Secretary, ensuring proper governance procedures and maintaining accurate records for our Community Interest Company.",
        "location": "CT5 Area (Whitstable, Seasalter, Tankerton, Chestfield, Swalecliffe, Yorkletts)",
        "reportingLine": "Board of Directors",
        "timeCommitment": "6-10 hours per month",
        "description": "<p>As Company Secretary, you will provide essential administrative and governance support to CT5 Pride's Board of Directors. This role is crucial for maintaining proper corporate governance, ensuring compliance with Companies House requirements, and supporting effective board operations.</p><p>You will work closely with the Board Chair and other directors to coordinate meetings, maintain accurate records, and ensure all statutory and regulatory requirements are met. This position offers an excellent opportunity to contribute to the governance of a growing community organisation while supporting LGBTQIA+ inclusion in the CT5 area.</p>",
        "essentialCriteria": [
            "Strong organisational and administrative skills, with attention to detail and accuracy",
            "Excellent written and verbal communication skills, with experience preparing formal reports and correspondence",
            "Understanding of corporate governance principles and board operations",
            "Experience in minute-taking and meeting coordination",
            "Ability to maintain confidentiality and handle sensitive information appropriately",
            "Strong commitment to equality, diversity, and inclusion",
            "Willingness to leverage professional and person networks to support fundraising and awareness efforts",
            "Proven experience (minimum 3 years) in an administrative role, with a focus on governance and supporting Board of Directors or senior leadership teams",
            "Policy & Procedure writing experience",
            "Strong understanding of governance structures, legal requirements, and board operations in the non-profit or community sector",
            "Experience in managing and maintaining accurate records, meeting minutes, and correspondence",
            "Excellent written and verbal communication skills, with experience preparing formal reports, minutes, and correspondence for Board members",
            "Ability to effectively communicate with Board members, staff, volunteers, and external stakeholders",
            "Strong commitment to confidentiality, with the ability to handle sensitive information with discretion and professionalism",
            "High ethical standards and integrity in dealing with governance and administrative matters"
        ],
        "desirableCriteria": [
            "Previous experience serving as a company secretary, board officer, or in a governance or compliance role",
            "Understanding of the legal and regulatory framework for Community Interest Companies or charities",
            "Familiarity with filing requirements for Companies House or similar public bodies",
            "Experience supporting or developing policies, internal procedures, or organisational systems",
            "Knowledge of equality, diversity, and inclusion frameworks in practice",
            "Experience working or volunteering within LGBTQIA+ organisations or equalities-focused initiatives",
            "Strong written communication skills, with experience preparing formal documents or board papers",
            "Ability to manage shared drives or document storage systems such as Google Workspace or Microsoft 365",
            "Familiarity with coordinating AGMs, board recruitment, or director inductions",
            "A visible presence or active network within the CT5 area or broader Kent community",
            "Line-management experience in managing volunteers and/or staff"
        ]
    }
];

// SVG Icons for different role types
export const roleIcons = {
    "parade": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    "social-media": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.22.42-1.42 1.01L3 11v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8l-2.08-5.99zM9 16H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>`,
    "outreach": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.84 1.84 0 0 0 18.2 7c-.8 0-1.54.5-1.85 1.26l-1.92 5.76c-.15.45.15.98.64.98.18 0 .35-.06.49-.16l2.44-1.68V22h2zm-7.5-10.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H9.5l-1.32-3.96c-.26-.79-.98-1.29-1.85-1.29C5.76 9.75 5.2 10.42 5.2 11.2c0 .27.08.53.22.74L7 16h1v6h2z"/></svg>`,
    "volunteers": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3 6.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM8 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm8 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>`,
    "fundraising": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>`,
    "youth": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
}; 