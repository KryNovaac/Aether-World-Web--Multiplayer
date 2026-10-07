/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as BABYLON from '@babylonjs/core';
import * as YUKA from 'yuka';

export type MobArchetype = 'AETHER_STALKER' | 'SENTINEL_DRONE' | 'GUARDIAN_GOLEM';

export interface SpawnedMob {
  id: string;
  name: string;
  archetype: MobArchetype;
  rootNode: BABYLON.TransformNode;
  vehicle: YUKA.Vehicle;
  animParts: {
    legs?: BABYLON.TransformNode[];
    wings?: BABYLON.TransformNode[];
    arms?: BABYLON.TransformNode[];
    coreMesh?: BABYLON.Mesh;
    haloRing?: BABYLON.Mesh;
  };
  phaseOffset: number;
  baseHeightOffset: number;
}

/**
 * GAME TECH STACK MODULE: HIGH-POLY PROCEDURAL MODELS & YUKA AI MOBS
 * 1. Membangun Model Karakter Paladin (Cyber-Knight Berartikulasi Penuh) dengan PBR Material,
 *    Pauldron Bahu, Jubah Energi, Pedang Aether Blade di Punggung, dan Sendi Lutut/Siku.
 * 2. Membangun 3 Spesies Mob AI dengan Yuka Autonomous Steering Behaviors:
 *    - Aether Stalker (Quadruped Biomech Serigala Hutan, berjalan dengan 4 kaki berartikulasi)
 *    - Sentinel Drone (Pesawat Penjaga Terbang dengan 4 Rotor & Cincin Pemindai)
 *    - Guardian Golem (Colossus Batu Rune Bercahaya yang berpatroli di sekitar Plaza)
 */
