"""Reproducible, editable Cycles interior quality study for Protail. No generated backdrop."""
import bpy, bmesh, math, random, json, sys, argparse
from mathutils import Vector, Matrix
from pathlib import Path

ROOT=Path(__file__).resolve().parent
ASSETS=ROOT/'assets'
OUTPUT=ROOT/'output'
OUTPUT.mkdir(exist_ok=True)
random.seed(41)
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
parser=argparse.ArgumentParser()
parser.add_argument('--width',type=int,default=1000)
parser.add_argument('--samples',type=int,default=32)
parser.add_argument('--name',default='interior-preview')
parser.add_argument('--build-only',action='store_true')
opt=parser.parse_args(args)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for material in list(bpy.data.materials):
    if material.users==0: bpy.data.materials.remove(material)

scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.device='CPU'
scene.cycles.samples=opt.samples
scene.cycles.use_denoising=True
scene.cycles.use_adaptive_sampling=True
scene.cycles.adaptive_threshold=.035 if opt.samples<100 else .015
scene.cycles.adaptive_min_samples=8 if opt.samples<100 else 24
scene.cycles.max_bounces=10
scene.cycles.diffuse_bounces=4
scene.cycles.glossy_bounces=4
scene.cycles.transmission_bounces=10
scene.cycles.transparent_max_bounces=10
scene.cycles.sample_clamp_indirect=5
scene.render.threads_mode='FIXED'
scene.render.threads=8
scene.render.resolution_x=opt.width
scene.render.resolution_y=round(opt.width*10/16)
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGB'
scene.render.image_settings.color_depth='8'
scene.render.film_transparent=False
scene.view_settings.view_transform='AgX'
try: scene.view_settings.look='AgX - Medium High Contrast'
except: pass
scene.view_settings.exposure=.2

def linear(c):
    c=c.lstrip('#')
    values=[int(c[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in values)+(1,)

def material(name,color,rough=.4,metal=0,transmission=0):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=linear(color)
    p.inputs['Roughness'].default_value=rough
    p.inputs['Metallic'].default_value=metal
    p.inputs['Transmission Weight'].default_value=transmission
    return m

def emission(name,color,power):
    m=material(name,color,.3)
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Emission Color'].default_value=linear(color)
    p.inputs['Emission Strength'].default_value=power
    return m

def pbr(name,folder,scale=(1,1,1),rough_range=None):
    m=material(name,'ffffff',.4)
    n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF')
    coord=n.new('ShaderNodeTexCoord')
    mapping=n.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=scale
    l.new(coord.outputs['Generated'],mapping.inputs['Vector'])
    for kind,socket,space in [('color','Base Color','sRGB'),('roughness','Roughness','Non-Color'),('normal',None,'Non-Color')]:
        path=ASSETS/folder/(kind+'.jpg')
        tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path),check_existing=True)
        tex.image.colorspace_settings.name=space
        l.new(mapping.outputs['Vector'],tex.inputs['Vector'])
        tex.projection='BOX';tex.projection_blend=.12
        if kind=='normal':
            normal=n.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.45
            l.new(tex.outputs['Color'],normal.inputs['Color']);l.new(normal.outputs['Normal'],p.inputs['Normal'])
        elif kind=='roughness' and rough_range:
            ramp=n.new('ShaderNodeMapRange');ramp.inputs['To Min'].default_value=rough_range[0];ramp.inputs['To Max'].default_value=rough_range[1]
            l.new(tex.outputs['Color'],ramp.inputs['Value']);l.new(ramp.outputs[0],p.inputs[socket])
        else:l.new(tex.outputs['Color'],p.inputs[socket])
    return m

