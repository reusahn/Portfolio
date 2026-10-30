"""Build the editorial portfolio from the reviewed project descriptions. Python standard library."""
import html
import json
import re
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = json.loads((ROOT / "content/projects.json").read_text())
UNITY_DETAILS = json.loads((ROOT / "content/unity-details.json").read_text())
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
    navigation = '' if current == "home" else '<nav class="mainnav" aria-label="Main"><a href="index.html">All projects</a></nav>'
    og = f'<meta property="og:image" content="https://jonghoonahn.com/{e(image)}">' if image else ''
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)} | Jonghoon Ahn</title><meta name="description" content="{e(description)}"><meta name="theme-color" content="#182c2b">{og}
<link rel="icon" href="../assets/images/favicon.png"><link rel="stylesheet" href="site.css?v=compact-20261030"><script src="site.js" defer></script></head><body>
<a class="skip" href="#main">Skip to content</a><header class="topbar"><div class="wrap topbar-inner"><a class="brand" href="index.html">Jonghoon Ahn</a>{navigation}</div></header>'''


def footer():
    return '''<footer class="footer"><div class="wrap"><div>Jonghoon Ahn</div><div><a href="https://github.com/reusahn">GitHub ↗</a><a href="mailto:hoonahncloud@gmail.com">Email ↗</a></div></div></footer></body></html>'''


def tags(p):
    return '<div class="tags">' + ''.join(f'<span class="tag">{e(t)}</span>' for t in p['tags']) + '</div>'


def video_url(p):
    suffix = f'&h={p["hash"]}' if p.get('hash') else ''
    return f'https://player.vimeo.com/video/{p["video"]}?title=0&byline=0&portrait=0&dnt=1{suffix}'


def original_video(p):
    suffix = '/' + p['hash'] if p.get('hash') else ''
    return f'https://vimeo.com/{p["video"]}{suffix}'


def video(p):
    return f'''<div class="video-shell"><iframe src="{e(video_url(p))}" title="{e(p['title'])} — project video" width="1920" height="1080" loading="eager" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'''


def card(p, number):
    techniques = '<p class="card-tech">' + ' · '.join(e(t) for t in p['tags'][:3]) + '</p>'
    return f'''<article class="project-card" data-project="{p['id']}" data-group="{p['group']}"><a class="project-photo" href="{p['id']}.html" aria-label="Open {e(p['title'])}"><img src="../{p['image']}" alt="{e(p['alt'])}" width="1920" height="1080" loading="lazy"></a><div class="project-card-body"><h3><a href="{p['id']}.html">{e(p['title'])}</a></h3><p class="card-idea">{e(p['teaser'])}</p>{techniques}<p class="card-role">{e(p['role'])}</p></div></article>'''


def home(route="all"):
    group_order = {"all": ["xr-worlds", "sensing", "graphics", "humans"], "xr": ["xr-worlds", "sensing", "graphics", "humans"],
                   "human": ["humans", "xr-worlds", "sensing", "graphics"]}[route]
    description = "Unity-based projects by Jonghoon Ahn: VR, sensing, real-time graphics, and digital humans."
    controls = ''.join(f'<a href="#{key}">{e(HOME_GROUPS[key][0])}<span aria-hidden="true">↓</span></a>' for key in group_order)
    count = 0
    groups = []
    for group_number, group in enumerate(group_order, 1):
        name, desc = HOME_GROUPS[group]
        idx = f'{group_number:02d}'
        projects = [p for p in PROJECTS if p['group'] == group]
        if route == "human":
            priority = {"ai-zoo": 0, "ai-choi": 1, "gang-se-hwang": 2, "escape-metro": 0, "narci": 1, "fineo": 2, "graffiti-freedom": 3}
            projects.sort(key=lambda p: priority.get(p['id'], 10))
        elif route in ("all", "xr"):
            priority = {"narci": 0, "escape-metro": 1, "fineo": 2, "graffiti-freedom": 3, "to-eternity": 0, "silhak-dance": 1, "track-6": 2, "jemulpo": 3, "erick-oh": 0}
            projects.sort(key=lambda p: priority.get(p['id'], 10))
        cards = []
        for p in projects:
            count += 1
            cards.append(card(p, count))
        groups.append(f'<section class="catalog-group" data-catalog-group="{group}" id="{group}"><div class="group-heading"><h2>{name}</h2></div><div class="project-grid">{"".join(cards)}</div></section>')
    page = header("Unity-based projects", description, current="home").replace('<body>', '<body class="portfolio-index">') + f'''<main id="main" class="wrap">
