# Turning on phone notifications (one-time setup, ~5 minutes)

The app itself works as soon as this folder is uploaded (install it from the **Alerts** tab).
Notifications need one extra step: a small free GitHub job that checks the leagues every ~10 minutes and sends the alerts.

## 1. Upload everything in this folder to the `best3-hoops` repo
Including the `notify/` folder and the `.github/workflows/notify.yml` file.

> If your uploader can't add `.github/workflows/notify.yml` (GitHub needs special permission for workflow files):
> on github.com open the repo → **Add file → Create new file** → name it `.github/workflows/notify.yml` → paste the contents of that file → **Commit**.

## 2. Add the two secret keys
github.com → the `best3-hoops` repo → **Settings → Secrets and variables → Actions → New repository secret**
- Name `VAPID_PUBLIC` → value from the separate keys file Claude gave you
- Name `VAPID_PRIVATE` → value from the separate keys file Claude gave you

(Never upload the keys file itself — it stays private.)

## 3. Turn it on
Repo → **Actions** tab → if asked, click **"I understand my workflows, go ahead and enable them"** →
pick **Best of 3 notifications** → **Run workflow** once to test. After that it runs by itself every ~10 minutes.

## 4. On each phone
Open the site → **Alerts** tab → install the app → **Turn on notifications** → pick which alerts you want.
- **iPhone:** must be added to the Home Screen first (Safari → Share → Add to Home Screen) and opened from there (iOS 16.4+).
- **Android:** Chrome → Install app, then turn on notifications.

### Good to know
- GitHub pauses scheduled jobs if the repo has no commits for 60 days — any upload restarts it (or click Run workflow).
- Alerts can arrive up to ~10–15 minutes after something happens (GitHub's schedule isn't exact).
