import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let grids = [];
let selectedGridIndex = -1;
let glass;
let textureForState0, textureForState1;
let binaryData = '';

class BlockGrid {
    constructor(textureForState0, textureForState1, xCount, yCount, zCount, xDistance, yDistance, zDistance, xTilt, zTilt, posX, posY, posZ, loopOrder = 'x,y,z') {
        this.textureForState0 = textureForState0;
        this.textureForState1 = textureForState1;
        this.xCount = xCount;
        this.yCount = yCount;
        this.zCount = zCount;
        this.xDistance = xDistance;
        this.yDistance = yDistance;
        this.zDistance = zDistance;
        this.xTilt = xTilt;
        this.zTilt = zTilt;
        this.posX = posX;
        this.posY = posY;
        this.posZ = posZ;
        this.cubes = [];
        this.loopOrder = loopOrder;
        this.createGrid();
    }

    createGrid() {
        const geometry = new THREE.BoxGeometry();
        let material;
        let textureIndex = 0;

        const loopOrder = this.loopOrder.split(',');

        const loop = {
            x: this.xCount,
            y: this.yCount,
            z: this.zCount,
        };

        for (let i = 0; i < loop[loopOrder[0]]; i++) {
            for (let j = 0; j < loop[loopOrder[1]]; j++) {
                for (let k = 0; k < loop[loopOrder[2]]; k++) {
                    const x = loopOrder[0] === 'x' ? i : (loopOrder[1] === 'x' ? j : k);
                    const y = loopOrder[0] === 'y' ? i : (loopOrder[1] === 'y' ? j : k);
                    const z = loopOrder[0] === 'z' ? i : (loopOrder[1] === 'z' ? j : k);

                    if (textureIndex < binaryData.length) {
                        material = new THREE.MeshStandardMaterial({ map: binaryData[textureIndex] === '1' ? this.textureForState1 : this.textureForState0 });
                        textureIndex++;
                    } else {
                        material = new THREE.MeshStandardMaterial({ map: this.textureForState0 });
                    }
                    const cube = new THREE.Mesh(geometry, material);
                    cube.position.set(
                        this.posX + x * this.xDistance,
                        this.posY + y * this.yDistance + x * this.xTilt + z * this.zTilt,
                        this.posZ + z * this.zDistance
                    );
                    scene.add(cube);
                    this.cubes.push(cube);
                }
            }
        }
    }

    updateGrid() {
        this.cubes.forEach(cube => scene.remove(cube));
        this.cubes = [];
        this.createGrid();
    }

    updatePosition() {
        let cubeIndex = 0;

        const loopOrder = this.loopOrder.split(',');

        const loop = {
            x: this.xCount,
            y: this.yCount,
            z: this.zCount,
        };

        for (let i = 0; i < loop[loopOrder[0]]; i++) {
            for (let j = 0; j < loop[loopOrder[1]]; j++) {
                for (let k = 0; k < loop[loopOrder[2]]; k++) {
                    const x = loopOrder[0] === 'x' ? i : (loopOrder[1] === 'x' ? j : k);
                    const y = loopOrder[0] === 'y' ? i : (loopOrder[1] === 'y' ? j : k);
                    const z = loopOrder[0] === 'z' ? i : (loopOrder[1] === 'z' ? j : k);
                    const cube = this.cubes[cubeIndex];
                    if (cube) {
                        cube.position.set(
                            this.posX + x * this.xDistance,
                            this.posY + y * this.yDistance + x * this.xTilt + z * this.zTilt,
                            this.posZ + z * this.zDistance
                        );
                        cubeIndex++;
                    }
                }
            }
        }
    }

