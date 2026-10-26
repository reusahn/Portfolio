"""Check generated portfolio pages and references. Works with a full checkout or a known-path snapshot."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())


class Page(HTMLParser):
    def __init__(self, path, text):
        super().__init__(convert_charrefs=True)
        self.path, self.stack, self.ids, self.refs, self.projects, self.errors = path, [], set(), [], [], []
        self.h1 = 0
        self.feed(text)
        if self.stack:
            self.errors.append('Unclosed tags: ' + str(self.stack))

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'h1':
            self.h1 += 1
        if values.get('id'):
            if values['id'] in self.ids:
                self.errors.append('Duplicate ID: ' + values['id'])
            self.ids.add(values['id'])
        if values.get('data-project'):
            self.projects.append(values['data-project'])
        for name in ('href', 'src'):
            if name in values:
                self.refs.append(values[name])
        if tag == 'img' and not values.get('alt'):
            self.errors.append('Missing image alt')
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        actual = self.stack.pop() if self.stack else None
        if actual != tag:
            self.errors.append('Tag mismatch: ' + str(actual) + ' / ' + tag)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--known-paths', type=Path)
    args = parser.parse_args()
    repository = ROOT.parent
    known = set(json.loads(args.known_paths.read_text())) if args.known_paths else set()
    projects = json.loads((ROOT / 'content/projects.json').read_text())
    project_ids = {p['id'] for p in projects}
    assert len(project_ids) == len(projects) == 15
    pages = {p.resolve(): Page(p, p.read_text()) for p in ROOT.glob('*.html')}
    errors, local_refs, fragments, document_refs = [], 0, 0, 0
    for path, page in pages.items():
        errors += [str(path.name) + ': ' + error for error in page.errors]
        if page.h1 != 1:
            errors.append(path.name + ': expected one H1')
        if path.name in ('index.html', 'xr.html', 'human-ai.html'):
            if len(page.projects) != 15 or set(page.projects) != project_ids:
                errors.append(path.name + ': missing or duplicated project cards')
        for ref in page.refs:
            parsed = urlsplit(ref)
            prefix = 'https://github.com/reusahn/Portfolio/blob/gh-pages/'
            if ref.startswith(prefix):
                document_refs += 1
                target = repository / ref[len(prefix):]
                if not target.is_file() and ref[len(prefix):] not in known:
                    errors.append(path.name + ': missing repository target ' + ref)
            if parsed.scheme or parsed.netloc:
                continue
            local_refs += 1
            target = (repository / unquote(parsed.path.lstrip('/')) if parsed.path.startswith('/')
                      else path.parent / unquote(parsed.path)) if parsed.path else path
            target = target.resolve()
            if parsed.path.endswith('/') or target.is_dir():
                target = target / 'index.html'
            try:
                relative = target.relative_to(repository).as_posix()
            except ValueError:
                errors.append(path.name + ': reference outside repository ' + ref)
                continue
            if not target.is_file() and relative not in known:
                errors.append(path.name + ': missing local target ' + ref)
            if parsed.fragment and target in pages:
                fragments += 1
                if unquote(parsed.fragment) not in pages[target].ids:
                    errors.append(path.name + ': missing fragment ' + ref)
    for p in projects:
        if (ROOT / (p['id'] + '.html')).resolve() not in pages:
            errors.append('Missing case: ' + p['id'])
        if len(p['system']) != 4 or len(p['preproduction']) != 3:
            errors.append('Incomplete case structure: ' + p['id'])
    result = {'pages': len(pages), 'existing_works': len(projects), 'local_references': local_refs,
              'fragments': fragments, 'repository_document_references': document_refs, 'errors': errors}
    print(json.dumps(result, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