wood=pbr('Oiled European oak / scanned PBR','oak',(1.5,.55,1),(.3,.48))
wn=wood.node_tree.nodes;wl=wood.node_tree.links;wp=wn.get('Principled BSDF');link=wp.inputs['Base Color'].links[0];socket=link.from_socket;wl.remove(link)
finish=wn.new('ShaderNodeHueSaturation');finish.name='Protail oak finish';finish.inputs['Saturation'].default_value=1.25;finish.inputs['Value'].default_value=.85;wl.new(socket,finish.inputs['Color']);wl.new(finish.outputs['Color'],wp.inputs['Base Color'])
floor=pbr('Polished terrazzo / scanned PBR','floor',(9,12,1),(.24,.4))
floor.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.12
# Keep the scanned aggregate detail while selecting a neutral, warm-grey architectural finish.
fn=floor.node_tree.nodes;fl=floor.node_tree.links;fp=fn.get('Principled BSDF');base_link=fp.inputs['Base Color'].links[0];base_socket=base_link.from_socket;fl.remove(base_link)
hs=fn.new('ShaderNodeHueSaturation');hs.inputs['Saturation'].default_value=.2;hs.inputs['Value'].default_value=1.15;fl.new(base_socket,hs.inputs['Color']);fl.new(hs.outputs['Color'],fp.inputs['Base Color'])
green=material('Protail deep olive enamel','#35473d',.32,.12)
black=material('Satin charcoal powder coat','#202528',.31,.35)
rubber=material('Rubber and shadow gaps','#171a18',.76)
wall=material('Warm mineral plaster','#d6d2c7',.87)
tile=material('Glazed preparation tile','#ece9df',.22)
ceiling=material('Charcoal acoustic ceiling','#333a38',.87)
steel=material('Brushed food-grade stainless','#b4bdc0',.24,1)
brass=material('Satin brass accent','#b69c62',.28,.85)
aluminium=material('Galvanised air duct','#8a9294',.48,.85)
glass=material('Clear low iron display glass','#f5ffff',.015,0,1)
glass.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value=1.46
warm_led=emission('Warm white LED 3000K','#ffe1a5',5)
cold_led=emission('Display LED 4000K','#f2f9ff',4)
terracotta=material('Handmade ceramic planter','#8b5940',.65)
white=material('Warm white packaging','#ede7d8',.4)
copper=material('Copper refrigeration line','#a26e43',.25,1)
red=material('Fire system red','#9e3930',.42,.2)

# Microsurface prevents the clean steel from becoming a featureless grey slab.
nodes=steel.node_tree.nodes;links=steel.node_tree.links
coord=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(1,1,70)
noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=180;noise.inputs['Detail'].default_value=2
bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.11;bump.inputs['Distance'].default_value=.0009
links.new(coord.outputs['Generated'],mapping.inputs['Vector']);links.new(mapping.outputs['Vector'],noise.inputs['Vector']);links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal'])
if 'Anisotropic IOR Level' in nodes.get('Principled BSDF').inputs:nodes.get('Principled BSDF').inputs['Anisotropic IOR Level'].default_value=.45

def assign(obj,mat):obj.data.materials.append(mat);return obj
def box(name,loc,size,mat,bevel=.008):
    x,y,z=[v/2 for v in size]
    verts=[(-x,-y,-z),(-x,-y,z),(-x,y,-z),(-x,y,z),(x,-y,-z),(x,-y,z),(x,y,-z),(x,y,z)]
    faces=[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.materials.append(mat);mesh.update()
    uv=mesh.uv_layers.new(name='UVMap')
    for p in mesh.polygons:
        for li,co in zip(p.loop_indices,[(0,0),(1,0),(1,1),(0,1)]):uv.data[li].uv=co
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.location=loc
    if bevel:
        mod=o.modifiers.new('True edge bevel','BEVEL');mod.width=bevel;mod.segments=3
        mod=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');mod.keep_sharp=True
    return o

sphere_cache={}
def sphere(name,loc,scale,mat,segments=24,rings=12):
    key=(mat.name,segments,rings)
    if key not in sphere_cache:
        mesh=bpy.data.meshes.new(name);bm=bmesh.new();bmesh.ops.create_uvsphere(bm,u_segments=segments,v_segments=rings,radius=1,calc_uvs=True);bm.to_mesh(mesh);bm.free();mesh.materials.append(mat)
        for p in mesh.polygons:p.use_smooth=True
        sphere_cache[key]=mesh
    o=bpy.data.objects.new(name,sphere_cache[key]);bpy.context.collection.objects.link(o);o.location=loc;o.scale=scale
    return o

def cylinder(name,loc,radius,depth,mat,vertices=32):
    verts=[(radius*math.cos(i*math.tau/vertices),radius*math.sin(i*math.tau/vertices),z) for z in [-depth/2,depth/2] for i in range(vertices)]
    faces=[(i,(i+1)%vertices,(i+1)%vertices+vertices,i+vertices) for i in range(vertices)]+[tuple(range(vertices-1,-1,-1)),tuple(range(vertices,vertices*2))]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.materials.append(mat);mesh.update()
    for p in mesh.polygons:p.use_smooth=len(p.vertices)==4
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);o.location=loc
    mod=o.modifiers.new('Machined edge','BEVEL');mod.width=min(.004,radius*.08);mod.segments=2
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o

def tube(name,points,radius,mat):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=12
    s=curve.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
    for p,v in zip(s.bezier_points,points):p.co=v;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
    curve.bevel_depth=radius;curve.bevel_resolution=3
    o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o);assign(o,mat);return o

