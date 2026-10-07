/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as BABYLON from '@babylonjs/core';
import { SpawnedMob } from './aetherWorldEntities';
import { soundEngine } from '../audio/soundEngine';

export type CharacterModelId =
  | 'CYBER_PALADIN'
  | 'SHADOW_RANGER'
  | 'CHRONO_MAGE'
  | 'VALKYRIE_AUTOMATON';

export type ArmorColorThemeId =
  | 'CELESTIAL_CYAN'
  | 'CRIMSON_VALKYRIE'
  | 'EMERALD_SYLVAN'
  | 'SOLARIS_GOLD'
  | 'VOID_AMETHYST'
  | 'FROST_GLACIER';

export type BackAttachmentId =
  | 'AETHER_WINGS'
  | 'RUNE_HALO'
  | 'CLOAK_CAPE'
  | 'NONE';

export type HeadwearStyleId =
  | 'DUMMY_BALD'
  | 'HAIR_SPIKY'
  | 'HAIR_PONYTAIL'
  | 'HAIR_BOB_CYBER'
  | 'HAT_WIZARD'
  | 'HAT_RONIN_KASA'
  | 'HAT_CROWN'
  | 'HELM_KNIGHT'
  | 'HELM_RANGER_HOOD';

export type HairColorId =
  | 'OBSIDIAN_BLACK'
  | 'SILVER_PLATINUM'
  | 'SOLARIS_BLONDE'
  | 'CRIMSON_RED'
  | 'AZURE_CYAN'
  | 'AMETHYST_VIOLET';

export type TopOutfitStyleId =
  | 'TOP_ADVENTURER_COAT'
  | 'TOP_PALADIN_ARMOR'
  | 'TOP_HOODIE_STREET'
  | 'TOP_MAGE_VESTMENT'
  | 'TOP_MARTIAL_GI';

export type BottomPantsStyleId =
  | 'PANTS_CARGO_TACTICAL'
  | 'PANTS_KNIGHT_GREAVES'
  | 'PANTS_SAMURAI_HAKAMA'
  | 'PANTS_BATTLE_ROBE'
  | 'PANTS_EXPLORER_SHORTS';

export type BodyAccessoryStyleId =
  | 'ACC_SCARF'
  | 'ACC_QUIVER_POUCH'
  | 'ACC_ARCANE_ORBS'
  | 'ACC_HIP_TASSETS'
  | 'ACC_NONE';

export type WeaponToolId = 'SWORD' | 'SPEAR' | 'BOW' | 'SNOWBALL' | 'NONE';

export type SwordSlashDirection =
  | 'TOP_TO_BOTTOM'
  | 'RIGHT_TO_LEFT'
  | 'LEFT_TO_RIGHT';

export interface CharacterCustomization {
  modelId: CharacterModelId;
  colorTheme: ArmorColorThemeId;
  hairColor: HairColorId;
  headwearId: HeadwearStyleId;
  topOutfitId: TopOutfitStyleId;
  bottomPantsId: BottomPantsStyleId;
  bodyAccessoryId: BodyAccessoryStyleId;
  backAttachment: BackAttachmentId;
  equippedTool: WeaponToolId;
}

export const DEFAULT_CHARACTER_CUSTOMIZATION: CharacterCustomization = {
  modelId: 'CYBER_PALADIN',
  colorTheme: 'CELESTIAL_CYAN',
  hairColor: 'SILVER_PLATINUM',
  headwearId: 'HELM_KNIGHT',
  topOutfitId: 'TOP_PALADIN_ARMOR',
  bottomPantsId: 'PANTS_KNIGHT_GREAVES',
  bodyAccessoryId: 'ACC_HIP_TASSETS',
  backAttachment: 'AETHER_WINGS',
  equippedTool: 'SWORD',
};

export function applyModelPresetToCustomization(
  current: CharacterCustomization,
  modelId: CharacterModelId
): CharacterCustomization {
  if (modelId === 'CYBER_PALADIN') {
    return {
      ...current,
      modelId,
      headwearId: 'HELM_KNIGHT',
      topOutfitId: 'TOP_PALADIN_ARMOR',
      bottomPantsId: 'PANTS_KNIGHT_GREAVES',
      bodyAccessoryId: 'ACC_HIP_TASSETS',
    };
  }
  if (modelId === 'SHADOW_RANGER') {
    return {
      ...current,
      modelId,
      headwearId: 'HELM_RANGER_HOOD',
      topOutfitId: 'TOP_ADVENTURER_COAT',
      bottomPantsId: 'PANTS_CARGO_TACTICAL',
      bodyAccessoryId: 'ACC_QUIVER_POUCH',
    };
  }
  if (modelId === 'CHRONO_MAGE') {
    return {
      ...current,
      modelId,
      headwearId: 'HAT_WIZARD',
      topOutfitId: 'TOP_MAGE_VESTMENT',
      bottomPantsId: 'PANTS_BATTLE_ROBE',
      bodyAccessoryId: 'ACC_ARCANE_ORBS',
    };
  }
  return {
    ...current,
    modelId: 'VALKYRIE_AUTOMATON',
    headwearId: 'HAT_CROWN',
    topOutfitId: 'TOP_MARTIAL_GI',
    bottomPantsId: 'PANTS_SAMURAI_HAKAMA',
    bodyAccessoryId: 'ACC_SCARF',
  };
}

export interface WardrobeOptionMetadata<T extends string> {
  id: T;
  name: string;
  categoryLabel: string;
  subtitle: string;
}

export const HEADWEAR_STYLES_LIST: WardrobeOptionMetadata<HeadwearStyleId>[] = [
  {
    id: 'DUMMY_BALD',
    name: 'Dummy Polos',
    categoryLabel: 'Manekin',
    subtitle: 'Kepala model dummy mulus tanpa wajah',
  },
  {
    id: 'HAIR_SPIKY',
    name: 'Rambut Runcing',
    categoryLabel: 'Rambut',
    subtitle: 'Gaya rambut petualang anime 3D',
  },
  {
    id: 'HAIR_PONYTAIL',
    name: 'Rambut Kuncir',
    categoryLabel: 'Rambut',
    subtitle: 'Rambut kuncir kuda samurai berayun',
  },
  {
    id: 'HAIR_BOB_CYBER',
    name: 'Rambut Bob Cyber',
    categoryLabel: 'Rambut',
    subtitle: 'Potongan bob pendek dengan poni neon',
  },
  {
    id: 'HAT_WIZARD',
    name: 'Topi Penyihir',
    categoryLabel: 'Topi',
    subtitle: 'Topi kerucut lebar arkanis berpita emas',
  },
  {
    id: 'HAT_RONIN_KASA',
    name: 'Topi Caping Ronin',
    categoryLabel: 'Topi',
    subtitle: 'Topi bambu lebar pengembara Aether',
  },
  {
    id: 'HAT_CROWN',
    name: 'Mahkota Seraphim',
    categoryLabel: 'Topi/Mahkota',
    subtitle: 'Mahkota emas melayang & sayap telinga',
  },
  {
    id: 'HELM_KNIGHT',
    name: 'Helm Ksatria',
    categoryLabel: 'Helm',
    subtitle: 'Helm pelindung penuh & jambul ksatria',
  },
  {
    id: 'HELM_RANGER_HOOD',
    name: 'Tudung Stealth',
    categoryLabel: 'Helm/Tudung',
    subtitle: 'Tudung kain penjelajah bayangan',
  },
];

export const HAIR_COLOR_OPTIONS: { id: HairColorId; name: string; hex: string }[] = [
  { id: 'OBSIDIAN_BLACK', name: 'Hitam Obsidian', hex: '#18181B' },
  { id: 'SILVER_PLATINUM', name: 'Perak Platinum', hex: '#E2E8F0' },
  { id: 'SOLARIS_BLONDE', name: 'Emas Solaris', hex: '#FACC15' },
  { id: 'CRIMSON_RED', name: 'Merah Kirmizi', hex: '#E11D48' },
  { id: 'AZURE_CYAN', name: 'Biru Sian', hex: '#38BDF8' },
  { id: 'AMETHYST_VIOLET', name: 'Ungu Amethyst', hex: '#A855F7' },
];

export const TOP_OUTFIT_STYLES_LIST: WardrobeOptionMetadata<TopOutfitStyleId>[] = [
  {
    id: 'TOP_ADVENTURER_COAT',
    name: 'Jaket Petualang',
    categoryLabel: 'Pakaian',
    subtitle: 'Kerah tinggi & sabuk silang dada',
  },
  {
    id: 'TOP_PALADIN_ARMOR',
    name: 'Zirah Ksatria',
    categoryLabel: 'Zirah',
    subtitle: 'Pelat dada titanium & pauldron bahu',
  },
  {
    id: 'TOP_HOODIE_STREET',
    name: 'Hoodie Techwear',
    categoryLabel: 'Pakaian',
    subtitle: 'Jaket santai bertudung lipat & saku depan',
  },
  {
    id: 'TOP_MAGE_VESTMENT',
    name: 'Jubah Arkanis',
    categoryLabel: 'Pakaian',
    subtitle: 'Mantel bahu penyihir & lencana rune',
  },
  {
    id: 'TOP_MARTIAL_GI',
    name: 'Rompi Martial Gi',
    categoryLabel: 'Pakaian',
    subtitle: 'Rompi petarung tanpa lengan & sabuk obi',
  },
];

export const BOTTOM_PANTS_STYLES_LIST: WardrobeOptionMetadata<BottomPantsStyleId>[] = [
  {
    id: 'PANTS_CARGO_TACTICAL',
    name: 'Celana Kargo Taktis',
    categoryLabel: 'Celana',
    subtitle: 'Celana panjang kantong paha & bot tempur',
  },
  {
    id: 'PANTS_KNIGHT_GREAVES',
    name: 'Celana Zirah Baja',
    categoryLabel: 'Celana Zirah',
    subtitle: 'Pelindung paha, lutut emas & sepatu besi',
  },
  {
    id: 'PANTS_SAMURAI_HAKAMA',
    name: 'Celana Lebar Hakama',
    categoryLabel: 'Celana',
    subtitle: 'Celana lipit longgar samurai tradisional',
  },
  {
    id: 'PANTS_BATTLE_ROBE',
    name: 'Bawahan Jubah',
    categoryLabel: 'Celana/Jubah',
    subtitle: 'Mantel pinggul panjang & celana dalam',
  },
  {
    id: 'PANTS_EXPLORER_SHORTS',
    name: 'Celana Pendek',
    categoryLabel: 'Celana',
    subtitle: 'Celana pendek selutut & sepatu bot',
  },
];

export const BODY_ACCESSORY_STYLES_LIST: WardrobeOptionMetadata<BodyAccessoryStyleId>[] = [
  {
    id: 'ACC_SCARF',
    name: 'Syal Leher Panjang',
    categoryLabel: 'Aksesori',
    subtitle: 'Syal leher dengan kain berkibar',
  },
  {
    id: 'ACC_QUIVER_POUCH',
    name: 'Tabung Panah & Sabuk',
    categoryLabel: 'Aksesori',
    subtitle: 'Quiver punggung & kantong taktis pinggang',
  },
  {
    id: 'ACC_ARCANE_ORBS',
    name: '3 Bola Kristal Orbit',
    categoryLabel: 'Aksesori',
    subtitle: 'Tiga bola energi berputar mengelilingi badan',
  },
  {
    id: 'ACC_HIP_TASSETS',
    name: 'Perisai Pinggul',
    categoryLabel: 'Aksesori',
    subtitle: 'Pelindung mekanis kiri-kanan pinggul',
  },
  {
    id: 'ACC_NONE',
    name: 'Tanpa Aksesori',
    categoryLabel: 'Polos',
    subtitle: 'Tanpa aksesori badan tambahan',
  },
];

export interface ModelMetadata {
  id: CharacterModelId;
  name: string;
  roleTitle: string;
  description: string;
  badgeColor: string;
}

export const CHARACTER_MODELS_LIST: ModelMetadata[] = [
  {
    id: 'CYBER_PALADIN',
    name: 'Cyber-Paladin',
    roleTitle: 'Vanguard Knight',
    description:
      'Zirah lapis titanium berat dengan helm bervisor neon, jambul ksatria, dan inti reaktor dada.',
    badgeColor: '#38BDF8',
  },
  {
    id: 'SHADOW_RANGER',
    name: 'Shadow Ranger',
    roleTitle: 'Aether Strider',
    description:
      'Penjelajah lincah bertudung stealth, masker optik, pelindung bahu ringan, dan tabung panah punggung.',
    badgeColor: '#34D399',
  },
  {
    id: 'CHRONO_MAGE',
    name: 'Chrono Mage',
    roleTitle: 'Arcane Weaver',
    description:
      'Penyihir Aether dengan topi runcing arkanis, jubah rune panjang, dan bola kristal yang mengorbit.',
    badgeColor: '#A855F7',
  },
  {
    id: 'VALKYRIE_AUTOMATON',
    name: 'Valkyrie Seraph',
    roleTitle: 'Celestial Mecha',
    description:
      'Konstruk mekanis bersayap mahkota ganda di kepala, siluet aerodinamis, dan cincin energi.',
    badgeColor: '#F59E0B',
  },
];

export interface ColorThemeMetadata {
  id: ArmorColorThemeId;
  name: string;
  primaryHex: string;
  secondaryHex: string;
  glowHex: string;
}

