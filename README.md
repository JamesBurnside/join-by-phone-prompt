# Join By Phone Example

This repository contains a simple example of how to prompt a user to `join-by-phone` in an Azure Communication Services call. The sample uses `@azure/communication-react` to display a `CallComposite`, and when the user joins the call if there are no microphones available, displays a prompt to join by phone instead.

<https://github.com/user-attachments/assets/b054f83a-fa9d-4631-b521-60d1ae148ca1>

## Run Locally

### Setup

1. Clone the repository

   ```bash
   git clone
   cd join-by-phone-example
   ```

1. Install dependencies

   ```bash
   npm install
   ```

1. Create a `.env` file in the root of the project and add the following variables:

   ```bash
   VITE_TEST_USER_ID=<USER_ID_STRING>
   VITE_TEST_USER_TOKEN=<USER_TOKEN>
   VITE_TEST_MEETING_LINK=<TEAMS_MEETING_LINK>
   ```

   Replace `<USER_ID_STRING>`, `USER_TOKEN` and `<TEAMS_MEETING_LINK>` with local values. You can generate `<USER_ID_STRING>` and `USER_TOKEN` values for testing in the Azure portal, under your `Communication Services` resource > `Identities & User Access Tokens`. In a production application, you would generate these values on your backend server and fetch them in your client application with a `fetch` call. `TEAMS_MEETING_LINK` should be a valid link to a Teams meeting. You can create a Teams meeting in your Teams client and copy the link from there.

### Run

1. Start the development server

   ```bash
   npm run dev
   ```

1. Open your browser and navigate to `http://localhost:5173/`.

## Notes

This project was bootstrapped with vite via `npm create vite@latest --template react-ts`.
