# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Expressive UI & RBAC

This application has been upgraded with an expressive motion system and Role-Based Access Control.

### Expressive Motion & Elevation
- **Motion**: UI elements like dashboard tiles and cards use spring-based physics for hover animations, providing a tangible and responsive feel. This is implemented using `framer-motion`.
- **Elevation**: Elements lift on interaction, using Material 3's expressive elevation system (2dp default, 8dp on hover/press).
- **Shape**: A global `rounded-expressive` token (24dp) is used for key components to create a friendly and modern aesthetic.

### Role-Based Access Control (RBAC)
- **Roles**: Users are assigned roles (`viewer`, `producer`, `core`, `admin`) stored in their Firestore user document.
- **Access Control**: The `<RequireRole>` Higher-Order Component (HOC) gates access to specific pages and UI elements based on the current user's role. Actions or links the user cannot access are visually disabled.
- **Security**: Firestore security rules enforce these roles on the backend, ensuring data integrity and preventing unauthorized access.

### Onboarding Flow
- **Adaptive Checklist**: A new onboarding page at `/onboarding` provides a role-aware checklist of tasks to help new users learn the platform. Progress is tracked in the user's Firestore document.
- **Interactive Tour**: An interactive product tour, powered by `react-joyride`, guides users through the main features of the application, corresponding to the checklist items.
- **Progressive Discovery**: The onboarding status is reflected throughout the app, with a badge on the "Inducción" link showing remaining steps and a teaser card on the dashboard for users who haven't completed the flow.
