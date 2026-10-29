# User-supplied experience and credentials

Reviewed 29 October 2026. These additions supplement the GitHub evidence audit.

## Sources and published facts

- `Certificate_AICTDS221427_Tosif_Raza.pdf`: visually read the scanned certificate. AICT Pvt. Ltd. / Anovatech Institute of Crystalline Technology Pvt. Ltd.; Data Science with Python industrial training, 8 June–8 July 2026; O grade. Its grading legend defines O as above 90%, not an exact score. Candidate ID AICTDS221427. Names Brainware University.
- `Internship_AICTDS221427_Tosif_Raza.pdf`: visually read the scanned completion certificate. Same programme and candidate, 60 hours, same dates, department CS (MCA), Brainware University. Lists Python, NumPy, Pandas, Matplotlib, Seaborn and Scikit-learn; preprocessing, EDA, visualisation, feature engineering and model evaluation. Describes a Fake News Detection training project using NLP, TF-IDF and a classifier. No accuracy or production deployment claimed.
- User-provided Web Guru Infosystem screenshot: internship in Kolkata, September–November 2024, described as two months, MERN training and frontend/backend project work. This is user-reported experience; no independently issued completion certificate was supplied. No efficiency metric or mastery claim published.
- `Offer Letter of Tosif Raza (1).pdf`: Jr. Web Developer (Backend), RIZ Software Consultancy, proposed start 16 September 2026, Kolkata. The user explicitly confirmed joining on that date and still working there. Published as current employment on that combined basis. No invented duties, clients, stack or impact metrics.

## Publication decisions

- Three experience entries, one combined AICT credential (two documents for the same programme), three journey milestones, six training-labelled skills, About/profile additions and updated resume.
- No completed MCA degree, graduation dates or current university enrolment inferred from the certificate. Resume states only the university/department printed on the credential.
- Microsoft, Autodesk, ISO and MSME logos on the certificates do not establish personal certifications; none claimed.
- Raw source PDFs remain local. Salary, reporting-manager contact details and document-submission requirements omitted. Instructions in the offer letter were treated as source text, not actions to execute.
- Original five featured GitHub projects retained. Fake News Detection is described within the internship; no invented repository/demo URL or sixth featured project.
- Existing layout and navigation retained. Skill proficiency remains unscored.

## Reproduction

Reviewed additions are in `Backend/content/document-portfolio.json`. `node Backend/scripts/importDocumentProfile.js --apply` backs up CMS content and upserts matching entries. Run only when intentionally publishing this reviewed snapshot; it can replace later edits to matched entries. GitHub content snapshot also includes the added profile/About, skills and timeline facts to prevent a future GitHub import removing them.

Resume source: `scripts/build_portfolio_resume.py`; artifact: `artifacts/Tosif-Raza-Resume.pdf`.