<section class="portfolio-title"><h1>Unity-based projects</h1></section>
<section id="selected-work" aria-label="Portfolio works"><nav class="category-buttons" aria-label="Project categories">{controls}</nav>
<div id="project-catalog">{''.join(groups)}</div></section>
</main>''' + footer()
    return page


def sample_panel(p):
    s = p.get('sample')
    if not s:
        return ''
    text = (ROOT / s['path']).read_text()
    if p['id'] == 'erick-oh':
        start = text.index('            phase +=')
        end = text.index('            target.SetPropertyBlock(block);', start) + len('            target.SetPropertyBlock(block);')
        excerpt = textwrap.dedent(text[start:end]).strip()
    elif p['id'] == 'jemulpo':
        start = text.index('                                    ReadFully(stream, header')
        excerpt = textwrap.dedent(text[start:text.index('                                    s.status', start)]).strip()
    else:
        start = text.index('        public bool EnterCode')
        excerpt = textwrap.dedent(text[start:text.index('        public void ResetPuzzle', start)]).strip()
    shader = ''
    if p['id'] == 'erick-oh':
        shader_text = (ROOT / s['related']).read_text()
        start = shader_text.index('                float3 p=input.positionOS.xyz;')
        shader_excerpt = textwrap.dedent(shader_text[start:shader_text.index('                return o;', start)]).strip()
        shader = f'<h3 class="source-subheading">HLSL displacement</h3><pre class="code-panel"><code>{e(shader_excerpt)}</code></pre><p>This stylized example displaces vertices with noise and retains the original normals.</p>'
    reading_notes = {
        'erick-oh': [
            'SetFlow validates and clamps the direction. Update integrates it into a phase instead of resetting time or translating the object.',
            'MaterialPropertyBlock carries the flow, frequency, and amplitude to this renderer. The controller expands local bounds for the declared displacement range.',
            'This sample leaves collision geometry and displaced normals unchanged. Inspect those boundaries before reusing it for a task.'
        ],
        'jemulpo': [
            'ReadFully reconstructs a length-prefixed frame from the TCP byte stream. Partial reads are not treated as complete images.',
            'The bounded queue separates network reception from Unity main-thread texture work. Payload size and PNG dimensions are checked before display.',
            'This is a one-sender transport example. It contains no Barracuda model, style-transfer pipeline, UDP routing, or four-participant installation reconstruction.'
        ],
        'escape-metro': [
            'AcceptReply checks turn identity, epoch, timeout, text length, and an allowed presentation cue.',
            'EnterCode authorizes progression from puzzle evidence and the expected code. A model reply does not directly invoke the unlock event.',
            'ResetPuzzle advances the epoch and clears pending state so a reply from the previous puzzle cannot be accepted.'
        ]
    }
    notes = '<ul class="code-reading">' + ''.join('<li>' + e(item) + '</li>' for item in reading_notes[p['id']]) + '</ul>'
    description = {
        'erick-oh': 'C# updates per-renderer flow and deformation parameters. The simplified URP shader uses them for vertex displacement.',
        'jemulpo': 'A framed PNG receiver separates TCP reading from texture creation on Unity’s main thread.',
        'escape-metro': 'A reply validator and puzzle gate keep NPC text separate from game-authorized progression.'
    }[p['id']]
    return f'''<section class="case-section" id="source"><h2>Code example</h2><p>{e(description)}</p><div class="source-boundary">Independent example, not the original project source. Unity compilation and runtime verification remain pending.</div><p class="source-filename">{e(Path(s['path']).name)}</p><pre class="code-panel"><code>{e(excerpt)}</code></pre>{shader}<h3 class="source-subheading">Implementation notes</h3>{notes}<div class="actions"><a class="text-link" href="{s['path']}" download>{e(Path(s['path']).name)} ↓</a><a class="text-link" href="{s['related']}" download>Related source ↓</a><a class="text-link" href="{REPO}docs/UNITY_SETUP.md">Setup notes ↗</a></div></section>'''


def inspection_panel(p):
    check = p.get('engineering')
    if not check:
        return ''
    items = ''.join(f'<div><dt>{label}</dt><dd>{e(check[key])}</dd></div>' for key, label in [
        ('decision', 'Design decision'), ('failure', 'Failure case to exercise'),
        ('evidence', 'Observable evidence'), ('reuse', 'Reuse boundary')])
    return f'<details class="technical-notes"><summary>Verification and reuse notes</summary><p>These are newly prepared checks, not reported production incidents.</p><dl class="inspection-note">{items}</dl></details>'


def detail_figure(item):
    label = '<p class="reference-label">Illustrative reference · AI-generated</p>' if item['kind'] == 'reference' else ''
    return f'''<figure class="detail-figure {e(item['kind'])}" data-image-slot="{e(item['slot'])}">{label}<a href="{e(item['src'])}" target="_blank" rel="noopener noreferrer" aria-label="Open full-size image: {e(item['title'])}"><img src="{e(item['src'])}" alt="{e(item['alt'])}" loading="lazy" decoding="async" width="{item.get('width',1920)}" height="{item.get('height',1080)}"></a><figcaption>{e(item['caption'])}</figcaption></figure>'''


def unity_features(p):
    detail = UNITY_DETAILS[p['id']]
    images = detail['images']
    result = []
    for i, feature in enumerate(detail['features']):
        result.append(f'''<section class="unity-feature" aria-labelledby="feature-{i+1}"><h3 id="feature-{i+1}">{e(feature['title'])}</h3><p>{e(feature['body'])}</p></section>''')
        if i == 0:
            result.append(detail_figure(images[0]))
        if i == len(detail['features'])-1:
            result.extend(detail_figure(item) for item in images[1:])
    return ''.join(result)


def implementation_diagram(p):
    nodes = []
    for i, ((title, body), (x, y)) in enumerate(zip(p['system'], [(55,90),(675,90),(675,315),(55,315)])):
        lines = textwrap.wrap(body, width=39)
        label = ''.join(f'<tspan x="{x+25}" dy="{0 if j == 0 else 27}">{e(line)}</tspan>' for j, line in enumerate(lines))
        nodes.append(f'<g><rect x="{x}" y="{y}" width="470" height="145" rx="4" fill="#fdfcf8" stroke="#b9c7bf"/><text x="{x+25}" y="{y+27}" fill="#1a554a" font-size="14" font-family="monospace">0{i+1}</text><text x="{x+25}" y="{y+65}" fill="#182c2b" font-size="25" font-weight="600">{e(title)}</text><text x="{x+25}" y="{y+98}" fill="#596661" font-size="20">{label}</text></g>')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 535" role="img" aria-labelledby="title description"><title id="title">{e(p['title'])}: implementation map</title><desc id="description">{e(' → '.join(a + ': ' + b for a,b in p['system']))}. Editorial reconstruction, not an Editor capture.</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#1a554a"/></marker></defs><rect width="1200" height="535" fill="#e9ede6"/><g font-family="Arial,Helvetica,sans-serif"><text x="55" y="47" fill="#1a554a" font-size="16" letter-spacing="2">INPUT → PROCESS → RESPONSE → ENCOUNTER</text>{''.join(nodes)}<g fill="none" stroke="#1a554a" stroke-width="3" marker-end="url(#arrow)"><path d="M 545 163 H 653"/><path d="M 910 251 V 295"/><path d="M 653 388 H 545"/></g><text x="55" y="503" fill="#596661" font-size="15">Implementation map · prepared for this portfolio · not a Unity screenshot</text></g></svg>'''
    path = 'assets/diagrams/' + p['id'] + '.svg'
    write(path, svg)
    mobile = '<ol class="map-steps">' + ''.join(f'<li><span>0{i+1}</span><div><strong>{e(a)}</strong><p>{e(b)}</p></div></li>' for i,(a,b) in enumerate(p['system'])) + '</ol>'
    return f'<figure class="implementation-map"><img src="{path}" alt="{e(p["title"])} implementation map: {e(" to ".join(a for a,b in p["system"]))}" loading="lazy" width="1200" height="535">{mobile}<figcaption>System structure reconstructed from the documented implementation scope. Not an Editor capture or timing measurement.</figcaption></figure>'


