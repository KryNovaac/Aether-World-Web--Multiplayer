/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as BABYLON from '@babylonjs/core';

export type WeatherMode = 'CERAH' | 'HUJAN' | 'BADAI' | 'AETHER_MIST';
export type SeasonMode = 'SEMI' | 'PANAS' | 'GUGUR' | 'DINGIN';
export type DayPhaseName = 'PAGI' | 'SIANG' | 'SORE' | 'MALAM';

export interface DesktopControlSettings {
  mouseSensitivity: number; // 0.2 .. 3.0 (default 1.0)
  invertMouseX: boolean; // default false (Geser Kanan = Lihat Kanan)
  invertMouseY: boolean; // default false (Geser Atas = Lihat Atas)
  zoomSensitivity: number; // 0.5 .. 2.0 (default 1.0)
}

export interface MobileControlSettings {
  touchSensitivity: number; // 0.2 .. 3.0 (default 1.0)
  invertTouchX: boolean; // default false
  invertTouchY: boolean; // default false
  joystickScale: number; // 0.85 .. 1.25 (default 1.0)
  autoSprintOnFullTilt: boolean; // default true
}

export const DEFAULT_DESKTOP_SETTINGS: DesktopControlSettings = {
  mouseSensitivity: 1.0,
  invertMouseX: false,
  invertMouseY: false,
  zoomSensitivity: 1.0,
};

export const DEFAULT_MOBILE_SETTINGS: MobileControlSettings = {
  touchSensitivity: 1.0,
  invertTouchX: false,
  invertTouchY: false,
  joystickScale: 1.0,
  autoSprintOnFullTilt: true,
};

/**
 * 1 Hari di dalam game (24 jam) = 20 menit dunia nyata (1200 detik).
 * Laju penambahan jam per detik nyata = 24 / 1200 = 0.02 jam/detik.
 */
export const IN_GAME_HOURS_PER_REAL_SECOND = 24 / 1200;

export function getSeasonMetadata(season: SeasonMode): {
  id: SeasonMode;
  name: string;
  subtitle: string;
  accentColor: string;
  leafColor: BABYLON.Color3;
  leafEmissive: BABYLON.Color3;
  groundTint: BABYLON.Color3;
  groundRoughness: number;
  fogTint: BABYLON.Color3;
} {
  switch (season) {
    case 'SEMI':
      return {
        id: 'SEMI',
        name: 'Musim Semi',
        subtitle: 'Spring Blossom',
        accentColor: '#F472B6',
        leafColor: new BABYLON.Color3(0.18, 0.52, 0.36),
        leafEmissive: new BABYLON.Color3(0.06, 0.09, 0.06),
        groundTint: new BABYLON.Color3(0.72, 0.94, 0.82),
        groundRoughness: 0.78,
        fogTint: new BABYLON.Color3(0.04, 0.02, 0.05),
      };
    case 'PANAS':
      return {
        id: 'PANAS',
        name: 'Musim Panas',
        subtitle: 'Golden Summer',
        accentColor: '#FBBF24',
        leafColor: new BABYLON.Color3(0.06, 0.42, 0.28),
        leafEmissive: new BABYLON.Color3(0.02, 0.08, 0.04),
        groundTint: new BABYLON.Color3(0.82, 0.92, 0.78),
        groundRoughness: 0.82,
        fogTint: new BABYLON.Color3(0.05, 0.04, 0.0),
      };
    case 'GUGUR':
      return {
        id: 'GUGUR',
        name: 'Musim Gugur',
        subtitle: 'Crimson Autumn',
        accentColor: '#FB923C',
        leafColor: new BABYLON.Color3(0.78, 0.32, 0.12),
        leafEmissive: new BABYLON.Color3(0.14, 0.05, 0.01),
        groundTint: new BABYLON.Color3(0.92, 0.76, 0.58),
        groundRoughness: 0.84,
        fogTint: new BABYLON.Color3(0.08, 0.03, 0.01),
      };
    case 'DINGIN':
      return {
        id: 'DINGIN',
        name: 'Musim Dingin',
        subtitle: 'Frost Winter',
        accentColor: '#38BDF8',
        leafColor: new BABYLON.Color3(0.75, 0.88, 0.96),
        leafEmissive: new BABYLON.Color3(0.08, 0.14, 0.22),
        groundTint: new BABYLON.Color3(0.92, 0.96, 1.0),
        groundRoughness: 0.48,
        fogTint: new BABYLON.Color3(0.06, 0.09, 0.14),
      };
  }
}