def bar(name,a,b,r,mat):
    a,b=Vector(a),Vector(b);o=cylinder(name,(a+b)/2,r,(b-a).length,mat,20)
    o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o

def area(name,loc,target,power,size,color='#fff0d8',size_y=None):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='RECTANGLE' if size_y else 'DISK';data.size=size
    if size_y:data.size_y=size_y
    data.color=linear(color)[:3]
    o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();o.visible_glossy=False;return o

def image_mat(name,path,emission_strength=0):
    m=material(name,'ffffff',.5);n=m.node_tree.nodes;l=m.node_tree.links;p=n.get('Principled BSDF')
    t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(path),check_existing=True);l.new(t.outputs['Color'],p.inputs['Base Color']);l.new(t.outputs['Alpha'],p.inputs['Alpha'])
    if emission_strength:l.new(t.outputs['Color'],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=emission_strength
    return m

def graphic(name,path,loc,w,h):
    # Plane faces the camera side of the shop (-Y), with proper UVs and Persian shaping baked into its artwork.
    bpy.ops.mesh.primitive_plane_add(size=1,location=(loc[0],loc[1]-.004,loc[2]),rotation=(math.pi/2,0,0))
    o=bpy.context.object;o.name=name;o.scale=(w,h,1);assign(o,image_mat(name+' print',path,.12));return o

def fascia(name,key,loc,w=3.4,h=.75):
    box(name+' panel',(loc[0],loc[1]+.04,loc[2]),(w+.06,.08,h+.06),black,.012)
    graphic(name,ASSETS/'graphics'/(key+'.png'),loc,w,h)

def lathe(name,profile,mat,segments=48):
    verts=[];faces=[]
    for r,z in profile:
        for j in range(segments):
            a=j*2*math.pi/segments;verts.append((r*math.cos(a),r*math.sin(a),z))
    for i in range(len(profile)-1):
        for j in range(segments):
            a=i*segments+j;b=i*segments+(j+1)%segments
            faces.append((a,b,b+segments,a+segments))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.materials.append(mat);mesh.update()
    uv=mesh.uv_layers.new(name='Cylindrical UV')
    for poly in mesh.polygons:
        for loop_index in poly.loop_indices:
            vi=mesh.loops[loop_index].vertex_index;i,j=divmod(vi,segments);uv.data[loop_index].uv=(j/segments,i/(len(profile)-1))
        poly.use_smooth=True
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);return obj

def duplicate(template,name,loc,scale=1,rotation=0):
    o=bpy.data.objects.new(name,template.data);bpy.context.collection.objects.link(o);o.location=loc;o.scale=(scale,scale,scale);o.rotation_euler.z=rotation;return o

# Architecture: a believable finished interior, with large daylight apertures and an exposed services ceiling.
box('22 x 30m polished terrazzo floor',(0,1,-.1),(22,30,.2),floor,.012)
box('Right plaster wall',(11,1,2.7),(.22,30,5.4),wall,.005)
box('Rear wall',(0,16,2.7),(22,.2,5.4),wall,.005)
box('Acoustic ceiling',(0,1,5.35),(22,30,.12),ceiling,.005)
for y in [-12,-8,-4,0,4,8,12,16]:
    box('Window mullion',(-11,y,2.6),(.08,.07,5.2),black,.003)
    if y<12:box('Low iron glazing',(-11,y+2,2.6),(.012,3.9,5.1),glass,.001)
for z in [.15,3.8,5.15]:box('Horizontal window framing',(-11,1,z),(.1,30,.06),black,.003)
for y in [-10,-3,4,11]:
    box('Structural crossbeam',(0,y,4.95),(22,.14,.3),aluminium,.008)
    for x in [-10.7,10.7]:box('Structural pier',(x,y,2.6),(.2,.2,5.2),aluminium,.01)
for x in [-6,1.8,8]:
    bar('Main spiral duct',(x,-12,4.55),(x,15,4.55),.24,aluminium)
    for y in range(-12,16):
        bpy.ops.mesh.primitive_torus_add(major_radius=.242,minor_radius=.006,major_segments=32,minor_segments=6,location=(x,y,4.55),rotation=(math.pi/2,0,0));assign(bpy.context.object,steel)
    for y in [-7,1,9]:
        bar('Branch air duct',(x,y,4.55),(x+1.7,y,4.55),.1,aluminium)
        box('Ceiling diffuser',(x+1.7,y,4.41),(.55,.55,.08),black,.008)
