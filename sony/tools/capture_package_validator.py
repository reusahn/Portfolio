#!/usr/bin/env python3
"""Validate capture-package manifests and source-file presence; no DCC parser required.

This tool checks packaging and declared metadata. It does not decode FBX, Alembic,
video, or depth data and cannot certify tracking, likeness, or deformation quality.
"""
from __future__ import annotations
import argparse
import html
import json
import math
from pathlib import Path

def valid_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)

def validate_package(manifest: dict, root: Path) -> dict:
    root = root.resolve()
    issues = []
    alignments = []

    def issue(level, field, message):
        issues.append({'level': level, 'field': field, 'message': message})

    def positive_fps(value, field):
        if not valid_number(value) or value <= 0:
            issue('error', field, 'Frame rate must be a positive finite number.')
            return False
        return True

    def frame_range(value, field):
        if not isinstance(value, list) or len(value) != 2 or any(not isinstance(v, int) or isinstance(v, bool) for v in value) or value[0] > value[1]:
            issue('error', field, 'Use an inclusive [start, end] integer frame range.')
            return False
        return True

    def file_check(value, field):
        if not isinstance(value, str) or not value.strip():
            issue('error', field, 'A package-relative source path is required.')
            return
        relative = Path(value)
        if relative.is_absolute():
            issue('error', field, 'Use a relative path inside the capture package.')
            return
        candidate = (root / relative).resolve()
        if not candidate.is_relative_to(root):
            issue('error', field, 'The path must stay inside the capture package.')
        elif not candidate.is_file():
            issue('error', field, 'The referenced source file is missing.')
        elif candidate.stat().st_size == 0:
            issue('error', field, 'The referenced source file is empty.')

    if not isinstance(manifest, dict):
        return {'status':'FAIL','counts':{'takes':0,'errors':1,'warnings':0},'issues':[{'level':'error','field':'manifest','message':'The manifest must be a JSON object.'}],'alignments':[]}
    if manifest.get('schema_version') != 1:
        issue('error', 'schema_version', 'Expected schema version 1.')
    for field in ['project', 'package_id', 'operator']:
        if not isinstance(manifest.get(field), str) or not manifest[field].strip():
            issue('error', field, 'A non-empty text value is required.')
    destination = manifest.get('destination')
    if not isinstance(destination, dict):
        destination = {}
        issue('error', 'destination', 'A destination object is required.')
    target_fps_ok = positive_fps(destination.get('fps'), 'destination.fps')
    if destination.get('units') not in ['m','cm','mm']:
        issue('error','destination.units','Declare m, cm, or mm.')
    if destination.get('up_axis') not in ['Y','Z']:
        issue('error','destination.up_axis','Declare the destination up axis as Y or Z.')
    takes = manifest.get('takes')
    if not isinstance(takes, list) or not takes:
        issue('error','takes','Include at least one take.')
        takes = []
    seen = set()
    for index, take in enumerate(takes):
        prefix = f'takes[{index}]'
        if not isinstance(take, dict):
            issue('error',prefix,'Each take must be a JSON object.')
            continue
        key = take.get('take_id')
        if not isinstance(key,str) or not key.strip():
            issue('error',prefix+'.take_id','A non-empty take ID is required.')
        elif key in seen:
            issue('error',prefix+'.take_id','Take IDs must be unique in a package.')
        else:
            seen.add(key)
        if not isinstance(take.get('subject_id'),str) or not take['subject_id'].strip():
            issue('error',prefix+'.subject_id','A non-empty subject ID is required.')
        streams = {}
        for kind in ['body','face']:
            stream = take.get(kind)
            if not isinstance(stream,dict):
                issue('error',prefix+'.'+kind,'A body and a face stream are required for this profile.')
                continue
            file_check(stream.get('file'),prefix+'.'+kind+'.file')
            fps_ok = positive_fps(stream.get('fps'),prefix+'.'+kind+'.fps')
            range_ok = frame_range(stream.get('frame_range'),prefix+'.'+kind+'.frame_range')
            sync = stream.get('sync_frame')
            sync_ok = isinstance(sync,int) and not isinstance(sync,bool)
            if not sync_ok:
                issue('error',prefix+'.'+kind+'.sync_frame','Declare the integer frame containing the common sync event.')
            elif range_ok and not stream['frame_range'][0] <= sync <= stream['frame_range'][1]:
                issue('error',prefix+'.'+kind+'.sync_frame','The sync event is outside the declared source range.')
                sync_ok = False
            if fps_ok and range_ok and sync_ok:
                streams[kind] = stream
            if fps_ok and target_fps_ok and stream['fps'] != destination['fps']:
                issue('warning',prefix+'.'+kind+'.fps','Source and destination rates differ; confirm resampling in the DCC.')
        export = take.get('export')
        if not isinstance(export,dict):
            issue('error',prefix+'.export','An export specification is required.')
        else:
            if export.get('format') not in ['FBX','Alembic']:
                issue('error',prefix+'.export.format','Declare FBX or Alembic.')
            export_fps_ok = positive_fps(export.get('fps'),prefix+'.export.fps')
            frame_range(export.get('frame_range'),prefix+'.export.frame_range')
            if export_fps_ok and target_fps_ok and export['fps'] != destination['fps']:
                issue('error',prefix+'.export.fps','Export metadata does not match the agreed destination frame rate.')
            if export.get('units') != destination.get('units'):
                issue('error',prefix+'.export.units','Export units do not match the destination.')
            if export.get('up_axis') != destination.get('up_axis'):
                issue('error',prefix+'.export.up_axis','Export up axis does not match the destination.')
            geometry = export.get('included_geometry',[])
            if export.get('format') == 'Alembic' and (not isinstance(geometry,list) or not all(isinstance(g,str) for g in geometry) or not {'body','face'}.issubset(set(geometry))):
                issue('error',prefix+'.export.included_geometry','This full-character Alembic profile requires body and face geometry.')
        if 'body' in streams and 'face' in streams:
            body,face = streams['body'],streams['face']
            # The sync frames are absolute source indices. This is the translation
            # applied to the face timeline to place its sync event on the body's.
            shift = body['sync_frame']/body['fps'] - face['sync_frame']/face['fps']
            start = max(body['frame_range'][0]/body['fps'],face['frame_range'][0]/face['fps']+shift)
            end = min((body['frame_range'][1]+1)/body['fps'],(face['frame_range'][1]+1)/face['fps']+shift)
            overlap = max(0,end-start)
            alignments.append({'take_id':key,'face_shift_seconds':round(shift,6),'aligned_overlap_seconds':round(overlap,6)})
            if overlap == 0:
                issue('error',prefix,'The synchronized source ranges have no overlapping duration.')
            body_duration=(body['frame_range'][1]-body['frame_range'][0]+1)/body['fps']
            if overlap < body_duration*.9:
                issue('warning',prefix,'Aligned face coverage is below 90% of the declared body duration; review the shot range.')
    errors=sum(x['level']=='error' for x in issues)
    warnings=sum(x['level']=='warning' for x in issues)
    return {'project':manifest.get('project'),'package_id':manifest.get('package_id'),'status':'FAIL' if errors else 'REVIEW' if warnings else 'PASS','scope':'Manifest metadata and source-file presence only; no media-format decoding or animation-quality evaluation.','counts':{'takes':len(takes),'errors':errors,'warnings':warnings},'issues':issues,'alignments':alignments}