def case_page(p):
    diagram = implementation_diagram(p)
    decisions = ''.join(f'<div class="decision"><h3>{e(a)}</h3><p>{e(b)}</p></div>' for a, b in p['technical'])
    preproduction = ''.join(f'<li><h3>{e(a)}</h3><p>{e(b)}</p></li>' for a, b in p['preproduction'])
    second = f'<p class="companion-video"><a href="https://vimeo.com/{p["secondVideo"]}" target="_blank" rel="noopener noreferrer">Be NARCI companion video ↗</a></p>' if p.get('secondVideo') else ''
    related = [q for q in PROJECTS if q['group'] == p['group'] and q['id'] != p['id']][:2]
    related_links = ''.join(f'<a href="{q["id"]}.html">{e(q["title"])} ↗</a>' for q in related)
    credits = f'<p><strong>Collaboration:</strong> {e(p["credits"])}</p>' if p.get('credits') else ''
    metadata = ' · '.join(e(x) for x in [p['year'], p['role']] if x)
    techniques = ' · '.join(e(x) for x in p['tags'])
    return header(p['title'], p['implementation'], image=p['image']).replace('<body>', '<body class="project-detail">') + f'''<main id="main" class="wrap detail-wrap">
<header class="project-heading"><h1>{e(p['title'])}</h1><p class="project-meta">{metadata}</p><p class="project-tools">{techniques}</p><p class="project-summary">{e(p['implementation'])}</p></header>
<article class="case-content"><section id="project-video">{video(p)}{second}</section>
<section class="case-section" id="implementation"><h2>Unity implementation</h2><div class="unity-feature-list">{unity_features(p)}</div></section>
<section class="case-section" id="structure"><h2>System & design decisions</h2>{diagram}{decisions}{inspection_panel(p)}</section>
{sample_panel(p)}
<section class="case-section" id="concept"><h2>Concept</h2><p class="case-question">{e(p['question'])}</p><p>{e(p['context'])}</p>{credits}</section>
<section class="case-section" id="development"><h2>Development</h2><p class="muted">Retrospective planning notes, prepared for this portfolio.</p><ol class="development-steps">{preproduction}</ol></section>
<section class="case-section" id="study"><details class="research-extension"><summary>Further research</summary><p class="case-question">{e(p['research']['question'])}</p><p><strong>Vary:</strong> {e(p['research']['change'])}</p><p><strong>Hold consistent:</strong> {e(p['research']['keep'])}</p><p class="muted">Proposed comparison. No controlled study or measured effect is reported.</p></details></section>
<nav class="related-work" aria-label="Related projects"><h2>Related projects</h2>{related_links}</nav>
</article></main>''' + footer()


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
    return header("From concept to implementation", "A development approach that connects artistic questions, interaction design, and Unity systems.", "approach") + f'''<main id="main" class="wrap"><div class="page-intro"><p class="eyebrow">Pre-production, system design & reflection</p><h1>Development approach</h1><p class="lead approach-lead">A technique matters because of the encounter it makes possible. I read the work through six decisions that connect an artistic premise to an interactive system.</p><p class="small muted">This framework and the project development notes were written for this portfolio. They reconstruct the logic of the documented works and identify useful next artifacts. They do not stand in for original production records.</p></div><ol class="method-list">{items}</ol><section class="split-section"><div><p class="eyebrow">Planning artifacts</p><h2>A brief for each work.</h2><p class="muted">Each project now has an explicit question, input-to-output map, three development decisions, and a proposed research comparison. The downloadable notes make those decisions available for further production.</p></div><div><div class="actions"><a class="button secondary" href="{REPO}docs/PROJECT_DEVELOPMENT_NOTES.md">Project development notes ↗</a><a class="text-link" href="{REPO}docs/EVIDENCE_CAPTURE_KO.md">한국어 촬영 가이드 ↗</a></div></div></section></main>''' + footer()


