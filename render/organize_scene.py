"""Organise the editable quality-study scene without changing rendered geometry."""
import bpy,json
from pathlib import Path
root=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'output/protail-interior-reference.blend'))
groups={}
for name in ['01 Architecture','02 Mechanical and safety','03 Produce and scanned fruit','04 Bulk and retail island','05 Protein and preparation','06 Grocery and refrigeration','07 Lighting','08 Identity and graphics','09 Camera','99 Source templates']:
    collection=bpy.data.collections.get(name) or bpy.data.collections.new(name)
    if collection.name not in bpy.context.scene.collection.children:bpy.context.scene.collection.children.link(collection)
    groups[name]=collection
for obj in list(bpy.context.scene.objects):
    n=obj.name.lower()
    if 'template' in n or obj.hide_render:category='99 Source templates'
    elif obj.type=='CAMERA':category='09 Camera'
    elif any(t in n for t in ['logo','brand plaque','department','aisle identity','sign suspension']):category='08 Identity and graphics'
    elif obj.type=='LIGHT' or any(t in n for t in ['luminaire','led diffuser','ring suspension','ring soft','torus']):category='07 Lighting'
    elif any(t in n for t in ['main spiral duct','branch air duct','sprinkler','ceiling diffuser']):category='02 Mechanical and safety'
    elif any(t in n for t in ['produce','crate','scanned apple','scanned lemon','scanned lime','paper price']):category='03 Produce and scanned fruit'
    elif any(t in n for t in ['protein','prep','sink','faucet','butcher','chilled','glass case','curved low iron','rear case','natural fat','fresh cut','satin steel case','recessed black plinth','oak case','glass counter','glass support']):category='05 Protein and preparation'
    elif any(t in n for t in ['gondola','shelf','refrigerat','bottle cap','door gasket']):category='06 Grocery and refrigeration'
    elif any(t in n for t in ['bulk','dispenser','dispensing','scoop','jar','loose grains']):category='04 Bulk and retail island'
    elif any(t in n for t in ['logo','brand plaque','department','aisle identity','sign suspension']):category='08 Identity and graphics'
    else:category='01 Architecture'
    target=groups[category]
    if obj.name not in target.objects:target.objects.link(obj)
    for old in list(obj.users_collection):
        if old!=target:old.objects.unlink(obj)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA'
proof={'blender':bpy.app.version_string,'engine':bpy.context.scene.render.engine,'objects':len(bpy.context.scene.objects),'materials':len(bpy.data.materials),'collections':{name:len(c.objects) for name,c in groups.items()},'images':[{'name':i.name,'packed':bool(i.packed_file),'size':list(i.size)} for i in bpy.data.images if i.type=='IMAGE'],'camera':list(bpy.context.scene.camera.location),'resolution':[bpy.context.scene.render.resolution_x,bpy.context.scene.render.resolution_y]}
(root/'output/scene-proof.json').write_text(json.dumps(proof,indent=2),encoding='utf8')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'output/protail-interior-reference.blend'))
print('PROTAIL_PROOF',json.dumps({k:v for k,v in proof.items() if k!='images'}))
