import copy
import tempfile
import unittest
from pathlib import Path
from capture_package_validator import validate_package

class ValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
        (self.root/'body.txt').write_text('Synthetic body-source stand-in')
        (self.root/'face.txt').write_text('Synthetic face-source stand-in')
        self.sample={'schema_version':1,'project':'Synthetic Test','package_id':'demo','operator':'Synthetic Operator','destination':{'fps':30,'units':'cm','up_axis':'Z'},'takes':[{'take_id':'t01','subject_id':'s01','body':{'file':'body.txt','fps':30,'frame_range':[0,299],'sync_frame':30},'face':{'file':'face.txt','fps':30,'frame_range':[0,299],'sync_frame':45},'export':{'format':'Alembic','fps':30,'frame_range':[0,299],'units':'cm','up_axis':'Z','included_geometry':['body','face']}}]}
    def tearDown(self):self.temp.cleanup()
    def run_sample(self):return validate_package(self.sample,self.root)
    def test_alignment_offset_and_overlap(self):
        r=self.run_sample();self.assertEqual(r['status'],'PASS');self.assertEqual(r['alignments'][0]['face_shift_seconds'],-.5);self.assertEqual(r['alignments'][0]['aligned_overlap_seconds'],9.5)
    def test_missing_source_is_error(self):
        (self.root/'face.txt').unlink();self.assertEqual(self.run_sample()['status'],'FAIL')
    def test_invalid_frame_rate_is_error(self):
        self.sample['takes'][0]['body']['fps']=0;self.assertEqual(self.run_sample()['status'],'FAIL')
    def test_export_rate_mismatch_is_error(self):
        self.sample['takes'][0]['export']['fps']=24;self.assertEqual(self.run_sample()['status'],'FAIL')
    def test_capture_rate_mismatch_requests_review(self):
        self.sample['takes'][0]['face']['fps']=60;self.assertEqual(self.run_sample()['status'],'REVIEW')
    def test_duplicate_take_id_is_error(self):
        self.sample['takes'].append(copy.deepcopy(self.sample['takes'][0]));self.assertEqual(self.run_sample()['status'],'FAIL')
    def test_out_of_package_path_is_rejected(self):
        self.sample['takes'][0]['face']['file']='../face.txt';r=self.run_sample();self.assertTrue(any('stay inside' in i['message'] for i in r['issues']))
    def test_missing_facial_geometry_is_error(self):
        self.sample['takes'][0]['export']['included_geometry']=['body'];self.assertEqual(self.run_sample()['status'],'FAIL')
    def test_sync_outside_range_is_error(self):
        self.sample['takes'][0]['face']['sync_frame']=999;self.assertEqual(self.run_sample()['status'],'FAIL')
    def test_nan_and_boolean_frame_rates_are_rejected(self):
        for value in [float('nan'),float('inf'),True]:
            with self.subTest(value=value):
                self.sample['takes'][0]['body']['fps']=value;self.assertEqual(self.run_sample()['status'],'FAIL')
    def test_invalid_geometry_list_is_reported(self):
        self.sample['takes'][0]['export']['included_geometry']=None;self.assertEqual(self.run_sample()['status'],'FAIL')
    def test_invalid_top_level_is_reported(self):
        self.assertEqual(validate_package([],self.root)['status'],'FAIL')

if __name__=='__main__':unittest.main()
