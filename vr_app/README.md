# Altarpiece VR Application
## Global overview
An immersive WebVR experience built with [Three.js](https://threejs.org/) and WebXR, offering a 1:1 scale spatial exploration of the digitally reconstructed altarpiece within its historical architectural context (the now-lost church schematically modelled). Designed for WebXR-compatible VR headsets (e.g., Meta Quest).

## Architecture
```text
vr-app/
├── node_modules/        # Installed npm package dependencies
├── src/                 
│   ├── script.js        # Main WebXR application logic, scene setup, and interaction pipeline
│   ├── Nexus3D.js       # Nexus multiresolution loader engine
│   └── ...              # Additional helper modules and source scripts
├── static/
│   ├── fonts/           # Text font assets used in the 3D scene / UI
│   ├── models/          # 3D meshes (Nexus .nxz/.nxs files and PLY models)
│   └── ...              # Other static graphic materials, textures, and assets
├── index.html           # Primary HTML entry point and canvas layout
├── README.md            # This file
└── vite.config.mjs      # Vite bundler and development server configuration
```

## Setup instructions
> [!NOTE]
> `static/` folder is ignored by `.gitignore` to comply with GitHub's 100 MB file size restriction.

0. Pre-requisites (Ubuntu)
- Install curl from apt repositories (not snap version!)
- Install nvm https://github.com/nvm-sh/nvm

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
source ~/.bashrc
nvm --version
```
- Install node.js 
```
nvm install --lts
```
- Verify
```
node -v
npm -v
```

1. Clone the project
- git clone https://github.com/potenziani/Manresa.git

2. Inside the project folder, install dependencies
```
cd the project folder
npm install three (es crea carpeta node_modules, package-lock.json i package.json) 
npm install three-mesh-ui
```

3. Install dev dependencies
```
npm install -D vite
npm install -D vite-plugin-restart
npm install -D vite-plugin-mkcert
```

4. Initialize the project
```
npm init -y
```

5. Modify package.json
  - add private
  "private": true, 
  - set scripts to:
  "scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
  }
  - set type to:
  "type": "module"
 - delete "test"

6. Adding static assets
   
I added other resources to the static/ folder (for example .ply, .nxz, textures, etc.).


7. Running the project
To install the package.json
```
npm install
```

To start the development server: 
```
npm run dev
```
