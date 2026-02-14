# JD Analysis – Verification Steps

## 1. Confirm skill extraction

- Go to **Dashboard → Analyze** (or `/dashboard/analyze`).
- Paste the sample JD below (or any JD containing the keywords).
- Click **Analyze**.
- On **Results**, open the **Key skills extracted** card:
  - You should see tags grouped by category, e.g. **Core CS:** DSA, OOP | **Languages:** Java, Python | **Web:** React, Node.js, Express, REST | **Data:** SQL, MongoDB | **Cloud/DevOps:** AWS, Docker, Kubernetes | **Testing:** JUnit.
- If the JD contains **none** of the defined keywords, the card should show **"General fresher stack"**.

## 2. Confirm history persists after refresh

- After running an analysis, go to **Dashboard → History** (or `/dashboard/history`).
- You should see the new entry with **date**, **company**, **role**, and **score**.
- Refresh the page (F5 or Ctrl+R). The same list should still be there (localStorage).
- Click an entry: it should open **Results** with that analysis (URL like `/dashboard/results?id=pp-...`).
- Open **Results** with no `id` (e.g. `/dashboard/results`): it should show the **latest** analysis.

## 3. Sample JD (copy-paste for testing)

```
Company: TechCorp India
Role: Full Stack Developer (Fresher)

We are looking for a Full Stack Developer with strong fundamentals in DSA, OOP, and DBMS.
You will work with Java and Python on the backend, and React and JavaScript on the frontend.
Experience with Node.js, Express, REST APIs, and SQL/MySQL is required. Knowledge of MongoDB,
PostgreSQL, and Redis is a plus. You should be comfortable with AWS, Docker, and Kubernetes.
We use CI/CD and Linux in our pipeline. Testing experience with JUnit and Selenium is preferred.

Requirements:
- Strong problem-solving and DSA skills (arrays, trees, graphs).
- Good grasp of OS and Networks basics.
- Ability to write clean code and unit tests.
- Good communication skills.

Nice to have: TypeScript, Next.js, GraphQL, Azure, GCP, Cypress, Playwright, PyTest.
```

Expected: **Core CS** (DSA, OOP, DBMS, OS, Networks), **Languages** (Java, Python, JavaScript, TypeScript), **Web** (React, Node.js, Express, REST, GraphQL), **Data** (SQL, MySQL, MongoDB, PostgreSQL, Redis), **Cloud/DevOps** (AWS, Docker, Kubernetes, CI/CD, Linux), **Testing** (JUnit, Selenium, Cypress, Playwright, PyTest). Readiness score: 35 + 30 (6 categories) + 10 (company) + 10 (role) + 10 (JD > 800 chars) = **95** (capped at 100).

## 4. Quick checklist

- [ ] Skill extraction shows correct categories and tags for the sample JD.
- [ ] Empty/minimal JD shows "General fresher stack".
- [ ] History lists entries with date, company, role, score.
- [ ] After refresh, history list is unchanged.
- [ ] Clicking a history entry opens Results with that entry.
- [ ] Results shows: Readiness score, Key skills, Round-wise checklist, 7-day plan, 10 questions.
- [ ] No external APIs; everything works offline.

---

## 5. Interactive results & export (verification)

### Live readiness score
- Open **Results** for an analysis that has extracted skills.
- In **Key skills extracted**, each skill has two buttons: **I know** and **Practice** (default: Practice).
- Click **I know** on one or more skills: the **Readiness score** (circular gauge) should **increase by +2 per skill** in real time.
- Click **Practice** (or switch back from I know): the score should **decrease by -2 per skill**. Score stays between 0 and 100.
- Confirm the number in the center of the circle matches the described formula.

### Toggles persist after refresh
- On **Results**, change a few skills to **I know** and a few to **Practice**. Note the readiness score.
- Refresh the page (F5). Re-open the same result (from **History** or same URL with `?id=...`).
- Confirm: skill toggles are still **I know** / **Practice** as set, and the readiness score is unchanged.
- Confirm: **History** list shows the **updated** readiness score for that entry (the one you changed on Results).

### Export tools
- On **Results**, find the **Export** card.
- **Copy 7-day plan**: click → paste in Notepad; you should see the 7-day plan as plain text.
- **Copy round checklist**: click → paste; you should see all rounds and bullet items.
- **Copy 10 questions**: click → paste; you should see the 10 questions numbered.
- **Download as TXT**: click → a `.txt` file downloads with all sections (score, checklist, plan, questions). Open it and confirm content.

