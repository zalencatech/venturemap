# UPDATE GUIDE — apply the new 3D website to your existing GitHub repo (terminal)

Your repo already has files created by the GitHub Action (`data/`, `reports/`, `frontend/public/data/`).
This zip does NOT contain those, so copying it over your repo will not touch them.

## 1. Get your repo on the Pixelbook (skip if you already have it)
```bash
cd ~
git clone https://github.com/zalencatech/venturemap.git venturemap-repo
cd venturemap-repo
```
If you already have a local copy, `cd` into it and run `git pull` instead.

## 2. Extract the new zip into a temporary folder
```bash
cp /mnt/chromeos/MyFiles/Downloads/venturemap.zip ~/
mkdir -p ~/venturemap-new && cd ~/venturemap-new && unzip -o ~/venturemap.zip
```

## 3. Copy the new files over the repo
```bash
cd ~/venturemap-repo
rm -rf frontend/src
cp -r ~/venturemap-new/venturemap/frontend/src frontend/src
cp ~/venturemap-new/venturemap/frontend/{package.json,package-lock.json,vite.config.js,index.html} frontend/
cp ~/venturemap-new/venturemap/README.md ~/venturemap-new/venturemap/UPDATE_GUIDE.md .
```

## 4. (Optional) test it locally
```bash
cd frontend && npm install && npm run build && cd ..
```

## 5. Commit and push
```bash
git status            # should list frontend/src files, package.json, package-lock.json, README.md
git add -A
git commit -m "New 3D scroll website and Group Info page"
git push
```
Vercel redeploys automatically in about a minute. Hard-refresh the site with Ctrl + Shift + R.

If `git push` is rejected (the Action pushed new data in the meantime): run `git pull --rebase` and then `git push` again.
