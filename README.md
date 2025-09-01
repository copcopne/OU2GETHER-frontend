# OU2GETHER Frontend

OU2GETHER is a social networking app for students, designed to connect communities, share posts, interact through comments & reactions, chat, and manage groups.  
This repository contains the **frontend** built with **React Native + Expo**, integrated with a backend via REST APIs.

---

## 🚀 Features

- **Authentication**: Register, login, change password, unlock account, user verification.  
- **Home Feed**: View all posts, or filter by following, with pagination and pull-to-refresh.  
- **Posts**:  
  - Create new posts (text posts, polls for admins).  
  - Interactions: like, love, haha, wow, sad, angry.  
  - Comment system with emoji reactions.  
  - Edit & delete posts/comments (permission-based).  
- **Polls**: Create surveys with deadline, vote, and view results.  
- **Profile**: View & edit profile, search for users.  
- **Chat**: Browse chat list (in development).  
- **Admin & Groups**: Create groups, create users, verify users, unlock accounts, and system statistics.  

---

## 🛠️ Tech Stack

- **React Native** + **Expo** (v53, RN v0.79)  
- **React Navigation v7** (stack, bottom-tabs)  
- **React Native Paper** (UI components)  
- **AsyncStorage** (local token storage)  
- **Axios** (API calls)  
- **Firebase** (external service integration)  
- **Dayjs / Moment** (date & time handling)  
- **React Native Gifted Chat** (chat UI)  
- **Gorhom Bottom Sheet** (post creation modal)  

---

## 📦 Installation & Running

```bash
# Clone repo
git clone https://github.com/<your-org>/copcopne-ou2gether-frontend.git
cd copcopne-ou2gether-frontend

# Install dependencies
npm install
# or
yarn install

# Start development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios

# Run on web
npx expo start --web

```

## ⚙️ Environment Variables
Create a .env file at the root folder with:
``` bash
CLIENT_ID=xxx
API_KEY=xxx
AUTH_DOMAIN=xxx
PROJECT_ID=xxx
STORAGE_BUCKET=xxx
MESSAGING_SENDER_ID=xxx
APP_ID=xxx
DEFAULT_PASSWORD=xxx
```
replace xxx with your key/api.