def handoff_page():
    links = [
        ('to-eternity', 'Sensing → authored media', 'I connected Azure Kinect input to Unity events, Timeline, and live archival-image composition.'),
        ('erick-oh', 'Task state → visual feedback', 'I developed cloud shaders and raymarched metaball forms, with C# runtime control.'),
        ('escape-metro', 'Conversation → progression', 'I connected GPT-based NPC dialogue to puzzle clues and progression in a Unity VR game.'),
    ]
    cases = ''.join(f'<article><p class="eyebrow">{e(boundary)}</p><h2><a href="{pid}.html#implementation">{e(BY_ID[pid]["title"])}</a></h2><p>{e(scope)}</p><div class="proof-links"><a href="{pid}.html#project-video">Existing video ↗</a><a href="{pid}.html#implementation">Implementation ↗</a></div></article>' for pid, boundary, scope in links)
    return header('Working with a lab', 'Concrete Unity contributions, inspectable evidence, and a bounded first research implementation.') + f'''<main id="main" class="wrap">
<div class="page-intro"><p class="breadcrumb"><a href="index.html">Unity-based projects</a> / Working with a lab</p><p class="eyebrow">Implementation, collaboration & handoff</p><h1>Unity research collaboration</h1><p class="lead approach-lead">I build Unity interactions and visual-feedback systems that turn sensed input and task events into controllable scene changes.</p><p class="small muted">Existing project work supports these skills. The proposed research integrations below have their own implementation and validation scope.</p></div>
<section class="collaboration-cases" aria-label="Three implementation entry points">{cases}</section>
<section class="split-section"><div><p class="eyebrow">Two bounded contribution directions / proposed</p><h2>Useful controls.<br>Explicit lifecycle.</h2><p>I can own a Unity-side interaction or rendering subsystem: its input boundary, scene response, useful parameter ranges, and reset behavior. My next contribution would be a small adapter and an inspectable example for one agreed task.</p></div><div><h3>Published research context</h3><p>XARP places device operations in a Unity client. Its discussion identifies gaps around visual effects and fine-grained rendering. SABER makes task events and their timing part of an experimental system.</p><p class="small"><a href="https://arxiv.org/html/2508.04108#S6.SS2">XARP §6.2 ↗</a> · <a href="https://arxiv.org/html/2508.04108#S13.SS2">XARP §13.2 ↗</a> · <a href="https://sites.cs.ucsb.edu/~holl/pubs/Bullock-2026-IEEEVR.pdf">SABER §3 ↗</a></p><p class="small muted">These are my inferred contribution opportunities. No toolkit compatibility, lab request, funded opening, or hardware synchronization is claimed.</p></div></section>
<section class="split-section"><div><p class="eyebrow">One existing source prototype to continue</p><h2>Context Gate.</h2><p>A delayed placement hint can arrive after the user changes the board. The source compares delivering every well-formed hint with rechecking its object-state preconditions.</p><p><strong>Proposed contribution:</strong> a Unity harness that records whether delayed hints were displayed, discarded, timed out, or cancelled across paired trials.</p><a class="text-link" href="context-gate.html">Inspect the question and source ↗</a></div><div><h3>A small first collaboration</h3><p>Choose one task-state contract and one target platform. First produce a reviewable desktop run of Context Gate. Then decide whether the same lifecycle should be bound to one lab interaction.</p><ul class="compact-list"><li><strong>I would own:</strong> the Unity scene, state transition, response validation, event trail, and runbook.</li><li><strong>We would choose together:</strong> task difficulty, the input adapter, valid-trial rules, and required timing precision.</li><li><strong>Deliverable:</strong> source revision, settings, minimal scene, raw logs, and an uncut input-to-response recording.</li></ul><p class="small muted">This is a proposed technical spike. The supplied C# is source-only until the Unity acceptance checks below pass. No second research prototype is added.</p></div></section>
<section class="section-space" id="artifacts"><p class="eyebrow">Inspect / run / verify</p><h2>What a teammate can open now.</h2><div class="table-scroll"><table class="evidence-table handoff-table"><thead><tr><th scope="col">Artifact</th><th scope="col">Purpose and boundary</th><th scope="col">Current evidence</th></tr></thead><tbody>
<tr><th scope="row"><a href="downloads/Unity_Research_Source.zip" download>Unity source bundle ↓</a></th><td>Context Gate, independent samples, tests, and setup notes. No private production source.</td><td>New source. Unity compile and execution pending.</td></tr>
<tr><th scope="row"><a href="downloads/source-manifest.json">Source manifest ↗</a></th><td>SHA-256 per bundled file, release identifier, and verification scope.</td><td>Generated from the bundled files.</td></tr>
<tr><th scope="row"><a href="{REPO}docs/UNITY_SETUP.md">Unity runbook ↗</a></th><td>Import, generated scene, settings, fault checks, desktop build.</td><td>Instructions available. Independent clean import pending.</td></tr>
<tr><th scope="row"><a href="tools/validate_session.py" download>Event validator ↓</a></th><td>Checks event lifecycle and JSONL / CSV / JSON agreement. It does not authenticate the origin of a log.</td><td><a href="verification/offline-checks.json">Executed offline checks ↗</a> use synthetic fixtures, not Unity exports.</td></tr>
<tr><th scope="row"><a href="{REPO}docs/SESSION_SCHEMA.md">Session schema ↗</a></th><td>Allowed transitions, cancellation, incomplete recovery, and analysis flags.</td><td>Matches the authored runner contract; real exports pending.</td></tr>
<tr><th scope="row"><a href="{REPO}docs/EVIDENCE_CAPTURE_KO.md">Capture instructions ↗</a></th><td>Exact input, Inspector, Game-view and failure-path recordings.</td><td>Additional production needed.</td></tr>
</tbody></table></div></section>
<section class="section-space" id="verify"><p class="eyebrow">Acceptance record / Unity verification pending</p><h2>A run is reviewable when its evidence agrees.</h2><div class="table-scroll"><table class="evidence-table handoff-table"><thead><tr><th scope="col">Check</th><th scope="col">Expected observation</th><th scope="col">Keep with the run</th></tr></thead><tbody>
<tr><th scope="row">Clean import</th><td>The declared Unity version compiles the source and generates the demo scene.</td><td>Engine / package versions, source-manifest hash, Console record.</td></tr>
<tr><th scope="row">Applicable reply</th><td>Both policies display a hint whose source and destination predicates still hold.</td><td>Game view, request identity, raw event trace.</td></tr>
<tr><th scope="row">Changed context</th><td>DeliverAll can show inapplicable advice. Revalidate records a discard. An unrelated move can preserve valid advice.</td><td>Matched initial layout, moves, policy and decision reason.</td></tr>
<tr><th scope="row">Lifecycle</th><td>Pause freezes the displayed countdown. Reset or abort cancels pending work. A new epoch has a known layout.</td><td>Pause / reset / abort sequence, cancellation events and frame numbers.</td></tr>
<tr><th scope="row">Failure paths</th><td>Timeout and malformed replies have explicit outcomes. Storage failure stops the session and releases acquired writers.</td><td>Error trace and recovery attempt. No edited-out failure.</td></tr>
<tr><th scope="row">Export and handoff</th><td>The validator accepts the recorded trace and agrees across output formats. A teammate reproduces one expected sequence.</td><td>Raw JSONL, CSV, final JSON, validator result and reproduction note.</td></tr>
</tbody></table></div><p class="small muted">Application timestamps record processing, not physical stimulus onset. A SABER-style synchronization claim needs an additional hardware timing measurement. Passing synthetic validator tests does not establish Unity behavior or a human-study result.</p><p><a class="text-link" href="{REPO}docs/HANDOFF_CHECKLIST.md">Fill in the run record ↗</a></p></section>
<section class="index-contact"><h2>Discuss one task boundary.</h2><div><a href="mailto:hoonahncloud@gmail.com">Email ↗</a><a href="code.html">Source index ↗</a><a href="research.html">Research context ↗</a></div></section>
</main>''' + footer()