export interface CloudCluster {
  root: BABYLON.TransformNode;
  puffs: BABYLON.Mesh[];
  baseY: number;
  speedX: number;
  speedZ: number;
  scaleFactor: number;
  phaseOffset: number;
}

export interface SkyCloudSystem {
  clouds: CloudCluster[];
  cloudMaterial: BABYLON.PBRMetallicRoughnessMaterial;
  groundMistParticles: BABYLON.ParticleSystem;
  seasonParticles: BABYLON.ParticleSystem;
  update: (
    dt: number,
    elapsed: number,
    hour: number,
    weather: WeatherMode,
    season: SeasonMode,
    playerPos: BABYLON.Vector3
  ) => void;
  dispose: () => void;
}

/**
 * Menentukan fase waktu (Pagi, Siang, Sore, Malam) dari jam (0 - 24)
 */
export function getDayPhaseFromHour(hour: number): {
  phase: DayPhaseName;
  label: string;
  accentColor: string;
} {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 5 && h < 9.5) {
    return { phase: 'PAGI', label: 'Pagi (Dawn)', accentColor: '#FDBA74' };
  }
  if (h >= 9.5 && h < 16.0) {
    return { phase: 'SIANG', label: 'Siang (Noon)', accentColor: '#38BDF8' };
  }
  if (h >= 16.0 && h < 19.25) {
    return { phase: 'SORE', label: 'Sore (Sunset)', accentColor: '#FB7185' };
  }
  return { phase: 'MALAM', label: 'Malam (Night)', accentColor: '#818CF8' };
}

/**
 * Format jam desimal (0..24) menjadi HH:MM:SS agar detak jam terlihat hidup
 */
export function formatLiveGameClock(hourFloat: number): {
  hhmm: string;
  ss: string;
  full: string;
} {
  const normalized = ((hourFloat % 24) + 24) % 24;
  const totalSeconds = Math.floor(normalized * 3600);
  const h = Math.floor(totalSeconds / 3600) % 24;
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const hhStr = h.toString().padStart(2, '0');
  const mmStr = m.toString().padStart(2, '0');
  const ssStr = s.toString().padStart(2, '0');
  return {
    hhmm: `${hhStr}:${mmStr}`,
    ss: ssStr,
    full: `${hhStr}:${mmStr}:${ssStr}`,
  };
}

/**
 * Membuat tekstur partikel kabut lembut secara prosedural
 */
