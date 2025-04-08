/**
 * Mastra AI Voice Recognition - Windows Build Script
 * 
 * This script builds the Windows installer for the Mastra AI Voice Recognition application.
 * 
 * To run this script:
 * 1. Install the required dependencies: npm install
 * 2. Run the script: node build-windows.js
 */

const builder = require('electron-builder');
const path = require('path');

const config = {
  appId: 'com.mastra.ai.voice',
  productName: 'Mastra AI Voice',
  directories: {
    output: path.join(__dirname, 'dist'),
    app: __dirname
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: path.join(__dirname, 'assets', 'icon.ico')
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Mastra AI Voice',
    uninstallDisplayName: 'Mastra AI Voice',
    artifactName: 'MastraAIVoice-Setup-${version}.${ext}'
  },
  extraResources: [
    {
      from: path.join(__dirname, 'assets'),
      to: 'assets',
      filter: ['**/*']
    }
  ],
  files: [
    '**/*',
    '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
  ]
};

async function buildWindows() {
  console.log('Building Windows installer...');
  
  try {
    const result = await builder.build({
      targets: builder.Platform.WINDOWS.createTarget(),
      config
    });
    
    console.log('Build completed successfully!');
    console.log('Installer created at:', result[0].path);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildWindows();