def systems_page():
    rows = []
    for p in PROJECTS:
        rows.append(f'<tr><th scope="row"><a href="{p["id"]}.html">{e(p["title"])}</a></th><td>{e(p["system"][0][1])}</td><td>{e(" · ".join(p["tags"]))}</td><td>{e(p["system"][-1][1])}</td></tr>')
    groups = ''.join(f'<a href="index.html#{key}"><span>{idx}</span><strong>{title}</strong><small>{desc}</small></a>' for key, (title, desc, idx) in GROUPS.items())
    return header("Technical systems map", "The input, implementation focus, and output of all 15 works.", "systems") + f'''<main id="main" class="wrap"><div class="page-intro"><p class="eyebrow">All 15 works / technical map</p><h1>Unity systems</h1><p class="muted" style="max-width:760px">The same engine connects very different kinds of work. This index keeps the sensor, generative method, character, and world attached to the project in which it was implemented.</p></div><div class="practice-map">{groups}</div><div class="table-scroll"><table class="evidence-table systems-table"><thead><tr><th scope="col">Project</th><th scope="col">Input / source</th><th scope="col">Implementation focus</th><th scope="col">Output / encounter</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div><section class="split-section"><div><h2>Keep the hardware specific.</h2><p class="muted">To Eternity uses Azure Kinect. Silhak Dance and Track 6 use Kinect v2. Beads Wall uses webcam mapping into VFX Graph. A similar visual result does not make those sensing systems interchangeable.</p></div><div><h2>Keep the engines specific.</h2><p class="muted">Gang Se-hwang is a Unity HDRP digital-human case. Shininho and Jooan's Unreal / MetaHuman work adds production context and is documented separately. Context Gate is a new source prototype with its own pending runtime validation.</p></div></section></main>''' + footer()


