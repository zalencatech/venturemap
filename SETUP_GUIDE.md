# SETUP GUIDE — upload to GitHub and deploy, using only your browser

Everything here is done by clicking in Chrome on your Pixelbook. No installs, no terminal needed.
(Later, to prepare for your viva, you should also run the project yourself — see Part 7.)

---

## Part 1 — Unzip the project (ChromeOS Files app)

1. Open the **Files** app → **Downloads**.
2. Right-click `venturemap.zip` → **Extract all**. A folder called `venturemap` appears in Downloads.
3. **Important:** show hidden files. In the Files app click the **⋮ (three dots)** at the top right → turn on **Show hidden files**
   (or press **Ctrl + .**). Two items start with a dot (`.gitignore` and the `.github` folder) and would be skipped otherwise.
4. Open the `venturemap` folder. You should see: `.github`, `data`, `frontend`, `src`, `tests`, `.gitignore`, `main.py`, `pytest.ini`, `README.md`, `requirements.txt`, `SETUP_GUIDE.md`.

## Part 2 — Create the GitHub repository

1. Go to <https://github.com> and sign up / sign in (free).
2. Click the **+** at the top right → **New repository**.
3. Repository name: `venturemap`. Choose **Public**.
4. **Leave unticked:** "Add a README", ".gitignore" and "license" (the project already has its own files).
5. Click **Create repository**.

## Part 3 — Upload the files

1. On the new empty repository page click the link **uploading an existing file**.
2. In the Files app, open Downloads → `venturemap`, press **Ctrl + A** to select everything **inside** the folder
   (not the folder itself), and **drag** it onto the GitHub page where it says *"Drag files here"*.
3. Wait until every file is listed (about 48 files). GitHub accepts up to 100 files per upload.
4. At the bottom, keep **Commit directly to the main branch** and click **Commit changes**.
5. Check the file list on the repository page:
   - You should see `.github`, `.gitignore`, `data`, `frontend`, `src`, `tests`, `main.py`, `pytest.ini`, `README.md`, `requirements.txt`, `SETUP_GUIDE.md`.
   - **If `.gitignore` is missing:** click **Add file → Create new file**, type `.gitignore` as the name, open the same file from your Downloads folder (right-click → Open with Text), copy everything, paste, **Commit changes**.
   - **If `.github` is missing:** do the same, but type the name `.github/workflows/run-pipeline.yml` (typing `/` creates folders) and paste the content of that file.

## Part 4 — Put your own GitHub address into the website

1. In your repository open `frontend` → `src` → `config.js`.
2. Click the **pencil icon** (Edit).
3. Replace `YOUR-USERNAME` with your GitHub username so the line reads
   `https://github.com/<your-username>/venturemap`.
4. Click **Commit changes…** → **Commit changes**.

## Part 5 — Generate the real data (one button)

The sandbox where this project was built could not reach the World Bank API, so **no real data has been generated yet**.
You create it like this:

1. Open the **Actions** tab of your repository. If GitHub asks, click **"I understand my workflows, go ahead and enable them"**.
2. In the left list click **Run VentureMap pipeline** → **Run workflow** (green button on the right) → **Run workflow**.
3. Wait 1–3 minutes until the run shows a green ✓. It runs the tests, downloads the data from the World Bank, runs the analysis and saves the results into your repository.
4. Go back to the **Code** tab. Now `data/venturemap_clean.csv`, `data/venturemap.json`, a `reports` folder (charts + `eda_summary.txt`) and `frontend/public/data/venturemap.json` exist.

**If the run fails with a red ✗:**
- Click the failed run → click the failed step to read the message.
- *"Permission denied" / 403 when pushing:* go to **Settings → Actions → General → Workflow permissions**, choose **Read and write permissions**, **Save**, then run the workflow again.
- *Errors containing "HTTP" or "Could not fetch":* the World Bank API may be busy. Wait a few minutes and run it again.
- *A test fails:* copy the red message and ask for help — do not ignore it.

> This workflow file has not been executed by the author of this guide; if a step needs adjusting, the message in the failed step tells you which one.

## Part 6 — Deploy the website on Vercel

1. Go to <https://vercel.com> → **Sign Up** → **Continue with GitHub** (the free Hobby plan; no credit card).
2. Click **Add New… → Project**, find `venturemap` and click **Import** (if it is not listed, click *Adjust GitHub App Permissions* and allow the repository).
3. **Root Directory:** click **Edit** and choose `frontend`.
4. Check that **Framework Preset = Vite**, Build Command `npm run build`, Output Directory `dist`.
5. Click **Deploy**. After about a minute you get a link like `venturemap-xxxx.vercel.app`.
6. Open it. You should see the dashboard with the real data. If you see **"No dataset found yet"**, Part 5 has not been completed (the file `frontend/public/data/venturemap.json` is missing) — finish Part 5; Vercel redeploys on its own after new commits (or press **Redeploy** on the Vercel project page).

**Updating the data later:** Actions → Run VentureMap pipeline → Run workflow. The new commit makes Vercel redeploy automatically.

## Part 7 — Run it yourself (recommended before the viva)

You must be able to explain the code, so run it once yourself in a Codespace:

1. On your repository click **Code → Codespaces → Create codespace on main**. A VS Code editor opens in the browser.
2. In the terminal at the bottom type, one line at a time:
   ```
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   python main.py
   python -m src.analysis
   python -m pytest -q
   ```
3. Look at the files in `data/` and `reports/charts/`. Right-click a file → **Download** to save a chart on your Pixelbook.
4. To run the website there: `cd frontend`, `npm install`, `npm run dev`, then click **Open in Browser** in the pop-up.
5. To save changes made in Codespaces, use the **Source Control** icon (left bar): type a message → **Commit** → **Sync Changes**.
6. When you finish: click the Codespaces menu (bottom-left) → **Stop Current Codespace**, so you don't use up the free monthly hours.

## Part 8 — Read before submission

- Open `README.md` and `reports/eda_summary.txt` and make sure you can explain every section.
- Read the "Viva preparation" section of the README and try answering the questions in your own words.
- Describe the results only as the generated files show them; don't claim findings you haven't seen.