export const ARMOR_COLOR_THEMES: ColorThemeMetadata[] = [
  {
    id: 'CELESTIAL_CYAN',
    name: 'Celestial Cyan',
    primaryHex: '#D1DCEB',
    secondaryHex: '#2457B8',
    glowHex: '#38BDF8',
  },
  {
    id: 'CRIMSON_VALKYRIE',
    name: 'Crimson Eclipse',
    primaryHex: '#27272A',
    secondaryHex: '#991B1B',
    glowHex: '#F43F5E',
  },
  {
    id: 'EMERALD_SYLVAN',
    name: 'Emerald Sylvan',
    primaryHex: '#ECFDF5',
    secondaryHex: '#065F46',
    glowHex: '#10B981',
  },
  {
    id: 'SOLARIS_GOLD',
    name: 'Solaris Imperial',
    primaryHex: '#FEF9C3',
    secondaryHex: '#B45309',
    glowHex: '#F59E0B',
  },
  {
    id: 'VOID_AMETHYST',
    name: 'Void Amethyst',
    primaryHex: '#1E1B4B',
    secondaryHex: '#5B21B6',
    glowHex: '#C084FC',
  },
  {
    id: 'FROST_GLACIER',
    name: 'Frost Glacier',
    primaryHex: '#E0F2FE',
    secondaryHex: '#0369A1',
    glowHex: '#7DD3FC',
  },
];

export interface BackAttachmentMetadata {
  id: BackAttachmentId;
  name: string;
  subtitle: string;
}

export const BACK_ATTACHMENTS_LIST: BackAttachmentMetadata[] = [
  {
    id: 'AETHER_WINGS',
    name: 'Sayap Kristal Aether',
    subtitle: '4 Bilah Sayap Energi Melayang',
  },
  {
    id: 'RUNE_HALO',
    name: 'Cincin Halo Astral',
    subtitle: 'Lingkaran Rune Berputar di Punggung',
  },
  {
    id: 'CLOAK_CAPE',
    name: 'Jubah Ksatria Aether',
    subtitle: 'Jubah Energi Berkibar',
  },
  {
    id: 'NONE',
    name: 'Tanpa Aksesori',
    subtitle: 'Siluet Punggung Bersih',
  },
];

export interface WeaponToolMetadata {
  id: WeaponToolId;
  slotNumber: number;
  name: string;
  subtitle: string;
  actionLabel: string;
  accentHex: string;
}

export const WEAPON_TOOLS_LIST: WeaponToolMetadata[] = [
  {
    id: 'SWORD',
    slotNumber: 1,
    name: 'Pedang Aether',
    subtitle: 'Kombo Tebas Atas-Bawah & Kanan-Kiri',
    actionLabel: 'Tebas Pedang',
    accentHex: '#38BDF8',
  },
  {
    id: 'SPEAR',
    slotNumber: 2,
    name: 'Tombak Celestial',
    subtitle: 'Tahan Bidik & Lepas Tusuk Menerjang',
    actionLabel: 'Tahan / Tusuk',
    accentHex: '#F59E0B',
  },
  {
    id: 'BOW',
    slotNumber: 3,
    name: 'Busur Recurve 3D',
    subtitle: 'Tahan Tarik Panah & Lepas Menancap',
    actionLabel: 'Tahan & Panah',
    accentHex: '#34D399',
  },
  {
    id: 'SNOWBALL',
    slotNumber: 4,
    name: 'Bola Salju Cryo',
    subtitle: 'Lemparan Salju Beku Parabolik',
    actionLabel: 'Lempar Salju',
    accentHex: '#BAE6FD',
  },
  {
    id: 'NONE',
    slotNumber: 5,
    name: 'Tangan Kosong',
    subtitle: 'Tanpa Memegang Senjata',
    actionLabel: 'Tangan Kosong',
    accentHex: '#94A3B8',
  },
];

export interface WorldObstacleRef {
  x: number;
  z: number;
  radius: number;
  label: string;
}

export interface ActiveProjectile {
  kind: 'ARROW' | 'SNOWBALL' | 'SLASH_WAVE' | 'SPEAR_WAVE';
  root: BABYLON.TransformNode;
  velocity: BABYLON.Vector3;
  gravity: number;
  age: number;
  maxLifetime: number;
  stuck: boolean;
  stuckTime: number;
  baseRotationX: number;
}

export interface ImpactParticleBurst {
  meshes: { mesh: BABYLON.Mesh; vel: BABYLON.Vector3 }[];
  age: number;
  maxAge: number;
}

export interface ArticulatedRigNodes {
  characterVisual: BABYLON.TransformNode;
  torsoPivot: BABYLON.TransformNode;
  headGroup: BABYLON.TransformNode;
  leftArmPivot: BABYLON.TransformNode;
  rightArmPivot: BABYLON.TransformNode;
  leftElbowPivot: BABYLON.TransformNode;
  rightElbowPivot: BABYLON.TransformNode;
  leftLegPivot: BABYLON.TransformNode;
  rightLegPivot: BABYLON.TransformNode;
  leftKneePivot: BABYLON.TransformNode;
  rightKneePivot: BABYLON.TransformNode;
}

/**
 * Membangun Mesh Anak Panah 3D Detail:
 * - Mata Panah Broadhead berada di ujung depan (+Z)
 * - 3 Sirip Bulu Fletching berada di ujung belakang (-Z)
 */
function createDetailedArrowMesh(
  scene: BABYLON.Scene,
  namePrefix: string,
  shaftMat: BABYLON.Material,
  tipMat: BABYLON.Material,
  featherMat: BABYLON.Material
): BABYLON.TransformNode {
  const arrowRoot = new BABYLON.TransformNode(`${namePrefix}_root`, scene);

  const shaft = BABYLON.MeshBuilder.CreateCylinder(
    `${namePrefix}_shaft`,
    { diameter: 0.025, height: 0.9, tessellation: 8 },
    scene
  );
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = 0.0;
  shaft.parent = arrowRoot;
  shaft.material = shaftMat;

  // Mata panah runcing menghadap ke DEPAN (+Z)
  const arrowhead = BABYLON.MeshBuilder.CreateCylinder(
    `${namePrefix}_head`,
    { diameterTop: 0.0, diameterBottom: 0.095, height: 0.24, tessellation: 4 },
    scene
  );
  arrowhead.rotation.x = Math.PI / 2;
  arrowhead.position.z = 0.52;
  arrowhead.parent = arrowRoot;
  arrowhead.material = tipMat;

  const collar = BABYLON.MeshBuilder.CreateTorus(
    `${namePrefix}_collar`,
    { diameter: 0.046, thickness: 0.014, tessellation: 10 },
    scene
  );
  collar.position.z = 0.4;
  collar.parent = arrowRoot;
  collar.material = tipMat;

  // 3 Sirip Bulu Panah di bagian ekor (-Z)
  for (let i = 0; i < 3; i++) {
    const feather = BABYLON.MeshBuilder.CreateBox(
      `${namePrefix}_feather_${i}`,
      { width: 0.008, height: 0.082, depth: 0.19 },
      scene
    );
    const angle = (i * Math.PI * 2) / 3;
    feather.position.set(
      Math.sin(angle) * 0.026,
      Math.cos(angle) * 0.026,
      -0.35
    );
    feather.rotation.z = -angle;
    feather.parent = arrowRoot;
    feather.material = featherMat;
  }

  return arrowRoot;
}

/**
 * Membangun Sistem Kustomisasi Karakter, Kerangka Sendi (Siku, Lutut, Torso),
 * Fitur Hold/Tahan untuk Memanah & Menusuk Tombak, serta Visual 3rd-Person Busur yang Presisi.
 */