def update_legacy_pages():
    for name in ["context-gate.html", "code.html", "evidence.html", "research.html"]:
        path = ROOT / name
        text = path.read_text()
        text = re.sub(r'href="site\.css(?:\?[^\"]*)?"', 'href="site.css?v=compact-20261030"', text)
        # Retain existing functional content while sharing the expanded site's navigation.
        nav = header("", "").split('<header class="topbar">', 1)[1].split('</header>', 1)[0]
        text = re.sub(r'<header class="topbar">.*?</header>', '<header class="topbar">' + nav + '</header>', text, count=1, flags=re.S)
        text = re.sub(r'<footer class="footer">.*?</footer>', footer().split('</body>', 1)[0], text, count=1, flags=re.S)
        if name == "evidence.html":
            for project_id in ['erick-oh', 'jemulpo', 'escape-metro']:
                text = text.replace(project_id + '.html#evidence', project_id + '.html#implementation')
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
        if p.get('engineering'):
            out += ["", "### Engineering inspection", "", "New review notes. Failure cases are proposed checks, not reported production incidents.", ""]
            out += [f"**{label}:** {p['engineering'][key]}" for key, label in [
                ('decision', 'Design decision'), ('failure', 'Failure case to exercise'),
                ('evidence', 'Observable evidence'), ('reuse', 'Reuse boundary')]]
        out += ["", "Scope note: " + p['note'], "", "Project archive: https://jonghoonahn.com/" + p['archive'], ""]
    return '\n'.join(out)