function createSoftMistTexture(scene: BABYLON.Scene): BABYLON.DynamicTexture {
  const tex = new BABYLON.DynamicTexture('softMistTex', 128, scene, false);
  const ctx = tex.getContext();
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  grad.addColorStop(0.45, 'rgba(220, 238, 255, 0.25)');
  grad.addColorStop(1, 'rgba(200, 225, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  tex.update();
  return tex;
}

/**
 * Membuat tekstur partikel musim (salju/kelopak/daun)
 */
function createSeasonFlakeTexture(scene: BABYLON.Scene): BABYLON.DynamicTexture {
  const tex = new BABYLON.DynamicTexture('seasonFlakeTex', 64, scene, false);
  const ctx = tex.getContext();
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  tex.update();
  return tex;
}

/**
 * Membangun sistem Awan 3D Poligonal Berlapis + Kabut Lembah Rendah + Partikel 4 Musim
 */
export function createSkyCloudAndMistSystem(scene: BABYLON.Scene): SkyCloudSystem {
  const cloudMaterial = new BABYLON.PBRMetallicRoughnessMaterial('cloudVolumetricMat', scene);
  cloudMaterial.baseColor = new BABYLON.Color3(0.92, 0.96, 1.0);
  cloudMaterial.metallic = 0.02;
  cloudMaterial.roughness = 0.92;
  cloudMaterial.alpha = 0.86;
  cloudMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  cloudMaterial.backFaceCulling = false;

  const clouds: CloudCluster[] = [];
  const cloudCount = 24;

  const baseSphere = BABYLON.MeshBuilder.CreateSphere(
    'cloudBaseSphere',
    { diameter: 1, segments: 7 },
    scene
  );
  baseSphere.isVisible = false;

  for (let i = 0; i < cloudCount; i++) {
    const root = new BABYLON.TransformNode(`cloudCluster_${i}`, scene);
    const angle = (i / cloudCount) * Math.PI * 2 + (i % 3) * 0.4;
    const dist = 35 + ((i * 29) % 135);
    const baseY = 46 + (i % 5) * 5.5;

    root.position.set(Math.cos(angle) * dist, baseY, Math.sin(angle) * dist);

    const puffs: BABYLON.Mesh[] = [];
    const puffCount = 5 + (i % 4);
    const scaleFactor = 1.0 + (i % 3) * 0.35;

    for (let p = 0; p < puffCount; p++) {
      const puff = baseSphere.clone(`cloudPuff_${i}_${p}`);
      puff.isVisible = true;
      puff.parent = root;
      puff.material = cloudMaterial;
      puff.isPickable = false;

      const offsetAngle = (p / puffCount) * Math.PI * 2;
      const spread = p === 0 ? 0 : 3.2 + (p % 3) * 1.8;
      const px = Math.cos(offsetAngle) * spread * scaleFactor;
      const pz = Math.sin(offsetAngle) * (spread * 0.72) * scaleFactor;
      const py = p === 0 ? 1.1 * scaleFactor : (p % 2 === 0 ? 0.3 : -0.35) * scaleFactor;

      puff.position.set(px, py, pz);
      const sx = (p === 0 ? 11.5 : 7.5 + (p % 3) * 2.4) * scaleFactor;
      const sy = (p === 0 ? 4.6 : 3.1 + (p % 2) * 1.1) * scaleFactor;
      const sz = (p === 0 ? 9.2 : 6.4 + (p % 3) * 2.0) * scaleFactor;
      puff.scaling.set(sx, sy, sz);
      puffs.push(puff);
    }

    clouds.push({
      root,
      puffs,
      baseY,
      speedX: 1.15 + (i % 5) * 0.35,
      speedZ: 0.25 + (i % 3) * 0.12,
      scaleFactor,
      phaseOffset: i * 1.37,
    });
  }

  // Sistem Partikel Kabut Lembah Rendah (Ground Mist)
  const mistTex = createSoftMistTexture(scene);
  const groundMistParticles = new BABYLON.ParticleSystem('groundMistParticles', 260, scene);
  groundMistParticles.particleTexture = mistTex;
  groundMistParticles.emitter = new BABYLON.Vector3(0, 2.2, 0);
  groundMistParticles.minEmitBox = new BABYLON.Vector3(-58, -1.5, -58);
  groundMistParticles.maxEmitBox = new BABYLON.Vector3(58, 4.5, 58);

  groundMistParticles.color1 = new BABYLON.Color4(0.75, 0.88, 1.0, 0.16);
  groundMistParticles.color2 = new BABYLON.Color4(0.55, 0.78, 0.96, 0.12);
  groundMistParticles.colorDead = new BABYLON.Color4(0.4, 0.6, 0.85, 0.0);

  groundMistParticles.minSize = 9.0;
  groundMistParticles.maxSize = 18.5;
  groundMistParticles.minLifeTime = 6.0;
  groundMistParticles.maxLifeTime = 11.0;
  groundMistParticles.emitRate = 28;
  groundMistParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
  groundMistParticles.gravity = new BABYLON.Vector3(0, 0.02, 0);
  groundMistParticles.direction1 = new BABYLON.Vector3(-0.6, 0.02, -0.4);
  groundMistParticles.direction2 = new BABYLON.Vector3(0.6, 0.08, 0.4);
  groundMistParticles.minAngularSpeed = -0.08;
  groundMistParticles.maxAngularSpeed = 0.08;
  groundMistParticles.start();

  // Sistem Partikel Atmosfer 4 Musim (Kelopak Semi, Kunang Panas, Daun Gugur, Salju Dingin)
  const seasonTex = createSeasonFlakeTexture(scene);
  const seasonParticles = new BABYLON.ParticleSystem('seasonParticles', 1400, scene);
  seasonParticles.particleTexture = seasonTex;
  seasonParticles.emitter = new BABYLON.Vector3(0, 18, 0);
  seasonParticles.minEmitBox = new BABYLON.Vector3(-48, -4, -48);
  seasonParticles.maxEmitBox = new BABYLON.Vector3(48, 8, 48);
  seasonParticles.minSize = 0.18;
  seasonParticles.maxSize = 0.48;
  seasonParticles.minLifeTime = 3.5;
  seasonParticles.maxLifeTime = 6.5;
  seasonParticles.emitRate = 180;
  seasonParticles.minAngularSpeed = -1.2;
  seasonParticles.maxAngularSpeed = 1.2;
  seasonParticles.start();

  let lastSeasonConfigured: SeasonMode | null = null;

  const update = (
    dt: number,
    elapsed: number,
    hour: number,
    weather: WeatherMode,
    season: SeasonMode,
    playerPos: BABYLON.Vector3
  ) => {
    const windMultiplier =
      weather === 'BADAI' ? 2.6 : weather === 'HUJAN' ? 1.75 : season === 'GUGUR' ? 1.35 : 1.0;
    const bound = 175;

    for (let i = 0; i < clouds.length; i++) {
      const c = clouds[i];
      c.root.position.x += c.speedX * windMultiplier * dt;
      c.root.position.z += c.speedZ * windMultiplier * dt;
      c.root.position.y = c.baseY + Math.sin(elapsed * 0.45 + c.phaseOffset) * 0.65;

      if (c.root.position.x > bound) c.root.position.x = -bound;
      if (c.root.position.x < -bound) c.root.position.x = bound;
      if (c.root.position.z > bound) c.root.position.z = -bound;
      if (c.root.position.z < -bound) c.root.position.z = bound;
    }

    // Konfigurasi Partikel Berdasarkan 4 Musim
    if (lastSeasonConfigured !== season) {
      lastSeasonConfigured = season;
      if (season === 'SEMI') {
        // Kelopak Bunga Sakura/Pink-Putih Melayang
        seasonParticles.color1 = new BABYLON.Color4(1.0, 0.68, 0.85, 0.85);
        seasonParticles.color2 = new BABYLON.Color4(0.95, 0.85, 0.95, 0.75);
        seasonParticles.colorDead = new BABYLON.Color4(0.9, 0.6, 0.8, 0);
        seasonParticles.minSize = 0.22;
        seasonParticles.maxSize = 0.45;
        seasonParticles.emitRate = 160;
        seasonParticles.gravity = new BABYLON.Vector3(0.8, -1.8, 0.4);
      } else if (season === 'PANAS') {
        // Partikel Cahaya Emas / Kunang-Kunang Hangat
        seasonParticles.color1 = new BABYLON.Color4(1.0, 0.92, 0.45, 0.75);
        seasonParticles.color2 = new BABYLON.Color4(0.45, 0.95, 0.75, 0.65);
        seasonParticles.colorDead = new BABYLON.Color4(1.0, 0.8, 0.2, 0);
        seasonParticles.minSize = 0.15;
        seasonParticles.maxSize = 0.35;
        seasonParticles.emitRate = 95;
        seasonParticles.gravity = new BABYLON.Vector3(0.2, 0.35, 0.2);
      } else if (season === 'GUGUR') {
        // Daun-Daun Jingga & Merah Tua Berguguran
        seasonParticles.color1 = new BABYLON.Color4(0.98, 0.48, 0.12, 0.9);
        seasonParticles.color2 = new BABYLON.Color4(0.88, 0.22, 0.1, 0.85);
        seasonParticles.colorDead = new BABYLON.Color4(0.6, 0.25, 0.05, 0);
        seasonParticles.minSize = 0.28;
        seasonParticles.maxSize = 0.56;
        seasonParticles.emitRate = 210;
        seasonParticles.gravity = new BABYLON.Vector3(2.2, -3.2, 0.9);
      } else {
        // Musim Dingin: Butiran Salju Putih Berkilau Turun Deras
        seasonParticles.color1 = new BABYLON.Color4(0.95, 0.98, 1.0, 0.92);
        seasonParticles.color2 = new BABYLON.Color4(0.78, 0.9, 1.0, 0.82);
        seasonParticles.colorDead = new BABYLON.Color4(0.8, 0.92, 1.0, 0);
        seasonParticles.minSize = 0.2;
        seasonParticles.maxSize = 0.48;
        seasonParticles.emitRate = 480;
        seasonParticles.gravity = new BABYLON.Vector3(-0.9, -4.8, -0.4);
      }
    }

    // Sesuaikan warna awan berdasarkan Jam, Musim, dan Cuaca
    const h = ((hour % 24) + 24) % 24;
    let baseR = 0.94;
    let baseG = 0.96;
    let baseB = 1.0;
    let emR = 0.08;
    let emG = 0.11;
    let emB = 0.16;

    if (h >= 5 && h < 8.5) {
      const t = 1 - Math.abs(h - 6.75) / 1.75;
      baseR = 0.92 + t * 0.08;
      baseG = 0.78 + (1 - t) * 0.16;
      baseB = 0.72 + (1 - t) * 0.24;
      emR = 0.28 * t + 0.06;
      emG = 0.14 * t + 0.05;
      emB = 0.08 * t + 0.06;
    } else if (h >= 8.5 && h < 16.0) {
      baseR = 0.96;
      baseG = 0.98;
      baseB = 1.0;
      emR = 0.12;
      emG = 0.15;
      emB = 0.2;
    } else if (h >= 16.0 && h < 19.5) {
      const t = 1 - Math.abs(h - 17.75) / 1.75;
      baseR = 0.85 + t * 0.15;
      baseG = 0.56 + (1 - t) * 0.22;
      baseB = 0.62 + (1 - t) * 0.18;
      emR = 0.34 * t + 0.05;
      emG = 0.11 * t + 0.04;
      emB = 0.14 * t + 0.06;
    } else {
      baseR = 0.16;
      baseG = 0.23;
      baseB = 0.36;
      emR = 0.03;
      emG = 0.07;
      emB = 0.14;
    }

    if (weather === 'HUJAN') {
      baseR *= 0.55;
      baseG *= 0.58;
      baseB *= 0.64;
      cloudMaterial.alpha = 0.93;
    } else if (weather === 'BADAI') {
      baseR *= 0.36;
      baseG *= 0.39;
      baseB *= 0.46;
      cloudMaterial.alpha = 0.96;
    } else {
      cloudMaterial.alpha = 0.85;
    }

    cloudMaterial.baseColor.set(baseR, baseG, baseB);
    cloudMaterial.emissiveColor.set(emR, emG, emB);

    groundMistParticles.emitter = new BABYLON.Vector3(playerPos.x, 2.0, playerPos.z);
    seasonParticles.emitter = new BABYLON.Vector3(playerPos.x, playerPos.y + 15, playerPos.z);
  };

  const dispose = () => {
    groundMistParticles.dispose();
    seasonParticles.dispose();
    baseSphere.dispose();
    cloudMaterial.dispose();
  };

  return {
    clouds,
    cloudMaterial,
    groundMistParticles,
    seasonParticles,
    update,
    dispose,
  };
}