    toJSON() {
        return {
            xCount: this.xCount,
            yCount: this.yCount,
            zCount: this.zCount,
            xDistance: this.xDistance,
            yDistance: this.yDistance,
            zDistance: this.zDistance,
            xTilt: this.xTilt,
            zTilt: this.zTilt,
            posX: this.posX,
            posY: this.posY,
            posZ: this.posZ,
            loopOrder: this.loopOrder
        };
    }
}


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 10, 20);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x282a36);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    
    const light = new THREE.AmbientLight(0xd0d0d0);
    scene.add(light);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('blocks/redstone_block.png', (texture) => {
        textureForState0 = texture;
        textureForState0.minFilter = THREE.NearestFilter;
        textureForState0.magFilter = THREE.NearestFilter;

        textureLoader.load('blocks/gold_block.png', (texture) => {
            textureForState1 = texture;
            textureForState1.minFilter = THREE.NearestFilter;
            textureForState1.magFilter = THREE.NearestFilter;

            addGrid(textureForState0, textureForState1);
        });
    });
/*
    function loadTexture(textureName, callback) {
        const textureLoader = new THREE.TextureLoader();
        if (textureName === 'barrel') {
            const textures = {
                top: textureLoader.load(`${textureName}_top.png`),
                side: textureLoader.load(`${textureName}_side.png`),
                bottom: textureLoader.load(`${textureName}_bottom.png`)
            };
            callback(new THREE.MeshStandardMaterial({ map: textures.side }), textures);
        } else {
            textureLoader.load(`${textureName}`, (texture) => {
                texture.minFilter = THREE.NearestFilter;
                texture.magFilter = THREE.NearestFilter;
                callback(new THREE.MeshStandardMaterial({ map: texture }));
            });
        }
    }
*/
    textureLoader.load('glass.png', (texture) => {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true});
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        glass = new THREE.Mesh(geometry, material);
        scene.add(glass);
    });

    document.getElementById('addGrid').addEventListener('click', () => {
        addGrid(textureForState0, textureForState1);
    });

    document.getElementById('removeGrid').addEventListener('click', () => {
        if (selectedGridIndex >= 0) {
            removeGrid(selectedGridIndex);
        }
    });

    document.getElementById('gridSelector').addEventListener('change', (event) => {
        selectedGridIndex = parseInt(event.target.value);
        updateControls();
    });

    document.getElementById('xDistance').addEventListener('input', updateGridProperty);
    document.getElementById('yDistance').addEventListener('input', updateGridProperty);
    document.getElementById('zDistance').addEventListener('input', updateGridProperty);
    document.getElementById('xTilt').addEventListener('input', updateGridProperty);
    document.getElementById('zTilt').addEventListener('input', updateGridProperty);
    document.getElementById('xCount').addEventListener('input', updateGridProperty);
    document.getElementById('yCount').addEventListener('input', updateGridProperty);
    document.getElementById('zCount').addEventListener('input', updateGridProperty);

    document.getElementById('gridPosX').addEventListener('input', updateGridPosition);
    document.getElementById('gridPosY').addEventListener('input', updateGridPosition);
    document.getElementById('gridPosZ').addEventListener('input', updateGridPosition);
    document.getElementById('loopOrder').addEventListener('change', updateGridProperty);

    document.getElementById('glassX').addEventListener('input', updateGlassPosition);
    document.getElementById('glassY').addEventListener('input', updateGlassPosition);
    document.getElementById('glassZ').addEventListener('input', updateGlassPosition);

    document.getElementById('exportJson').addEventListener('click', exportToJson);
    document.getElementById('importJson').addEventListener('change', importFromJson);

    document.getElementById('binaryData').addEventListener('input', applyBinaryData);

    document.getElementById('flipX').addEventListener('click', flipX);
    document.getElementById('flipY').addEventListener('click', flipY);
    document.getElementById('flipZ').addEventListener('click', flipZ);

    animate();
    createAxes();
}

function createAxes() {
    const colors = {
        x: 0xff0000,
        y: 0x00ff00,
        z: 0x0000ff
    };

    function createLine(start, end, color) {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({ color });
        return new THREE.Line(geometry, material);
    }

    const xLine = createLine(
        new THREE.Vector3(-0.5, -0.5, -0.5),
        new THREE.Vector3(500, -0.5, -0.5),
        colors.x
    );
    scene.add(xLine);

    const yLine = createLine(
        new THREE.Vector3(-0.5, -0.5, -0.5),
        new THREE.Vector3(-0.5, 500, -0.5),
        colors.y
    );
    scene.add(yLine);

    const zLine = createLine(
        new THREE.Vector3(-0.5, -0.5, -0.5),
        new THREE.Vector3(-0.5, -0.5, 500),
        colors.z
    );
    scene.add(zLine);
}

