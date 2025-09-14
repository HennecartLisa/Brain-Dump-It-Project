export const VOCAB = {
    // Action buttons
    CANCEL: "Cancel",
    SAVE: "Save",
    DELETE: "Delete",
    NEW: "New",
    SIGN_OUT: "Sign out",
    SIGN_IN: "Sign in", 
    EDIT: "Edit",
    CHECK: "Check",
    
    // Entity names
    TASK: "Task",
    LIST: "List",
    ROUTINE: "Routine",
    TRACKER: "Tracker",
    PROJECT: "Project",
    PERSON: "Person",
    BRAIN_DUMP: "Brain Dump",
    
    // Creation forms
    NEW_LIST: "New List",
    NEW_LIST_NAME: "List Name",
    NEW_ROUTINE: "New Routine", 
    NEW_ROUTINE_NAME: "Routine Name",
    NEW_TASK: "New Task",
    NEW_TASK_NAME: "Task Name",
    NEW_TRACKER: "New Tracker",
    NEW_TRACKER_NAME: "Tracker Name", 
    NEW_PROJECT: "New Project",
    NEW_PROJECT_NAME: "Project Name",
    NEW_TASK_ROUTINE: "New Task Routine",
    NEW_TASK_ROUTINE_NAME: "Task Routine Name",
    
    // Loading states
    LOADING: "Loading...",
    LOADING_LISTS_TASKS: "Loading your lists and tasks...",
    LOGGING_IN: "Logging in...",
    SIGNING_UP: "Signing up...",
    LOG_IN_TITLE: "Log in",
    SIGN_UP_TITLE: "Sign up",
    
    // Empty states
    NO_TASKS_IN_LIST: "Create your first task",
    NO_TASKS_IN_ROUTINE: "Create your first routine task",
    NO_LISTS_FOUND: "Create your first list with the Brain Dumpo button",
    NO_TASK_LISTS_FOUND: "No task lists found",
    NO_ROUTINE_LISTS_FOUND: "Create your first routine with the Brain Dumpo button",
    UNTITLED_LIST: "Untitled List",
    UNTITLED_ROUTINE: "Untitled Routine",
    
    // Auth actions
    LOG_IN: "Log in",
    SIGN_UP: "Sign up",
    WITH_GOOGLE: "with Google",
    
    // Generic messages
    ACCOUNT_CREATED_CHECK_EMAIL: "Account created. Check your email to verify",
    ACCOUNT_CREATED_PROFILE_SETUP_FAILED: "Account created but failed to set up profile. Please contact support.",
    SIGNUP_GENERIC_ERROR: "An error occurred during signup, please check your emails",
    LOGIN_GENERIC_ERROR: "An error occurred during login",
    PASSWORD_TOO_WEAK: "Password too weak",
    EMAIL_LABEL: "Email",
    EMAIL_PLACEHOLDER: "you@example.com",
    PASSWORD_LABEL: "Password",
    PASSWORD_PLACEHOLDER: "Your password",
    PASSWORD_SECURE_PLACEHOLDER: "Secure password",
    USERNAME_LABEL: "Username",
    USERNAME_HELPER_UNIQUE: "Must be unique",
    USERNAME_TAKEN: "This name is taken",

    // Password strength
    PASSWORD_STRENGTH_WEAK: "weak",
    PASSWORD_STRENGTH_MEDIUM: "medium",
    PASSWORD_STRENGTH_STRONG: "strong",
    PASSWORD_HELPER_WEAK: "Minimum 8 characters, upper, lower, number, symbol",
    PASSWORD_HELPER_MEDIUM: "Almost there...",
    PASSWORD_HELPER_STRONG: "You have a strong password!",
    
    // Sidebar menu items
    MY_BRAIN: "My Brain",
    MY_VILLAGE: "My Village",
    
    // Village/Group related
    ADD_USER_TO_VILLAGE: "Add User to Village",
    USER_DISPLAY_NAME: "User Display Name",
    MY_VILLAGE_GROUP: "My village",
    NO_GROUPS_FOUND: "No groups found",
    NO_MEMBERS_FOUND: "No members found",
    MEMBER_ROLE: "Role",
    MEMBER_STATUS: "Status",
    MEMBER_SCORE: "Score",

    // GDPR ancPrivacy
    PRIVACY_POLICY_TITLE: "Data Protection & Privacy Policy",
    PRIVACY_POLICY_LINK_TEXT: "Data Protection & Privacy Policy",
    PRIVACY_INTRO_TITLE: "Your Privacy Matters",
    PRIVACY_INTRO_TEXT: "This privacy notice explains how we collect, use, and protect your personal information in accordance with UK GDPR (General Data Protection Regulation) and the Data Protection Act 2018.",
    PRIVACY_CONTROLLER_TITLE: "Data Controller",
    PRIVACY_CONTROLLER_TEXT: "Brain Dump is the data controller for your personal information. We are committed to protecting your privacy and ensuring the security of your personal data.",
    PRIVACY_DATA_WE_COLLECT_TITLE: "Personal Data We Collect",
    PRIVACY_ACCOUNT_INFO: "Account Information:",
    PRIVACY_ACCOUNT_INFO_POINTS: [
        "Email address (for authentication and communication)",
        "Display name/username (for identification within the platform)",
        "Password (encrypted and securely stored)"
    ],
    PRIVACY_USAGE_DATA: "Usage Data:",
    PRIVACY_USAGE_DATA_POINTS: [
        "Tasks, lists, and routines you create",
        "Group memberships and collaborations",
        "App preferences and settings",
        "Accessibility settings and comfort mode preferences"
    ],
    PRIVACY_TECHNICAL_DATA: "Technical Data:",
    PRIVACY_TECHNICAL_DATA_POINTS: [
        "IP address and device information",
        "Browser type and version",
        "Usage patterns and app interactions",
        "Error logs and performance data"
    ],
    PRIVACY_LEGAL_BASIS_TITLE: "Legal Basis for Processing",
    PRIVACY_LEGAL_CONTRACT: "Contract Performance (Article 6(1)(b) GDPR):",
    PRIVACY_LEGAL_CONTRACT_TEXT: "We process your data to provide the task management and collaboration services you've requested.",
    PRIVACY_LEGAL_LEGIT_INTEREST: "Legitimate Interests (Article 6(1)(f) GDPR):",
    PRIVACY_LEGAL_LEGIT_INTEREST_TEXT: "We process data to improve our services, ensure security, and provide customer support.",
    PRIVACY_LEGAL_CONSENT: "Consent (Article 6(1)(a) GDPR):",
    PRIVACY_LEGAL_CONSENT_TEXT: "For optional features like analytics and marketing communications, we rely on your explicit consent.",
    PRIVACY_USE_OF_DATA_TITLE: "How We Use Your Personal Data",
    PRIVACY_USE_OF_DATA_POINTS: [
        "To provide and maintain our task management services",
        "To enable collaboration features and group management",
        "To personalize your experience and preferences",
        "To ensure platform security and prevent fraud",
        "To provide customer support and respond to inquiries",
        "To improve our services through analytics (with your consent)",
        "To comply with legal obligations"
    ],
    PRIVACY_SHARING_TITLE: "Data Sharing and Third Parties",
    PRIVACY_SHARING_INTRO: "We do not sell your personal data. We may share your information only in the following circumstances:",
    PRIVACY_SHARING_POINTS: [
        "With other users in groups you choose to join (limited to display name and group activities)",
        "With service providers who help us operate our platform (under strict data protection agreements)",
        "When required by law or to protect our rights and safety",
        "In case of business transfer (with prior notice)"
    ],
    PRIVACY_RETENTION_TITLE: "Data Retention",
    PRIVACY_RETENTION_INTRO: "We retain your personal data only for as long as necessary to fulfill the purposes outlined in this notice:",
    PRIVACY_RETENTION_POINTS: [
        "Account data: Until you delete your account or request deletion",
        "Usage data: Up to 3 years for service improvement purposes",
        "Technical logs: Up to 1 year for security and debugging",
        "Legal compliance data: As required by applicable laws"
    ],
    PRIVACY_RIGHTS_TITLE: "Your Rights Under UK GDPR",
    PRIVACY_RIGHTS_LIST: [
        "Right of Access",
        "Right to Rectification",
        "Right to Erasure",
        "Right to Restrict Processing",
        "Right to Data Portability",
        "Right to Object"
    ],
    PRIVACY_CONTACT_TITLE: "Contact Us",
    PRIVACY_CONTACT_TEXT: "If you have any questions about this privacy notice or wish to exercise your rights, please contact us:",
    PRIVACY_CONTACT_EMAIL: "privacy@braindump.app",
    PRIVACY_CONTACT_DPO: "dpo@braindump.app",
    PRIVACY_ICO_TEXT: "You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) if you believe your data protection rights have been violated.",
    PRIVACY_UNDERSTAND_BUTTON: "I Understand",
    PRIVACY_CONSENT_CHECKBOX_TEXT_PREFIX: "I agree to the",
    PRIVACY_CONSENT_CHECKBOX_TEXT_SUFFIX: "and consent to the processing of my personal data in accordance with UK GDPR.",
    PRIVACY_MUST_CONSENT: "You must agree to our privacy policy to continue",

    // Account section
    MY_ACCOUNT_PROFILE: "My Account - Profile",
    MY_ACCOUNT_PREFERENCES: "My Account - Preferences",
    MY_ACCOUNT_SECURITY: "My Account - Security",
    ACCOUNT_SETTINGS_COMING_SOON: "Account settings and profile management coming soon...",
    USER_PREFERENCES_COMING_SOON: "User preferences and settings coming soon...",
    DANGER_ZONE: "Danger Zone",
    DELETE_ACCOUNT_WARNING: "Once you delete your account, there is no going back. Please be certain.",
    
    // Projects section
    PROJECTS_ACTIVE: "Projects - Active",
    PROJECTS_PLANNING: "Projects - Planning",
    PROJECTS_ARCHIVE: "Projects - Archive",
    ACTIVE_PROJECTS_COMING_SOON: "Active projects coming soon...",
    PROJECT_PLANNING_COMING_SOON: "Project planning tools coming soon...",
    COMPLETED_PROJECTS_COMING_SOON: "Completed projects coming soon...",
    
    // History section
    HISTORY_RECENT_ACTIVITY: "History - Recent Activity",
    HISTORY_STATISTICS: "History - Statistics",
    HISTORY_ARCHIVE: "History - Archive",
    RECENT_ACTIVITY_COMING_SOON: "Recent activity history coming soon...",
    USAGE_STATISTICS_COMING_SOON: "Usage statistics coming soon...",
    HISTORICAL_DATA_COMING_SOON: "Historical data archive coming soon...",
    
    // Village section
    MY_VILLAGE_GROUP_NOT_FOUND: "My Village group not found",
    CREATE_MY_VILLAGE_GROUP: "Create My Village Group",
    
    // Account Deletion
    DELETE_PROFILE_BUTTON: "Delete My Profile",
    DELETE_PROFILE_CONFIRM_TITLE: "Delete Account Confirmation",
    DELETE_PROFILE_CONFIRM_MESSAGE: "Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your personal data, tasks, lists, and group memberships.",
    DELETE_PROFILE_WARNING: "This will permanently delete your account and all associated data.",
    DELETE_PROFILE_CONFIRM_BUTTON: "Yes, Delete My Account",
    DELETE_PROFILE_CANCEL_BUTTON: "Cancel",
    DELETE_PROFILE_SUCCESS: "Your account has been successfully deleted.",
    DELETE_PROFILE_ERROR: "Failed to delete your account. Please try again.",
} as const;