def render_report(report):
    e=lambda x: html.escape(str(x))
    rows=''.join(f'<tr><td>{e(i["level"])}</td><td>{e(i["field"])}</td><td>{e(i["message"])}</td></tr>' for i in report['issues']) or '<tr><td colspan="3">No packaging issues found.</td></tr>'
    offsets=''.join(f'<tr><td>{e(i["take_id"])}</td><td>{e(i["face_shift_seconds"])}</td><td>{e(i["aligned_overlap_seconds"])}</td></tr>' for i in report['alignments'])
    return f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Capture Package QA Report</title><style>body{{font:15px/1.6 Arial,sans-serif;max-width:1040px;margin:50px auto;padding:0 25px;background:#101215;color:#eceff2}}h1{{font-size:36px;letter-spacing:-.04em}}p{{color:#b7bec7}}table{{border-collapse:collapse;width:100%;margin:25px 0}}td,th{{border:1px solid #363c44;padding:13px;text-align:left;overflow-wrap:anywhere}}th{{color:#b7cde5}}.status{{font-size:18px;color:#bddabf}}.label{{font-size:11px;letter-spacing:.14em;color:#a9bcd2}}</style><p class="label">SYNTHETIC DEMONSTRATION / INDEPENDENT PIPELINE TOOL</p><h1>Capture Package QA</h1><p>Package: {e(report.get('package_id',''))}</p><p class="status">{e(report['status'])}</p><p>{e(report.get('scope',''))}</p><h2>Packaging checks</h2><table><tr><th>Level</th><th>Field</th><th>Finding</th></tr>{rows}</table><h2>Declared sync alignment</h2><p>Face shift is added to the face timeline in seconds. A positive value moves it later. Values below are calculated from synthetic manifest data.</p><table><tr><th>Take</th><th>Face shift (s)</th><th>Aligned overlap (s)</th></tr>{offsets}</table></html>'''

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest',type=Path)
    parser.add_argument('--root',type=Path)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    manifest=json.loads(args.manifest.read_text())
    report=validate_package(manifest,args.root or args.manifest.parent)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.with_suffix('.json').write_text(json.dumps(report,indent=2))
    args.output.with_suffix('.html').write_text(render_report(report))
    print(json.dumps({'status':report['status'],**report['counts']}))
    return 1 if report['status']=='FAIL' else 0

if __name__=='__main__':
    raise SystemExit(main())