for y in [-9,-2,5,12]:
    bar('Red sprinkler main',(-10,y,4.87),(10,y,4.87),.022,red)
    for x in [-7,-2,3,8]:cylinder('Sprinkler head',(x,y,4.8),.035,.09,steel,16)
for x in [-7,-1,5]:
    for y in [-9,-3,3,9,14]:
        box('Linear suspended luminaire',(x,y,4.05),(.11,2.1,.09),black,.008)
        box('LED diffuser',(x,y,3.996),(.075,2.04,.012),warm_led,.004)
        for dy in [-.8,.8]:bar('Luminaire suspension',(x,y+dy,4.12),(x,y+dy,5.2),.004,steel)
        area('Ceiling light',(x,y,3.97),(x,y,0),75,1.5,'#fff1da',.35)

# Slatted oak soffit and joinery around the specialist food wall.
box('Protein backdrop',(6.2,8.9,2.45),(9.6,.15,4.9),green,.015)
for i in range(88):box('Oak wall slat',(1.5+i*.108,8.78,4.35),(.045,.06,1.35),wood,.004)
for x in [2.9,6,9.1]:
    fascia('Protein department', ['meat','poultry','fish'][[2.9,6,9.1].index(x)],(x,8.61,3.65),2.75,.69)
    box('Warm wall washer',(x,8.53,3.17),(2.7,.06,.018),warm_led,.003)
for ix in range(24):
    for iz in range(6):box('Glazed preparation wall tile',(1.5+ix*.4,8.74,.35+iz*.38),(.394,.04,.374),tile,.003)
for x in [3,6.5,9]:
    for dx in [-1,1]:
        for dy in [-.35,.35]:cylinder('Stainless bench leg',(x+dx,8.0+dy,.45),.025,.9,steel)
    box('Stainless prep worktop',(x,8.0,.94),(2.3,.85,.07),steel,.018)
    box('Prep bench lower shelf',(x,8,.3),(2.1,.7,.035),steel,.01)
    box('Sink bowl shadow',(x+.55,8,.963),(.5,.45,.008),black,.07)
    box('Inset steel sink bottom',(x+.55,8,.97),(.42,.36,.009),steel,.06)
    tube('Gooseneck faucet',[(x+.7,8.25,.98),(x+.7,8.25,1.4),(x+.45,8.25,1.43),(x+.43,8.1,1.28)],.017,steel)

# Curved-glass refrigerated service counter, sized and detailed as fabricated equipment.
for module,cx in enumerate([3,6.05,9.1]):
    box('Protein case insulated body',(cx,6.5,.52),(2.99,1.25,.8),green,.045)
    box('Recessed black plinth',(cx,6.5,.15),(2.85,1.15,.17),rubber,.012)
    for n in range(27):box('Oak case front fin',(cx-1.4+n*.105,5.853,.63),(.04,.07,.73),wood,.003)
    box('Satin steel case sill',(cx,6.5,.98),(3.02,1.4,.055),steel,.016)
    deck=box('Chilled display deck',(cx,6.48,1.07),(2.85,1.18,.045),tile,.012);deck.rotation_euler.x=math.radians(4)
    # Front surface curves back towards the top. Solidified, not an opaque placeholder.
    path=[(-.71,1.02),(-.76,1.2),(-.74,1.4),(-.65,1.61),(-.49,1.74)]
    verts=[]
    for x in [-1.49,1.49]:
        for y,z in path:verts.append((cx+x,6.5+y,z))
    faces=[(len(path)+i,len(path)+i+1,i+1,i) for i in range(len(path)-1)]
    mesh=bpy.data.meshes.new('Curved low iron front glass');mesh.from_pydata(verts,[],faces);mesh.materials.append(glass)
    obj=bpy.data.objects.new('Curved low iron front glass',mesh);bpy.context.collection.objects.link(obj)
    solid=obj.modifiers.new('6mm glass thickness','SOLIDIFY');solid.thickness=.006
    for p in mesh.polygons:p.use_smooth=True
    box('Glass counter top',(cx,6.43,1.75),(2.99,.98,.007),glass,.003)
    for dx in [-1.49,1.49]:
        box('Glass case end',(cx+dx,6.42,1.39),(.007,1.15,.66),glass,.002)
        cylinder('Glass support',(cx+dx,6.93,1.38),.013,.65,steel)
    box('Rear case frame',(cx,7.02,1.73),(3.0,.035,.055),steel,.01)
    box('Chilled case internal LED',(cx,6.98,1.66),(2.8,.025,.02),cold_led,.003)
    area('Protein display light',(cx,6.7,1.7),(cx,6.3,1),40,2.5,'#fff5e9',.2)

