const packageJson = require('./package.json');

module.exports = {
    packagerConfig: {
        asar: true,
        dir: './',
        out: `release/${packageJson.version}`,
        ignore: ['!dist-electron', '!dist'],
        appId: 'TranslaTerror',
        icon: './build/icon',
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            platforms: ['win32'],
            config: {
                name: 'TranslaTerror',
                setupExe: `translaterror_${packageJson.version}.exe`,
                setupIcon: './build/icon.ico',
                oneClick: false,
                perMachine: false,
                allowToChangeInstallationDirectory: true,
                deleteAppDataOnUninstall: false,
            },
        },
        {
            name: '@electron-forge/maker-dmg',
            platforms: ['darwin'],
            config: {
                name: `translaterror_${packageJson.version}`,
                format: 'ULFO',
                icon: './build/icon.icns',
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
    ],
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'jonaszb',
                    name: 'translaterror',
                },
                prerelease: true,
            },
        },
    ],
};