export function createDetailedPaladinCharacter(
  scene: BABYLON.Scene,
  shadowGenerator: BABYLON.ShadowGenerator,
  cyanGlowMat: BABYLON.StandardMaterial,
  goldGlowMat: BABYLON.StandardMaterial
) {
  const playerRoot = new BABYLON.TransformNode('playerRoot', scene);
  playerRoot.position.set(0, 0, -10);

  const characterVisual = new BABYLON.TransformNode('characterVisual', scene);
  characterVisual.parent = playerRoot;

  // PBR Materials Khusus Armor Paladin
  const titaniumArmorMat = new BABYLON.PBRMetallicRoughnessMaterial('titaniumArmor', scene);
  titaniumArmorMat.baseColor = new BABYLON.Color3(0.82, 0.86, 0.94);
  titaniumArmorMat.metallic = 0.78;
  titaniumArmorMat.roughness = 0.24;

  const cobaltPlateMat = new BABYLON.PBRMetallicRoughnessMaterial('cobaltPlate', scene);
  cobaltPlateMat.baseColor = new BABYLON.Color3(0.14, 0.34, 0.72);
  cobaltPlateMat.metallic = 0.65;
  cobaltPlateMat.roughness = 0.28;

  const darkCarbonMat = new BABYLON.PBRMetallicRoughnessMaterial('darkCarbon', scene);
  darkCarbonMat.baseColor = new BABYLON.Color3(0.08, 0.1, 0.15);
  darkCarbonMat.metallic = 0.45;
  darkCarbonMat.roughness = 0.55;

  // 1. Sabuk Pinggang (Pelvis) & Sendi Pinggang/Torso (Spine Pivot)
  const beltMesh = BABYLON.MeshBuilder.CreateCylinder(
    'paladinBelt',
    { diameterTop: 0.6, diameterBottom: 0.64, height: 0.2, tessellation: 8 },
    scene
  );
  beltMesh.position.y = 0.92;
  beltMesh.scaling.z = 0.7;
  beltMesh.parent = characterVisual;
  beltMesh.material = cobaltPlateMat;

  const torsoPivot = new BABYLON.TransformNode('torsoPivot', scene);
  torsoPivot.position.set(0, 0.94, 0);
  torsoPivot.parent = characterVisual;

  const chestMesh = BABYLON.MeshBuilder.CreateCylinder(
    'paladinChest',
    { diameterTop: 0.78, diameterBottom: 0.58, height: 0.76, tessellation: 8 },
    scene
  );
  chestMesh.position.y = 0.4; // 0.94 + 0.40 = 1.34
  chestMesh.scaling.z = 0.68;
  chestMesh.parent = torsoPivot;
  chestMesh.material = titaniumArmorMat;
  shadowGenerator.addShadowCaster(chestMesh);

  // Inti Reaktor Aether di Dada
  const chestReactor = BABYLON.MeshBuilder.CreatePolyhedron(
    'chestReactor',
    { type: 1, size: 0.14 },
    scene
  );
  chestReactor.position.set(0, 0.44, 0.26);
  chestReactor.parent = torsoPivot;
  chestReactor.material = cyanGlowMat;

  // Pedang Energi Bawaan (Disembunyikan oleh sistem senjata dinamis)
  const swordGroup = new BABYLON.TransformNode('swordBack', scene);
  swordGroup.position.set(0.1, 0.48, -0.28);
  swordGroup.rotation.z = -0.42;
  swordGroup.parent = torsoPivot;

  const swordHilt = BABYLON.MeshBuilder.CreateCylinder(
    'swordHilt',
    { diameter: 0.06, height: 0.38 },
    scene
  );
  swordHilt.position.y = 0.35;
  swordHilt.parent = swordGroup;
  swordHilt.material = goldGlowMat;

  const swordCrossguard = BABYLON.MeshBuilder.CreateBox(
    'swordGuard',
    { width: 0.34, height: 0.06, depth: 0.08 },
    scene
  );
  swordCrossguard.position.y = 0.16;
  swordCrossguard.parent = swordGroup;
  swordCrossguard.material = titaniumArmorMat;

  const swordBlade = BABYLON.MeshBuilder.CreateBox(
    'swordBlade',
    { width: 0.11, height: 1.05, depth: 0.025 },
    scene
  );
  swordBlade.position.y = -0.38;
  swordBlade.parent = swordGroup;
  swordBlade.material = cyanGlowMat;

  // 2. Kepala Model Dummy Tanpa Wajah (Faceless Articulated Mannequin Head) + Sendi Leher
  const headGroup = new BABYLON.TransformNode('headGroup', scene);
  headGroup.position.y = 1.02; // 0.94 + 1.02 = 1.96
  headGroup.parent = torsoPivot;

  const dummyNeck = BABYLON.MeshBuilder.CreateCylinder(
    'dummyNeck',
    { diameterTop: 0.16, diameterBottom: 0.19, height: 0.18, tessellation: 10 },
    scene
  );
  dummyNeck.position.y = -0.22;
  dummyNeck.parent = headGroup;
  dummyNeck.material = darkCarbonMat;

  const helmetDome = BABYLON.MeshBuilder.CreateSphere(
    'helmetDome',
    { diameterX: 0.43, diameterY: 0.48, diameterZ: 0.46, segments: 14 },
    scene
  );
  helmetDome.parent = headGroup;
  helmetDome.material = titaniumArmorMat;
  shadowGenerator.addShadowCaster(helmetDome);

  for (const side of [-1, 1]) {
    const dummyEarJoint = BABYLON.MeshBuilder.CreateCylinder(
      `dummyEar_${side}`,
      { diameter: 0.11, height: 0.04, tessellation: 10 },
      scene
    );
    dummyEarJoint.rotation.z = Math.PI / 2;
    dummyEarJoint.position.set(side * 0.21, 0.0, -0.01);
    dummyEarJoint.parent = headGroup;
    dummyEarJoint.material = darkCarbonMat;
  }

  const visorSlit = BABYLON.MeshBuilder.CreateCylinder(
    'visorSlit',
    { diameterTop: 0.42, diameterBottom: 0.42, height: 0.12, tessellation: 12, arc: 0.45 },
    scene
  );
  visorSlit.rotation.y = Math.PI * 0.275;
  visorSlit.position.set(0, 0.02, 0.04);
  visorSlit.parent = headGroup;
  visorSlit.material = cyanGlowMat;

  const helmetCrest = BABYLON.MeshBuilder.CreateBox(
    'helmetCrest',
    { width: 0.05, height: 0.18, depth: 0.46 },
    scene
  );
  helmetCrest.position.set(0, 0.22, -0.02);
  helmetCrest.parent = headGroup;
  helmetCrest.material = goldGlowMat;

  // 3. Lengan Kiri & Kanan Berartikulasi 2 Sendi (Sendi Bahu + Sendi Siku)
  const createArmLimb = (side: -1 | 1) => {
    // Sendi Bahu (Shoulder Pivot)
    const shoulderPivot = new BABYLON.TransformNode(`armPivot_${side}`, scene);
    shoulderPivot.position.set(side * 0.48, 0.68, 0); // 0.94 + 0.68 = 1.62
    shoulderPivot.parent = torsoPivot;

    const pauldron = BABYLON.MeshBuilder.CreateSphere(
      `pauldron_${side}`,
      { diameterX: 0.34, diameterY: 0.28, diameterZ: 0.34, slice: 0.6 },
      scene
    );
    pauldron.position.set(side * 0.04, 0.04, 0);
    pauldron.rotation.z = side * -0.35;
    pauldron.parent = shoulderPivot;
    pauldron.material = cobaltPlateMat;

    const upperArm = BABYLON.MeshBuilder.CreateCylinder(
      `upperArm_${side}`,
      { diameterTop: 0.2, diameterBottom: 0.16, height: 0.36, tessellation: 10 },
      scene
    );
    upperArm.position.y = -0.18;
    upperArm.parent = shoulderPivot;
    upperArm.material = darkCarbonMat;

    // Sendi Siku (Elbow Joint Pivot)
    const elbowPivot = new BABYLON.TransformNode(`elbowPivot_${side}`, scene);
    elbowPivot.position.set(0, -0.36, 0);
    elbowPivot.parent = shoulderPivot;

    const elbowJointSphere = BABYLON.MeshBuilder.CreateSphere(
      `elbowBall_${side}`,
      { diameter: 0.17, segments: 8 },
      scene
    );
    elbowJointSphere.parent = elbowPivot;
    elbowJointSphere.material = goldGlowMat;

    const gauntlet = BABYLON.MeshBuilder.CreateCylinder(
      `gauntlet_${side}`,
      { diameterTop: 0.17, diameterBottom: 0.2, height: 0.36, tessellation: 8 },
      scene
    );
    gauntlet.position.y = -0.19;
    gauntlet.parent = elbowPivot;
    gauntlet.material = titaniumArmorMat;
    shadowGenerator.addShadowCaster(gauntlet);

    const handPalm = BABYLON.MeshBuilder.CreateSphere(
      `handPalm_${side}`,
      { diameter: 0.16, segments: 8 },
      scene
    );
    handPalm.position.y = -0.38;
    handPalm.parent = elbowPivot;
    handPalm.material = darkCarbonMat;

    return { shoulderPivot, elbowPivot };
  };

  const leftArm = createArmLimb(-1);
  const rightArm = createArmLimb(1);

  // 4. Kaki Kiri & Kanan Berartikulasi 2 Sendi (Sendi Paha + Sendi Lutut + Sepatu)
  const createLegLimb = (side: -1 | 1) => {
    // Sendi Pangkal Paha (Hip Pivot)
    const hipPivot = new BABYLON.TransformNode(`legPivot_${side}`, scene);
    hipPivot.position.set(side * 0.21, 0.86, 0);
    hipPivot.parent = characterVisual;

    const thigh = BABYLON.MeshBuilder.CreateCylinder(
      `thigh_${side}`,
      { diameterTop: 0.27, diameterBottom: 0.21, height: 0.42, tessellation: 10 },
      scene
    );
    thigh.position.y = -0.21;
    thigh.parent = hipPivot;
    thigh.material = darkCarbonMat;

    // Sendi Lutut (Knee Joint Pivot)
    const kneePivot = new BABYLON.TransformNode(`kneePivot_${side}`, scene);
    kneePivot.position.set(0, -0.42, 0);
    kneePivot.parent = hipPivot;

    const kneeGuard = BABYLON.MeshBuilder.CreatePolyhedron(
      `knee_${side}`,
      { type: 1, size: 0.1 },
      scene
    );
    kneeGuard.position.set(0, 0.0, 0.12);
    kneeGuard.parent = kneePivot;
    kneeGuard.material = goldGlowMat;

    const shinGreave = BABYLON.MeshBuilder.CreateCylinder(
      `shin_${side}`,
      { diameterTop: 0.22, diameterBottom: 0.17, height: 0.4, tessellation: 8 },
      scene
    );
    shinGreave.position.y = -0.21;
    shinGreave.parent = kneePivot;
    shinGreave.material = titaniumArmorMat;
    shadowGenerator.addShadowCaster(shinGreave);

    const footBoot = BABYLON.MeshBuilder.CreateBox(
      `boot_${side}`,
      { width: 0.2, height: 0.11, depth: 0.3 },
      scene
    );
    footBoot.position.set(0, -0.4, 0.05);
    footBoot.parent = kneePivot;
    footBoot.material = cobaltPlateMat;

    return { hipPivot, kneePivot };
  };

  const leftLeg = createLegLimb(-1);
  const rightLeg = createLegLimb(1);

  return {
    playerRoot,
    characterVisual,
    torsoPivot,
    headGroup,
    leftArmPivot: leftArm.shoulderPivot,
    rightArmPivot: rightArm.shoulderPivot,
    leftElbowPivot: leftArm.elbowPivot,
    rightElbowPivot: rightArm.elbowPivot,
    leftLegPivot: leftLeg.hipPivot,
    rightLegPivot: rightLeg.hipPivot,
    leftKneePivot: leftLeg.kneePivot,
    rightKneePivot: rightLeg.kneePivot,
  };
}

