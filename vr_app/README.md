# Manresa VR app.

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
- cd the project folder
- npm install three (es crea carpeta node_modules, package-lock.json i package.json) 
- npm install three-mesh-ui


3. Install dev dependencies
- npm install -D vite
- npm install -D vite-plugin-restart
- npm install -D vite-plugin-mkcert

4. Initialize the project
- npm init -y

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

. Adding static assets
   
I added other resources to the static/ folder (for example .ply, .nxz, textures, etc.).


7. Running the project
To install the package.json
npm install
To start the development server: 
npm run dev
