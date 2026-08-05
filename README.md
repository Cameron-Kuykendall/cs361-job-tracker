# Running the Job Tracker

## 1. Start the React Frontend

Open a terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite (usually http://localhost:5173).

---

## 2. Company / Venue Lookup Microservice

Open a second terminal:

```bash
cd company-venue-lookup
npm install
npm start
```

Runs on:

```
http://localhost:3020
```

---

## 3. Analytics Dashboard Microservice

Open a third terminal:

```bash
cd analytics-dashboard-service
npm install
npm start
```

Runs on:

```
http://localhost:3014
```

---

## 4. Calendar Invite Generator

This microservice requires **two** processes.

### Terminal 4

```bash
cd microservices/calendar_microservice
python3 CalendarInvite.py
```

### Terminal 5

```bash
cd microservices/calendar_microservice
python3 http_adapter.py
```

The HTTP adapter runs on:

```
http://localhost:3018
```

---

## 5. Email Notification Service

This microservice also requires **two** processes.

### Terminal 6

```bash
cd microservices/notifications_microservice
python3 Email_Notification_service.py
```

### Terminal 7

```bash
cd microservices/notifications_microservice
python3 http_adapter.py
```

The HTTP adapter runs on:

```
http://localhost:5557
```

---

# Demo Features

- **Company Lookup**
  - Search for a company and save its location.

- **Analytics Dashboard**
  - Fetch application statistics from the Analytics microservice.

- **Calendar Invite**
  - Generate and download an interview calendar (.ics) invite.

- **Email Reminder**
  - Send an interview reminder email through the Notification microservice.

Each microservice runs independently and communicates with the Job Tracker through HTTP requests and responses.