### Action next box
- At the bottom of **Results**, find the **Action next** card.
- With default toggles (all **Practice**), it should list **top 3 weak skills** (first 3 from your extracted skills) and the line: **Start Day 1 plan now.**
- Mark all skills as **I know**: the box should show “All extracted skills are marked as known…” and still suggest **Start Day 1 plan now.**

---

## 6. Company Intel & Round Mapping (verification)

### Company intel renders correctly
- Run an analysis **with a company name** (e.g. **Infosys** or **Amazon**). Open **Results**.
- You should see a **Company intel** card with: **Company name**, **Industry** (e.g. Technology Services or inferred), **Estimated size** (Enterprise (2000+) for known names).
- **Typical hiring focus**: Enterprise = "Structured DSA and core CS fundamentals"; Startup = "Practical problem-solving and stack depth."
- Note at bottom: **"Demo Mode: Company intel generated heuristically."**
- Analysis **without** company: Company intel card does **not** appear.

### Round mapping changes by company + skills
- **Enterprise + DSA** (e.g. Company: TCS, JD with DSA): 4 rounds — Online Test (DSA + Aptitude), Technical (DSA + Core CS), Tech + Projects, HR. Each round has a **Why this round matters** line.
- **Startup + React/Node** (e.g. Company: MyStartup or empty, JD with React, Node.js): 3 rounds — Practical coding, System discussion, Culture fit.
- **No company, DSA in JD**: Round mapping still shows (default startup flow), e.g. Coding (DSA + basics), Technical + Projects, Culture fit.

### Test scenarios

| Company   | JD focus           | Expected size   | Round style                          |
|-----------|--------------------|-----------------|--------------------------------------|
| Infosys   | DSA, Java, SQL     | Enterprise 2000+ | 4 rounds: Online Test to Tech to HR |
| (empty)   | React, Node, Express | (no intel)    | 3 rounds: Practical to Culture      |
| (empty)   | DSA, Python        | (no intel)    | 3 rounds: Coding to Culture          |

### Persist and demo note
- Reopen from **History**: Company intel and round mapping still present (stored in entry).
- Demo note appears under Company intel and under Round mapping.

---

## 7. Data model, validation, and edge cases (verification)

### Schema consistency
- Every new analysis saves an entry with: **id**, **createdAt**, **company** (string, empty if not provided), **role** (string, empty if not), **jdText**, **extractedSkills** (coreCS, languages, web, data, cloud, testing, other), **roundMapping** (roundTitle, focusAreas, whyItMatters), **checklist** (roundTitle, items), **plan7Days** (day, focus, tasks), **questions**, **baseScore**, **skillConfidenceMap**, **finalScore**, **updatedAt**.
- **History** and **Results** read migrated entries; legacy entries are normalized to this shape when loaded.

### Input validation (Analyze page)
- **JD textarea** is **required** (submit disabled when empty).
- When JD length is **&lt; 200 characters** (and not empty), a calm **warning** appears: *"This JD is too short to analyze deeply. Paste full JD for better output."* (amber box). Submit is still allowed.
- **Company** and **Role** remain optional.

### Default when no skills detected
- Run analysis with a JD that contains **none** of the defined keywords (e.g. only "We want a fresher").
- On **Results**, **Key skills extracted** should show **Other**: Communication, Problem solving, Basic coding, Projects.
- **Checklist**, **7-day plan**, and **10 questions** should still appear (generic/fresher content).

### Score stability
- **baseScore** is set once at analyze time and never changed when toggling skills.
- **finalScore** is the displayed readiness score; it changes only when the user toggles skills (**I know** / **Practice**). Formula: baseScore + 2×(know count) − 2×(practice count), clamped 0–100.
- After toggling, **updatedAt** and **finalScore** are persisted; reopening from **History** shows the updated score and toggles.

### History robustness
- If **localStorage** contains a **corrupted** or invalid entry (e.g. manually edit and break JSON or remove required fields), that entry is **skipped** when loading history.
- **History** page shows a banner: *"One saved entry couldn't be loaded. Create a new analysis."* (or *"X saved entries couldn't be loaded…"* if more than one). Valid entries still list and open correctly.