# Meat uses real muscle/fat surface artwork, physical roughness and a curved, irregular cut profile.
meat=material('Fresh beef muscle','#ffffff',.32)
nodes=meat.node_tree.nodes;links=meat.node_tree.links;p=nodes.get('Principled BSDF')
coord=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(.48,.48,1);mapping.inputs['Location'].default_value=(.51,.01,0)
tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(ROOT.parent/'public/textures/fresh-food-atlas.png'))
links.new(coord.outputs['UV'],mapping.inputs['Vector']);links.new(mapping.outputs['Vector'],tex.inputs['Vector']);links.new(tex.outputs['Color'],p.inputs['Base Color'])
p.inputs['Subsurface Weight'].default_value=.08;p.inputs['Subsurface Radius'].default_value=(.7,.2,.12)
fat=material('Ivory fat edge','#e0c7ae',.48);chicken=material('Fresh chicken skin','#e2bd9a',.42)
for module,cx in enumerate([3,6.05,9.1]):
    for i in range(5):
        x=cx-1.15+i*.57
        box('Black butcher tray',(x,6.45,1.12),(.51,1,.025),black,.025)
        for j in range(3):
            y=6.12+j*.29
            o=sphere('Fresh cut beef',(x,y,1.18),(.18,.12,.045),meat,32,16);o.rotation_euler.z=random.uniform(-.3,.3)
            # A narrow irregular fat seam follows one edge rather than a white geometric ring.
            tube('Natural fat seam',[(x-.14,y-.07,1.205),(x-.02,y-.11,1.218),(x+.1,y-.08,1.21)],.006,fat)

# Photogrammetry templates: the original mesh and scanned UV maps remain intact.
fruit_templates={}
for key in ['apple','lemon','lime']:
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(ASSETS/key/'source.gltf'))
    imported=[o for o in bpy.data.objects if o not in before]
    meshes=[o for o in imported if o.type=='MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes:o.select_set(True)
    bpy.context.view_layer.objects.active=meshes[0]
    if len(meshes)>1:bpy.ops.object.join()
    obj=bpy.context.object;world=obj.matrix_world.copy();obj.parent=None;obj.data.transform(world);obj.matrix_world=Matrix.Identity(4)
    verts=[v.co for v in obj.data.vertices]
    minimum=Vector([min(v[i] for v in verts) for i in range(3)]);maximum=Vector([max(v[i] for v in verts) for i in range(3)])
    center=Vector(((minimum.x+maximum.x)/2,(minimum.y+maximum.y)/2,minimum.z))
    factor=.082/max(maximum.x-minimum.x,maximum.y-minimum.y)
    for v in obj.data.vertices:v.co=(v.co-center)*factor
    obj.name='SCANNED TEMPLATE / '+key;obj.hide_render=True;obj.hide_set(True)
    fruit_templates[key]=obj
    for o in imported:
        if o!=obj and o.name in bpy.data.objects and o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True)

def fruit(key,loc,scale=1):
    obj=duplicate(fruit_templates[key],'Scanned '+key,loc,scale,random.uniform(-math.pi,math.pi));obj.rotation_euler.x=random.uniform(-.14,.14);obj.rotation_euler.y=random.uniform(-.14,.14);return obj

def produce_island(cx,cy):
    box('Produce island oak cabinet',(cx,cy,.54),(3.2,2.05,.78),wood,.055)
    box('Produce recessed olive base',(cx,cy,.14),(3.05,1.9,.17),green,.018)
    for n in range(31):box('Produce cabinet fluted joinery',(cx-1.5+n*.1,cy-1.04,.58),(.035,.055,.72),wood,.004)
    for row in range(3):
        z=.99+row*.14
        for col in range(3):
            x=cx-1.03+col*1.03;y=cy-.65+row*.65
            box('Sloped timber crate base',(x,y,z),(.98,.61,.035),wood,.008)
            for dx in [-.49,.49]:box('Crate side',(x+dx,y,z+.075),(.018,.62,.14),wood,.005)
            for dy in [-.3,.3]:box('Crate end',(x,y+dy,z+.075),(.98,.018,.14),wood,.005)
            for layer in range(2):
                for a in range(10):
                    for b in range(5):
                        if layer and (a in [0,9] or b in [0,4] or random.random()<.18):continue
                        kind=['apple','lemon','lime'][(col+row)%3]
                        fruit(kind,(x-.41+a*.089+random.uniform(-.008,.008),y-.22+b*.093+random.uniform(-.008,.008),z+.025+layer*.06),random.uniform(.9,1.1))
            box('Slim price card rail',(x,y-.33,z+.12),(.36,.016,.1),black,.004)
            # Printed price tags are deliberately understated at architectural viewing distance.
            box('Paper price card',(x,y-.34,z+.12),(.31,.003,.072),white,.001)