export function createCustomizableEquipmentSystem(
  scene: BABYLON.Scene,
  rig: ArticulatedRigNodes,
  camera: BABYLON.Camera,
  cyanGlowMat: BABYLON.StandardMaterial,
  goldGlowMat: BABYLON.StandardMaterial
) {
  const {
    characterVisual,
    torsoPivot,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    leftElbowPivot,
    rightElbowPivot,
    leftLegPivot,
    rightLegPivot,
    leftKneePivot,
    rightKneePivot,
  } = rig;

  const customPrimaryMat = new BABYLON.PBRMetallicRoughnessMaterial(
    'customPrimaryMat',
    scene
  );
  customPrimaryMat.metallic = 0.68;
  customPrimaryMat.roughness = 0.26;

  const customSecondaryMat = new BABYLON.PBRMetallicRoughnessMaterial(
    'customSecondaryMat',
    scene
  );
  customSecondaryMat.metallic = 0.45;
  customSecondaryMat.roughness = 0.38;

  const dummySkinMat = new BABYLON.PBRMetallicRoughnessMaterial(
    'dummySkinMat',
    scene
  );
  dummySkinMat.baseColor = new BABYLON.Color3(0.86, 0.89, 0.94);
  dummySkinMat.metallic = 0.18;
  dummySkinMat.roughness = 0.35;

  const hairMat = new BABYLON.PBRMetallicRoughnessMaterial('hairMat', scene);
  hairMat.baseColor = new BABYLON.Color3(0.88, 0.91, 0.96);
  hairMat.metallic = 0.22;
  hairMat.roughness = 0.42;

  const darkGripMat = new BABYLON.PBRMetallicRoughnessMaterial(
    'darkGripMat',
    scene
  );
  darkGripMat.baseColor = new BABYLON.Color3(0.12, 0.09, 0.07);
  darkGripMat.metallic = 0.25;
  darkGripMat.roughness = 0.65;

  const customGlowMat = new BABYLON.StandardMaterial('customGlowMat', scene);
  customGlowMat.disableLighting = true;

  const snowMat = new BABYLON.StandardMaterial('snowProjectileMat', scene);
  snowMat.diffuseColor = BABYLON.Color3.FromHexString('#E0F2FE');
  snowMat.emissiveColor = BABYLON.Color3.FromHexString('#7DD3FC');
  snowMat.specularColor = BABYLON.Color3.White();

  const applyMaterialsToBaseCharacter = () => {
    const allMeshes = characterVisual.getChildMeshes(false);
    allMeshes.forEach((m) => {
      if (m.name.includes('helmetDome')) {
        // Kepala model dummy tanpa wajah menggunakan material manekin halus
        m.material = dummySkinMat;
      } else if (
        m.name.includes('paladinChest') ||
        m.name.includes('gauntlet_') ||
        m.name.includes('shin_') ||
        m.name.includes('swordGuard')
      ) {
        m.material = customPrimaryMat;
      } else if (
        m.name.includes('paladinBelt') ||
        m.name.includes('pauldron_') ||
        m.name.includes('boot_')
      ) {
        m.material = customSecondaryMat;
      } else if (
        m.name.includes('chestReactor') ||
        m.name.includes('visorSlit') ||
        m.name.includes('swordBlade')
      ) {
        m.material = customGlowMat;
      }
      if (
        m.name.includes('swordHilt') ||
        m.name.includes('swordGuard') ||
        m.name.includes('swordBlade')
      ) {
        m.isVisible = false;
      }
    });
  };
  applyMaterialsToBaseCharacter();

  // ============================================================================
  // 1A. KUSTOMISASI KEPALA DUMMY (RAMBUT, TOPI, MAHKOTA & HELM — TANPA WAJAH)
  // Semua dipasang pada `headGroup` agar menoleh bersama kepala dummy!
  // ============================================================================
  const headwearRoot = new BABYLON.TransformNode('headwearRoot', scene);
  headwearRoot.parent = headGroup;

  // 1) Rambut Runcing Anime (HAIR_SPIKY)
  const hairSpikyGroup = new BABYLON.TransformNode('hairSpikyGroup', scene);
  hairSpikyGroup.parent = headwearRoot;

  const spikyCap = BABYLON.MeshBuilder.CreateSphere(
    'spikyCap',
    { diameterX: 0.45, diameterY: 0.34, diameterZ: 0.47, slice: 0.65, segments: 10 },
    scene
  );
  spikyCap.position.set(0, 0.06, -0.01);
  spikyCap.parent = hairSpikyGroup;
  spikyCap.material = hairMat;

  const spikeConfigs = [
    { x: 0, y: 0.28, z: 0.08, rx: 0.55, rz: 0, h: 0.26 },
    { x: -0.14, y: 0.25, z: 0.05, rx: 0.38, rz: 0.62, h: 0.24 },
    { x: 0.14, y: 0.25, z: 0.05, rx: 0.38, rz: -0.62, h: 0.24 },
    { x: 0, y: 0.27, z: -0.12, rx: -0.65, rz: 0, h: 0.28 },
    { x: -0.18, y: 0.16, z: -0.1, rx: -0.45, rz: 0.85, h: 0.25 },
    { x: 0.18, y: 0.16, z: -0.1, rx: -0.45, rz: -0.85, h: 0.25 },
    { x: 0, y: 0.14, z: -0.22, rx: -1.05, rz: 0, h: 0.26 },
    { x: -0.09, y: 0.2, z: 0.19, rx: 1.05, rz: 0.25, h: 0.18 },
    { x: 0.09, y: 0.2, z: 0.19, rx: 1.05, rz: -0.25, h: 0.18 },
  ];
  spikeConfigs.forEach((cfg, idx) => {
    const spike = BABYLON.MeshBuilder.CreateCylinder(
      `hairSpike_${idx}`,
      { diameterTop: 0.0, diameterBottom: 0.14, height: cfg.h, tessellation: 5 },
      scene
    );
    spike.position.set(cfg.x, cfg.y, cfg.z);
    spike.rotation.set(cfg.rx, 0, cfg.rz);
    spike.parent = hairSpikyGroup;
    spike.material = hairMat;
  });

  // 2) Rambut Kuncir Kuda Samurai (HAIR_PONYTAIL)
  const hairPonytailGroup = new BABYLON.TransformNode('hairPonytailGroup', scene);
  hairPonytailGroup.parent = headwearRoot;

  const ponytailCap = BABYLON.MeshBuilder.CreateSphere(
    'ponytailCap',
    { diameterX: 0.45, diameterY: 0.34, diameterZ: 0.48, slice: 0.62, segments: 12 },
    scene
  );
  ponytailCap.position.set(0, 0.06, -0.01);
  ponytailCap.parent = hairPonytailGroup;
  ponytailCap.material = hairMat;

  const ponytailTieRing = BABYLON.MeshBuilder.CreateTorus(
    'ponytailTieRing',
    { diameter: 0.13, thickness: 0.032, tessellation: 14 },
    scene
  );
  ponytailTieRing.position.set(0, 0.14, -0.24);
  ponytailTieRing.rotation.x = Math.PI / 3;
  ponytailTieRing.parent = hairPonytailGroup;
  ponytailTieRing.material = goldGlowMat;

  const ponytailTailPivot = new BABYLON.TransformNode('ponytailTailPivot', scene);
  ponytailTailPivot.position.set(0, 0.14, -0.25);
  ponytailTailPivot.parent = hairPonytailGroup;

  const ponytailPlume = BABYLON.MeshBuilder.CreateCylinder(
    'ponytailPlume',
    { diameterTop: 0.14, diameterBottom: 0.03, height: 0.56, tessellation: 8 },
    scene
  );
  ponytailPlume.position.set(0, -0.24, -0.1);
  ponytailPlume.rotation.x = 0.42;
  ponytailPlume.parent = ponytailTailPivot;
  ponytailPlume.material = hairMat;

  // 3) Rambut Bob Pendek Cyber (HAIR_BOB_CYBER)
  const hairBobGroup = new BABYLON.TransformNode('hairBobGroup', scene);
  hairBobGroup.parent = headwearRoot;

  const bobTop = BABYLON.MeshBuilder.CreateSphere(
    'bobTop',
    { diameterX: 0.47, diameterY: 0.38, diameterZ: 0.49, slice: 0.65, segments: 12 },
    scene
  );
  bobTop.position.set(0, 0.06, 0);
  bobTop.parent = hairBobGroup;
  bobTop.material = hairMat;

  for (const side of [-1, 1]) {
    const bobSideLock = BABYLON.MeshBuilder.CreateBox(
      `bobSide_${side}`,
      { width: 0.08, height: 0.32, depth: 0.34 },
      scene
    );
    bobSideLock.position.set(side * 0.2, -0.02, 0.02);
    bobSideLock.rotation.z = side * 0.12;
    bobSideLock.parent = hairBobGroup;
    bobSideLock.material = hairMat;
  }

  const bobHairpin = BABYLON.MeshBuilder.CreateBox(
    'bobHairpin',
    { width: 0.12, height: 0.03, depth: 0.04 },
    scene
  );
  bobHairpin.position.set(-0.16, 0.12, 0.21);
  bobHairpin.rotation.z = 0.35;
  bobHairpin.parent = hairBobGroup;
  bobHairpin.material = customGlowMat;

  // 4) Topi Penyihir Arkanis (HAT_WIZARD)
  const hatWizardGroup = new BABYLON.TransformNode('hatWizardGroup', scene);
  hatWizardGroup.parent = headwearRoot;

  const mageHatBrim = BABYLON.MeshBuilder.CreateCylinder(
    'mageHatBrim',
    { diameterTop: 0.9, diameterBottom: 0.96, height: 0.045, tessellation: 18 },
    scene
  );
  mageHatBrim.position.set(0, 0.19, 0);
  mageHatBrim.rotation.x = -0.12;
  mageHatBrim.parent = hatWizardGroup;
  mageHatBrim.material = customSecondaryMat;

  const mageHatBand = BABYLON.MeshBuilder.CreateTorus(
    'mageHatBand',
    { diameter: 0.46, thickness: 0.04, tessellation: 16 },
    scene
  );
  mageHatBand.position.set(0, 0.22, -0.01);
  mageHatBand.rotation.x = -0.12;
  mageHatBand.parent = hatWizardGroup;
  mageHatBand.material = goldGlowMat;

  const mageHatCone = BABYLON.MeshBuilder.CreateCylinder(
    'mageHatCone',
    { diameterTop: 0.03, diameterBottom: 0.46, height: 0.64, tessellation: 12 },
    scene
  );
  mageHatCone.position.set(0, 0.5, -0.05);
  mageHatCone.rotation.x = -0.24;
  mageHatCone.parent = hatWizardGroup;
  mageHatCone.material = customSecondaryMat;

  // 5) Topi Caping Ronin / Bamboo Kasa (HAT_RONIN_KASA)
  const hatRoninGroup = new BABYLON.TransformNode('hatRoninGroup', scene);
  hatRoninGroup.parent = headwearRoot;

  const kasaCone = BABYLON.MeshBuilder.CreateCylinder(
    'kasaCone',
    { diameterTop: 0.08, diameterBottom: 1.04, height: 0.28, tessellation: 20 },
    scene
  );
  kasaCone.position.set(0, 0.26, 0);
  kasaCone.parent = hatRoninGroup;
  kasaCone.material = customSecondaryMat;

  const kasaGlowRing = BABYLON.MeshBuilder.CreateTorus(
    'kasaGlowRing',
    { diameter: 0.98, thickness: 0.022, tessellation: 24 },
    scene
  );
  kasaGlowRing.position.set(0, 0.13, 0);
  kasaGlowRing.parent = hatRoninGroup;
  kasaGlowRing.material = customGlowMat;

  // 6) Mahkota Sayap Seraphim (HAT_CROWN)
  const hatCrownGroup = new BABYLON.TransformNode('hatCrownGroup', scene);
  hatCrownGroup.parent = headwearRoot;

  const valkyrieCrown = BABYLON.MeshBuilder.CreateTorus(
    'valkyrieCrown',
    { diameter: 0.46, thickness: 0.045, tessellation: 18 },
    scene
  );
  valkyrieCrown.position.set(0, 0.34, 0);
  valkyrieCrown.parent = hatCrownGroup;
  valkyrieCrown.material = goldGlowMat;

  for (const side of [-1, 1]) {
    const headWing = BABYLON.MeshBuilder.CreateBox(
      `valkHeadWing_${side}`,
      { width: 0.04, height: 0.44, depth: 0.22 },
      scene
    );
    headWing.position.set(side * 0.25, 0.18, -0.05);
    headWing.rotation.z = side * -0.42;
    headWing.rotation.x = -0.35;
    headWing.parent = hatCrownGroup;
    headWing.material = customGlowMat;
  }

  // 7) Tudung Stealth Ranger (HELM_RANGER_HOOD)
  const helmHoodGroup = new BABYLON.TransformNode('helmHoodGroup', scene);
  helmHoodGroup.parent = headwearRoot;

  const rangerHood = BABYLON.MeshBuilder.CreateCylinder(
    'rangerHood',
    { diameterTop: 0.16, diameterBottom: 0.56, height: 0.56, tessellation: 12 },
    scene
  );
  rangerHood.position.set(0, 0.1, -0.03);
  rangerHood.rotation.x = -0.18;
  rangerHood.parent = helmHoodGroup;
  rangerHood.material = customSecondaryMat;

  // ============================================================================
  // 1B. PAKAIAN ATAS / BAJU (DIPASANG PADA TORSO & LENGAN ATAS)
  // ============================================================================
  const topOutfitRoot = new BABYLON.TransformNode('topOutfitRoot', scene);
  topOutfitRoot.parent = torsoPivot;

  // 1) Jaket Tunik Petualang (TOP_ADVENTURER_COAT)
  const topAdventurerGroup = new BABYLON.TransformNode('topAdventurerGroup', scene);
  topAdventurerGroup.parent = topOutfitRoot;

  const advCollar = BABYLON.MeshBuilder.CreateCylinder(
    'advCollar',
    { diameterTop: 0.52, diameterBottom: 0.46, height: 0.18, tessellation: 12 },
    scene
  );
  advCollar.position.set(0, 0.78, -0.02);
  advCollar.parent = topAdventurerGroup;
  advCollar.material = customSecondaryMat;

  const advChestStrap = BABYLON.MeshBuilder.CreateBox(
    'advChestStrap',
    { width: 0.1, height: 0.78, depth: 0.58 },
    scene
  );
  advChestStrap.position.set(0, 0.42, 0);
  advChestStrap.rotation.z = 0.52;
  advChestStrap.parent = topAdventurerGroup;
  advChestStrap.material = darkGripMat;

  const advBuckle = BABYLON.MeshBuilder.CreatePolyhedron(
    'advBuckle',
    { type: 1, size: 0.085 },
    scene
  );
  advBuckle.position.set(0, 0.44, 0.28);
  advBuckle.parent = topAdventurerGroup;
  advBuckle.material = goldGlowMat;

  // 2) Jaket Hoodie Streetwear (TOP_HOODIE_STREET)
  const topHoodieGroup = new BABYLON.TransformNode('topHoodieGroup', scene);
  topHoodieGroup.parent = topOutfitRoot;

  const hoodieBodyShell = BABYLON.MeshBuilder.CreateCylinder(
    'hoodieBodyShell',
    { diameterTop: 0.82, diameterBottom: 0.72, height: 0.78, tessellation: 12 },
    scene
  );
  hoodieBodyShell.position.set(0, 0.39, 0);
  hoodieBodyShell.scaling.z = 0.74;
  hoodieBodyShell.parent = topHoodieGroup;
  hoodieBodyShell.material = customSecondaryMat;

  const hoodieFoldedHood = BABYLON.MeshBuilder.CreateTorus(
    'hoodieFoldedHood',
    { diameter: 0.5, thickness: 0.15, tessellation: 14 },
    scene
  );
  hoodieFoldedHood.position.set(0, 0.79, -0.05);
  hoodieFoldedHood.rotation.x = 0.22;
  hoodieFoldedHood.parent = topHoodieGroup;
  hoodieFoldedHood.material = customPrimaryMat;

  const hoodiePocket = BABYLON.MeshBuilder.CreateBox(
    'hoodiePocket',
    { width: 0.42, height: 0.22, depth: 0.12 },
    scene
  );
  hoodiePocket.position.set(0, 0.18, 0.24);
  hoodiePocket.parent = topHoodieGroup;
  hoodiePocket.material = customPrimaryMat;

  for (const side of [-1, 1]) {
    const drawstring = BABYLON.MeshBuilder.CreateCylinder(
      `hoodieString_${side}`,
      { diameter: 0.022, height: 0.28 },
      scene
    );
    drawstring.position.set(side * 0.09, 0.58, 0.28);
    drawstring.parent = topHoodieGroup;
    drawstring.material = customGlowMat;
  }

  // 3) Jubah Agung Arkanis (TOP_MAGE_VESTMENT)
  const topMageGroup = new BABYLON.TransformNode('topMageGroup', scene);
  topMageGroup.parent = topOutfitRoot;

  const mageShoulderMantle = BABYLON.MeshBuilder.CreateCylinder(
    'mageShoulderMantle',
    { diameterTop: 0.52, diameterBottom: 0.98, height: 0.32, tessellation: 12 },
    scene
  );
  mageShoulderMantle.position.set(0, 0.66, 0);
  mageShoulderMantle.scaling.z = 0.72;
  mageShoulderMantle.parent = topMageGroup;
  mageShoulderMantle.material = customSecondaryMat;

  const mageStolaFront = BABYLON.MeshBuilder.CreateBox(
    'mageStolaFront',
    { width: 0.22, height: 0.74, depth: 0.04 },
    scene
  );
  mageStolaFront.position.set(0, 0.38, 0.28);
  mageStolaFront.parent = topMageGroup;
  mageStolaFront.material = goldGlowMat;

  // 4) Rompi Martial Gi (TOP_MARTIAL_GI)
  const topMartialGroup = new BABYLON.TransformNode('topMartialGroup', scene);
  topMartialGroup.parent = topOutfitRoot;

  for (const side of [-1, 1]) {
    const giLapel = BABYLON.MeshBuilder.CreateBox(
      `giLapel_${side}`,
      { width: 0.12, height: 0.68, depth: 0.58 },
      scene
    );
    giLapel.position.set(side * 0.1, 0.42, 0.02);
    giLapel.rotation.z = side * -0.28;
    giLapel.parent = topMartialGroup;
    giLapel.material = customSecondaryMat;
  }

  const giObiBelt = BABYLON.MeshBuilder.CreateCylinder(
    'giObiBelt',
    { diameterTop: 0.68, diameterBottom: 0.7, height: 0.22, tessellation: 12 },
    scene
  );
  giObiBelt.position.set(0, 0.08, 0);
  giObiBelt.scaling.z = 0.74;
  giObiBelt.parent = topMartialGroup;
  giObiBelt.material = goldGlowMat;

  // ============================================================================
  // 1C. CELANA & BAWAHAN BERARTIKULASI (DIPASANG PADA PAHA & LUTUT!)
  // ============================================================================
  const cargoPockets: BABYLON.Mesh[] = [];
  const hakamaThighs: BABYLON.Mesh[] = [];
  const shortsCuffs: BABYLON.Mesh[] = [];

  const setupArticulatedLegPants = (
    hipNode: BABYLON.TransformNode,
    side: -1 | 1
  ) => {
    // A. Kantong Samping Celana Kargo Taktis (PANTS_CARGO_TACTICAL)
    const cargoPocket = BABYLON.MeshBuilder.CreateBox(
      `cargoPocket_${side}`,
      { width: 0.08, height: 0.2, depth: 0.16 },
      scene
    );
    cargoPocket.position.set(side * 0.13, -0.2, 0.02);
    cargoPocket.parent = hipNode;
    cargoPocket.material = customSecondaryMat;
    cargoPockets.push(cargoPocket);

    // B. Paha Lebar Lipit Celana Samurai Hakama (PANTS_SAMURAI_HAKAMA)
    const hakamaLeg = BABYLON.MeshBuilder.CreateCylinder(
      `hakamaThigh_${side}`,
      { diameterTop: 0.34, diameterBottom: 0.44, height: 0.46, tessellation: 10 },
      scene
    );
    hakamaLeg.position.set(0, -0.23, 0);
    hakamaLeg.parent = hipNode;
    hakamaLeg.material = customSecondaryMat;
    hakamaThighs.push(hakamaLeg);

    // C. Manset Celana Pendek Penjelajah (PANTS_EXPLORER_SHORTS)
    const shortCuff = BABYLON.MeshBuilder.CreateTorus(
      `shortCuff_${side}`,
      { diameter: 0.27, thickness: 0.055, tessellation: 12 },
      scene
    );
    shortCuff.position.set(0, -0.34, 0);
    shortCuff.parent = hipNode;
    shortCuff.material = customPrimaryMat;
    shortsCuffs.push(shortCuff);
  };

  setupArticulatedLegPants(leftLegPivot, -1);
  setupArticulatedLegPants(rightLegPivot, 1);

  // Bawahan Jubah Panjang (PANTS_BATTLE_ROBE)
  const mageRobeSkirt = BABYLON.MeshBuilder.CreateCylinder(
    'mageRobeSkirt',
    { diameterTop: 0.62, diameterBottom: 0.96, height: 0.68, tessellation: 12 },
    scene
  );
  mageRobeSkirt.position.set(0, -0.34, 0);
  mageRobeSkirt.scaling.z = 0.74;
  mageRobeSkirt.parent = torsoPivot;
  mageRobeSkirt.material = customSecondaryMat;

  // ============================================================================
  // 1D. AKSESORI BADAN TAMBAHAN (SYAL, QUIVER, ORBS, PERISAI PINGGUL)
  // ============================================================================
  // 1) Syal Leher Panjang (ACC_SCARF)
  const accScarfGroup = new BABYLON.TransformNode('accScarfGroup', scene);
  accScarfGroup.parent = torsoPivot;

  const rangerScarf = BABYLON.MeshBuilder.CreateTorus(
    'rangerScarf',
    { diameter: 0.52, thickness: 0.14, tessellation: 14 },
    scene
  );
  rangerScarf.position.set(0, 0.78, 0);
  rangerScarf.parent = accScarfGroup;
  rangerScarf.material = customSecondaryMat;

  const scarfTails: BABYLON.Mesh[] = [];
  for (const side of [-1, 1]) {
    const tail = BABYLON.MeshBuilder.CreateBox(
      `scarfTail_${side}`,
      { width: 0.13, height: 0.68, depth: 0.025 },
      scene
    );
    tail.position.set(side * 0.12, 0.42, -0.26);
    tail.rotation.x = 0.22;
    tail.rotation.z = side * -0.14;
    tail.parent = accScarfGroup;
    tail.material = customGlowMat;
    scarfTails.push(tail);
  }

  // 2) Tabung Panah & Tas Pinggang (ACC_QUIVER_POUCH)
  const accQuiverGroup = new BABYLON.TransformNode('accQuiverGroup', scene);
  accQuiverGroup.parent = torsoPivot;

  const rangerQuiver = BABYLON.MeshBuilder.CreateCylinder(
    'rangerQuiver',
    { diameterTop: 0.2, diameterBottom: 0.15, height: 0.68, tessellation: 10 },
    scene
  );
  rangerQuiver.position.set(-0.22, 0.48, -0.26);
  rangerQuiver.rotation.z = 0.35;
  rangerQuiver.parent = accQuiverGroup;
  rangerQuiver.material = darkGripMat;

  for (let i = 0; i < 3; i++) {
    const qArrow = BABYLON.MeshBuilder.CreateCylinder(
      `quiverArrow_${i}`,
      { diameter: 0.025, height: 0.35 },
      scene
    );
    qArrow.position.set((i - 1) * 0.04, 0.42, 0);
    qArrow.parent = rangerQuiver;
    qArrow.material = customGlowMat;
  }

  for (const side of [-1, 1]) {
    const beltPouch = BABYLON.MeshBuilder.CreateBox(
      `beltPouch_${side}`,
      { width: 0.12, height: 0.16, depth: 0.1 },
      scene
    );
    beltPouch.position.set(side * 0.31, 0.02, 0.08);
    beltPouch.parent = accQuiverGroup;
    beltPouch.material = darkGripMat;
  }

  // 3) 3 Bola Kristal Mengorbit (ACC_ARCANE_ORBS)
  const mageOrbsPivot = new BABYLON.TransformNode('mageOrbsPivot', scene);
  mageOrbsPivot.position.set(0, 0.85, 0);
  mageOrbsPivot.parent = torsoPivot;

  for (let i = 0; i < 3; i++) {
    const orb = BABYLON.MeshBuilder.CreatePolyhedron(
      `mageOrb_${i}`,
      { type: 1, size: 0.085 },
      scene
    );
    const angle = (i * Math.PI * 2) / 3;
    orb.position.set(Math.cos(angle) * 0.68, 0.1, Math.sin(angle) * 0.68);
    orb.parent = mageOrbsPivot;
    orb.material = customGlowMat;
  }

  // 4) Perisai Pinggul Valkyrie (ACC_HIP_TASSETS)
  const accTassetsGroup = new BABYLON.TransformNode('accTassetsGroup', scene);
  accTassetsGroup.parent = torsoPivot;

  for (const side of [-1, 1]) {
    const hipFin = BABYLON.MeshBuilder.CreateBox(
      `valkHipFin_${side}`,
      { width: 0.06, height: 0.48, depth: 0.32 },
      scene
    );
    hipFin.position.set(side * 0.36, -0.1, -0.04);
    hipFin.rotation.z = side * -0.35;
    hipFin.parent = accTassetsGroup;
    hipFin.material = customPrimaryMat;
  }

  // ============================================================================
  // 2. AKSESORI PUNGGUNG (DIPASANG PADA TORSO AGAR IKUT BERGERAK BERSAMA PUNGGUNG)
  // ============================================================================
  const backAttachRoot = new BABYLON.TransformNode('backAttachRoot', scene);
  backAttachRoot.position.set(0, 0.5, -0.24);
  backAttachRoot.parent = torsoPivot;

  const wingsGroup = new BABYLON.TransformNode('wingsGroup', scene);
  wingsGroup.parent = backAttachRoot;
  const wingBlades: BABYLON.Mesh[] = [];
  for (const side of [-1, 1]) {
    for (let tier = 0; tier < 2; tier++) {
      const wing = BABYLON.MeshBuilder.CreateBox(
        `aetherWing_${side}_${tier}`,
        { width: 0.035, height: tier === 0 ? 0.95 : 0.68, depth: 0.22 },
        scene
      );
      wing.position.set(
        side * (0.38 + tier * 0.16),
        tier === 0 ? 0.22 : -0.18,
        -0.06
      );
      wing.rotation.z = side * (tier === 0 ? -0.68 : -1.05);
      wing.rotation.y = side * 0.25;
      wing.parent = wingsGroup;
      wing.material = customGlowMat;
      wingBlades.push(wing);
    }
  }

  const haloGroup = new BABYLON.TransformNode('haloGroup', scene);
  haloGroup.parent = backAttachRoot;
  const runeRing = BABYLON.MeshBuilder.CreateTorus(
    'backRuneRing',
    { diameter: 1.05, thickness: 0.045, tessellation: 24 },
    scene
  );
  runeRing.rotation.x = Math.PI / 2;
  runeRing.parent = haloGroup;
  runeRing.material = customGlowMat;

  const innerStar = BABYLON.MeshBuilder.CreatePolyhedron(
    'backInnerStar',
    { type: 1, size: 0.16 },
    scene
  );
  innerStar.parent = haloGroup;
  innerStar.material = goldGlowMat;

  const capeGroup = new BABYLON.TransformNode('capeGroup', scene);
  capeGroup.parent = backAttachRoot;
  const capeMesh = BABYLON.MeshBuilder.CreateBox(
    'knightCape',
    { width: 0.68, height: 1.15, depth: 0.04 },
    scene
  );
  capeMesh.position.set(0, -0.36, -0.05);
  capeMesh.rotation.x = 0.16;
  capeMesh.parent = capeGroup;
  capeMesh.material = customSecondaryMat;

  // ============================================================================
  // 3. PEMBUATAN MODEL 3D SENJATA: PEDANG, TOMBAK, BUSUR RECURVE 3D & BOLA SALJU
  // ============================================================================
  const buildWeaponMeshes = (parent: BABYLON.TransformNode, prefix: string) => {
    // A. PEDANG (Aether Greatsword)
    const swordNode = new BABYLON.TransformNode(`${prefix}_sword`, scene);
    swordNode.parent = parent;

    const sPommel = BABYLON.MeshBuilder.CreatePolyhedron(
      `${prefix}_sPommel`,
      { type: 1, size: 0.055 },
      scene
    );
    sPommel.position.y = -0.18;
    sPommel.parent = swordNode;
    sPommel.material = goldGlowMat;

    const sHilt = BABYLON.MeshBuilder.CreateCylinder(
      `${prefix}_sHilt`,
      { diameterTop: 0.052, diameterBottom: 0.044, height: 0.34, tessellation: 10 },
      scene
    );
    sHilt.parent = swordNode;
    sHilt.material = darkGripMat;

    const sGuardCenter = BABYLON.MeshBuilder.CreatePolyhedron(
      `${prefix}_sGuardGem`,
      { type: 1, size: 0.068 },
      scene
    );
    sGuardCenter.position.y = 0.19;
    sGuardCenter.parent = swordNode;
    sGuardCenter.material = customGlowMat;

    for (const side of [-1, 1]) {
      const guardWing = BABYLON.MeshBuilder.CreateBox(
        `${prefix}_sGuardWing_${side}`,
        { width: 0.22, height: 0.055, depth: 0.085 },
        scene
      );
      guardWing.position.set(side * 0.11, 0.2, 0);
      guardWing.rotation.z = side * 0.24;
      guardWing.parent = swordNode;
      guardWing.material = goldGlowMat;
    }

    const sBladeCore = BABYLON.MeshBuilder.CreateBox(
      `${prefix}_sBladeCore`,
      { width: 0.065, height: 1.08, depth: 0.036 },
      scene
    );
    sBladeCore.position.y = 0.74;
    sBladeCore.parent = swordNode;
    sBladeCore.material = customPrimaryMat;

    const sBladeEdge = BABYLON.MeshBuilder.CreateBox(
      `${prefix}_sBladeEdge`,
      { width: 0.135, height: 1.06, depth: 0.018 },
      scene
    );
    sBladeEdge.position.y = 0.74;
    sBladeEdge.parent = swordNode;
    sBladeEdge.material = customGlowMat;

    const sBladeTip = BABYLON.MeshBuilder.CreateCylinder(
      `${prefix}_sBladeTip`,
      { diameterTop: 0, diameterBottom: 0.135, height: 0.26, tessellation: 4 },
      scene
    );
    sBladeTip.position.y = 1.39;
    sBladeTip.scaling.z = 0.22;
    sBladeTip.parent = swordNode;
    sBladeTip.material = customGlowMat;

    // B. TOMBAK (Celestial Dragon Lance)
    const spearNode = new BABYLON.TransformNode(`${prefix}_spear`, scene);
    spearNode.parent = parent;

    const spearShaft = BABYLON.MeshBuilder.CreateCylinder(
      `${prefix}_spearShaft`,
      { diameter: 0.044, height: 2.05, tessellation: 10 },
      scene
    );
    spearShaft.position.y = 0.52;
    spearShaft.parent = spearNode;
    spearShaft.material = darkGripMat;

    const spearPommel = BABYLON.MeshBuilder.CreateCylinder(
      `${prefix}_spearPommel`,
      { diameterTop: 0.05, diameterBottom: 0.0, height: 0.22, tessellation: 6 },
      scene
    );
    spearPommel.position.y = -0.58;
    spearPommel.parent = spearNode;
    spearPommel.material = goldGlowMat;

    const spearCollar = BABYLON.MeshBuilder.CreateTorus(
      `${prefix}_spearCollar`,
      { diameter: 0.19, thickness: 0.035, tessellation: 16 },
      scene
    );
    spearCollar.position.y = 1.48;
    spearCollar.parent = spearNode;
    spearCollar.material = goldGlowMat;

    for (const side of [-1, 1]) {
      const lugWing = BABYLON.MeshBuilder.CreateBox(
        `${prefix}_spearLug_${side}`,
        { width: 0.14, height: 0.04, depth: 0.03 },
        scene
      );
      lugWing.position.set(side * 0.09, 1.54, 0);
      lugWing.rotation.z = side * 0.48;
      lugWing.parent = spearNode;
      lugWing.material = customPrimaryMat;
    }

    const spearTip = BABYLON.MeshBuilder.CreateCylinder(
      `${prefix}_spearTip`,
      { diameterTop: 0.0, diameterBottom: 0.165, height: 0.62, tessellation: 4 },
      scene
    );
    spearTip.position.y = 1.85;
    spearTip.scaling.z = 0.42;
    spearTip.parent = spearNode;
    spearTip.material = customGlowMat;

    // C. BUSUR RECURVE 3D
    // Berpusat pada Riser Grip (0, 0, 0) agar telapak tangan kiri tepat menggenggam gagang busur,
    // lengan busur melengkung ke arah belakang (-Z), dan anak panah menunjuk lurus ke DEPAN (+Z)!
    const bowNode = new BABYLON.TransformNode(`${prefix}_bow`, scene);
    bowNode.parent = parent;

    const bowCurvePoints = [
      new BABYLON.Vector3(0, 0.72, -0.12),  // Ujung Recurve Atas (Upper Tip)
      new BABYLON.Vector3(0, 0.56, -0.24),  // Lengkungan Atas
      new BABYLON.Vector3(0, 0.34, -0.05),  // Lengan Busur Atas (Upper Limb)
      new BABYLON.Vector3(0, 0.14, 0.02),   // Riser Atas
      new BABYLON.Vector3(0, 0.0, 0.0),     // Pegangan Tengah (Center Grip di 0,0,0!)
      new BABYLON.Vector3(0, -0.14, 0.02),  // Riser Bawah
      new BABYLON.Vector3(0, -0.34, -0.05), // Lengan Busur Bawah (Lower Limb)
      new BABYLON.Vector3(0, -0.56, -0.24), // Lengkungan Bawah
      new BABYLON.Vector3(0, -0.72, -0.12), // Ujung Recurve Bawah (Lower Tip)
    ];

    const bowRadiusFunc = (index: number) => {
      const distFromMid = Math.abs(index - 4);
      if (distFromMid === 0) return 0.036;
      if (distFromMid === 1) return 0.032;
      if (distFromMid === 2) return 0.025;
      if (distFromMid === 3) return 0.018;
      return 0.012;
    };

    const bowLimbTube = BABYLON.MeshBuilder.CreateTube(
      `${prefix}_bowLimbTube`,
      {
        path: bowCurvePoints,
        radiusFunction: bowRadiusFunc,
        tessellation: 12,
        cap: BABYLON.Mesh.CAP_ALL,
      },
      scene
    );
    bowLimbTube.parent = bowNode;
    bowLimbTube.material = customPrimaryMat;

    // Pegangan Riser Tengah tepat di (0, 0, 0)
    const bowRiserGrip = BABYLON.MeshBuilder.CreateCylinder(
      `${prefix}_bowRiserGrip`,
      { diameterTop: 0.082, diameterBottom: 0.082, height: 0.28, tessellation: 12 },
      scene
    );
    bowRiserGrip.position.set(0, 0, 0);
    bowRiserGrip.parent = bowNode;
    bowRiserGrip.material = goldGlowMat;

    for (const signY of [-1, 1]) {
      const tipGem = BABYLON.MeshBuilder.CreatePolyhedron(
        `${prefix}_bowTipGem_${signY}`,
        { type: 1, size: 0.042 },
        scene
      );
      tipGem.position.set(0, signY * 0.72, -0.12);
      tipGem.parent = bowNode;
      tipGem.material = customGlowMat;

      const limbAccent = BABYLON.MeshBuilder.CreateTorus(
        `${prefix}_bowAccent_${signY}`,
        { diameter: 0.075, thickness: 0.018, tessellation: 12 },
        scene
      );
      limbAccent.position.set(0, signY * 0.34, -0.05);
      limbAccent.rotation.x = Math.PI / 2;
      limbAccent.parent = bowNode;
      limbAccent.material = goldGlowMat;
    }

    // Tali Busur Dinamis 2 Segmen (Menghubungkan Ujung Atas -> Titik Tarik Nock -> Ujung Bawah)
    const upperString = BABYLON.MeshBuilder.CreateCylinder(
      `${prefix}_upperString`,
      { diameter: 0.011, height: 0.72, tessellation: 6 },
      scene
    );
    upperString.parent = bowNode;
    upperString.material = customGlowMat;

    const lowerString = BABYLON.MeshBuilder.CreateCylinder(
      `${prefix}_lowerString`,
      { diameter: 0.011, height: 0.72, tessellation: 6 },
      scene
    );
    lowerString.parent = bowNode;
    lowerString.material = customGlowMat;

    // Anak Panah 3D yang Terpasang di Tali Busur (Ujung mata panah menghadap ke +Z / DEPAN!)
    const nockedArrow = createDetailedArrowMesh(
      scene,
      `${prefix}_nockedArrow`,
      goldGlowMat,
      customGlowMat,
      customSecondaryMat
    );
    nockedArrow.parent = bowNode;

    const updateBowDraw = (drawAmount: number, showArrow: boolean = true) => {
      const topTip = new BABYLON.Vector3(0, 0.71, -0.13);
      const botTip = new BABYLON.Vector3(0, -0.71, -0.13);
      // Saat drawAmount = 0, tali berada di z = -0.14. Saat ditarik penuh (1.0), tali mundur ke z = -0.62!
      const pullZ = -0.14 - drawAmount * 0.48;
      const nockPos = new BABYLON.Vector3(0, 0, pullZ);

      const upDiff = topTip.subtract(nockPos);
      const upLen = upDiff.length();
      upperString.scaling.y = upLen / 0.72;
      upperString.position.copyFrom(nockPos.add(topTip).scale(0.5));
      upperString.rotation.x = Math.atan2(upDiff.z, upDiff.y);

      const lowDiff = nockPos.subtract(botTip);
      const lowLen = lowDiff.length();
      lowerString.scaling.y = lowLen / 0.72;
      lowerString.position.copyFrom(nockPos.add(botTip).scale(0.5));
      lowerString.rotation.x = Math.atan2(lowDiff.z, lowDiff.y);

      // Ekor anak panah berada di titik tali (pullZ), sedangkan mata panah menonjol ke DEPAN (+Z) melewati riser (z=0)!
      nockedArrow.setEnabled(showArrow);
      nockedArrow.position.set(0, 0, pullZ + 0.42);
    };
    updateBowDraw(0, true);

    // D. BOLA SALJU (Cryo Snowball)
    const snowballNode = new BABYLON.TransformNode(`${prefix}_snowball`, scene);
    snowballNode.parent = parent;

    const heldSnowSphere = BABYLON.MeshBuilder.CreateSphere(
      `${prefix}_heldSnowSphere`,
      { diameter: 0.28, segments: 10 },
      scene
    );
    heldSnowSphere.parent = snowballNode;
    heldSnowSphere.material = snowMat;

    const snowFrostRing = BABYLON.MeshBuilder.CreateTorus(
      `${prefix}_snowFrostRing`,
      { diameter: 0.38, thickness: 0.02, tessellation: 14 },
      scene
    );
    snowFrostRing.rotation.x = 0.6;
    snowFrostRing.parent = snowballNode;
    snowFrostRing.material = cyanGlowMat;

    return {
      swordNode,
      spearNode,
      bowNode,
      snowballNode,
      updateBowDraw,
    };
  };

  // Mount Senjata di Telapak Tangan Kanan (Dipasang pada Sendi Siku Kanan `rightElbowPivot`)
  const rightHandMount = new BABYLON.TransformNode('rightHandWeaponMount', scene);
  rightHandMount.position.set(0, -0.38, 0.08);
  rightHandMount.rotation.x = Math.PI / 2.2;
  rightHandMount.parent = rightElbowPivot;
  const tpRightWeapons = buildWeaponMeshes(rightHandMount, 'tpR');

  // Socket Telapak Tangan Kiri (di ujung bawah Sendi Siku Kiri `leftElbowPivot`)
  const leftHandSocket = new BABYLON.TransformNode('leftHandSocket', scene);
  leftHandSocket.position.set(0, -0.38, 0.05);
  leftHandSocket.parent = leftElbowPivot;

  // Mount Busur 3rd-Person: Dipasang langsung pada `characterVisual` (ruang koordinat +Z Depan, +Y Atas,
  // identik dengan kamera 1st-Person!) namun posisinya selalu dikunci mengikuti `leftHandSocket`.
  // Dengan cara ini, rotasi bahu/siku tidak akan pernah membalik orientasi busur maupun anak panah!
  const leftHandBowMount = new BABYLON.TransformNode('leftHandBowMount', scene);
  leftHandBowMount.position.set(-0.42, 1.15, 0.35);
  leftHandBowMount.rotation.set(0, 0, 0.15);
  leftHandBowMount.parent = characterVisual;
  const tpLeftBow = buildWeaponMeshes(leftHandBowMount, 'tpL');
  tpLeftBow.swordNode.setEnabled(false);
  tpLeftBow.spearNode.setEnabled(false);
  tpLeftBow.snowballNode.setEnabled(false);

  const syncThirdPersonBowToLeftHand = (pitchRad: number, yawRad: number, cantRad: number) => {
    leftHandSocket.computeWorldMatrix(true);
    characterVisual.computeWorldMatrix(true);
    const invCharMat = characterVisual.getWorldMatrix().clone().invert();
    const socketWorldPos = leftHandSocket.getAbsolutePosition();
    const localHandPos = BABYLON.Vector3.TransformCoordinates(socketWorldPos, invCharMat);
    leftHandBowMount.position.copyFrom(localHandPos);
    // Dalam ruang characterVisual: +Z adalah DEPAN dan +Y adalah ATAS (sama persis dengan 1st-Person!)
    leftHandBowMount.rotation.set(pitchRad, yawRad, cantRad);
  };

  // Senjata di Sudut Kanan Bawah Kamera (First-Person Viewmodel)
  const fpMount = new BABYLON.TransformNode('firstPersonWeaponMount', scene);
  fpMount.position.set(0.42, -0.34, 0.88);
  fpMount.rotation.set(0.25, -0.18, 0.06);
  fpMount.parent = camera;
  const fpWeapons = buildWeaponMeshes(fpMount, 'fp');

  // ============================================================================
  // 4. STATE HOLD / CHARGE (TAHAN UNTUK MEMANAH ATAU MENUSUK TOMBAK) & KOMBO
  // ============================================================================
  let currentCustomization: CharacterCustomization = {
    ...DEFAULT_CHARACTER_CUSTOMIZATION,
  };
  let attackAnimTimer = 0;
  let attackAnimDuration = 0.4;
  let activeAttackType: WeaponToolId = 'SWORD';

  // State Hold / Menahan Tarikan Busur atau Ancang-Ancang Tombak
  let isHoldingWeapon = false;
  let holdChargeSeconds = 0;
  const maxHoldChargeTime = 0.55; // 0.55 detik untuk mencapai tarikan/tahanan 100%

  // Rotasi Kombo Pedang: 0 = Atas ke Bawah, 1 = Kanan ke Kiri, 2 = Kiri ke Kanan
  let swordComboStep = 0;
  let activeSwordSlashDir: SwordSlashDirection = 'TOP_TO_BOTTOM';

  // State Terjangan Maju Tombak (Lunge Velocity)
  const activeSpearLungeVel = new BABYLON.Vector3(0, 0, 0);

  const applyCustomization = (
    custom: CharacterCustomization,
    isFirstPerson: boolean
  ) => {
    currentCustomization = custom;

    const theme =
      ARMOR_COLOR_THEMES.find((t) => t.id === custom.colorTheme) ||
      ARMOR_COLOR_THEMES[0];
    customPrimaryMat.baseColor = BABYLON.Color3.FromHexString(theme.primaryHex);
    customSecondaryMat.baseColor = BABYLON.Color3.FromHexString(theme.secondaryHex);
    customGlowMat.diffuseColor = BABYLON.Color3.FromHexString(theme.glowHex);
    customGlowMat.emissiveColor = BABYLON.Color3.FromHexString(theme.glowHex);

    const hairOption =
      HAIR_COLOR_OPTIONS.find((h) => h.id === custom.hairColor) ||
      HAIR_COLOR_OPTIONS[0];
    hairMat.baseColor = BABYLON.Color3.FromHexString(hairOption.hex);

    // 1. KEPALA DUMMY (RAMBUT, TOPI, MAHKOTA, HELM — WAJAH TIDAK ADA / MANEKIN DUMMY)
    const hw = custom.headwearId || 'HELM_KNIGHT';
    hairSpikyGroup.setEnabled(!isFirstPerson && hw === 'HAIR_SPIKY');
    hairPonytailGroup.setEnabled(!isFirstPerson && hw === 'HAIR_PONYTAIL');
    hairBobGroup.setEnabled(!isFirstPerson && hw === 'HAIR_BOB_CYBER');
    hatWizardGroup.setEnabled(!isFirstPerson && hw === 'HAT_WIZARD');
    hatRoninGroup.setEnabled(!isFirstPerson && hw === 'HAT_RONIN_KASA');
    hatCrownGroup.setEnabled(!isFirstPerson && hw === 'HAT_CROWN');
    helmHoodGroup.setEnabled(!isFirstPerson && hw === 'HELM_RANGER_HOOD');

    const childMeshes = characterVisual.getChildMeshes(false);
    const visorMesh = childMeshes.find((m) => m.name === 'visorSlit');
    const crestMesh = childMeshes.find((m) => m.name === 'helmetCrest');
    const domeMesh = childMeshes.find((m) => m.name === 'helmetDome');

    // Jika memilih Rambut, Topi, atau Dummy Polos -> sembunyikan visor helm agar terlihat jelas kepala dummy tanpa wajah!
    const isFullHelm = hw === 'HELM_KNIGHT';
    if (visorMesh) {
      visorMesh.isVisible = !isFirstPerson && isFullHelm;
    }
    if (crestMesh) {
      crestMesh.isVisible = !isFirstPerson && isFullHelm;
    }
    if (domeMesh) {
      domeMesh.material = isFullHelm ? customPrimaryMat : dummySkinMat;
    }

    // 2. PAKAIAN ATAS / BAJU (TOP OUTFIT)
    const top = custom.topOutfitId || 'TOP_PALADIN_ARMOR';
    topAdventurerGroup.setEnabled(!isFirstPerson && top === 'TOP_ADVENTURER_COAT');
    topHoodieGroup.setEnabled(!isFirstPerson && top === 'TOP_HOODIE_STREET');
    topMageGroup.setEnabled(!isFirstPerson && top === 'TOP_MAGE_VESTMENT');
    topMartialGroup.setEnabled(!isFirstPerson && top === 'TOP_MARTIAL_GI');

    const showHeavyPauldrons =
      top === 'TOP_PALADIN_ARMOR' || top === 'TOP_MAGE_VESTMENT';
    const showChestReactor = top === 'TOP_PALADIN_ARMOR';

    childMeshes.forEach((m) => {
      if (m.name.includes('pauldron_')) {
        m.isVisible = !isFirstPerson && showHeavyPauldrons;
      } else if (m.name === 'chestReactor') {
        m.isVisible = !isFirstPerson && showChestReactor;
      }
    });

    // 3. CELANA / BAWAHAN (BOTTOM PANTS)
    const pants = custom.bottomPantsId || 'PANTS_KNIGHT_GREAVES';
    cargoPockets.forEach((p) =>
      p.setEnabled(!isFirstPerson && pants === 'PANTS_CARGO_TACTICAL')
    );
    hakamaThighs.forEach((h) =>
      h.setEnabled(!isFirstPerson && pants === 'PANTS_SAMURAI_HAKAMA')
    );
    shortsCuffs.forEach((s) =>
      s.setEnabled(!isFirstPerson && pants === 'PANTS_EXPLORER_SHORTS')
    );
    mageRobeSkirt.setEnabled(!isFirstPerson && pants === 'PANTS_BATTLE_ROBE');

    const showKneeArmor =
      pants === 'PANTS_KNIGHT_GREAVES' || pants === 'PANTS_CARGO_TACTICAL';
    childMeshes.forEach((m) => {
      if (m.name.includes('knee_')) {
        m.isVisible = !isFirstPerson && showKneeArmor;
      } else if (m.name.includes('shin_')) {
        // Jika memakai celana pendek, betis menampilkan sendi dummy; jika celana panjang/zirah, menampilkan warna pakaian
        m.material =
          pants === 'PANTS_EXPLORER_SHORTS' ? dummySkinMat : customPrimaryMat;
      } else if (m.name.includes('thigh_')) {
        m.material =
          pants === 'PANTS_KNIGHT_GREAVES'
            ? customPrimaryMat
            : customSecondaryMat;
      }
    });

    // 4. AKSESORI BADAN TAMBAHAN (SYAL, QUIVER, ORBS, PERISAI PINGGUL)
    const bodyAcc = custom.bodyAccessoryId || 'ACC_NONE';
    accScarfGroup.setEnabled(!isFirstPerson && bodyAcc === 'ACC_SCARF');
    accQuiverGroup.setEnabled(!isFirstPerson && bodyAcc === 'ACC_QUIVER_POUCH');
    mageOrbsPivot.setEnabled(!isFirstPerson && bodyAcc === 'ACC_ARCANE_ORBS');
    accTassetsGroup.setEnabled(!isFirstPerson && bodyAcc === 'ACC_HIP_TASSETS');

    // 5. AKSESORI PUNGGUNG
    wingsGroup.setEnabled(!isFirstPerson && custom.backAttachment === 'AETHER_WINGS');
    haloGroup.setEnabled(!isFirstPerson && custom.backAttachment === 'RUNE_HALO');
    capeGroup.setEnabled(!isFirstPerson && custom.backAttachment === 'CLOAK_CAPE');

    // 6. ALAT & SENJATA AKTIF
    const tool = custom.equippedTool;
    tpRightWeapons.swordNode.setEnabled(!isFirstPerson && tool === 'SWORD');
    tpRightWeapons.spearNode.setEnabled(!isFirstPerson && tool === 'SPEAR');
    tpRightWeapons.bowNode.setEnabled(false);
    tpRightWeapons.snowballNode.setEnabled(!isFirstPerson && tool === 'SNOWBALL');

    tpLeftBow.bowNode.setEnabled(!isFirstPerson && tool === 'BOW');

    fpWeapons.swordNode.setEnabled(isFirstPerson && tool === 'SWORD');
    fpWeapons.spearNode.setEnabled(isFirstPerson && tool === 'SPEAR');
    fpWeapons.bowNode.setEnabled(isFirstPerson && tool === 'BOW');
    fpWeapons.snowballNode.setEnabled(isFirstPerson && tool === 'SNOWBALL');
  };

  // ============================================================================
  // 5. SISTEM PROYEKTIL, SAYATAN PEDANG, TUSUKAN TOMBAK & PANAH MENANCAP
  // ============================================================================
  const activeProjectiles: ActiveProjectile[] = [];
  const activeBursts: ImpactParticleBurst[] = [];

  const spawnImpactBurst = (
    pos: BABYLON.Vector3,
    colorHex: string,
    count: number = 14,
    size: number = 0.1
  ) => {
    const burstMat = new BABYLON.StandardMaterial('burstMat', scene);
    burstMat.emissiveColor = BABYLON.Color3.FromHexString(colorHex);
    burstMat.disableLighting = true;

    const meshes: { mesh: BABYLON.Mesh; vel: BABYLON.Vector3 }[] = [];
    for (let i = 0; i < count; i++) {
      const p = BABYLON.MeshBuilder.CreatePolyhedron(
        'impactShard',
        { type: 1, size: size * (0.65 + Math.random() * 0.7) },
        scene
      );
      p.position.copyFrom(pos);
      p.material = burstMat;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.75;
      const speed = 3.2 + Math.random() * 6.5;
      const vel = new BABYLON.Vector3(
        Math.cos(theta) * Math.sin(phi) * speed,
        Math.cos(phi) * speed + 2.2,
        Math.sin(theta) * Math.sin(phi) * speed
      );
      meshes.push({ mesh: p, vel });
    }
    activeBursts.push({ meshes, age: 0, maxAge: 0.55 });
  };

  /**
   * Meluncurkan Anak Panah 3D dengan kecepatan sesuai durasi tahan (chargePower: 0.7 -> 1.45)
   */
  const spawnLaunchedArrow = (
    origin: BABYLON.Vector3,
    aimYaw: number,
    aimPitch: number,
    chargePower: number = 1.0
  ) => {
    soundEngine.playBowShoot();

    const cosPitch = Math.cos(aimPitch);
    const aimDir = new BABYLON.Vector3(
      Math.sin(aimYaw) * cosPitch,
      -Math.sin(aimPitch),
      Math.cos(aimYaw) * cosPitch
    ).normalize();

    const arrowRoot = createDetailedArrowMesh(
      scene,
      'flyingArrow',
      goldGlowMat,
      customGlowMat,
      customSecondaryMat
    );
    arrowRoot.position.copyFrom(origin);

    const speed = 36 * chargePower;
    const launchVel = aimDir.scale(speed);
    launchVel.y += 1.65;

    const targetLook = origin.add(launchVel);
    arrowRoot.lookAt(targetLook);

    activeProjectiles.push({
      kind: 'ARROW',
      root: arrowRoot,
      velocity: launchVel,
      gravity: 9.2,
      age: 0,
      maxLifetime: 18.0,
      stuck: false,
      stuckTime: 0,
      baseRotationX: arrowRoot.rotation.x,
    });

    if (activeProjectiles.length > 28) {
      const oldestStuckIdx = activeProjectiles.findIndex((p) => p.stuck);
      if (oldestStuckIdx !== -1) {
        activeProjectiles[oldestStuckIdx].root.dispose();
        activeProjectiles.splice(oldestStuckIdx, 1);
      }
    }
  };

  /**
   * Mengeksekusi Tusukan Tombak + Terjangan Maju (Forward Lunge) saat dilepas
   */
  const executeSpearThrustRelease = (
    playerPos: BABYLON.Vector3,
    aimYaw: number,
    mobs: SpawnedMob[],
    chargePower: number = 1.0,
    onHitMobCallback?: (mobName: string, weaponName: string) => void
  ) => {
    soundEngine.playSpearThrust();
    activeAttackType = 'SPEAR';
    attackAnimDuration = 0.4;
    attackAnimTimer = 0.4;

    const flatDir = new BABYLON.Vector3(
      Math.sin(aimYaw),
      0,
      Math.cos(aimYaw)
    ).normalize();
    const spawnOrigin = playerPos
      .add(new BABYLON.Vector3(0, 1.52, 0))
      .add(flatDir.scale(0.95));

    // Kecepatan terjangan maju (Lunge) meningkat jika tombak ditahan terlebih dahulu!
    activeSpearLungeVel.copyFrom(flatDir.scale(19.5 * chargePower));

    const beamRoot = new BABYLON.TransformNode('spearWaveRoot', scene);
    beamRoot.position.copyFrom(spawnOrigin);
    beamRoot.rotation.y = aimYaw;

    const spearBeam = BABYLON.MeshBuilder.CreateCylinder(
      'spearBeam',
      {
        diameterTop: 0.01,
        diameterBottom: 0.34 * chargePower,
        height: 3.5 * chargePower,
        tessellation: 10,
      },
      scene
    );
    spearBeam.rotation.x = Math.PI / 2;
    spearBeam.position.z = 1.55;
    spearBeam.parent = beamRoot;
    spearBeam.material = goldGlowMat;

    const sonicRing = BABYLON.MeshBuilder.CreateTorus(
      'spearSonicRing',
      { diameter: 0.98 * chargePower, thickness: 0.048, tessellation: 18 },
      scene
    );
    sonicRing.position.z = 0.65;
    sonicRing.parent = beamRoot;
    sonicRing.material = customGlowMat;

    activeProjectiles.push({
      kind: 'SPEAR_WAVE',
      root: beamRoot,
      velocity: flatDir.scale(25 * chargePower),
      gravity: 0,
      age: 0,
      maxLifetime: 0.28,
      stuck: false,
      stuckTime: 0,
      baseRotationX: 0,
    });

    mobs.forEach((mob) => {
      const toMob = mob.rootNode.position.subtract(playerPos);
      const dist = Math.hypot(toMob.x, toMob.z);
      if (dist < 6.8 * chargePower) {
        const pushVec = toMob.normalize().scale(2.5 * chargePower);
        mob.vehicle.position.x += pushVec.x;
        mob.vehicle.position.z += pushVec.z;
        spawnImpactBurst(
          mob.rootNode.position.add(new BABYLON.Vector3(0, 1.1, 0)),
          '#F59E0B',
          18,
          0.12
        );
        soundEngine.playProjectileHit();
        onHitMobCallback?.(mob.name, 'Tusukan Tombak Celestial');
      }
    });
  };

  /**
   * Memulai Tahan / Hold Senjata (Saat Tombol Klik Kiri / F / Tombol Aksi Ditekan):
   * - Jika Busur (BOW) atau Tombak (SPEAR): Menahan tarikan busur / ancang-ancang tombak selama tombol ditahan!
   * - Jika Pedang (SWORD) atau Bola Salju (SNOWBALL): Langsung mengeksekusi kombo tebasan / lemparan.
   */
  const startWeaponHold = (
    playerPos: BABYLON.Vector3,
    aimYaw: number,
    aimPitch: number,
    mobs: SpawnedMob[],
    onHitMobCallback?: (mobName: string, weaponName: string) => void
  ) => {
    const tool = currentCustomization.equippedTool;
    if (tool === 'BOW' || tool === 'SPEAR') {
      if (!isHoldingWeapon) {
        isHoldingWeapon = true;
        holdChargeSeconds = 0;
        activeAttackType = tool;
        soundEngine.playMove();
      }
      return;
    }
    triggerWeaponAction(playerPos, aimYaw, aimPitch, mobs, onHitMobCallback);
  };

  /**
   * Melepaskan Tahan / Hold Senjata (Saat Tombol Klik Kiri / F / Tombol Aksi Dilepas):
   * - Melontarkan anak panah yang sedang ditarik atau menusukkan tombak sembari menerjang maju!
   */
  const releaseWeaponHold = (
    playerPos: BABYLON.Vector3,
    aimYaw: number,
    aimPitch: number,
    mobs: SpawnedMob[],
    onHitMobCallback?: (mobName: string, weaponName: string) => void
  ) => {
    if (!isHoldingWeapon) return;
    const tool = currentCustomization.equippedTool;
    const chargeRatio = Math.min(1, holdChargeSeconds / maxHoldChargeTime);
    const chargePower = 0.78 + chargeRatio * 0.55; // 0.78x (tap cepat) hingga 1.33x (tahan penuh)
    isHoldingWeapon = false;
    holdChargeSeconds = 0;

    if (tool === 'BOW') {
      activeAttackType = 'BOW';
      attackAnimDuration = 0.28;
      attackAnimTimer = 0.28;

      const flatDir = new BABYLON.Vector3(
        Math.sin(aimYaw),
        0,
        Math.cos(aimYaw)
      ).normalize();
      const bowOrigin = playerPos
        .add(new BABYLON.Vector3(0, 1.62, 0))
        .add(flatDir.scale(0.95));
      spawnLaunchedArrow(bowOrigin, aimYaw, aimPitch, chargePower);
    } else if (tool === 'SPEAR') {
      executeSpearThrustRelease(
        playerPos,
        aimYaw,
        mobs,
        chargePower,
        onHitMobCallback
      );
    }
  };

  /**
   * Memicu Aksi Instan (Untuk Pedang, Bola Salju, atau Klik Cepat)
   */
  const triggerWeaponAction = (
    playerPos: BABYLON.Vector3,
    aimYaw: number,
    aimPitch: number,
    mobs: SpawnedMob[],
    onHitMobCallback?: (mobName: string, weaponName: string) => void
  ) => {
    const tool = currentCustomization.equippedTool;
    activeAttackType = tool;

    const cosPitch = Math.cos(aimPitch);
    const aimDir = new BABYLON.Vector3(
      Math.sin(aimYaw) * cosPitch,
      -Math.sin(aimPitch),
      Math.cos(aimYaw) * cosPitch
    ).normalize();

    const flatDir = new BABYLON.Vector3(
      Math.sin(aimYaw),
      0,
      Math.cos(aimYaw)
    ).normalize();
    const spawnOrigin = playerPos
      .add(new BABYLON.Vector3(0, 1.52, 0))
      .add(flatDir.scale(0.9));

    const theme =
      ARMOR_COLOR_THEMES.find((t) => t.id === currentCustomization.colorTheme) ||
      ARMOR_COLOR_THEMES[0];

    if (tool === 'SWORD') {
      soundEngine.playSwordSlash();
      attackAnimDuration = 0.38;
      attackAnimTimer = 0.38;

      if (swordComboStep === 0) {
        activeSwordSlashDir = 'TOP_TO_BOTTOM';
      } else if (swordComboStep === 1) {
        activeSwordSlashDir = 'RIGHT_TO_LEFT';
      } else {
        activeSwordSlashDir = 'LEFT_TO_RIGHT';
      }
      swordComboStep = (swordComboStep + 1) % 3;

      const waveRoot = new BABYLON.TransformNode('slashWaveRoot', scene);
      waveRoot.position.copyFrom(spawnOrigin);
      waveRoot.rotation.y = aimYaw;

      const slashArc = BABYLON.MeshBuilder.CreateCylinder(
        'slashCrescent',
        {
          diameterTop: 2.5,
          diameterBottom: 2.5,
          height: 0.07,
          tessellation: 24,
          arc: 0.52,
        },
        scene
      );
      slashArc.rotation.y = -Math.PI * 0.24;
      slashArc.parent = waveRoot;
      slashArc.material = customGlowMat;

      if (activeSwordSlashDir === 'TOP_TO_BOTTOM') {
        waveRoot.rotation.z = Math.PI / 2;
      } else if (activeSwordSlashDir === 'RIGHT_TO_LEFT') {
        waveRoot.rotation.z = 0.18;
      } else {
        waveRoot.rotation.z = -0.18;
      }

      activeProjectiles.push({
        kind: 'SLASH_WAVE',
        root: waveRoot,
        velocity: flatDir.scale(16.5),
        gravity: 0,
        age: 0,
        maxLifetime: 0.28,
        stuck: false,
        stuckTime: 0,
        baseRotationX: 0,
      });

      mobs.forEach((mob) => {
        const toMob = mob.rootNode.position.subtract(playerPos);
        const dist = Math.hypot(toMob.x, toMob.z);
        if (dist < 4.8) {
          const pushVec = toMob.normalize().scale(1.85);
          mob.vehicle.position.x += pushVec.x;
          mob.vehicle.position.z += pushVec.z;
          spawnImpactBurst(
            mob.rootNode.position.add(new BABYLON.Vector3(0, 1.1, 0)),
            theme.glowHex,
            15,
            0.11
          );
          soundEngine.playProjectileHit();
          onHitMobCallback?.(mob.name, 'Tebasan Pedang Aether');
        }
      });
    } else if (tool === 'SPEAR') {
      executeSpearThrustRelease(playerPos, aimYaw, mobs, 1.0, onHitMobCallback);
    } else if (tool === 'BOW') {
      activeAttackType = 'BOW';
      attackAnimDuration = 0.28;
      attackAnimTimer = 0.28;
      const bowOrigin = playerPos
        .add(new BABYLON.Vector3(0, 1.62, 0))
        .add(flatDir.scale(0.95));
      spawnLaunchedArrow(bowOrigin, aimYaw, aimPitch, 1.0);
    } else if (tool === 'SNOWBALL') {
      soundEngine.playSnowballThrow();
      attackAnimDuration = 0.36;
      attackAnimTimer = 0.36;

      const snowRoot = new BABYLON.TransformNode('snowballProjectile', scene);
      snowRoot.position.copyFrom(spawnOrigin);

      const ball = BABYLON.MeshBuilder.CreateSphere(
        'flyingSnowball',
        { diameter: 0.34, segments: 10 },
        scene
      );
      ball.parent = snowRoot;
      ball.material = snowMat;

      const trailRing = BABYLON.MeshBuilder.CreateTorus(
        'snowTrailRing',
        { diameter: 0.42, thickness: 0.025, tessellation: 12 },
        scene
      );
      trailRing.parent = snowRoot;
      trailRing.material = cyanGlowMat;

      const launchVel = aimDir.scale(24);
      launchVel.y += 4.2;

      activeProjectiles.push({
        kind: 'SNOWBALL',
        root: snowRoot,
        velocity: launchVel,
        gravity: 15.5,
        age: 0,
        maxLifetime: 3.5,
        stuck: false,
        stuckTime: 0,
        baseRotationX: 0,
      });
    } else if (tool === 'NONE') {
      soundEngine.playMove();
      attackAnimDuration = 0.25;
      attackAnimTimer = 0.25;
    }
  };

  /**
   * Mengambil vektor dorongan maju (Forward Lunge) saat tombak sedang menusuk
   */
  const consumeSpearLungeDisplacement = (dt: number): BABYLON.Vector3 => {
    if (
      activeAttackType === 'SPEAR' &&
      attackAnimTimer > 0 &&
      activeSpearLungeVel.lengthSquared() > 0.1
    ) {
      const progress = 1 - attackAnimTimer / attackAnimDuration;
      const lungeEnvelope =
        progress < 0.15
          ? progress / 0.15
          : Math.max(0, 1 - (progress - 0.15) / 0.78);
      return activeSpearLungeVel.scale(lungeEnvelope * dt);
    }
    return BABYLON.Vector3.Zero();
  };

  /**
   * Update Per-Frame untuk Sendi Lengan, Siku, Torso, Tahan Busur/Tombak, dan Fisika Panah Menancap
   */
  const updateWeaponsAndProjectiles = (
    dt: number,
    elapsed: number,
    playerPos: BABYLON.Vector3,
    aimYaw: number,
    aimPitch: number,
    getTerrainElevation: (x: number, z: number) => number,
    obstacles: WorldObstacleRef[],
    mobs: SpawnedMob[],
    onHitMobCallback?: (mobName: string, weaponName: string) => void
  ) => {
    // 1. Animasi Orbit Aksesori Karakter, Kuncir Rambut & Syal Berkibar
    mageOrbsPivot.rotation.y = elapsed * 2.2;
    runeRing.rotation.z = elapsed * 1.4;
    innerStar.rotation.y = -elapsed * 2.4;
    innerStar.rotation.x = elapsed * 1.6;
    ponytailTailPivot.rotation.x = Math.sin(elapsed * 4.5) * 0.12;
    ponytailTailPivot.rotation.z = Math.cos(elapsed * 3.2) * 0.08;
    scarfTails.forEach((tail, idx) => {
      tail.rotation.x = 0.24 + Math.sin(elapsed * 5.0 + idx) * 0.12;
    });

    wingBlades.forEach((w, idx) => {
      const side = idx < 2 ? -1 : 1;
      const tier = idx % 2;
      w.rotation.z =
        side * (tier === 0 ? -0.68 : -1.05) +
        Math.sin(elapsed * 3.2 + tier) * 0.09 * side;
    });

    const equipped = currentCustomization.equippedTool;

    // 2A. JIKA SEDANG MENAHAN (HOLD) UNTUK MEMANAH ATAU MENUSUK TOMBAK
    if (isHoldingWeapon && (equipped === 'BOW' || equipped === 'SPEAR')) {
      holdChargeSeconds += dt;
      const chargeRatio = Math.min(1, holdChargeSeconds / maxHoldChargeTime);

      if (equipped === 'BOW') {
        // Postur Pemanah 3rd-Person (Torso menyamping sedikit, kepala tetap lurus ke depan)
        torsoPivot.rotation.y = 0.32 * chargeRatio;
        torsoPivot.rotation.x = aimPitch * 0.35;
        headGroup.rotation.y = -0.32 * chargeRatio;

        // Lengan kiri mengangkat busur lurus ke depan (+Z) dengan sendi siku sedikit ditekuk
        leftArmPivot.rotation.set(-1.25 + aimPitch * 0.65, -0.22 * chargeRatio, 0);
        leftElbowPivot.rotation.set(-0.32, 0, 0);

        // Kunci posisi busur ke telapak tangan kiri & arahkan lurus ke DEPAN (+Z) mengikuti bidikan!
        syncThirdPersonBowToLeftHand(aimPitch * 0.65, 0, 0.12);

        // Lengan kanan + sendi siku kanan menekuk tajam menarik tali busur ke arah pipi kanan!
        rightArmPivot.rotation.set(
          -1.42 + aimPitch * 0.65,
          -0.25 - chargeRatio * 0.55,
          0.22
        );
        rightElbowPivot.rotation.set(-0.45 - chargeRatio * 1.38, 0.45, 0);

        tpLeftBow.updateBowDraw(chargeRatio, true);
        fpWeapons.updateBowDraw(chargeRatio, true);

        // Viewmodel 1st-Person saat menahan tarikan busur
        const tremor =
          chargeRatio >= 1 ? Math.sin(elapsed * 38) * 0.004 : 0;
        fpMount.position.set(
          0.2 + tremor,
          -0.22 + tremor,
          0.84 - chargeRatio * 0.14
        );
        fpMount.rotation.set(0.04, -0.05, 0.02);
      } else if (equipped === 'SPEAR') {
        // Postur Menahan Tombak (Ancang-ancang menusuk: torso memutar ke kanan, siku kanan menekuk ke belakang)
        torsoPivot.rotation.y = -0.45 * chargeRatio;
        torsoPivot.rotation.x = 0.08 * chargeRatio;
        headGroup.rotation.y = 0.45 * chargeRatio;

        // Lengan kiri menjaga keseimbangan di depan
        leftArmPivot.rotation.set(-0.65, 0.35, -0.25);
        leftElbowPivot.rotation.set(-0.85, 0, 0);

        // Lengan kanan menarik tombak ke belakang namun ujung tombak tetap mendatar membidik ke DEPAN (+Z)!
        rightArmPivot.rotation.set(-0.65 + aimPitch * 0.5, -0.25, 0.15);
        rightElbowPivot.rotation.set(-0.92 - chargeRatio * 0.35, 0, 0);

        // Kompensasi rotasi agar ujung tombak menunjuk lurus ke depan (+Z)
        const totalArmX = -0.65 + (-0.92 - chargeRatio * 0.35);
        rightHandMount.position.set(0, -0.38, 0.08);
        rightHandMount.rotation.set(Math.PI / 2 - totalArmX, 0.18, 0);

        const tremor =
          chargeRatio >= 1 ? Math.sin(elapsed * 42) * 0.005 : 0;
        fpMount.position.set(
          0.34 + tremor,
          -0.3 + tremor,
          0.68 - chargeRatio * 0.24
        );
        fpMount.rotation.set(Math.PI / 2.15, -0.05, 0);
      }
    }
    // 2B. JIKA SEDANG MENJALANKAN ANIMASI AYUNAN / TUSUKAN / LEPAS PANAH
    else if (attackAnimTimer > 0) {
      attackAnimTimer = Math.max(0, attackAnimTimer - dt);
      const progress = 1 - attackAnimTimer / attackAnimDuration; // 0.0 -> 1.0
      const swingSin = Math.sin(progress * Math.PI);

      if (activeAttackType === 'SWORD') {
        if (activeSwordSlashDir === 'TOP_TO_BOTTOM') {
          // TEBASAN DARI ATAS KE BAWAH (Torso membungkuk tajam + Siku kanan mengayun vertikal)
          torsoPivot.rotation.x = BABYLON.Scalar.Lerp(-0.22, 0.28, progress);
          torsoPivot.rotation.y = BABYLON.Scalar.Lerp(-0.25, 0.25, progress);
          headGroup.rotation.y = -torsoPivot.rotation.y * 0.6;

          rightArmPivot.rotation.set(
            BABYLON.Scalar.Lerp(-2.25, -0.15, progress),
            0,
            -0.1
          );
          rightElbowPivot.rotation.set(
            BABYLON.Scalar.Lerp(-0.85, -0.1, progress),
            0,
            0
          );
          rightHandMount.rotation.set(Math.PI / 1.75, 0, 0);

          fpMount.position.set(
            0.18,
            0.26 - progress * 0.8,
            0.88 + swingSin * 0.25
          );
          fpMount.rotation.set(-0.65 + progress * 1.85, -0.08, 0.05);
        } else if (activeSwordSlashDir === 'RIGHT_TO_LEFT') {
          // TEBASAN DARI SAMPING KANAN KE KIRI (Torso memutar dari kanan ke kiri)
          torsoPivot.rotation.y = BABYLON.Scalar.Lerp(-0.48, 0.48, progress);
          torsoPivot.rotation.x = 0.1;
          headGroup.rotation.y = -torsoPivot.rotation.y * 0.7;

          rightArmPivot.rotation.set(
            -1.35,
            BABYLON.Scalar.Lerp(-1.1, 0.95, progress),
            -1.1
          );
          rightElbowPivot.rotation.set(-0.45 * (1 - swingSin), 0, 0);
          rightHandMount.rotation.set(Math.PI / 2, 0, Math.PI / 2);

          fpMount.position.set(
            0.62 - progress * 1.15,
            -0.26,
            0.85 + swingSin * 0.22
          );
          fpMount.rotation.set(0.35, 0.65 - progress * 1.45, -1.25);
        } else {
          // TEBASAN BALIK DARI KIRI KE KANAN
          torsoPivot.rotation.y = BABYLON.Scalar.Lerp(0.48, -0.48, progress);
          torsoPivot.rotation.x = 0.08;
          headGroup.rotation.y = -torsoPivot.rotation.y * 0.7;

          rightArmPivot.rotation.set(
            -1.32,
            BABYLON.Scalar.Lerp(0.95, -1.1, progress),
            1.05
          );
          rightElbowPivot.rotation.set(-0.45 * (1 - swingSin), 0, 0);
          rightHandMount.rotation.set(Math.PI / 2, 0, -Math.PI / 2);

          fpMount.position.set(
            -0.52 + progress * 1.15,
            -0.24,
            0.85 + swingSin * 0.22
          );
          fpMount.rotation.set(0.35, -0.65 + progress * 1.45, 1.25);
        }
      } else if (activeAttackType === 'SPEAR') {
        // ANIMASI TOMBAK MENUSUK LURUS KE DEPAN (Siku kanan melurus penuh & torso condong menerjang)
        const thrustSin = Math.sin(progress * Math.PI);
        torsoPivot.rotation.y = BABYLON.Scalar.Lerp(-0.35, 0.32, progress);
        torsoPivot.rotation.x = 0.24 * thrustSin;
        headGroup.rotation.y = -torsoPivot.rotation.y;

        leftArmPivot.rotation.set(-0.45, 0.25, -0.35);
        leftElbowPivot.rotation.set(-0.75, 0, 0);

        // Bahu & siku kanan meluruskan tombak tepat ke depan (+Z)
        rightArmPivot.rotation.set(-Math.PI / 2 + 0.15, 0, 0);
        rightElbowPivot.rotation.set(-0.15 * (1 - thrustSin), 0, 0);

        rightHandMount.position.set(0, -0.38 - thrustSin * 0.58, 0.08);
        rightHandMount.rotation.set(Math.PI, 0, 0);

        fpMount.position.set(0.34, -0.32, 0.75 + thrustSin * 0.92);
        fpMount.rotation.set(Math.PI / 2.15, -0.05, 0);
      } else if (activeAttackType === 'BOW') {
        // Animasi Recoil Pelepasan Tali Busur (Tali memantul kembali, anak panah baru muncul kembali di akhir)
        const recoil = 1 - progress;
        const stringSnap = Math.max(0, recoil * 0.22 * Math.cos(progress * 20));

        torsoPivot.rotation.y = 0.32 * recoil;
        headGroup.rotation.y = -0.32 * recoil;

        leftArmPivot.rotation.set(
          -1.25 + aimPitch * 0.65 - recoil * 0.1,
          -0.22 * recoil,
          0
        );
        leftElbowPivot.rotation.set(-0.32, 0, 0);
        syncThirdPersonBowToLeftHand(aimPitch * 0.65 - recoil * 0.08, 0, 0.12);

        rightArmPivot.rotation.set(-1.42 + aimPitch * 0.65, -0.75 * recoil, 0.2);
        rightElbowPivot.rotation.set(-1.65 * recoil, 0.35 * recoil, 0);

        tpLeftBow.updateBowDraw(stringSnap, progress > 0.75);
        fpWeapons.updateBowDraw(stringSnap, progress > 0.75);

        fpMount.position.set(0.22, -0.22 + recoil * 0.05, 0.82);
        fpMount.rotation.set(0.05, -0.06, 0.02);
      } else if (activeAttackType === 'SNOWBALL') {
        torsoPivot.rotation.y = BABYLON.Scalar.Lerp(-0.3, 0.3, progress);
        rightArmPivot.rotation.set(-1.65 * swingSin, 0, 0);
        rightElbowPivot.rotation.set(-0.85 * (1 - progress), 0, 0);
        fpMount.position.set(
          0.42,
          -0.34 + swingSin * 0.28,
          0.85 + swingSin * 0.35
        );
      } else if (activeAttackType === 'NONE') {
        torsoPivot.rotation.y = BABYLON.Scalar.Lerp(-0.22, 0.22, progress);
        rightArmPivot.rotation.set(-1.35 * swingSin, 0, 0);
        rightElbowPivot.rotation.set(-0.65 * (1 - swingSin), 0, 0);
      }
    }
    // 2C. POSISI SIAGA / BERJALAN NORMAL (BUSUR 3RD-PERSON TETAP MENGHADAP KE DEPAN!)
    else {
      torsoPivot.rotation.x *= 0.82;
      torsoPivot.rotation.y *= 0.82;
      headGroup.rotation.y *= 0.82;

      rightArmPivot.rotation.z = 0;
      rightHandMount.position.set(0, -0.38, 0.08);
      rightHandMount.rotation.set(Math.PI / 2.15, 0, 0);

      // Saat memegang Busur di 3rd-Person (Idle / Jalan / Lompat), siku kiri menekuk ke depan
      // membawa busur di depan badan, dan busur beserta anak panah selalu menghadap lurus ke DEPAN (+Z)!
      if (equipped === 'BOW') {
        leftArmPivot.rotation.x = leftArmPivot.rotation.x * 0.45 - 0.52;
        leftArmPivot.rotation.y = 0.12;
        leftElbowPivot.rotation.x = -0.68;
      }
      syncThirdPersonBowToLeftHand(0.12, 0.06, 0.24);

      tpLeftBow.updateBowDraw(0, true);
      fpWeapons.updateBowDraw(0, true);

      if (equipped === 'BOW') {
        fpMount.position.set(
          0.26,
          -0.26 + Math.sin(elapsed * 2.5) * 0.012,
          0.86
        );
        fpMount.rotation.set(0.06, -0.08, 0.04);
      } else {
        fpMount.position.set(
          0.42,
          -0.34 + Math.sin(elapsed * 2.5) * 0.015,
          0.86
        );
        fpMount.rotation.set(0.25, -0.18, 0.06);
      }
    }

    // 3. Simulasi Fisika Proyektil & Panah Menancap
    const theme =
      ARMOR_COLOR_THEMES.find((t) => t.id === currentCustomization.colorTheme) ||
      ARMOR_COLOR_THEMES[0];

    for (let i = activeProjectiles.length - 1; i >= 0; i--) {
      const proj = activeProjectiles[i];
      proj.age += dt;

      if (proj.age >= proj.maxLifetime) {
        proj.root.dispose();
        activeProjectiles.splice(i, 1);
        continue;
      }

      if (proj.stuck) {
        proj.stuckTime += dt;
        if (proj.stuckTime < 0.45) {
          const damp = 1 - proj.stuckTime / 0.45;
          proj.root.rotation.x =
            proj.baseRotationX + Math.sin(proj.stuckTime * 68) * 0.065 * damp;
        }
        continue;
      }

      proj.velocity.y -= proj.gravity * dt;
      const stepDelta = proj.velocity.scale(dt);
      proj.root.position.addInPlace(stepDelta);

      if (proj.kind === 'ARROW' && proj.velocity.lengthSquared() > 0.01) {
        const targetPoint = proj.root.position.add(proj.velocity);
        proj.root.lookAt(targetPoint);
      } else if (proj.kind === 'SNOWBALL') {
        proj.root.rotation.x += dt * 10;
        proj.root.rotation.y += dt * 8;
      }

      // A. Cek tabrakan dengan Mob AI
      let hitMob = false;
      if (proj.kind === 'ARROW' || proj.kind === 'SNOWBALL') {
        for (const mob of mobs) {
          const mobCenter = mob.rootNode.position.add(
            new BABYLON.Vector3(0, 1.05, 0)
          );
          const dist = BABYLON.Vector3.Distance(proj.root.position, mobCenter);
          if (dist < 1.6) {
            hitMob = true;
            const push = proj.velocity.normalize().scale(1.55);
            mob.vehicle.position.x += push.x;
            mob.vehicle.position.z += push.z;

            if (proj.kind === 'SNOWBALL') {
              spawnImpactBurst(proj.root.position, '#BAE6FD', 22, 0.13);
              onHitMobCallback?.(mob.name, 'Bola Salju Cryo');
              soundEngine.playProjectileHit();
              proj.root.dispose();
              activeProjectiles.splice(i, 1);
            } else {
              spawnImpactBurst(proj.root.position, theme.glowHex, 16, 0.11);
              onHitMobCallback?.(mob.name, 'Panah Menancap');
              soundEngine.playProjectileHit();

              proj.stuck = true;
              proj.stuckTime = 0;
              proj.baseRotationX = proj.root.rotation.x;
              proj.root.setParent(mob.rootNode);
            }
            break;
          }
        }
      }
      if (hitMob) continue;

      // B. Cek tumbukan dengan Pohon, Menara Obelisk, dan Monolit
      if (proj.kind === 'ARROW' || proj.kind === 'SNOWBALL') {
        let hitObstacle = false;
        for (const obs of obstacles) {
          const dHoriz = Math.hypot(
            proj.root.position.x - obs.x,
            proj.root.position.z - obs.z
          );
          const obsBaseY = getTerrainElevation(obs.x, obs.z);
          if (
            dHoriz <= obs.radius + 0.25 &&
            proj.root.position.y >= obsBaseY &&
            proj.root.position.y <= obsBaseY + 9.5
          ) {
            hitObstacle = true;
            if (proj.kind === 'SNOWBALL') {
              spawnImpactBurst(proj.root.position, '#E0F2FE', 20, 0.12);
              soundEngine.playProjectileHit();
              proj.root.dispose();
              activeProjectiles.splice(i, 1);
            } else {
              proj.stuck = true;
              proj.stuckTime = 0;
              proj.baseRotationX = proj.root.rotation.x;
              spawnImpactBurst(proj.root.position, theme.glowHex, 10, 0.08);
              soundEngine.playProjectileHit();
            }
            break;
          }
        }
        if (hitObstacle) continue;
      }

      // C. Cek tumbukan dengan Permukaan Tanah
      if (proj.kind === 'ARROW' || proj.kind === 'SNOWBALL') {
        const groundY = getTerrainElevation(
          proj.root.position.x,
          proj.root.position.z
        );
        if (proj.root.position.y <= groundY + 0.12) {
          proj.root.position.y = groundY + 0.12;
          if (proj.kind === 'SNOWBALL') {
            spawnImpactBurst(proj.root.position, '#E0F2FE', 22, 0.12);
            soundEngine.playProjectileHit();
            proj.root.dispose();
            activeProjectiles.splice(i, 1);
          } else {
            proj.stuck = true;
            proj.stuckTime = 0;
            proj.baseRotationX = proj.root.rotation.x;
            spawnImpactBurst(proj.root.position, theme.glowHex, 10, 0.08);
            soundEngine.playProjectileHit();
          }
        }
      }
    }

    // 4. Update Partikel Pecahan Impact
    for (let i = activeBursts.length - 1; i >= 0; i--) {
      const burst = activeBursts[i];
      burst.age += dt;
      if (burst.age >= burst.maxAge) {
        burst.meshes.forEach((m) => m.mesh.dispose());
        activeBursts.splice(i, 1);
        continue;
      }
      const scaleFactor = 1 - burst.age / burst.maxAge;
      burst.meshes.forEach((item) => {
        item.vel.y -= 14 * dt;
        item.mesh.position.addInPlace(item.vel.scale(dt));
        item.mesh.scaling.setAll(scaleFactor);
      });
    }
  };

  return {
    applyCustomization,
    startWeaponHold,
    releaseWeaponHold,
    triggerWeaponAction,
    consumeSpearLungeDisplacement,
    updateWeaponsAndProjectiles,
    isAttacking: () => attackAnimTimer > 0 || isHoldingWeapon,
    getHoldState: () => ({
      isHolding: isHoldingWeapon,
      chargeRatio: Math.min(1, holdChargeSeconds / maxHoldChargeTime),
      tool: currentCustomization.equippedTool,
    }),
  };
}