function addGrid(textureForState0, textureForState1) {
    const grid = new BlockGrid(textureForState0, textureForState1, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0);
    grids.push(grid);
    updateGridSelector();
    selectedGridIndex = grids.length - 1;
    updateControls();
    applyBinaryData();
}

function removeGrid(index) {
    grids[index].cubes.forEach(cube => scene.remove(cube));
    grids.splice(index, 1);
    updateGridSelector();
    selectedGridIndex = -1;
    updateControls();
    applyBinaryData();
}

function updateGridSelector() {
    const selector = document.getElementById('gridSelector');
    selector.innerHTML = '';
    grids.forEach((grid, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = `Grid ${index + 1}`;
        selector.appendChild(option);
    });
    if (grids.length > 0) {
        selector.value = grids.length - 1;
        selectedGridIndex = grids.length - 1;
    } else {
        selectedGridIndex = -1;
    }
    updateControls();
}

function updateControls() {
    if (selectedGridIndex >= 0) {
        const grid = grids[selectedGridIndex];
        document.getElementById('xDistance').value = grid.xDistance;
        document.getElementById('yDistance').value = grid.yDistance;
        document.getElementById('zDistance').value = grid.zDistance;
        document.getElementById('xTilt').value = grid.xTilt;
        document.getElementById('zTilt').value = grid.zTilt;
        document.getElementById('xCount').value = grid.xCount;
        document.getElementById('yCount').value = grid.yCount;
        document.getElementById('zCount').value = grid.zCount;
        document.getElementById('gridPosX').value = grid.posX;
        document.getElementById('gridPosY').value = grid.posY;
        document.getElementById('gridPosZ').value = grid.posZ;
        document.getElementById('loopOrder').value = grid.loopOrder;
    } else {
        document.getElementById('xDistance').value = 5;
        document.getElementById('yDistance').value = 5;
        document.getElementById('zDistance').value = 5;
        document.getElementById('xTilt').value = 0;
        document.getElementById('zTilt').value = 0;
        document.getElementById('xCount').value = 5;
        document.getElementById('yCount').value = 5;
        document.getElementById('zCount').value = 5;
        document.getElementById('gridPosX').value = 0;
        document.getElementById('gridPosY').value = 0;
        document.getElementById('gridPosZ').value = 0;
        document.getElementById('loopOrder').value = 'x,y,z';
    }
}

function updateGridProperty() {
    if (selectedGridIndex >= 0) {
        const grid = grids[selectedGridIndex];
        grid.xDistance = parseInt(document.getElementById('xDistance').value);
        grid.yDistance = parseInt(document.getElementById('yDistance').value);
        grid.zDistance = parseInt(document.getElementById('zDistance').value);
        grid.xTilt = parseInt(document.getElementById('xTilt').value);
        grid.zTilt = parseInt(document.getElementById('zTilt').value);
        grid.xCount = parseInt(document.getElementById('xCount').value);
        grid.yCount = parseInt(document.getElementById('yCount').value);
        grid.zCount = parseInt(document.getElementById('zCount').value);
        grid.loopOrder = document.getElementById('loopOrder').value;

        grid.updateGrid();
    }
    applyBinaryData();
}

function updateGridPosition() {
    if (selectedGridIndex >= 0) {
        const grid = grids[selectedGridIndex];
        grid.posX = parseInt(document.getElementById('gridPosX').value);
        grid.posY = parseInt(document.getElementById('gridPosY').value);
        grid.posZ = parseInt(document.getElementById('gridPosZ').value);

        grid.updatePosition();
    }
}