produce_island(-1.8,-3.6)
produce_island(-5.2,1.0)
fascia('Produce department','produce',(-5,1.1,3.6),4.2,.83)
for x in [-6.6,-3.4]:bar('Produce sign suspension',(x,1.12,4.95),(x,1.12,4.05),.004,steel)

# Central bulk island, with transparent dispensers, visible contents, levers, drip trays and retail packaging.
box('Bulk island rounded oak base',(.8,-1.0,.57),(3.5,1.65,.86),wood,.065)
box('Bulk recessed base',(.8,-1,.14),(3.28,1.45,.16),green,.02)
box('Bulk island black stone top',(.8,-1,1.04),(3.62,1.76,.08),black,.035)
box('Protail brand plaque',(.8,-1.875,.58),(.84,.015,.31),white,.012)
graphic('Original Protail logo',ROOT.parent/'Protail Logo/Protail_Logo.png',(.8,-1.887,.58),.78,.275)
for n in range(34):box('Bulk cabinet vertical oak slat',(-.83+n*.1,-1.84,.58),(.035,.045,.76),wood,.003)

grain_colors=['#b69861','#d4b888','#76623e','#d0b26f','#8c5f3b','#c19c6a']
grain_materials=[]
for i,color in enumerate(grain_colors):
    mat=material('Bulk grains '+str(i),color,.78)
    n=mat.node_tree.nodes;l=mat.node_tree.links;p=n.get('Principled BSDF');noise=n.new('ShaderNodeTexVoronoi');noise.inputs['Scale'].default_value=90
    ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=linear(color);ramp.color_ramp.elements[1].color=tuple(c*.42 for c in linear(color)[:3])+(1,)
    l.new(noise.outputs['Distance'],ramp.inputs[0]);l.new(ramp.outputs[0],p.inputs['Base Color']);grain_materials.append(mat)

for i in range(6):
    x=-.62+i*.56
    jar=lathe('Transparent gravity dispenser',[(.01,1.25),(.11,1.25),(.19,1.46),(.205,2.31),(.2,2.35)],glass,48);jar.location=(x,-.65,0)
    mod=jar.modifiers.new('3mm acrylic wall','SOLIDIFY');mod.thickness=.003
    cylinder('Black dispenser lid',(x,-.65,2.36),.218,.045,black,48)
    fill=cylinder('Visible bulk product',(x,-.65,1.86),.187,.79,grain_materials[i],48)
    for n in range(45):
        a=random.random()*math.tau;r=.17*math.sqrt(random.random())
        sphere('Loose grains at top',(x+math.cos(a)*r,-.65+math.sin(a)*r,2.265+random.random()*.025),(.012,.018,.009),grain_materials[i],8,6)
    cylinder('Dispenser outlet',(x,-.65,1.28),.065,.15,steel,24)
    box('Dispensing lever',(x,-.87,1.3),(.045,.2,.035),black,.009)
    box('Scoop tray',(x,-1.17,1.09),(.33,.37,.025),steel,.025)
    box('Dispenser frame',(x,-.3,1.7),(.025,.04,1.22),black,.008)

# Foreground jars and paper bags give honest close-up scale and material variety.
label_mats=[image_mat('Packaging artwork '+str(i),ASSETS/'graphics'/f'label-{i}.png') for i in range(8)]
jar_template=lathe('Jar template',[(.001,0),(.08,0),(.09,.015),(.09,.23),(.08,.245),(.079,.27),(.001,.27)],glass,40)
jar_template.hide_render=True
for i in range(5):
    x=-.5+i*.53
    duplicate(jar_template,'Glass retail jar',(x,-1.5,1.085))
    cylinder('Jar contents',(x,-1.5,1.19),.076,.19,grain_materials[i],32)
    cylinder('Jar lid',(x,-1.5,1.365),.084,.025,black,32)
    # An applied label, not a floating text overlay.
    bpy.ops.mesh.primitive_plane_add(size=1,location=(x,-1.591,1.225),rotation=(math.pi/2,0,0));o=bpy.context.object;o.scale=(.13,.14,1);assign(o,label_mats[i])
fascia('Bulk department','bulk',(.8,1.7,3.5),3.6,.7)
for x in [-.5,2.1]:bar('Bulk sign suspension',(x,1.73,3.9),(x,1.73,5.2),.004,steel)

