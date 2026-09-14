# -*- coding: utf-8 -*-
"""
exportar_robot.py
-----------------
Reexporta Dahua_Robot_Replica.blend a public/Dahua_Robot_Replica.glb
comprimido con Draco, y lista los nodos para verificar el contrato.

Este script reproduce exactamente el export que consume la web. Corrélo
cada vez que toques el modelo en Blender.

Uso A (interfaz de Blender):
    1. Abrir Dahua_Robot_Replica.blend
    2. Scripting > Open > este archivo > Run Script
    3. Ver la consola (Window > Toggle System Console en Windows)

Uso B (linea de comandos):
    blender Dahua_Robot_Replica.blend --background --python exportar_robot.py

Salida esperada: unos 340 KB con Draco, contra 1.814 KB sin comprimir.
"""

import os
import bpy

# Carpeta public/ del sitio. Ajustala si moves el proyecto.
OUT_DIR = r"C:\Users\tecno\OneDrive\Desktop\RedvisionWeb\public"
OUTPUT_PATH = os.path.join(OUT_DIR, "Dahua_Robot_Replica.glb")

os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. Seleccion: solo el robot.
#    Se excluyen camara, luces, el plano Piso y los cortadores booleanos CUT_*.
# ---------------------------------------------------------------------------
bpy.ops.object.select_all(action="DESELECT")

seleccionados = []
for obj in bpy.data.objects:
    if obj.name.startswith("RV_") or obj.name in ("CTRL_Cabeza", "CTRL_Lente"):
        obj.select_set(True)
        seleccionados.append(obj.name)

bpy.context.view_layer.objects.active = bpy.data.objects["CTRL_Cabeza"]
print("Objetos seleccionados: %d" % len(seleccionados))

# ---------------------------------------------------------------------------
# 2. Export glTF binario con Draco
# ---------------------------------------------------------------------------
bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
    export_format="GLB",
    use_selection=True,
    export_apply=True,        # aplica modificadores
    export_yup=True,          # convencion de three.js
    export_materials="EXPORT",
    export_image_format="AUTO",
    export_cameras=False,
    export_lights=False,
    export_animations=False,
    export_skins=False,
    export_extras=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12,
)

tam = os.path.getsize(OUTPUT_PATH) / 1024.0
print("OK: %s (%.0f KB)" % (OUTPUT_PATH, tam))

# ---------------------------------------------------------------------------
# 3. Verificacion del contrato que espera src/components/RobotDahua.jsx
# ---------------------------------------------------------------------------
print("\n--- Controles animables ---")
for nombre in ("CTRL_Cabeza", "CTRL_Lente"):
    obj = bpy.data.objects.get(nombre)
    if obj is None:
        print("  FALTA: %s  <-- la web no podra animar la cabeza" % nombre)
        continue
    print(
        "  %-14s loc=%s rot_euler=%s scale=%.4f padre=%s"
        % (
            nombre,
            tuple(round(v, 5) for v in obj.location),
            tuple(round(v, 5) for v in obj.rotation_euler),
            obj.scale.x,
            obj.parent.name if obj.parent else None,
        )
    )

print("\n--- Mallas exportadas ---")
for nombre in sorted(seleccionados):
    if nombre.startswith("RV_"):
        print("  %s" % nombre)

print(
    "\nRecordatorio: RV_Cuerpo_GrisCamara (rejilla del altavoz) debe quedar "
    "fuera de CTRL_Cabeza. En una camara PT la base no gira."
)
