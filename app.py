import sqlite3
import os
import logging
from contextlib import contextmanager
from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)

_secret_key = os.environ.get("SECRET_KEY")
if not _secret_key:
    logging.warning(
        "SECRET_KEY environment variable not set. Using an insecure default. "
        "Set SECRET_KEY before deploying to production."
    )
    _secret_key = "dev-secret-key-change-in-production"
app.secret_key = _secret_key

DATABASE = "jobs.db"


@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company TEXT NOT NULL,
                position TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Applied',
                date_applied TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )
        conn.commit()


STATUSES = ["Applied", "Phone Screen", "Interview", "Offer", "Rejected", "Withdrawn"]


@app.route("/")
def index():
    status_filter = request.args.get("status", "")
    with get_db() as conn:
        if status_filter:
            jobs = conn.execute(
                "SELECT * FROM jobs WHERE status = ? ORDER BY created_at DESC",
                (status_filter,),
            ).fetchall()
        else:
            jobs = conn.execute(
                "SELECT * FROM jobs ORDER BY created_at DESC"
            ).fetchall()
    return render_template(
        "index.html", jobs=jobs, statuses=STATUSES, status_filter=status_filter
    )


@app.route("/add", methods=["GET", "POST"])
def add():
    if request.method == "POST":
        company = request.form["company"].strip()
        position = request.form["position"].strip()
        status = request.form["status"]
        date_applied = request.form["date_applied"].strip()
        notes = request.form["notes"].strip()

        if not company or not position:
            flash("Company and position are required.", "error")
            return render_template(
                "add.html",
                statuses=STATUSES,
                form=request.form,
            )

        with get_db() as conn:
            conn.execute(
                "INSERT INTO jobs (company, position, status, date_applied, notes) VALUES (?, ?, ?, ?, ?)",
                (company, position, status, date_applied or None, notes or None),
            )
            conn.commit()
        flash(f"Added application for {position} at {company}.", "success")
        return redirect(url_for("index"))

    return render_template("add.html", statuses=STATUSES, form={})


@app.route("/edit/<int:job_id>", methods=["GET", "POST"])
def edit(job_id):
    with get_db() as conn:
        job = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
        if job is None:
            flash("Job application not found.", "error")
            return redirect(url_for("index"))

        if request.method == "POST":
            company = request.form["company"].strip()
            position = request.form["position"].strip()
            status = request.form["status"]
            date_applied = request.form["date_applied"].strip()
            notes = request.form["notes"].strip()

            if not company or not position:
                flash("Company and position are required.", "error")
                return render_template("edit.html", job=job, statuses=STATUSES)

            conn.execute(
                "UPDATE jobs SET company=?, position=?, status=?, date_applied=?, notes=? WHERE id=?",
                (company, position, status, date_applied or None, notes or None, job_id),
            )
            conn.commit()
            flash(f"Updated application for {position} at {company}.", "success")
            return redirect(url_for("index"))

        return render_template("edit.html", job=job, statuses=STATUSES)


@app.route("/delete/<int:job_id>", methods=["POST"])
def delete(job_id):
    with get_db() as conn:
        job = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
        if job:
            conn.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
            conn.commit()
            flash(f"Deleted application for {job['position']} at {job['company']}.", "success")
    return redirect(url_for("index"))


if __name__ == "__main__":
    init_db()
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug)
