"""Generate the Korean reading route for the selected portfolio cases."""
import html
import json
from pathlib import Path


def e(value):
    return html.escape(str(value), quote=True)


GROUP_NAMES = {
    'sensing': '센서와 물리 시스템',
    'xr-worlds': 'VR과 인터랙션',
    'graphics': '그래픽과 VFX',
    'humans': '디지털 휴먼',
}


def player(title, video_id, hash_value=''):
    suffix = f'&h={hash_value}' if hash_value else ''
    return f'<div class="video-shell"><iframe src="https://player.vimeo.com/video/{video_id}?title=0&byline=0&portrait=0&dnt=1{suffix}" title="{e(title)} 영상" loading="eager" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'


def head(title, description, home=False, english=''):
    nav = '' if home else '<a href="index.html">전체 작품</a>'
    nav += f'<a href="../{english}" lang="en">English</a>'
    return f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)} | Jonghoon Ahn</title><meta name="description" content="{e(description)}"><meta name="theme-color" content="#182c2b"><link rel="icon" href="../../assets/images/favicon.png"><link rel="stylesheet" href="../site.css?v=ko-20261030"></head><body class="{'portfolio-index' if home else 'project-detail'}"><a class="skip" href="#main">본문으로</a><header class="topbar"><div class="wrap topbar-inner"><a class="brand" href="index.html">Jonghoon Ahn</a><nav class="mainnav" aria-label="메뉴">{nav}</nav></div></header>'''


def foot():
    return '<footer class="footer"><div class="wrap"><div>Jonghoon Ahn</div><div><a href="https://github.com/reusahn">GitHub ↗</a><a href="mailto:hoonahncloud@gmail.com">이메일 ↗</a></div></div></footer></body></html>'


def build_ko(root, projects, details, catalog):
    translations = json.loads((root / 'content/ko.json').read_text())
    assert set(translations) == {p['id'] for p in catalog}
    ko = root / 'ko'
    ko.mkdir(exist_ok=True)
    controls = ''.join(f'<a href="#{group}">{e(label)}<span aria-hidden="true">↓</span></a>' for group,label in GROUP_NAMES.items())
    groups = []
    for group,label in GROUP_NAMES.items():
        cards = []
        for p in (p for p in catalog if p['group'] == group):
            t = translations[p['id']]
            tags = ' · '.join(e(x) for x in p['tags'][:3])
            cards.append(f'''<article class="project-card" data-project="{p['id']}"><a class="project-photo" href="{p['id']}.html" aria-label="{e(t['title'])} 상세페이지"><img src="../../{e(p['image'])}" alt="{e(t['title'])} 작품 이미지" width="1920" height="1080" loading="lazy"></a><div class="project-card-body"><h3><a href="{p['id']}.html">{e(t['title'])}</a></h3><p class="card-idea">{e(t['teaser'])}</p><p class="card-tech">{tags}</p></div></article>''')
        layout = 'project-grid project-grid--humans' if group == 'humans' else 'project-grid'
        groups.append(f'<section class="catalog-group" id="{group}"><div class="group-heading"><h2>{e(label)}</h2></div><div class="{layout}">{"".join(cards)}</div></section>')
    home = head('Unity와 Unreal 프로젝트', '안종훈의 센서, VR, 그래픽, 디지털 휴먼 프로젝트.', home=True, english='index.html') + f'''<main id="main" class="wrap"><section class="portfolio-title"><h1>Unity와 Unreal 프로젝트</h1></section><nav class="category-buttons" aria-label="작품 분야">{controls}</nav>{''.join(groups)}</main>''' + foot()
    (ko / 'index.html').write_text(home)

    for i,p in enumerate(catalog):
        t = translations[p['id']]
        year = f'<p class="project-meta">{e(p["year"])}</p>' if p['year'] else ''
        tools = ' · '.join(e(x) for x in p['tags'])
        features = []
        images = details[p['id']]['images']
        for n,(title,body) in enumerate(t['features']):
            features.append(f'<section class="unity-feature"><h3>{e(title)}</h3><p>{e(body)}</p></section>')
            selected_images = [images[n]] if p['id'] == 'ai-zoo' else images[:1] if n == 0 else images[1:] if n == 2 else []
            for img in selected_images:
                caption = img.get('caption_ko') or ('개념 설명용 생성 이미지. 실제 실행 화면은 아닙니다.' if img['kind']=='reference' else '기존 엔진 Editor 화면.' if img['kind']=='editor' else '기존 작품 제작 자료.')
                alt = img.get('alt_ko') or f'{t["title"]}: {title}'
                features.append(f'<figure class="detail-figure {e(img["kind"])}"><a href="../{e(img["src"])}" target="_blank" rel="noopener noreferrer"><img src="../{e(img["src"])}" alt="{e(alt)}" loading="lazy"></a><figcaption>{e(caption)}</figcaption></figure>')
        steps = ''.join(f'<li><span>{n:02d}</span><div><strong>{e(label)}</strong></div></li>' for n,label in enumerate(t['system'],1))
        jooan = ''
        if p['id']=='shininho':
            jooan = f'''<section class="case-section" id="jooan"><h2>주안 · VR 확장</h2><p>{e(t['jooan'])}</p><h3>주안 VR 영상</h3>{player('주안 VR', '1219693160')}<figure class="detail-figure archive"><img src="../../media/shininho/11_vr_final.jpg" alt="주안 VR 속 신인호 디지털 휴먼" loading="lazy"><figcaption>주안 VR 결과 화면.</figcaption></figure><figure class="detail-figure archive"><img src="../../media/shininho/12_niagara_emitter.jpg" alt="주안 VR의 Niagara 손 트레일 제작 화면" loading="lazy"><figcaption>Unreal Niagara 손 트레일 제작 자료.</figcaption></figure></section>'''
        ai_zoo = ''
        if p['id']=='ai-zoo':
            stages = ''.join(f'<li><h3>{e(a)}</h3><p>{e(b)}</p></li>' for a,b in t['affect_model'])
            example = '[[EMOTION|anger=9|happy=3|sadness=51|fear=78|despair=60]]'
            ai_zoo = f'''<section class="case-section" id="affect-model"><h2>정동에서 관객의 해석까지</h2><p>{e(t['affect_intro'])}</p><ol class="development-steps">{stages}</ol><p><strong>피드백 루프:</strong> 관객의 타이핑·손짓 → 연출 상태 → 구체·목소리·빛·캐릭터 → 관객의 해석 → 다음 행동.</p></section><section class="case-section" id="emotion-motion"><h2>대화에서 구체와 목소리까지</h2><p>관객이 휴대폰처럼 문장을 입력하면 Chat Completions API가 답변 뒤에 지정된 감정 지수 한 줄을 붙이도록 요청한다. Unity가 마지막 줄을 분리해 다섯 값이 모두 0–100의 정수인지 검사한다.</p><pre class="code-panel"><code>여기 조금만 더 있어 주세요.
{e(example)}</code></pre><p>분노·기쁨·슬픔·두려움은 음성 표현에 활용할 수 있는 범주다. <a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0196391">RAVDESS</a>에는 평온·놀람·혐오 등도 포함된다. 절망은 AI ZOO의 갇힘과 움직임의 소멸을 표현하기 위해 추가한 작품별 제어값이다. <a href="https://doi.org/10.1037/h0077714">Russell의 정서 원형 모델</a>은 감정의 성격과 활성도를 구분하는 참고점이다. 여기의 숫자와 매핑 계수는 심리 측정 척도가 아닌 연출용 값이다.</p><p>점수는 서보모터 3개가 만드는 구체의 속도·강도·위상 차에 반영된다. 같은 점수로 ElevenLabs 요청의 발화 속도를 설정하고, 재생할 때 Unity AudioSource의 음량을 조절한다. 조명은 Inspector 이벤트로 연결하며 Leap Motion 손 접촉은 별도 입력 함수로 받는다. 감정 지수 형식이 잘못되면 새로운 움직임과 음성을 적용하지 않는다.</p><h3>Unity C# · 감정 지수와 출력</h3><p>이번에 작성한 예제는 Chat Completions와 ElevenLabs API 요청, 로컬 모터 릴레이 호출을 포함한다. 원래 전시의 소스 복원이 아니며 음성 ID·API 키·센서 연결·실제 서보 각도는 현장에서 설정해야 한다.</p><div class="source-boundary">계수와 예시 점수는 실제 세션 기록이 아니다. Unity 컴파일과 API·Arduino 실기기 실행 검증은 아직 하지 않았다.</div><div class="actions"><a class="text-link" href="../unity/Assets/ResearchSamples/AiZooAffectRouter.cs" download>C# 소스 ↓</a></div></section>'''
        source = ''
        if p.get('sample'):
            source = f'''<section class="case-section" id="source"><h2>독립 코드 예제</h2><p>구현 원리를 살펴볼 수 있는 별도 C# 예제는 <a href="../{p['id']}.html#source" lang="en">영문 상세페이지</a>에 있다. 원본 프로젝트 소스는 아니며 Unity 컴파일 및 실행 확인이 필요하다.</p></section>'''
        prev = f'<a href="{catalog[i-1]["id"]}.html"><span>← 이전 작품</span><strong>{e(translations[catalog[i-1]["id"]]["title"])}</strong></a>' if i else '<span></span>'
        nxt = f'<a href="{catalog[i+1]["id"]}.html"><span>다음 작품 →</span><strong>{e(translations[catalog[i+1]["id"]]["title"])}</strong></a>' if i+1<len(catalog) else '<span></span>'
        page = head(t['title'],t['summary'],english=p['id']+'.html') + f'''<main id="main" class="wrap detail-wrap"><header class="project-heading"><h1>{e(t['title'])}</h1>{year}<p class="project-tools">{tools}</p><p class="project-summary">{e(t['summary'])}</p></header><article class="case-content"><section id="project-video">{player(t['title'],p['video'],p.get('hash',''))}</section><section class="case-section" id="implementation"><h2>{'Unreal' if p['engine']=='Unreal Engine' else 'Unity'} 구현</h2>{''.join(features)}</section>{jooan}{ai_zoo}<section class="case-section" id="structure"><h2>시스템 흐름</h2><ol class="ko-steps">{steps}</ol></section>{source}<section class="case-section" id="concept"><h2>작품의 질문</h2><p>{e(t['concept'])}</p></section><nav class="project-sequence" aria-label="작품 순서">{prev}{nxt}</nav></article></main>''' + foot()
        (ko / (p['id']+'.html')).write_text(page)
    return len(catalog)+1
