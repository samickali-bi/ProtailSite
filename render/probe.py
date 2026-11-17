import bpy,json,os
from pathlib import Path
root=Path(__file__).parent
result={'version':bpy.app.version_string,'devices':[],'selected':'CPU'}
prefs=bpy.context.preferences.addons['cycles'].preferences
for backend in ['OPTIX','CUDA','HIP','ONEAPI']:
    try:
        prefs.compute_device_type=backend
        prefs.get_devices()
        devices=[{'name':d.name,'type':d.type} for d in prefs.devices]
        result['devices'].append({'backend':backend,'devices':devices})
        if any(d.type!='CPU' for d in prefs.devices):
            result['selected']=backend
            break
    except Exception as e:
        result['devices'].append({'backend':backend,'error':str(e)})
(root/'hardware.json').write_text(json.dumps(result,indent=2),encoding='utf8')
print('PROTAIL_HARDWARE',json.dumps(result))
