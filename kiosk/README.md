# Altarpiece Kiosk Viewer

## General Overview
An interactive kiosk application built using 3DHOP to display a 3D reconstruction of a historical altarpiece. Designed for use in webpages and touchscreen kiosks.

## Architecture
```
kiosk/
├── img/                     # Graphic materials
├── js/                      # Javascript files
├── models/
│   ├── iconografia/         # Nexus and PLY 3D meshes and textures
│   └── reconstruccio/       # Nexus and PLY 3D meshes
├── skins/                   # Images for UI elements
├── stylesheet/              # CSS elements
├── README.md                # This file
├── menu.html                # Primary Kiosk touchscreen application entry point
└── ...                      # Other pages of the kiosk
```

## Local setup instructions
> [!NOTE]
> **HTTP Server Required:** Double-clicking `menu.html` will cause browser security (CORS) errors when loading 3D models. The application must be opened using a local web server.

### Quick Start (VS Code)

1. Open the `kiosk` folder in VS Code.
2. Install the **[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)** extension.
3. Right-click `menu.html` and select **Open with Live Server**.

### Alternative (No Extensions Required)
If you have Python installed, navigate to the `kiosk` folder in your terminal and run:

```bash
python -m http.server 8000
```
Then open `http://localhost:8000/menu.html` in your web browser.


> [!NOTE]
> Due to file size restrictions on GitHub, heavy 3D assets (.nxz / .nxs files, such as policromia.nxz) may be excluded from this repository. Ensure all required model files are placed into models/reconstruccio/ and models/iconografia/ before launching the viewer.