/**
 * MEMBANGUN EKOSISTEM MOB AI MENGGUNAKAN YUKA STEERING ENGINE
 */
export function createWorldMobsWithYuka(
  scene: BABYLON.Scene,
  shadowGenerator: BABYLON.ShadowGenerator,
  getTerrainElevation: (x: number, z: number) => number,
  cyanGlowMat: BABYLON.StandardMaterial,
  goldGlowMat: BABYLON.StandardMaterial,
  violetGlowMat: BABYLON.StandardMaterial
) {
  const entityManager = new YUKA.EntityManager();
  const mobs: SpawnedMob[] = [];

  // Material bersama untuk Mob
  const stalkerBodyMat = new BABYLON.PBRMetallicRoughnessMaterial('stalkerBodyMat', scene);
  stalkerBodyMat.baseColor = new BABYLON.Color3(0.12, 0.18, 0.28);
  stalkerBodyMat.metallic = 0.6;
  stalkerBodyMat.roughness = 0.35;

  const golemStoneMat = new BABYLON.PBRMetallicRoughnessMaterial('golemStoneMat', scene);
  golemStoneMat.baseColor = new BABYLON.Color3(0.22, 0.25, 0.32);
  golemStoneMat.metallic = 0.25;
  golemStoneMat.roughness = 0.8;

  // ---------------------------------------------------------------------------
  // TIPE MOB 1: AETHER STALKER (6 Ekor Serigala Quadruped Bioluminescent)
  // ---------------------------------------------------------------------------
  const stalkerSpawns = [
    { x: -26, z: -22 },
    { x: 28, z: -24 },
    { x: -34, z: 14 },
    { x: 34, z: 12 },
    { x: -16, z: 42 },
    { x: 18, z: 40 },
  ];

  stalkerSpawns.forEach((pos, idx) => {
    const root = new BABYLON.TransformNode(`mob_stalker_${idx}`, scene);

    const body = BABYLON.MeshBuilder.CreateBox(
      `stalkerBody_${idx}`,
      { width: 0.75, height: 0.58, depth: 1.55 },
      scene
    );
    body.position.y = 0.85;
    body.parent = root;
    body.material = stalkerBodyMat;
    shadowGenerator.addShadowCaster(body);

    const head = BABYLON.MeshBuilder.CreateCylinder(
      `stalkerHead_${idx}`,
      { diameterTop: 0.18, diameterBottom: 0.52, height: 0.65, tessellation: 6 },
      scene
    );
    head.rotation.x = Math.PI / 2.3;
    head.position.set(0, 1.08, 0.95);
    head.parent = root;
    head.material = stalkerBodyMat;

    const eyeVisor = BABYLON.MeshBuilder.CreateBox(
      `stalkerEye_${idx}`,
      { width: 0.42, height: 0.1, depth: 0.18 },
      scene
    );
    eyeVisor.position.set(0, 1.12, 1.05);
    eyeVisor.parent = root;
    eyeVisor.material = cyanGlowMat;

    const spineRidge = BABYLON.MeshBuilder.CreateBox(
      `stalkerSpine_${idx}`,
      { width: 0.12, height: 0.16, depth: 1.3 },
      scene
    );
    spineRidge.position.set(0, 1.18, 0);
    spineRidge.parent = root;
    spineRidge.material = cyanGlowMat;

    const legs: BABYLON.TransformNode[] = [];
    const legOffsets = [
      { x: -0.34, z: 0.52 },
      { x: 0.34, z: 0.52 },
      { x: -0.34, z: -0.52 },
      { x: 0.34, z: -0.52 },
    ];
    legOffsets.forEach((off, lIdx) => {
      const legPivot = new BABYLON.TransformNode(`stalkerLeg_${idx}_${lIdx}`, scene);
      legPivot.position.set(off.x, 0.75, off.z);
      legPivot.parent = root;

      const legMesh = BABYLON.MeshBuilder.CreateCylinder(
        `stalkerLegMesh_${idx}_${lIdx}`,
        { diameterTop: 0.2, diameterBottom: 0.1, height: 0.78, tessellation: 6 },
        scene
      );
      legMesh.position.y = -0.38;
      legMesh.parent = legPivot;
      legMesh.material = stalkerBodyMat;
      legs.push(legPivot);
    });

    // Yuka Autonomous Vehicle dengan WanderBehavior
    const vehicle = new YUKA.Vehicle();
    vehicle.position.set(pos.x, getTerrainElevation(pos.x, pos.z), pos.z);
    vehicle.maxSpeed = 5.4;
    vehicle.maxForce = 8.0;

    const wander = new YUKA.WanderBehavior(2.4, 4.5, 1.8);
    vehicle.steering.add(wander);
    entityManager.add(vehicle);

    mobs.push({
      id: `stalker_${idx}`,
      name: 'Aether Stalker',
      archetype: 'AETHER_STALKER',
      rootNode: root,
      vehicle,
      animParts: { legs },
      phaseOffset: idx * 1.7,
      baseHeightOffset: 0,
    });
  });

  // ---------------------------------------------------------------------------
  // TIPE MOB 2: SENTINEL DRONE (5 Unit Pesawat Drone Patroli Udara)
  // ---------------------------------------------------------------------------
  const droneSpawns = [
    { x: 0, z: -22 },
    { x: 24, z: 16 },
    { x: -24, z: 16 },
    { x: 0, z: 36 },
    { x: -18, z: -36 },
  ];

  droneSpawns.forEach((pos, idx) => {
    const root = new BABYLON.TransformNode(`mob_drone_${idx}`, scene);

    const coreSphere = BABYLON.MeshBuilder.CreateSphere(
      `droneCore_${idx}`,
      { diameter: 0.95, segments: 12 },
      scene
    );
    coreSphere.parent = root;
    coreSphere.material = stalkerBodyMat;

    const scannerEye = BABYLON.MeshBuilder.CreateSphere(
      `droneEye_${idx}`,
      { diameter: 0.42, segments: 10 },
      scene
    );
    scannerEye.position.set(0, 0, 0.38);
    scannerEye.parent = root;
    scannerEye.material = goldGlowMat;

    const haloRing = BABYLON.MeshBuilder.CreateTorus(
      `droneRing_${idx}`,
      { diameter: 1.85, thickness: 0.12, tessellation: 28 },
      scene
    );
    haloRing.parent = root;
    haloRing.material = cyanGlowMat;

    const wings: BABYLON.TransformNode[] = [];
    for (let w = 0; w < 4; w++) {
      const wAngle = (w * Math.PI) / 2 + Math.PI / 4;
      const wingNode = new BABYLON.TransformNode(`droneWing_${idx}_${w}`, scene);
      wingNode.position.set(Math.cos(wAngle) * 1.1, 0.15, Math.sin(wAngle) * 1.1);
      wingNode.parent = root;

      const rotorBlade = BABYLON.MeshBuilder.CreateDisc(
        `rotor_${idx}_${w}`,
        { radius: 0.38, tessellation: 12, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
        scene
      );
      rotorBlade.rotation.x = Math.PI / 2;
      rotorBlade.parent = wingNode;
      rotorBlade.material = cyanGlowMat;
      wings.push(wingNode);
    }

    const vehicle = new YUKA.Vehicle();
    vehicle.position.set(pos.x, getTerrainElevation(pos.x, pos.z) + 4.8, pos.z);
    vehicle.maxSpeed = 6.8;
    vehicle.maxForce = 6.5;

    const wander = new YUKA.WanderBehavior(3.2, 6.0, 2.0);
    vehicle.steering.add(wander);
    entityManager.add(vehicle);

    mobs.push({
      id: `drone_${idx}`,
      name: 'Sky Sentinel Drone',
      archetype: 'SENTINEL_DRONE',
      rootNode: root,
      vehicle,
      animParts: { wings, haloRing },
      phaseOffset: idx * 2.1,
      baseHeightOffset: 4.8,
    });
  });

  // ---------------------------------------------------------------------------
  // TIPE MOB 3: GUARDIAN GOLEM (3 Colossus Penjaga Batu Rune)
  // ---------------------------------------------------------------------------
  const golemSpawns = [
    { x: -14, z: -28 },
    { x: 26, z: -6 },
    { x: -26, z: 26 },
  ];

  golemSpawns.forEach((pos, idx) => {
    const root = new BABYLON.TransformNode(`mob_golem_${idx}`, scene);

    const torso = BABYLON.MeshBuilder.CreatePolyhedron(
      `golemTorso_${idx}`,
      { type: 2, size: 1.15 },
      scene
    );
    torso.position.y = 2.1;
    torso.scaling.set(1.1, 1.3, 0.85);
    torso.parent = root;
    torso.material = golemStoneMat;
    shadowGenerator.addShadowCaster(torso);

    const coreCrystal = BABYLON.MeshBuilder.CreatePolyhedron(
      `golemCore_${idx}`,
      { type: 1, size: 0.52 },
      scene
    );
    coreCrystal.position.set(0, 2.15, 0.55);
    coreCrystal.parent = root;
    coreCrystal.material = violetGlowMat;

    const head = BABYLON.MeshBuilder.CreateBox(
      `golemHead_${idx}`,
      { width: 0.75, height: 0.65, depth: 0.75 },
      scene
    );
    head.position.y = 3.45;
    head.parent = root;
    head.material = golemStoneMat;

    const crownEye = BABYLON.MeshBuilder.CreateBox(
      `golemEye_${idx}`,
      { width: 0.55, height: 0.14, depth: 0.8 },
      scene
    );
    crownEye.position.y = 3.48;
    crownEye.parent = root;
    crownEye.material = goldGlowMat;

    // Lengan Melayang Kiri & Kanan
    const leftArm = new BABYLON.TransformNode(`golemArmL_${idx}`, scene);
    leftArm.position.set(-1.55, 2.3, 0);
    leftArm.parent = root;
    const leftFist = BABYLON.MeshBuilder.CreateBox(
      `golemFistL_${idx}`,
      { width: 0.65, height: 1.5, depth: 0.65 },
      scene
    );
    leftFist.position.y = -0.5;
    leftFist.parent = leftArm;
    leftFist.material = golemStoneMat;
    shadowGenerator.addShadowCaster(leftFist);

    const rightArm = new BABYLON.TransformNode(`golemArmR_${idx}`, scene);
    rightArm.position.set(1.55, 2.3, 0);
    rightArm.parent = root;
    const rightFist = BABYLON.MeshBuilder.CreateBox(
      `golemFistR_${idx}`,
      { width: 0.65, height: 1.5, depth: 0.65 },
      scene
    );
    rightFist.position.y = -0.5;
    rightFist.parent = rightArm;
    rightFist.material = golemStoneMat;
    shadowGenerator.addShadowCaster(rightFist);

    // Kaki Golem
    const leftLeg = new BABYLON.TransformNode(`golemLegL_${idx}`, scene);
    leftLeg.position.set(-0.55, 1.0, 0);
    leftLeg.parent = root;
    const leftFoot = BABYLON.MeshBuilder.CreateBox(
      `golemFootL_${idx}`,
      { width: 0.55, height: 1.0, depth: 0.65 },
      scene
    );
    leftFoot.position.y = -0.5;
    leftFoot.parent = leftLeg;
    leftFoot.material = golemStoneMat;

    const rightLeg = new BABYLON.TransformNode(`golemLegR_${idx}`, scene);
    rightLeg.position.set(0.55, 1.0, 0);
    rightLeg.parent = root;
    const rightFoot = BABYLON.MeshBuilder.CreateBox(
      `golemFootR_${idx}`,
      { width: 0.55, height: 1.0, depth: 0.65 },
      scene
    );
    rightFoot.position.y = -0.5;
    rightFoot.parent = rightLeg;
    rightFoot.material = golemStoneMat;

    const vehicle = new YUKA.Vehicle();
    vehicle.position.set(pos.x, getTerrainElevation(pos.x, pos.z), pos.z);
    vehicle.maxSpeed = 2.6;
    vehicle.maxForce = 4.5;

    const wander = new YUKA.WanderBehavior(1.8, 3.5, 1.2);
    vehicle.steering.add(wander);
    entityManager.add(vehicle);

    mobs.push({
      id: `golem_${idx}`,
      name: 'Ancient Rune Golem',
      archetype: 'GUARDIAN_GOLEM',
      rootNode: root,
      vehicle,
      animParts: {
        arms: [leftArm, rightArm],
        legs: [leftLeg, rightLeg],
        coreMesh: coreCrystal,
      },
      phaseOffset: idx * 3.0,
      baseHeightOffset: 0,
    });
  });

  // Fungsi Update per-frame untuk seluruh AI Mob Yuka
  const updateMobs = (dt: number, elapsedSec: number) => {
    entityManager.update(dt);

    for (const mob of mobs) {
      const vx = mob.vehicle.position.x;
      const vz = mob.vehicle.position.z;

      // Jaga agar mob tetap berada di dalam radius dunia (soft boundary steering)
      const distFromOrigin = Math.hypot(vx, vz);
      if (distFromOrigin > 82) {
        mob.vehicle.velocity.x -= (vx / distFromOrigin) * 12 * dt;
        mob.vehicle.velocity.z -= (vz / distFromOrigin) * 12 * dt;
      }

      const groundY = getTerrainElevation(vx, vz);
      const hoverOffset =
        mob.archetype === 'SENTINEL_DRONE'
          ? Math.sin(elapsedSec * 3.0 + mob.phaseOffset) * 0.45
          : 0;

      mob.rootNode.position.set(vx, groundY + mob.baseHeightOffset + hoverOffset, vz);

      // Rotasi menghadap arah vektor kecepatan Yuka
      const speedSq =
        mob.vehicle.velocity.x * mob.vehicle.velocity.x +
        mob.vehicle.velocity.z * mob.vehicle.velocity.z;
      if (speedSq > 0.05) {
        const targetYaw = Math.atan2(mob.vehicle.velocity.x, mob.vehicle.velocity.z);
        mob.rootNode.rotation.y = targetYaw;
      }

      // Animasi Prosedural Berdasarkan Spesies Mob
      const speed = Math.sqrt(speedSq);
      if (mob.archetype === 'AETHER_STALKER' && mob.animParts.legs) {
        const walkCycle = elapsedSec * speed * 2.6 + mob.phaseOffset;
        mob.animParts.legs[0].rotation.x = Math.sin(walkCycle) * 0.65;
        mob.animParts.legs[1].rotation.x = -Math.sin(walkCycle) * 0.65;
        mob.animParts.legs[2].rotation.x = -Math.sin(walkCycle) * 0.65;
        mob.animParts.legs[3].rotation.x = Math.sin(walkCycle) * 0.65;
      } else if (mob.archetype === 'SENTINEL_DRONE') {
        if (mob.animParts.haloRing) {
          mob.animParts.haloRing.rotation.z += dt * 2.5;
          mob.animParts.haloRing.rotation.x = Math.sin(elapsedSec * 2 + mob.phaseOffset) * 0.35;
        }
      } else if (mob.archetype === 'GUARDIAN_GOLEM') {
        const stepCycle = elapsedSec * speed * 1.8 + mob.phaseOffset;
        if (mob.animParts.legs) {
          mob.animParts.legs[0].rotation.x = Math.sin(stepCycle) * 0.45;
          mob.animParts.legs[1].rotation.x = -Math.sin(stepCycle) * 0.45;
        }
        if (mob.animParts.arms) {
          mob.animParts.arms[0].rotation.x = -Math.sin(stepCycle) * 0.4;
          mob.animParts.arms[1].rotation.x = Math.sin(stepCycle) * 0.4;
        }
        if (mob.animParts.coreMesh) {
          mob.animParts.coreMesh.rotation.y += dt * 1.5;
        }
      }
    }
  };

  return { mobs, updateMobs };
}
