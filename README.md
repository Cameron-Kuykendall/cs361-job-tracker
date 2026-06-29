# cs361-job-tracker

A Flask web application for tracking job applications, built for CS361.

## Features

- Add, view, edit, and delete job applications
- Track company, position, status, date applied, and notes
- Filter applications by status
- Statuses: Applied, Phone Screen, Interview, Offer, Rejected, Withdrawn

## Setup

1. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application**

   ```bash
   python app.py
   ```

3. **Open your browser** and navigate to `http://127.0.0.1:5000`

The SQLite database (`jobs.db`) is created automatically on first run.