"""Create a resume from reviewed repositories and user-supplied credentials."""
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether, HRFlowable, PageBreak

ROOT = Path(__file__).resolve().parents[1]
content = json.loads((ROOT / 'Backend/content/github-portfolio.json').read_text(encoding='utf-8'))
profile = content['profile']
credentials = json.loads((ROOT / 'Backend/content/document-portfolio.json').read_text(encoding='utf-8'))
output = ROOT / 'artifacts/Tosif-Raza-Resume.pdf'
output.parent.mkdir(exist_ok=True)
navy = colors.HexColor('#10233f')
blue = colors.HexColor('#1761b6')
muted = colors.HexColor('#475569')
styles = {
    'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=25, leading=29, textColor=navy),
    'role': ParagraphStyle('role', fontName='Helvetica', fontSize=12, leading=17, textColor=blue),
    'contact': ParagraphStyle('contact', fontName='Helvetica', fontSize=8.5, leading=13, textColor=muted),
    'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=10, leading=14, spaceBefore=13, spaceAfter=6, textColor=blue),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.1, leading=13, textColor=navy),
    'project': ParagraphStyle('project', fontName='Helvetica-Bold', fontSize=10, leading=14, textColor=navy),
    'stack': ParagraphStyle('stack', fontName='Helvetica', fontSize=8, leading=11, textColor=muted),
}

def p(text, style='body'):
    return Paragraph(text, styles[style])

story = [p(escape(profile['name']), 'name'), p(escape(profile['title']), 'role'), Spacer(1, 6)]
story.append(p(f"{escape(profile['location'])}  |  <link href='mailto:{profile['email']}'>{escape(profile['email'])}</link>", 'contact'))
story.append(p("<link href='https://github.com/TosifRaza'>github.com/TosifRaza</link>  |  <link href='https://tosif.site/'>tosif.site</link>", 'contact'))
story.extend([Spacer(1, 10), HRFlowable(width='100%', thickness=1, color=colors.HexColor('#dbe5f0'))])
story.extend([p('PROFILE', 'section'), p(escape(profile['shortBio']))])
story.append(p('EXPERIENCE', 'section'))
for job in credentials['experience']:
    dates = job['startDate'] + ' - ' + ('Present' if job['current'] else job['endDate'])
    block = [p(escape(job['role']), 'project'),
             p(escape(job['company']), 'stack'),
             p(escape(dates + (' | ' + job['location'] if job['location'] else '')), 'stack'),
             p(escape(job['description']))]
    block.extend(p(escape(item)) for item in job['achievements'])
    block.append(Spacer(1, 7))
    story.append(KeepTogether(block))
story.append(p('CERTIFICATION', 'section'))
story.append(p('Data Science with Python | AICT Pvt. Ltd.', 'project'))
story.append(p('8 June - 8 July 2026 | 60 hours | O grade (above 90%)', 'body'))
story.append(p('Credential: AICTDS221427. Certificate lists Brainware University, CS (MCA).', 'stack'))
story.append(p('TECHNICAL SKILLS', 'section'))
groups = {
    'Frontend': 'JavaScript, React, HTML & CSS, Tailwind CSS, Redux Toolkit, React Router, Recharts',
    'Backend & data': 'Node.js, Express, REST APIs, JWT authentication, Socket.IO, MongoDB, Mongoose',
    'Tools & integrations': 'Vite, Git, GitHub; Razorpay integration code in KING\'S TEA',
}
for label, value in groups.items():
    story.append(p(f'<b>{escape(label)}:</b> {escape(value)}'))
story.append(p('<b>Data science training:</b> Python, NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn; NLP and TF-IDF in a Fake News Detection training project.'))

story.append(PageBreak())
story.append(p('SELECTED PROJECTS', 'section'))
summaries = {
    'StoreX': 'Business management application with inventory, point of sale, sales and purchasing workflows. The Express backend uses tenant-scoped access and MongoDB sessions for related sales records.',
    'kings-tea': 'Tea storefront and separate admin portal with catalogue, cart, orders and editable site content. Includes server-priced checkout, COD and Razorpay integration; online payments require merchant configuration.',
    'skillbridge-client': 'Customer, worker and admin interfaces with Redux-managed state. The Express backend handles job applications and reviews; Socket.IO supports messaging, typing indicators and read receipts.',
    'Tosif-Portfolio': 'MERN portfolio with an admin CMS and JWT-protected personal workspace for goals, tasks, time tracking and learning. Public content and private activity records are stored in MongoDB.',
    'kings-tutor': 'Frontend prototype for student enrolment, tutor discovery and admin lead workflows. Uses React routes, reusable components and a service layer. Interactions use mock data/localStorage; no live backend or payments.',
}
for project in content['projects']:
    source = f"<link href='{project['githubUrl']}' color='#1761b6'>Source code</link>"
    if project['repo'] == 'skillbridge-client':
        source += " / <link href='https://github.com/TosifRaza/skillbridge-server' color='#1761b6'>Backend</link>"
    block = [p(f"{escape(project['title'])} <font name='Helvetica' size='8'> | {source}</font>", 'project'),
             p(escape(summaries[project['repo']])),
             p(escape(' / '.join(project['stack'][:6])), 'stack'), Spacer(1, 9)]
    story.append(KeepTogether(block))

doc = SimpleDocTemplate(str(output), pagesize=A4, leftMargin=42, rightMargin=42, topMargin=35, bottomMargin=33,
                        title='Tosif Raza - Full-Stack JavaScript Developer', author='Tosif Raza')
doc.build(story)
print(output)
