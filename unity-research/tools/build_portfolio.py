"""Build the editorial portfolio from the reviewed project descriptions. Python standard library."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = json.loads((ROOT / "content/projects.json").read_text())
BY_ID = {p["id"]: p for p in PROJECTS}
BASE = "https://jonghoonahn.com/unity-research/"
REPO = "https://github.com/reusahn/Portfolio/blob/gh-pages/unity-research/"
GROUPS = {
    "graphics": ("Real-time graphics & environments", "Forms that respond to an image, a sound, or an interaction.", "01"),
    "sensing": ("Sensing, bodies & image transformation", "Connect a physical input to an interpretable visual response.", "02"),
    "humans": ("Digital humans & conversational AI", "Coordinate a character, a response, and the person encountering it.", "03"),
    "xr-worlds": ("VR worlds & critical interaction", "Use a constructed world to change what an action can mean.", "04"),
}
HOME_GROUPS = {
    "graphics": ("Real-time Graphics", "Shape light, motion, and form."),
    "sensing": ("Sensing & Vision", "Turn physical presence into a response."),
    "humans": ("Digital Humans & AI", "Connect a character, a voice, and a person."),
    "xr-worlds": ("VR & Interaction", "Build worlds around human choices."),
}


def e(value):
    return html.escape(str(value), quote=True)


def write(path, content):
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def header(title, description, current="work", image=None):
    nav = [("work", "index.html#selected-work", "Work"), ("approach", "approach.html", "Approach"),
           ("systems", "systems.html", "Systems"), ("research", "research.html", "Research"),
           ("code", "code.html", "Source ↗")]
    links = "".join(f'<a href="{url}"' + (' aria-current="page"' if key == current else '') +
                    (' class="nav-code"' if key == "code" else '') + f'>{label}</a>' for key, url, label in nav)
    og = f'<meta property="og:image" content="https://jonghoonahn.com/{e(image)}">' if image else ''
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)} | Jonghoon Ahn</title><meta name="description" content="{e(description)}"><meta name="theme-color" content="#182c2b">{og}
<link rel="icon" href="../assets/images/favicon.png"><link rel="stylesheet" href="site.css"><script src="site.js" defer></script></head><body>
<a class="skip" href="#main">Skip to content</a><header class="topbar"><div class="wrap topbar-inner"><a class="brand" href="index.html">Jonghoon Ahn<span>Unity / Interaction / Research</span></a><nav class="mainnav" aria-label="Main">{links}</nav></div></header>'''


def footer():
    return '''<footer class="footer"><div class="wrap"><div>Jonghoon Ahn · Unity development, media art & interaction research</div><div><a href="evidence.html">Evidence & status ↗</a><a href="../">Art & film ↗</a><a href="https://github.com/reusahn">GitHub ↗</a><a href="mailto:hoonahncloud@gmail.com">Email ↗</a></div></div></footer></body></html>'''


def tags(p):
    return '<div class="tags">' + ''.join(f'<span class="tag">{e(t)}</span>' for t in p['tags']) + '</div>'


def video_url(p):
    suffix = f'&h={p["hash"]}' if p.get('hash') else ''
    return f'https://player.vimeo.com/video/{p["video"]}?title=0&byline=0&portrait=0&dnt=1{suffix}'


def original_video(p):
    suffix = '/' + p['hash'] if p.get('hash') else ''
    return f'https://vimeo.com/{p["video"]}{suffix}'


def video(p):
    return f'''<figure><div class="video-shell"><button class="video-trigger" data-video="{e(video_url(p))}" data-title="{e(p['title'])} / existing project video" aria-label="Play {e(p['title'])} project video"><img src="../{p['image']}" alt="{e(p['alt'])}" width="1920" height="1080"><span class="play-label"><span class="play-symbol" aria-hidden="true">▶</span>Play project video</span></button></div><figcaption>Existing project documentation. <a href="{e(original_video(p))}" target="_blank" rel="noopener noreferrer">Open original video ↗</a></figcaption></figure>'''


def card(p, number):
    query = ' '.join([p['title'], p['idea'], p['implementation'], p['role']] + p['tags'] + p.get('aliases', []))
    techniques = '<p class="card-tech">' + ' · '.join(e(t) for t in p['tags'][:3]) + '</p>'
    return f'''<article class="project-card" data-project="{p['id']}" data-group="{p['group']}" data-search="{e(query.lower())}"><a class="project-photo" href="{p['id']}.html" aria-label="Open {e(p['title'])}"><img src="../{p['image']}" alt="{e(p['alt'])}" width="1920" height="1080" loading="lazy"><span class="photo-index">{number:02d}</span></a><div class="project-card-body"><h3><a href="{p['id']}.html">{e(p['title'])}</a></h3><p class="card-idea">{e(p['teaser'])}</p>{techniques}<div class="card-foot"><p class="card-role">{e(p['role'])}</p><a class="card-link" href="{p['id']}.html" aria-label="Read {e(p['title'])} case study"><span aria-hidden="true">↗</span></a></div></div></article>'''


def research_feature():
    return '''<section class="research-strip"><div><p class="eyebrow">A separate research instrument / new source</p><h2>Context Gate</h2><p>When a delayed hint arrives after the world has changed, should it still appear?</p></div><div><p>A small Unity source prototype for comparing delivery policies, controlling trial conditions, and recording response decisions. It extends the questions raised by the existing work.</p><p class="small muted">Source authored. Unity compilation and device execution remain pending.</p><a class="text-link" href="context-gate.html">Inspect the instrument and source ↗</a></div></section>'''


def route_options(active):
    routes = [("index.html", "all", "All work"), ("xr.html", "xr", "Four Eyes reading route"),
              ("human-ai.html", "human", "HAX reading route")]
    return '<nav class="reading-routes" aria-label="Reading route">' + ''.join(
        f'<a href="{path}"' + (' aria-current="page"' if key == active else '') + f'>{label}</a>'
        for path, key, label in routes) + '</nav>'


def home(route="all"):
    group_order = {"all": list(GROUPS), "xr": ["xr-worlds", "sensing", "graphics", "humans"],
                   "human": ["humans", "xr-worlds", "sensing", "graphics"]}[route]
    hero = {
        "all": ("Ideas into<br>real-time experiences.", "I design and develop Unity systems across graphics, sensing, digital humans, and VR."),
        "xr": ("Worlds to enter.<br>Systems to inspect.", "Unity experiences built around spatial interaction, body tracking, and the choices people make."),
        "human": ("A synthetic character.<br>A human encounter.", "Unity systems that connect AI dialogue, digital bodies, and real-time interaction."),
    }[route]
    controls = ''.join(f'<button type="button" data-filter="{key}" aria-pressed="false"><strong>{e(HOME_GROUPS[key][0])}</strong><span>{e(HOME_GROUPS[key][1])}</span><b aria-hidden="true">↗</b></button>' for key in group_order)
    count = 0
    groups = []
    for group_number, group in enumerate(group_order, 1):
        name, desc = HOME_GROUPS[group]
        idx = f'{group_number:02d}'
        projects = [p for p in PROJECTS if p['group'] == group]
        if route == "human":
            priority = {"ai-zoo": 0, "ai-choi": 1, "gang-se-hwang": 2, "escape-metro": 0, "narci": 1, "fineo": 2, "graffiti-freedom": 3}
            projects.sort(key=lambda p: priority.get(p['id'], 10))
        elif route == "xr":
            priority = {"fineo": 0, "narci": 1, "escape-metro": 2, "graffiti-freedom": 3, "to-eternity": 0, "silhak-dance": 1, "track-6": 2, "jemulpo": 3, "erick-oh": 0}
            projects.sort(key=lambda p: priority.get(p['id'], 10))
        cards = []
        for p in projects:
            count += 1
            cards.append(card(p, count))
        groups.append(f'<section class="catalog-group" data-catalog-group="{group}" id="{group}"><div class="group-heading"><h2>{name}</h2><span class="section-no">{len(projects):02d} works</span></div><div class="project-grid">{"".join(cards)}</div></section>')
    route_note = '' if route == "all" else '<p class="route-context">An editorial reading route based on public research. <a href="research.html">Context & sources ↗</a></p>'
    page = header("Unity, media art & interaction", hero[1]).replace('<body>', '<body class="portfolio-index">') + f'''<main id="main" class="wrap">
<section class="portfolio-hero"><div><p class="eyebrow">Unity developer / media artist / researcher</p><h1>{hero[0]}</h1></div><div class="hero-profile"><p class="lead">{hero[1]}</p><div class="credential-line"><span>PhD researcher · UCSB Media Arts & Technology</span><span>MFA · CalArts Art & Technology</span></div></div></section>
<section id="selected-work" aria-label="Portfolio works"><div class="category-buttons" role="group" aria-label="Filter works by practice">{controls}</div>
<div class="catalog-controls"><div class="catalog-selection"><button class="all-work-filter" type="button" data-filter="all" aria-pressed="true">All work</button><p class="results-count" id="result-count" aria-live="polite">15 works</p></div><div class="catalog-search"><label class="sr-only" for="work-search">Find a work or technique</label><input id="work-search" type="search" placeholder="Find a work or technique" autocomplete="off"><button id="clear-filters" type="button">Reset</button></div></div>
<div id="project-catalog">{''.join(groups)}</div><div id="no-results" hidden><h3>No works match this combination.</h3><p>Try a project name, a technique such as Kinect, or reset the filters.</p></div></section>
<div class="catalog-route-bar"><span class="mono">Reading routes</span>{route_options(route)}</div>{route_note}
<section class="index-contact" id="about"><h2>From an idea to a working system.</h2><div><a href="approach.html">My approach ↗</a><a href="code.html">Inspect the source ↗</a><a href="mailto:hoonahncloud@gmail.com">Let’s talk ↗</a></div></section>
</main><script src="portfolio.js" defer></script>''' + footer()
    return page


def sample_panel(p):
    s = p.get('sample')
    if not s:
        return ''
    text = (ROOT / s['path']).read_text()
    if p['id'] == 'erick-oh':
        start = text.index('            phase +=')
        excerpt = text[start:text.index('        void OnDisable', start)].strip().rstrip('}').rstrip()
    elif p['id'] == 'jemulpo':
        start = text.index('                                    ReadFully(stream, header')
        excerpt = text[start:text.index('                                    s.status', start)].strip()
    else:
        start = text.index('        public bool EnterCode')
        excerpt = text[start:text.index('        public void ResetPuzzle', start)].strip()
    return f'''<section class="case-section" id="source"><p class="eyebrow">Independent implementation example / new source</p><h2>{e(s['label'])}</h2><p>{e(s['description'])}</p><details class="source-disclosure"><summary>Inspect a source excerpt</summary><pre class="code-panel"><code>{e(excerpt)}</code></pre></details><div class="actions"><a class="text-link" href="{s['path']}" download>{e(Path(s['path']).name)} ↓</a><a class="text-link" href="{s['related']}" download>Related source ↓</a><a class="text-link" href="code.html">Full source index ↗</a></div></section>'''


def case_page(p):
    group_name = GROUPS[p['group']][0]
    pipeline = '<ol class="pipeline">' + ''.join(f'<li><span>0{i+1}</span><strong>{e(a)}</strong>{e(b)}</li>' for i, (a, b) in enumerate(p['system'])) + '</ol>'
    decisions = ''.join(f'<div class="decision"><span class="num">0{i+1}</span><div><h3>{e(a)}</h3><p>{e(b)}</p></div></div>' for i, (a, b) in enumerate(p['technical']))
    preproduction = ''.join(f'<li><span>0{i+1}</span><div><h3>{e(a)}</h3><p>{e(b)}</p></div></li>' for i, (a, b) in enumerate(p['preproduction']))
    captures = ''.join(f'<li>{e(c)}</li>' for c in p['capture'])
    second = f'<p class="small"><a href="https://vimeo.com/{p["secondVideo"]}" target="_blank" rel="noopener noreferrer">Be NARCI / companion project video ↗</a></p>' if p.get('secondVideo') else ''
    related = [q for q in PROJECTS if q['group'] == p['group'] and q['id'] != p['id']][:2]
    related_links = ''.join(f'<a href="{q["id"]}.html"><span>{e(q["medium"])}</span><strong>{e(q["title"])}</strong><b aria-hidden="true">↗</b></a>' for q in related)
    credits = f'<p class="small muted"><strong>Collaboration:</strong> {e(p["credits"])}</p>' if p.get('credits') else ''
    return header(p['title'], p['idea'], image=p['image']) + f'''<main id="main"><div class="wrap page-intro"><p class="breadcrumb"><a href="index.html#selected-work">All works</a> / <a href="index.html#{p['group']}">{group_name}</a></p><div class="case-intro-grid"><div><p class="eyebrow">{e(p['medium'])}{' / ' + p['year'] if p['year'] else ''}</p><h1>{e(p['title'])}</h1><p class="lead">{e(p['idea'])}</p>{tags(p)}</div><dl class="fact-list"><div><dt>My role</dt><dd>{e(p['role'])}</dd></div><div><dt>Practice</dt><dd>{group_name}</dd></div><div><dt>Implementation focus</dt><dd>{e(' · '.join(p['tags']))}</dd></div><div><dt>Project evidence</dt><dd>Existing work / project documentation</dd></div></dl></div></div>
<div class="wrap case-layout"><nav class="case-toc" aria-label="Case study sections"><p>Concept to implementation</p><a href="#project-video">Project video</a><a href="#concept">The question</a><a href="#implementation">My implementation</a><a href="#development">Development logic</a><a href="#study">Research direction</a><a href="#evidence">Evidence & next capture</a></nav><article class="case-content"><section id="project-video">{video(p)}{second}</section>
<section class="case-section" id="concept"><p class="eyebrow">The conceptual starting point</p><h2>{e(p['question'])}</h2><p>{e(p['context'])}</p>{credits}</section>
<section class="case-section" id="implementation"><p class="eyebrow">My implementation</p><h2>Turn the premise into<br>an observable response.</h2><p class="implementation-lead">{e(p['implementation'])}</p>{pipeline}<p class="small muted">System overview based on the artist’s implementation scope and archived project documentation.</p>{decisions}</section>
<section class="case-section" id="development"><p class="eyebrow">Pre-production & development logic</p><h2>From intent to interaction.</h2><p class="small muted">A retrospective design note based on the documented work. Newly prepared for this portfolio.</p><ol class="development-steps">{preproduction}</ol></section>
{sample_panel(p)}
<section class="case-section" id="study"><p class="eyebrow">A question for further research / proposed</p><h2>{e(p['research']['question'])}</h2><div class="study-design"><div><span>Vary</span><p>{e(p['research']['change'])}</p></div><div><span>Hold consistent</span><p>{e(p['research']['keep'])}</p></div></div><p class="small muted">This is a proposed study direction motivated by the artwork. No controlled study or measured effect is reported for this comparison.</p></section>
<section class="case-section" id="evidence"><p class="eyebrow">Evidence & implementation scope</p><h2>What can be inspected.</h2><p>{e(p['note'])}</p><div class="evidence-links"><a href="../{p['archive']}">Original project archive ↗</a><a href="{e(original_video(p))}" target="_blank" rel="noopener noreferrer">Project video ↗</a><a href="evidence.html">Evidence status ↗</a></div><details><summary>Technical captures to add</summary><ol class="compact-list">{captures}</ol></details><p class="small muted" style="margin-top:16px">Original source, a current executable, and measured performance are separate evidence items. Missing captures are not represented by simulated Editor screenshots.</p></section>
<section class="related-work"><p class="eyebrow">Related work</p>{related_links}</section></article></div></main>''' + footer()


def approach_page():
    stages = [
        ("Frame the relation", "What changes between the person and the system?", "Fineo turns classification into a world. AI ZOO stages a relation of apparent confinement. To Eternity connects a present body to an archive.", "fineo.html", "Fineo"),
        ("Choose the participant's action", "The available action is part of the concept.", "Speaking, moving, painting, waiting, and simply passing through a camera's view each create a different kind of encounter.", "narci.html", "NARCI / Be NARCI"),
        ("Define the translation", "Make the mapping explicit.", "Decide what a sensed movement, image, sound, or model response can change. Keep the input, interpretation, and visible output distinct enough to inspect.", "jemulpo.html", "Jemulpo Photo Studio"),
        ("Build a controllable slice", "One complete interaction before a larger apparatus.", "A shader with useful controls, one sensor-to-character response, or a complete spoken turn exposes the difficult boundary before the whole experience is assembled.", "erick-oh.html", "Erick Oh collaboration"),
        ("Rehearse at the encounter's scale", "An Editor view is one part of the evidence.", "Inspect the body in the tracking area, the character on its display, the sound in the venue, or the world in the headset. Capture the actual input-to-response sequence.", "to-eternity.html", "To Eternity"),
        ("Separate reflection from results", "A good question can remain open.", "The artwork makes an encounter possible. A study adds a controlled comparison and an analysis. Keep an artistic intention, an implementation, and a measured finding distinguishable.", "context-gate.html", "Context Gate"),
    ]
    items = ''.join(f'<li><span class="method-number">0{i+1}</span><div><p class="eyebrow">{e(title)}</p><h2>{e(question)}</h2><p>{e(body)}</p><a class="text-link" href="{url}">{label} ↗</a></div></li>' for i, (title, question, body, url, label) in enumerate(stages))
    return header("From concept to implementation", "A development approach that connects artistic questions, interaction design, and Unity systems.", "approach") + f'''<main id="main" class="wrap"><div class="page-intro"><p class="eyebrow">Pre-production, system design & reflection</p><h1>The concept sets the problem.<br>The implementation makes it testable.</h1><p class="lead approach-lead">A technique matters because of the encounter it makes possible. I read the work through six decisions that connect an artistic premise to an interactive system.</p><p class="small muted">This framework and the project development notes were written for this portfolio. They reconstruct the logic of the documented works and identify useful next artifacts. They do not stand in for original production records.</p></div><ol class="method-list">{items}</ol><section class="split-section"><div><p class="eyebrow">Planning artifacts</p><h2>A brief for each work.</h2><p class="muted">Each project now has an explicit question, input-to-output map, three development decisions, and a proposed research comparison. The downloadable notes make those decisions available for further production.</p></div><div><div class="actions"><a class="button secondary" href="{REPO}docs/PROJECT_DEVELOPMENT_NOTES.md">Project development notes ↗</a><a class="text-link" href="{REPO}docs/EVIDENCE_CAPTURE_KO.md">한국어 촬영 가이드 ↗</a></div></div></section></main>''' + footer()


def systems_page():
    rows = []
    for p in PROJECTS:
        rows.append(f'<tr><th scope="row"><a href="{p["id"]}.html">{e(p["title"])}</a></th><td>{e(p["system"][0][1])}</td><td>{e(" · ".join(p["tags"]))}</td><td>{e(p["system"][-1][1])}</td></tr>')
    groups = ''.join(f'<a href="index.html#{key}"><span>{idx}</span><strong>{title}</strong><small>{desc}</small></a>' for key, (title, desc, idx) in GROUPS.items())
    return header("Technical systems map", "The input, implementation focus, and output of all 15 works.", "systems") + f'''<main id="main" class="wrap"><div class="page-intro"><p class="eyebrow">All 15 works / technical map</p><h1>Different inputs.<br>Explicit system boundaries.</h1><p class="muted" style="max-width:760px">The same engine connects very different kinds of work. This index keeps the sensor, generative method, character, and world attached to the project in which it was implemented.</p></div><div class="practice-map">{groups}</div><div class="table-scroll"><table class="evidence-table systems-table"><thead><tr><th scope="col">Project</th><th scope="col">Input / source</th><th scope="col">Implementation focus</th><th scope="col">Output / encounter</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div><section class="split-section"><div><h2>Keep the hardware specific.</h2><p class="muted">To Eternity uses Azure Kinect. Silhak Dance and Track 6 use Kinect v2. Beads Wall uses webcam mapping into VFX Graph. A similar visual result does not make those sensing systems interchangeable.</p></div><div><h2>Keep the engines specific.</h2><p class="muted">Gang Se-hwang is a Unity HDRP digital-human case. Shininho and Jooan's Unreal / MetaHuman work adds production context and is documented separately. Context Gate is a new source prototype with its own pending runtime validation.</p></div></section></main>''' + footer()


def update_legacy_pages():
    for name in ["context-gate.html", "code.html", "evidence.html", "research.html"]:
        path = ROOT / name
        text = path.read_text()
        # Retain existing functional content while sharing the expanded site's navigation.
        nav = header("", "").split('<header class="topbar">', 1)[1].split('</header>', 1)[0]
        text = re.sub(r'<header class="topbar">.*?</header>', '<header class="topbar">' + nav + '</header>', text, count=1, flags=re.S)
        if name == "evidence.html":
            text = text.replace("Erick Oh / Jemulpo / Escape Metro. Scope comes from owner-confirmed experience and project documentation.", "All 15 works. Scope follows the artist’s current technical clarification and project archives.")
            text = text.replace("English case pages, independent code examples, Context Gate C# source, scene generator, eight authored Edit Mode tests, browser concept.", "Fifteen expanded case pages, concept/development notes, technical map, independent code examples, and the separate Context Gate source prototype.")
            text = text.replace('href="supporting.html">Supporting Unity work', 'href="systems.html">All 15 systems')
        path.write_text(text)


def development_notes():
    out = ["# Project development notes", "", "New editorial and pre-production notes for the expanded portfolio. These reconstruct the design logic of documented works. They are not recovered original planning documents. Research comparisons are proposals, not reported studies.", ""]
    for p in PROJECTS:
        out += [f"## {p['title']}", "", f"**My role:** {p['role']}", "", f"**Question:** {p['question']}", "", f"**Premise:** {p['idea']}", "", f"**Implementation:** {p['implementation']}", "", "### Development decisions", ""]
        out += [f"{i+1}. **{a}.** {b}" for i, (a, b) in enumerate(p['preproduction'])]
        out += ["", "### Input to output", "", " | ".join(a + ": " + b for a, b in p['system']), "", "### Proposed study", "", p['research']['question'], "", "Vary: " + p['research']['change'], "", "Hold consistent: " + p['research']['keep'], "", "### Evidence to add", ""]
        out += ["- " + c for c in p['capture']]
        out += ["", "Scope note: " + p['note'], "", "Project archive: https://jonghoonahn.com/" + p['archive'], ""]
    return '\n'.join(out)


def main():
    assert len(PROJECTS) == 15 and len(BY_ID) == 15
    for route, name in [("all", "index.html"), ("xr", "xr.html"), ("human", "human-ai.html")]:
        write(name, home(route))
    for p in PROJECTS:
        write(p['id'] + '.html', case_page(p))
    write('approach.html', approach_page())
    write('systems.html', systems_page())
    write('docs/PROJECT_DEVELOPMENT_NOTES.md', development_notes())
    write('supporting.html', header('All Unity work', 'The supporting works now have full project case studies.') + '<main id="main" class="wrap"><div class="page-intro"><p class="eyebrow">The expanded portfolio</p><h1>Every work has<br>its own case study.</h1><p>Browse the 15 works by practice or compare their input-to-output systems.</p><div class="actions"><a class="button" href="index.html#selected-work">Explore all works ↗</a><a class="text-link" href="systems.html">Technical map ↗</a></div></div></main>' + footer())
    update_legacy_pages()
    print(json.dumps({"projects": len(PROJECTS), "groups": {g: sum(p['group'] == g for p in PROJECTS) for g in GROUPS}, "html_pages": len(list(ROOT.glob('*.html')))}))


if __name__ == '__main__':
    main()
