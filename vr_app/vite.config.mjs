import restart from 'vite-plugin-restart'
import mkcert from 'vite-plugin-mkcert'
import { defineConfig } from 'vite'

export default defineConfig({
    base: './', // Base path for the app (useful if served from a subdirectory) 
    root: './', // Sources files (typically where index.html is)
    publicDir: './static/', // Path from "root" to static assets (files that are served as they are)
    server:
    {
        host: true, // Open to local network and display URL
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
    },
    build:
    {
        outDir: './dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
//        sourcemap: true, // Add sourcemap
    },
    plugins:
    [
        restart({ restart: [ '../static/**', ] }), // Restart server on static file change
        mkcert() // Add HTTPS support (needed for webxr development over the network)
    ],
})