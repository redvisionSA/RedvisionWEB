@echo off
REM ---------------------------------------------------------------------
REM  Publicacion inicial de la web institucional de REDVISION en GitHub.
REM
REM  Que hace:
REM    1. Inicializa el repositorio local en esta carpeta (rama main).
REM    2. Agrega todo lo que NO este excluido por .gitignore.
REM       Quedan fuera: node_modules, dist, public/draco (se regenera en
REM       cada npm install) e img (material crudo, ~48 MB).
REM    3. Crea el primer commit.
REM    4. Lo sube a https://github.com/redvisionSA/RedvisionWEB.git
REM
REM  Uso: doble clic, o ejecutar desde la carpeta del proyecto.
REM
REM  La primera vez Git va a pedir la identidad de GitHub. Se abre una
REM  ventana del navegador para iniciar sesion; la credencial queda
REM  guardada en el Administrador de credenciales de Windows.
REM ---------------------------------------------------------------------

setlocal
cd /d "%~dp0"

echo.
echo === Carpeta: %CD%
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git no esta instalado o no esta en el PATH.
  echo         Descargalo desde https://git-scm.com/download/win
  echo.
  pause
  exit /b 1
)

if not exist ".git" (
  echo === Inicializando repositorio...
  git init -b main || goto :error
) else (
  echo === El repositorio ya existe, se reutiliza.
)

echo.
echo === Preparando archivos...
git add -A || goto :error

echo.
echo === Creando el commit...
git commit -m "Sitio institucional REDVISION: maqueta completa" -m "Web institucional construida con Vite + React + Tailwind y React Three Fiber. Lenguaje visual Liquid Glass sobre bento grid, paleta estricta de marca (blanco, negro y rojo #D61922 identico en ambos temas), robot Dahua en 3D que sigue al cursor y al giroscopio, catalogo multimarca con Dahua Technology como plataforma de referencia, datos reales de contacto, mapa y resenas de Google. Copia integra en espanol con tildes y enies."
if errorlevel 1 (
  echo.
  echo [AVISO] No se creo un commit nuevo. Si dice "nothing to commit",
  echo         significa que ya estaba todo commiteado: seguimos al push.
)

echo.
echo === Configurando el remoto...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/redvisionSA/RedvisionWEB.git || goto :error

echo.
echo === Subiendo a GitHub...
git push -u origin main || goto :error

echo.
echo === LISTO. El proyecto esta en:
echo     https://github.com/redvisionSA/RedvisionWEB
echo.
pause
exit /b 0

:error
echo.
echo [ERROR] El comando anterior fallo. Revisa el mensaje de arriba.
echo.
pause
exit /b 1