# Genuine suspended ring luminaires: black housing, continuous diffuser and soft illumination.
for cy,radius in [(-2.0,1.35),(4.5,1.25)]:
    for z,minor,mat in [(3.55,.035,black),(3.52,.017,warm_led)]:
        bpy.ops.mesh.primitive_torus_add(major_radius=radius,minor_radius=minor,major_segments=96,minor_segments=8,location=(.8,cy,z));assign(bpy.context.object,mat)
        for p in bpy.context.object.data.polygons:p.use_smooth=True
    for a in [0,2*math.pi/3,4*math.pi/3]:bar('Ring suspension',(.8+math.cos(a)*radius,cy+math.sin(a)*radius,3.57),(.8+math.cos(a)*radius,cy+math.sin(a)*radius,5.2),.003,steel)
    area('Ring soft illumination',(.8,cy,3.5),(.8,cy,0),180,2.5,'#ffe8be')

# Rear grocery aisles, metal shelf brackets, price rails and varied products (shared geometry).
def bottle_template():
    m=material('Olive bottle green glass','#44562d',.17,0,.5)
    return lathe('Reusable bottle mesh',[(0,0),(.042,0),(.045,.018),(.045,.22),(.035,.26),(.017,.29),(.017,.33),(0,.33)],m,32)
bottle=bottle_template();bottle.hide_render=True
pack_templates=[]
for i in range(8):
    obj=box('Packaged goods template',(-30,0,0),(.12,.075,.22),label_mats[i],.004);obj.hide_render=True
    pack_templates.append(obj)
for x in [-6.8,-2.8,1.2]:
    for y in [8.4,12.8]:
        box('Gondola black plinth',(x,y,.13),(1.2,3.8,.2),black,.015)
        box('Gondola oak spine',(x,y,1.35),(.055,3.8,2.5),wood,.008)
        for side in [-1,1]:
            for z in [.35,.8,1.25,1.7,2.15]:
                box('Adjustable steel shelf',(x+side*.34,y,z),(.64,3.8,.025),steel,.006)
                box('Slim dark price rail',(x+side*.665,y,z+.025),(.025,3.8,.055),black,.004)
                for a in range(21):
                    for row in range(2):
                        px=x+side*(.16+row*.25);py=y-1.73+a*.17
                        if (a+round(z*10))%3==0:
                            duplicate(bottle,'Shelf glass bottle',(px,py,z+.015),random.uniform(.85,1),random.random()*math.tau)
                            cylinder('Bottle cap',(px,py,z+.345),.018,.023,black,16)
                        else:
                            t=pack_templates[(a+round(z*10))%8]
                            o=duplicate(t,'Shelf packaged product',(px,py,z+.125),random.uniform(.9,1.05),side*math.pi/2)
        for dy in [-1.9,1.9]:box('Gondola upright',(x,y+dy,1.35),(.08,.08,2.5),black,.005)
fascia('Grocery aisle identity','aisle',(-4.5,14.1,3.45),4,.75)

# Rear upright fridges: doors, seals, handles, shelves, bottles and internal light.
for cx in [-7,-3,1]:
    box('Refrigerated multideck shell',(cx,15.3,1.5),(3.9,1.1,2.85),black,.035)
    box('Refrigerator steel back',(cx,15.0,1.48),(3.6,.05,2.45),steel,.012)
    for z in [.4,.9,1.4,1.9,2.4]:
        box('Refrigerated shelf',(cx,14.83,z),(3.65,.7,.025),steel,.005)
        box('Cold shelf LED',(cx,14.5,z-.025),(3.5,.012,.012),cold_led,.002)
        for i in range(20):duplicate(bottle,'Refrigerated bottles',(cx-1.65+i*.17,14.75,z+.02),.8)
    for dx in [-1.3,0,1.3]:
        box('Refrigerator low iron door',(cx+dx,14.54,1.5),(1.25,.006,2.65),glass,.002)
        box('Refrigerator door handle',(cx+dx+.49,14.5,1.45),(.018,.04,.46),steel,.006)
        for dd in [-.64,.64]:box('Door gasket',(cx+dx+dd,14.53,1.5),(.025,.03,2.7),rubber,.003)