def main():
    assert len(PROJECTS) == 15 and len(BY_ID) == 15
    assert set(UNITY_DETAILS) == set(BY_ID)
    assert all(len(d['features']) == 3 and d['images'] for d in UNITY_DETAILS.values())
    for route, name in [("all", "index.html"), ("xr", "xr.html"), ("human", "human-ai.html")]:
        write(name, home(route))
    for p in PROJECTS:
        write(p['id'] + '.html', case_page(p))
    write('approach.html', approach_page())
    write('systems.html', systems_page())
    write('handoff.html', handoff_page())
    write('docs/PROJECT_DEVELOPMENT_NOTES.md', development_notes())
    write('supporting.html', header('All Unity work', 'The supporting works now have full project case studies.') + '<main id="main" class="wrap"><div class="page-intro"><p class="eyebrow">The expanded portfolio</p><h1>Unity projects</h1><p>Browse the 15 works by practice or compare their input-to-output systems.</p><div class="actions"><a class="button" href="index.html#selected-work">Explore all works ↗</a><a class="text-link" href="systems.html">Technical map ↗</a></div></div></main>' + footer())
    update_legacy_pages()
    print(json.dumps({"projects": len(PROJECTS), "groups": {g: sum(p['group'] == g for p in PROJECTS) for g in GROUPS}, "html_pages": len(list(ROOT.glob('*.html')))}))


if __name__ == '__main__':
    main()

