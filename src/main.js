"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    fps: { forceSetTimeOut: true, target: 60 },
    width: 1000,
    height: 800,
    scene: [Gallery]
}


const game = new Phaser.Game(config);