# Leafy planting is modelled with thin curved surfaces and transmission, not clusters of spheres.
leaf=material('Natural leaf','#355b2e',.48)
leaf.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value=.08
def plant(cx,cy,z,size=.65):
    pot=lathe('Ceramic planter',[(0,0),(.19,0),(.24,.06),(.27,.38),(.28,.4),(.25,.4),(.23,.35)],terracotta,40);pot.location=(cx,cy,z)
    for n in range(24):
        a=n*2.399+random.random()*.2;length=random.uniform(.3,.65)*size;start=Vector((cx,cy,z+.35));end=start+Vector((math.cos(a)*length,math.sin(a)*length,random.uniform(.3,.8)*size))
        mid=(start+end)/2+Vector((0,0,.12*size));tube('Living plant stem',[start,mid,end],.003,green)
        direction=(end-start).normalized();side=Vector((-direction.y,direction.x,0)).normalized()
        verts=[];faces=[]
        for i in range(7):
            t=i/6;center=start.lerp(end,t)+Vector((0,0,math.sin(t*math.pi)*.09))
            width=math.sin(t*math.pi)*.1*size
            verts.extend([center-side*width,center+Vector((0,0,.01)),center+side*width])
        for i in range(6):
            for j in range(2):q=i*3+j;faces.append((q,q+1,q+4,q+3))
        mesh=bpy.data.meshes.new('Curved leaf');mesh.from_pydata(verts,[],faces);mesh.materials.append(leaf)
        o=bpy.data.objects.new('Curved leaf',mesh);bpy.context.collection.objects.link(o)
        for p in mesh.polygons:p.use_smooth=True
for y in [-6,0,6,12]:plant(-10.5,y,.03,1.2)
for x,y in [(-1,1.2),(2.5,1.2)]:
    plant(x,y,3.5,.85)
    for a in [0,2.1,4.2]:bar('Hanging planter cable',(x+.2*math.cos(a),y+.2*math.sin(a),3.9),(x,y,5.2),.002,black)

# Daylight and photographic lighting, with no fake full-frame background image.
world=bpy.data.worlds.new('Daylight environment') if not scene.world else scene.world
scene.world=world;world.use_nodes=True
n=world.node_tree.nodes;l=world.node_tree.links
bg=n.get('Background');bg.inputs['Strength'].default_value=.22
sky=n.new('ShaderNodeTexSky');sky.sky_type='NISHITA';sky.sun_elevation=math.radians(34);sky.sun_rotation=math.radians(230);sky.air_density=1.1;sky.dust_density=.7
l.new(sky.outputs['Color'],bg.inputs['Color'])
area('Large window daylight',(-11.8,-3,3.8),(0,2,1),2700,10,'#e2edff',4)
area('Window front daylight',(-10.9,-10,3.8),(0,-2,1),1500,5,'#f1f3ff',3)
sun_data=bpy.data.lights.new('Late morning sun','SUN');sun_data.energy=1.7;sun_data.angle=math.radians(3)
sun=bpy.data.objects.new('Late morning sun',sun_data);bpy.context.collection.objects.link(sun);sun.rotation_euler=(math.radians(34),math.radians(-28),math.radians(-62))
area('Camera-side soft architectural fill',(6.5,-10,3.6),(-2,2,1.5),550,5,'#fff3dc',3)

bpy.ops.object.camera_add(location=(3.7,-6.8,1.85))
camera=bpy.context.object;camera.name='PROTAIL / interior quality reference'
target=Vector((-1.3,3.2,1.55));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.lens=24;camera.data.sensor_width=36;camera.data.clip_end=150
camera.data.dof.use_dof=True;camera.data.dof.focus_distance=(Vector((.8,-1,1.7))-camera.location).length;camera.data.dof.aperture_fstop=8
scene.camera=camera

scene['project']='Protail / interior quality gate'
scene['scope']='One editable interior frame: scanned produce, bulk, protein counter, grocery aisles, ceiling services, floor and identity.'
scene['asset_sources']='render/assets/sources.json; downloaded Poly Haven assets are CC0.'
scene['role']='Construction and MEP: Protail consultation and supervision; execution by contractor.'
scene['reference_refined']=True

# Pack the actual maps and geometry into the editable file for reliable review and future animation.
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT/'protail-interior-reference.blend'))
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT/'protail-interior-reference.blend'))
manifest={'blender':bpy.app.version_string,'engine':'Cycles','width':scene.render.resolution_x,'height':scene.render.resolution_y,'samples':opt.samples,'objects':len(scene.objects),'camera':list(camera.location),'output':str(OUTPUT/(opt.name+'.png')),'models':'Real Poly Haven scanned apple, lemon and lime; all architecture and equipment are editable geometry.'}
(OUTPUT/'render-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print('PROTAIL_SCENE_READY',json.dumps(manifest))
if not opt.build_only:
    scene.render.filepath=str(OUTPUT/(opt.name+'.png'))
    bpy.ops.render.render(write_still=True)
    print('PROTAIL_RENDER_DONE',scene.render.filepath)