### Edge-case verification steps
1. **Short JD**: Paste &lt; 200 chars → see warning; submit → analysis runs; Results show (possibly "Other" skills only).
2. **Empty JD**: Submit is disabled (required field).
3. **No skills JD**: Paste JD with no keyword hits → Results show Other: Communication, Problem solving, Basic coding, Projects; plan/checklist/questions present.
4. **Corrupted history**: In DevTools → Application → Local Storage, change `placement-prep-history` so one array element is `{}` or invalid → reload History → banner appears; other entries still work.
5. **Toggle persistence**: Change skills on Results → refresh → reopen same result from History → toggles and finalScore unchanged.

---

## 8. Test checklist and ship lock (verification)

### Checklist stored in localStorage and persists
- Open **/prp/07-test** (Test Checklist page).
- Check one or more items. Refresh the page (F5): the same items stay checked.
- In DevTools → Application → Local Storage, confirm key **placement-prep-test-checklist** exists and value is a JSON array of 10 booleans.

### Ship is locked until checklist complete
- With **fewer than 10** items checked, open **/prp/08-ship**.
- You should see **"Ship locked"** and the message: *"Complete all 10 tests on the Test Checklist to unlock shipping."* with a **"Go to Test Checklist"** button.
- Go to **/prp/07-test**, check **all 10** items.
- Navigate to **/prp/08-ship** again: you should see **"Ready to ship"** and *"10 / 10 tests passed."* (Ship is unlocked.)

### Reset checklist
- On **/prp/07-test**, click **"Reset checklist"**.
- All 10 checkboxes become unchecked; **Tests Passed** shows **0 / 10**.
- **/prp/08-ship** should show locked again when you visit it.

### Verification steps
1. **Persistence**: Check a few items on /prp/07-test → refresh → checkboxes still checked.
2. **Lock**: Open /prp/08-ship with 0/10 or &lt;10 → locked UI; link to test page works.
3. **Unlock**: Check all 10 on /prp/07-test → go to /prp/08-ship → unlocked UI.
4. **Reset**: Reset checklist → confirm 0/10 and Ship locked again.
5. **Summary**: Test page shows "Tests Passed: X / 10" and, when X &lt; 10, "Fix issues before shipping."

---

## 9. Proof page and Shipped status (verification)

### Proof page works with URL validation
- Open **/prp/proof**.
- **Step completion overview**: 8 steps with checkboxes; each shows Completed / Pending. Check/uncheck and refresh; state persists (localStorage key **prp_final_submission**).
- **Artifact inputs**: Enter invalid text (e.g. `not-a-url`) in Lovable, GitHub, or Deployed URL and blur: red border and message *"Enter a valid URL (http:// or https://)."* Enter `https://example.com` and blur: error clears. All three fields require valid URLs for Shipped.

### Copy export produces correct formatted text
- Fill the 3 links (or leave some empty). Click **"Copy Final Submission"**.
- Paste into Notepad: you should see the exact block:
  - Line: `------------------------------------------`
  - **Placement Readiness Platform — Final Submission**
  - **Lovable Project:** {link}
  - **GitHub Repository:** {link}
  - **Live Deployment:** {link}
  - **Core Capabilities:** (bullet list)
  - Closing line: `------------------------------------------`
- If a link is empty, pasted text shows `(not set)` for that line.

### Shipped status only when all conditions met
- **Shipped** badge and completion message appear **only when**:
  1. All **10** test checklist items are checked (/prp/07-test),
  2. All **8** proof steps are checked (/prp/proof),
  3. All **3** proof links are valid URLs (/prp/proof).
- **In Progress**: Checklist 10/10 but either &lt;8 steps or &lt;3 valid links → Ship page shows badge **"In Progress"** and link to Proof.
- **Locked**: &lt;10 checklist items → Ship page shows **"Ship locked"** and link to Test Checklist (checklist lock is not bypassed).

### Completion message when Shipped
- When status is **Shipped**, the Ship page shows:
  - *"You built a real product."*
  - *"Not a tutorial. Not a clone."*
  - *"A structured tool that solves a real problem."*
  - *"This is your proof of work."*

### Verification steps
1. **Proof URL validation**: On /prp/proof, enter `foo` in Lovable URL, blur → error. Change to `https://x.com` → error clears.
2. **Proof persistence**: Check steps and enter links → refresh → data still there (prp_final_submission in localStorage).
3. **Copy Final Submission**: Click button → paste elsewhere → formatted block matches spec.
4. **In Progress**: 10/10 checklist, but 0 or 7 proof steps or missing links → /prp/08-ship shows **In Progress**.
5. **Shipped**: 10/10 checklist + 8/8 steps + 3 valid links → /prp/08-ship shows **Shipped** and completion message.
