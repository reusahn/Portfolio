"""Replace one detail-page image without touching the original project archive.

Example:
python tools/replace_detail_image.py --project narci --slot narci-hand-response \
  --image /absolute/path/hand-capture.jpg --kind editor \
  --caption 'Unity hand-input event and its scene response.' \
  --alt 'Unity Editor showing tracked hands and the affected material' \
  --width 1920 --height 1080

Then run python tools/build_portfolio.py.
"""
import argparse
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', required=True)
    parser.add_argument('--slot', required=True)
    parser.add_argument('--image', required=True, type=Path)
    parser.add_argument('--kind', choices=['archive', 'editor', 'reference'], required=True,
                        help='editor is for actual Unity captures only; reference is for illustrations.')
    parser.add_argument('--caption', required=True)
    parser.add_argument('--alt', required=True)
    parser.add_argument('--width', type=int, required=True)
    parser.add_argument('--height', type=int, required=True)
    args = parser.parse_args()
    data_file = ROOT / 'content/unity-details.json'
    data = json.loads(data_file.read_text())
    if args.project not in data:
        parser.error('Unknown project.')
    matches = [x for x in data[args.project]['images'] if x['slot'] == args.slot]
    if len(matches) != 1:
        parser.error('Unknown or duplicated image slot.')
    source = args.image.resolve()
    extension = source.suffix.lower()
    if not source.is_file() or source.stat().st_size == 0 or extension not in {'.jpg', '.jpeg', '.png', '.webp'}:
        parser.error('Provide a non-empty JPG, PNG, or WebP image.')
    if args.width < 1 or args.height < 1:
        parser.error('Image dimensions must be positive.')
    relative = Path('assets/details') / (matches[0]['slot'] + extension)
    destination = ROOT / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    if source != destination.resolve():
        shutil.copy2(source, destination)
    matches[0].update(src=relative.as_posix(), kind=args.kind, caption=args.caption,
                      alt=args.alt, width=args.width, height=args.height)
    data_file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print('Updated ' + args.project + ' / ' + args.slot + '. Run tools/build_portfolio.py next.')


if __name__ == '__main__':
    main()
