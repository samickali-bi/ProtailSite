"""Render a reviewed .blend without rebuilding the scene."""
import bpy,sys,argparse,json,time
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
p=argparse.ArgumentParser();p.add_argument('--width',type=int,default=1800);p.add_argument('--samples',type=int,default=128);p.add_argument('--name',default='protail-interior-reference');p.add_argument('--camera',type=float,nargs=3);p.add_argument('--target',type=float,nargs=3);p.add_argument('--lens',type=float);p.add_argument('--exposure',type=float);p.add_argument('--save',action='store_true');opt=p.parse_args(args)
bpy.ops.wm.open_mainfile(filepath=str(root/'output/protail-interior-reference.blend'))
if not bpy.context.scene.get('reference_refined',False):
    for obj in bpy.context.scene.objects:
        if obj.type=='MESH' and obj.name.startswith('Curved low iron front glass'):
            obj.data.flip_normals()
    wood=bpy.data.materials.get('Oiled European oak / scanned PBR')
    nodes=wood.node_tree.nodes;links=wood.node_tree.links;pbr=nodes.get('Principled BSDF');link=pbr.inputs['Base Color'].links[0];source=link.from_socket;links.remove(link)
    finish=nodes.new('ShaderNodeHueSaturation');finish.name='Protail oak finish';finish.inputs['Saturation'].default_value=1.25;finish.inputs['Value'].default_value=.85;links.new(source,finish.inputs['Color']);links.new(finish.outputs['Color'],pbr.inputs['Base Color'])
    bpy.context.scene['reference_refined']=True
s=bpy.context.scene;s.render.resolution_x=opt.width;s.render.resolution_y=round(opt.width*10/16);s.render.resolution_percentage=100;s.cycles.samples=opt.samples;s.cycles.adaptive_threshold=.025 if opt.samples<100 else .015;s.cycles.adaptive_min_samples=8 if opt.samples<100 else 24
if opt.camera:s.camera.location=opt.camera
if opt.target:s.camera.rotation_euler=(Vector(opt.target)-s.camera.location).to_track_quat('-Z','Y').to_euler()
if opt.lens:s.camera.data.lens=opt.lens
if opt.exposure is not None:s.view_settings.exposure=opt.exposure
s.render.filepath=str(root/'output'/(opt.name+'.png'))
if opt.save:bpy.ops.wm.save_as_mainfile(filepath=str(root/'output/protail-interior-reference.blend'))
manifest_path=root/'output/render-manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf8'))
manifest.update({'width':s.render.resolution_x,'height':s.render.resolution_y,'samples':opt.samples,'camera':list(s.camera.location),'output':s.render.filepath})
manifest_path.write_text(json.dumps(manifest,indent=2),encoding='utf8')
start=time.perf_counter()
bpy.ops.render.render(write_still=True)
manifest['render_seconds']=round(time.perf_counter()-start,2)
manifest_path.write_text(json.dumps(manifest,indent=2),encoding='utf8')
print('PROTAIL_RENDER_DONE',s.render.filepath)