function updateGlassPosition() {
    glass.position.set(
        parseInt(document.getElementById('glassX').value),
        parseInt(document.getElementById('glassY').value),
        parseInt(document.getElementById('glassZ').value)
    );
}

function exportToJson() {
    const data = {
        grids: grids.map(grid => grid.toJSON()),
        playerPosition: {
            x: glass.position.x,
            y: glass.position.y,
            z: glass.position.z
        }
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pattern.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importFromJson(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            loadScene(data);
        };
        reader.readAsText(file);
    }
}

function loadScene(data) {
    grids.forEach(grid => grid.cubes.forEach(cube => scene.remove(cube)));
    grids = [];

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('blocks/redstone_block.png', (texture) => {
        textureLoader.load('blocks/gold_block.png', (textureForState1) => {
            data.grids.forEach((gridData, index) => {
                const grid = new BlockGrid(
                    texture,
                    textureForState1,
                    gridData.xCount,
                    gridData.yCount,
                    gridData.zCount,
                    gridData.xDistance,
                    gridData.yDistance,
                    gridData.zDistance,
                    gridData.xTilt,
                    gridData.zTilt,
                    gridData.posX,
                    gridData.posY,
                    gridData.posZ,
                    gridData.loopOrder
                );
                texture.minFilter = THREE.NearestFilter;
                texture.magFilter = THREE.NearestFilter;
                grids.push(grid);
                if (index === data.grids.length - 1) {
                    updateGridSelector();
                }
            });
        });
    });

    glass.position.set(data.playerPosition.x, data.playerPosition.y, data.playerPosition.z);
    document.getElementById('glassX').value = data.playerPosition.x;
    document.getElementById('glassY').value = data.playerPosition.y;
    document.getElementById('glassZ').value = data.playerPosition.z;
}

function applyBinaryData() {
    binaryData = document.getElementById('binaryData').value;
    let textureIndex = 0;

    grids.forEach(grid => {
        grid.cubes.forEach((cube, index) => {
            const material = new THREE.MeshStandardMaterial({
                map: binaryData[textureIndex] === '1' ? grid.textureForState1 : grid.textureForState0
            });
            cube.material = material;
            textureIndex++;
        });
        grid.updatePosition();
    });
}

function flip(direction) {
    if (selectedGridIndex >= 0) {
        const grid = grids[selectedGridIndex];

        if (direction == 'x') {
            const xDistance = parseInt(document.getElementById('xDistance').value);
            const xCount = parseInt(document.getElementById('xCount').value);
            const gridPosX = parseInt(document.getElementById('gridPosX').value);

            document.getElementById('gridPosX').value = (gridPosX + xDistance * xCount) - xDistance;
            document.getElementById('xDistance').value = -xDistance;

            grid.xDistance = -grid.xDistance;
            grid.posX = parseInt(document.getElementById('gridPosX').value);
        } 
        else if (direction == 'y') {
            const yDistance = parseInt(document.getElementById('yDistance').value);
            const yCount = parseInt(document.getElementById('yCount').value);
            const gridPosY = parseInt(document.getElementById('gridPosY').value);

            document.getElementById('gridPosY').value = (gridPosY + yDistance * yCount) - yDistance;
            document.getElementById('yDistance').value = -yDistance;

            grid.yDistance = -grid.yDistance;
            grid.posY = parseInt(document.getElementById('gridPosY').value);
        } 
        else if (direction == 'z') {
            const zDistance = parseInt(document.getElementById('zDistance').value);
            const zCount = parseInt(document.getElementById('zCount').value);
            const gridPosZ = parseInt(document.getElementById('gridPosZ').value);

            document.getElementById('gridPosZ').value = (gridPosZ + zDistance * zCount) - zDistance;
            document.getElementById('zDistance').value = -zDistance;

            grid.zDistance = -grid.zDistance;
            grid.posZ = parseInt(document.getElementById('gridPosZ').value);
        }

        grid.updatePosition();
    }
    updateControls();
    applyBinaryData();
}

function flipX() {
    flip('x');
}

function flipY() {
    flip('y');
}

function flipZ() {
    flip('z');
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
