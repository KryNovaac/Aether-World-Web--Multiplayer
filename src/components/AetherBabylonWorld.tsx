/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as BABYLON from '@babylonjs/core';
import { createNoise2D } from 'simplex-noise';
import { soundEngine } from '../audio/soundEngine';
import {
  createDetailedPaladinCharacter,
  createWorldMobsWithYuka,
} from '../game/aetherWorldEntities';
import {
  createSkyCloudAndMistSystem,
  WeatherMode,
  SeasonMode,
  DesktopControlSettings,
  MobileControlSettings,
  DEFAULT_DESKTOP_SETTINGS,
  DEFAULT_MOBILE_SETTINGS,
  IN_GAME_HOURS_PER_REAL_SECOND,
  getDayPhaseFromHour,
  formatLiveGameClock,
  getSeasonMetadata,
} from '../game/aetherSkyAndClouds';
import {
  MobileTouchControls,
  DeviceControlMode,
  inspectUserDevice,
} from './MobileTouchControls';
import {
  AetherSettingsModal,
} from './AetherGameModals';
import {
  createCustomizableEquipmentSystem,
  CharacterCustomization,
  DEFAULT_CHARACTER_CUSTOMIZATION,
  WEAPON_TOOLS_LIST,
  CHARACTER_MODELS_LIST,
  WeaponToolId,
} from '../game/aetherCharacterAndWeapons';
import {
  PlayerAuthIdentity,
  OnlinePlayerSummary,
  WorldSessionConfig,
  ChatMessageItem,
  loadSavedPlayerIdentity,
  createPlayerNametagBillboard,
  AetherMultiplayerManager,
} from '../game/aetherMultiplayerSystem';
import {
  Eye,
  Settings,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  Map as MapIcon,
  Swords,
  MessageSquare,
  Send,
  X,
  Hand,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export type CameraPerspective = 'FIRST_PERSON' | 'SECOND_PERSON' | 'THIRD_PERSON';
export type AtmospherePreset = 'NIGHT_SANCTUARY' | 'GOLDEN_SOLARIS' | 'NEBULA_TWILIGHT';

interface AetherBabylonWorldProps {
  initialControlMode?: DeviceControlMode;
  initialTimeOfDay?: number;
  initialWeather?: WeatherMode;
  initialSeason?: SeasonMode;
  initialCameraMode?: CameraPerspective;
  characterCustomization?: CharacterCustomization;
  onChangeCharacterCustomization?: (c: CharacterCustomization) => void;
  playerIdentity?: PlayerAuthIdentity;
  onChangePlayerIdentity?: (id: PlayerAuthIdentity) => void;
  sessionConfig?: WorldSessionConfig;
  desktopSettings?: DesktopControlSettings;
  onChangeDesktopSettings?: (s: DesktopControlSettings) => void;
  mobileSettings?: MobileControlSettings;
  onChangeMobileSettings?: (s: MobileControlSettings) => void;
  onReturnToLobby?: () => void;
  speedMultiplier?: number;
  onChangeSpeedMultiplier?: (val: number) => void;
  gravityScale?: number;
  onChangeGravityScale?: (val: number) => void;
  secondPersonVariant?: 'SHOULDER' | 'FRONT_LOCKED';
  onChangeSecondPersonVariant?: (val: 'SHOULDER' | 'FRONT_LOCKED') => void;
  atmospherePreset?: AtmospherePreset;
  onChangeAtmospherePreset?: (val: AtmospherePreset) => void;
  bloomIntensity?: number;
  onChangeBloomIntensity?: (val: number) => void;
  isGameExpanded?: boolean;
  onToggleGameExpand?: () => void;
}

interface CircleObstacle {
  x: number;
  z: number;
  radius: number;
  label: string;
  kind: 'TOWER' | 'TREE' | 'MONOLITH';
}

const seedHash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};
const noise2D = createNoise2D(() => 0.42);

export const getAetherTerrainHeight = (x: number, z: number): number => {
  const distFromCenter = Math.hypot(x, z);
  const plazaBlend = Math.min(1, Math.max(0, (distFromCenter - 15) / 14));
  const n1 = noise2D(x * 0.018, z * 0.018) * 3.8;
  const n2 = noise2D(x * 0.048, z * 0.048) * 1.35;
  const n3 = noise2D(x * 0.11, z * 0.11) * 0.35;
  const ridge = Math.cos(distFromCenter * 0.055) * 1.1;
  const riverDepression =
    Math.exp(-Math.pow((x - z * 0.65) / 14, 2)) * -1.45 * plazaBlend;

  return (n1 + n2 + n3 + ridge + riverDepression) * plazaBlend;
};

export const AetherBabylonWorld: React.FC<AetherBabylonWorldProps> = ({
  initialControlMode,
  initialTimeOfDay = 8.25,
  initialWeather = 'CERAH',
  initialSeason = 'SEMI',
  initialCameraMode = 'THIRD_PERSON',
  characterCustomization = DEFAULT_CHARACTER_CUSTOMIZATION,
  onChangeCharacterCustomization,
  playerIdentity,
  onChangePlayerIdentity,
  sessionConfig = {
    playMode: 'MULTIPLAYER',
    roomAction: 'CREATE_ROOM',
    roomCode: 'AE7K9M',
    roomName: 'Sanctuary Aetheria',
  },
  desktopSettings = DEFAULT_DESKTOP_SETTINGS,
  onChangeDesktopSettings,
  mobileSettings = DEFAULT_MOBILE_SETTINGS,
  onChangeMobileSettings,
  onReturnToLobby,
  speedMultiplier = 1.0,
  onChangeSpeedMultiplier,
  gravityScale = 1.0,
  onChangeGravityScale,
  secondPersonVariant = 'SHOULDER',
  onChangeSecondPersonVariant,
  atmospherePreset = 'NIGHT_SANCTUARY',
  onChangeAtmospherePreset,
  bloomIntensity = 0.85,
  onChangeBloomIntensity,
  isGameExpanded = true,
  onToggleGameExpand,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [controlMode, setControlMode] = useState<DeviceControlMode>(
    () => initialControlMode || inspectUserDevice().detectedMode
  );
  const [localCustomization, setLocalCustomization] =
    useState<CharacterCustomization>(characterCustomization);
  const [localIdentity, setLocalIdentity] = useState<PlayerAuthIdentity>(() =>
    playerIdentity || loadSavedPlayerIdentity()
  );
  const activeIdentity = playerIdentity || localIdentity;
  const handleUpdateIdentity = useCallback(
    (id: PlayerAuthIdentity) => {
      setLocalIdentity(id);
      onChangePlayerIdentity?.(id);
    },
    [onChangePlayerIdentity]
  );
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayerSummary[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [chatDraft, setChatDraft] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);
  const sessionConfigRef = useRef<WorldSessionConfig>(sessionConfig);
  const [localDesktopSettings, setLocalDesktopSettings] =
    useState<DesktopControlSettings>(desktopSettings);
  const [localMobileSettings, setLocalMobileSettings] =
    useState<MobileControlSettings>(mobileSettings);

  const activeCustomization = onChangeCharacterCustomization
    ? characterCustomization
    : localCustomization;
  const activeDesktopSettings = onChangeDesktopSettings
    ? desktopSettings
    : localDesktopSettings;
  const activeMobileSettings = onChangeMobileSettings
    ? mobileSettings
    : localMobileSettings;

  const handleUpdateCustomization = useCallback(
    (c: CharacterCustomization) => {
      setLocalCustomization(c);
      onChangeCharacterCustomization?.(c);
    },
    [onChangeCharacterCustomization]
  );
  const handleUpdateDesktopSettings = (s: DesktopControlSettings) => {
    setLocalDesktopSettings(s);
    onChangeDesktopSettings?.(s);
  };
  const handleUpdateMobileSettings = (s: MobileControlSettings) => {
    setLocalMobileSettings(s);
    onChangeMobileSettings?.(s);
  };

  // State UI & HUD
  const [cameraMode, setCameraMode] = useState<CameraPerspective>(initialCameraMode);
  const [isExploring] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<
    'CHARACTER' | 'DESKTOP' | 'MOBILE' | 'WORLD' | undefined
  >(undefined);
  const [isCrosshairLocked, setIsCrosshairLocked] = useState<boolean>(false);
  const [isMinimapCollapsed, setIsMinimapCollapsed] = useState<boolean>(false);
  const [crystalsCollected, setCrystalsCollected] = useState<number>(0);
  const [totalCrystals] = useState<number>(15);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [zoneName, setZoneName] = useState<string>('Sanctuary Core Plaza');
  const [nearestMobInfo, setNearestMobInfo] = useState<string>('12 Mob AI Aktif');

  // FPS & Frame Time (Kiri Bawah Kecil)
  const [fpsStats, setFpsStats] = useState<{ fps: number; ms: number }>({
    fps: 60,
    ms: 16.6,
  });
  const [holdHudState, setHoldHudState] = useState<{
    isHolding: boolean;
    chargePercent: number;
    tool: WeaponToolId;
  }>({
    isHolding: false,
    chargePercent: 0,
    tool: 'SWORD',
  });

  // State Jam Dunia Nyata (1 Hari = 20 Menit -> 24 jam = 1200 detik) & 4 Musim
  const [timeOfDay, setTimeOfDay] = useState<number>(initialTimeOfDay);
  const [autoDayCycle, setAutoDayCycle] = useState<boolean>(true);
  const [weatherMode, setWeatherMode] = useState<WeatherMode>(initialWeather);
  const [seasonMode, setSeasonMode] = useState<SeasonMode>(initialSeason);
  const [mobileSprint, setMobileSprint] = useState<boolean>(false);

  // Refs sinkronisasi loop Babylon.js
  const cameraModeRef = useRef<CameraPerspective>(cameraMode);
  const isExploringRef = useRef<boolean>(isExploring);
  const isSettingsOpenRef = useRef<boolean>(isSettingsOpen);
  const isCrosshairLockedRef = useRef<boolean>(isCrosshairLocked);
  const isMinimapCollapsedRef = useRef<boolean>(isMinimapCollapsed);
  const speedMultRef = useRef<number>(speedMultiplier);
  const gravityRef = useRef<number>(gravityScale);
  const secondPersonVarRef = useRef<'SHOULDER' | 'FRONT_LOCKED'>(secondPersonVariant);
  const atmosphereRef = useRef<AtmospherePreset>(atmospherePreset);
  const bloomRef = useRef<number>(bloomIntensity);
  const timeOfDayRef = useRef<number>(timeOfDay);
  const autoDayCycleRef = useRef<boolean>(autoDayCycle);
  const weatherModeRef = useRef<WeatherMode>(weatherMode);
  const seasonModeRef = useRef<SeasonMode>(seasonMode);
  const controlModeRef = useRef<DeviceControlMode>(controlMode);
  const mobileSprintRef = useRef<boolean>(mobileSprint);
  const desktopSettingsRef = useRef<DesktopControlSettings>(activeDesktopSettings);
  const mobileSettingsRef = useRef<MobileControlSettings>(activeMobileSettings);
  const customizationRef = useRef<CharacterCustomization>(activeCustomization);
  const playerIdentityRef = useRef<PlayerAuthIdentity>(activeIdentity);
  const multiplayerManagerRef = useRef<AetherMultiplayerManager | null>(null);
  const weaponActionRequestedRef = useRef<boolean>(false);
  const weaponHoldStartRequestedRef = useRef<boolean>(false);
  const weaponHoldReleaseRequestedRef = useRef<boolean>(false);
  const mobileFullTiltSprintRef = useRef<boolean>(false);

  // Refs untuk kontrol sentuh ponsel (Analog & Jump)
  const mobileMoveVecRef = useRef<{ vx: number; vz: number }>({ vx: 0, vz: 0 });
  const mobileJumpRequestedRef = useRef<boolean>(false);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);
  useEffect(() => {
    isExploringRef.current = isExploring;
  }, [isExploring]);
  useEffect(() => {
    isSettingsOpenRef.current = isSettingsOpen;
  }, [isSettingsOpen]);
  useEffect(() => {
    isCrosshairLockedRef.current = isCrosshairLocked;
  }, [isCrosshairLocked]);
  useEffect(() => {
    isMinimapCollapsedRef.current = isMinimapCollapsed;
  }, [isMinimapCollapsed]);
  useEffect(() => {
    speedMultRef.current = speedMultiplier;
  }, [speedMultiplier]);
  useEffect(() => {
    gravityRef.current = gravityScale;
  }, [gravityScale]);
  useEffect(() => {
    secondPersonVarRef.current = secondPersonVariant;
  }, [secondPersonVariant]);
  useEffect(() => {
    atmosphereRef.current = atmospherePreset;
  }, [atmospherePreset]);
  useEffect(() => {
    bloomRef.current = bloomIntensity;
  }, [bloomIntensity]);
  useEffect(() => {
    autoDayCycleRef.current = autoDayCycle;
  }, [autoDayCycle]);
  useEffect(() => {
    weatherModeRef.current = weatherMode;
  }, [weatherMode]);
  useEffect(() => {
    seasonModeRef.current = seasonMode;
  }, [seasonMode]);
  useEffect(() => {
    controlModeRef.current = controlMode;
  }, [controlMode]);
  useEffect(() => {
    mobileSprintRef.current = mobileSprint;
  }, [mobileSprint]);
  useEffect(() => {
    desktopSettingsRef.current = activeDesktopSettings;
  }, [activeDesktopSettings]);
  useEffect(() => {
    mobileSettingsRef.current = activeMobileSettings;
  }, [activeMobileSettings]);
  useEffect(() => {
    customizationRef.current = activeCustomization;
    multiplayerManagerRef.current?.updateIdentityAndCustomization(
      playerIdentityRef.current,
      activeCustomization
    );
  }, [activeCustomization]);
  useEffect(() => {
    playerIdentityRef.current = activeIdentity;
    multiplayerManagerRef.current?.updateIdentityAndCustomization(
      activeIdentity,
      customizationRef.current
    );
  }, [activeIdentity]);
  useEffect(() => {
    sessionConfigRef.current = sessionConfig;
  }, [sessionConfig]);
  useEffect(() => {
    if (isChatOpen) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleSendChat = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const text = chatDraft.trim();
      if (!text) return;
      multiplayerManagerRef.current?.sendChatMessage(text);
      setChatDraft('');
      soundEngine.playSelect();
    },
    [chatDraft]
  );

  const selectWeaponTool = useCallback(
    (tool: WeaponToolId) => {
      const currentTool = customizationRef.current.equippedTool;
      // Jika memilih alat yang sudah aktif (Pedang/Tombak/Busur/Bola Salju), lepaskan menjadi Tangan Kosong ('NONE')
      const resolvedTool: WeaponToolId =
        tool !== 'NONE' && currentTool === tool ? 'NONE' : tool;
      const next: CharacterCustomization = {
        ...customizationRef.current,
        equippedTool: resolvedTool,
      };
      customizationRef.current = next;
      handleUpdateCustomization(next);
      soundEngine.playSelect();
    },
    [handleUpdateCustomization]
  );

  const requestWeaponAction = useCallback(() => {
    weaponActionRequestedRef.current = true;
  }, []);

  const startWeaponHoldAction = useCallback(() => {
    weaponHoldStartRequestedRef.current = true;
  }, []);

  const releaseWeaponHoldAction = useCallback(() => {
    weaponHoldReleaseRequestedRef.current = true;
  }, []);

  const playerStateRef = useRef({
    x: 0,
    y: 0,
    z: 0,
    vy: 0,
    facingYaw: 0,
    cameraYaw: 0,
    cameraPitch: 0.22,
    cameraDistance: 8.6,
    isGrounded: true,
    walkCycle: 0,
  });

  const switchPerspective = useCallback((mode: CameraPerspective) => {
    setCameraMode(mode);
    soundEngine.playSelect();
  }, []);

  const cycleCameraPerspective = useCallback(() => {
    setCameraMode((prev) =>
      prev === 'FIRST_PERSON'
        ? 'SECOND_PERSON'
        : prev === 'SECOND_PERSON'
        ? 'THIRD_PERSON'
        : 'FIRST_PERSON'
    );
    soundEngine.playSelect();
  }, []);

  const warpToLocation = useCallback((x: number, z: number, label: string) => {
    const p = playerStateRef.current;
    p.x = x;
    p.z = z;
    p.y = getAetherTerrainHeight(x, z);
    p.vy = 0;
    setZoneName(label);
    soundEngine.playSelect();
  }, []);

  const toggleSound = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const toggleCrosshairLock = useCallback(() => {
    const canvas = canvasRef.current;
    setIsCrosshairLocked((prev) => {
      const next = !prev;
      isCrosshairLockedRef.current = next;
      if (next) {
        setIsSettingsOpen(false);
        isSettingsOpenRef.current = false;
        if (canvas && canvas.requestPointerLock) {
          try {
            canvas.requestPointerLock();
          } catch {
            // Virtual lock fallback
          }
        }
      } else {
        if (document.pointerLockElement && document.exitPointerLock) {
          try {
            document.exitPointerLock();
          } catch {
            // Abaikan
          }
        }
      }
      soundEngine.playSelect();
      return next;
    });
  }, []);

  const toggleSettingsPopup = useCallback(() => {
    setIsSettingsOpen((prev) => {
      const next = !prev;
      isSettingsOpenRef.current = next;
      if (next) {
        setIsCrosshairLocked(false);
        isCrosshairLockedRef.current = false;
        if (document.pointerLockElement && document.exitPointerLock) {
          try {
            document.exitPointerLock();
          } catch {
            // Abaikan
          }
        }
      }
      soundEngine.playSelect();
      return next;
    });
  }, []);

  const jumpToTimeOfDay = (targetHour: number) => {
    timeOfDayRef.current = targetHour;
    setTimeOfDay(targetHour);
    soundEngine.playSelect();
  };

  // Callback Kontrol Sentuh Ponsel (Mengikuti kalibrasi arah kanan=kanan, kiri=kiri)
  const handleMobileMoveChange = useCallback(
    (vx: number, vz: number, isFullTilt: boolean) => {
      mobileMoveVecRef.current.vx = vx;
      mobileMoveVecRef.current.vz = vz;
      mobileFullTiltSprintRef.current = isFullTilt;
    },
    []
  );

  const handleMobileLookDelta = useCallback((dx: number, dy: number) => {
    const p = playerStateRef.current;
    const ms = mobileSettingsRef.current;
    const signX = ms.invertTouchX ? -1 : 1;
    const signY = ms.invertTouchY ? -1 : 1;
    // Geser jari ke kanan (dx > 0) = kamera menengok ke kanan (+cameraYaw)
    p.cameraYaw += dx * 0.0052 * ms.touchSensitivity * signX;
    p.cameraPitch = Math.max(
      -0.68,
      Math.min(1.15, p.cameraPitch + dy * 0.0042 * ms.touchSensitivity * signY)
    );
  }, []);

  const handleMobileJumpPress = useCallback(() => {
    mobileJumpRequestedRef.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    const engine = new BABYLON.Engine(
      canvas,
      true,
      {
        preserveDrawingBuffer: false,
        stencil: true,
        antialias: true,
        powerPreference: 'high-performance',
        doNotHandleContextLost: false,
      },
      true
    );
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    engine.setHardwareScalingLevel(1 / dpr);

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.03, 0.05, 0.1, 1.0);
    // Kabut Eksponensial Berlapis (FogMode Exp2)
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogColor = new BABYLON.Color3(0.08, 0.14, 0.24);
    scene.fogDensity = 0.0052;

    const camera = new BABYLON.FreeCamera(
      'aetherMainCamera',
      new BABYLON.Vector3(0, 6, -12),
      scene
    );
    camera.minZ = 0.15;
    camera.maxZ = 450;
    camera.fov = 1.04;

    const glowLayer = new BABYLON.GlowLayer('aetherGlow', scene, {
      mainTextureFixedSize: 512,
      blurKernelSize: 32,
    });
    glowLayer.intensity = bloomRef.current;

    const hemiLight = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    hemiLight.diffuse = new BABYLON.Color3(0.65, 0.78, 0.98);
    hemiLight.groundColor = new BABYLON.Color3(0.12, 0.16, 0.25);
    hemiLight.intensity = 0.78;

    const dirLight = new BABYLON.DirectionalLight(
      'sunDirLight',
      new BABYLON.Vector3(-0.5, -0.85, -0.35).normalize(),
      scene
    );
    dirLight.position = new BABYLON.Vector3(45, 75, 45);
    dirLight.diffuse = new BABYLON.Color3(1.0, 0.95, 0.85);
    dirLight.intensity = 1.65;

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 16;

    // Kubah Langit + Matahari & Bulan
    const skyDome = BABYLON.MeshBuilder.CreateSphere(
      'skyDome',
      { diameter: 420, segments: 24, sideOrientation: BABYLON.Mesh.BACKSIDE },
      scene
    );
    const skyMat = new BABYLON.StandardMaterial('skyMat', scene);
    skyMat.disableLighting = true;
    skyMat.emissiveColor = new BABYLON.Color3(0.05, 0.09, 0.18);
    skyDome.material = skyMat;

    const sunOrb = BABYLON.MeshBuilder.CreateSphere(
      'sunOrb',
      { diameter: 11, segments: 16 },
      scene
    );
    const sunOrbMat = new BABYLON.StandardMaterial('sunOrbMat', scene);
    sunOrbMat.disableLighting = true;
    sunOrbMat.emissiveColor = new BABYLON.Color3(1.0, 0.88, 0.55);
    sunOrb.material = sunOrbMat;

    const moonOrb = BABYLON.MeshBuilder.CreateSphere(
      'moonOrb',
      { diameter: 7.5, segments: 16 },
      scene
    );
    const moonOrbMat = new BABYLON.StandardMaterial('moonOrbMat', scene);
    moonOrbMat.disableLighting = true;
    moonOrbMat.emissiveColor = new BABYLON.Color3(0.55, 0.78, 1.0);
    moonOrb.material = moonOrbMat;

    // Sistem Awan 3D Poligonal & Kabut Lembah Rendah (Ground Mist)
    const skyCloudSystem = createSkyCloudAndMistSystem(scene);

    // Terrain Prosedural Simplex-Noise
    const terrainSize = 240;
    const subdivisions = 128;
    const ground = BABYLON.MeshBuilder.CreateGround(
      'aetherGround',
      { width: terrainSize, height: terrainSize, subdivisions, updatable: true },
      scene
    );

    const positions = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const colors: number[] = [];
    if (positions) {
      for (let i = 0; i < positions.length; i += 3) {
        const vx = positions[i];
        const vz = positions[i + 2];
        const vy = getAetherTerrainHeight(vx, vz);
        positions[i + 1] = vy;

        const dist = Math.hypot(vx, vz);
        if (dist < 15.5) {
          colors.push(0.14, 0.24, 0.36, 1.0);
        } else if (vy < -0.5) {
          colors.push(0.06, 0.28, 0.38, 1.0);
        } else if (vy > 2.6) {
          colors.push(0.22, 0.27, 0.36, 1.0);
        } else {
          const grassTint = (vy + 2) / 6;
          colors.push(
            0.08 + grassTint * 0.08,
            0.2 + grassTint * 0.15,
            0.26 + grassTint * 0.14,
            1.0
          );
        }
      }
      ground.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
      ground.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
      const normals: number[] = [];
      BABYLON.VertexData.ComputeNormals(
        positions,
        ground.getIndices()!,
        normals
      );
      ground.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
    }

    const groundMat = new BABYLON.PBRMetallicRoughnessMaterial('groundMat', scene);
    groundMat.baseColor = new BABYLON.Color3(0.78, 0.88, 0.98);
    groundMat.metallic = 0.08;
    groundMat.roughness = 0.82;
    ground.material = groundMat;
    ground.receiveShadows = true;

    // Grid Tekstur Plaza Utama
    const plazaDisc = BABYLON.MeshBuilder.CreateCylinder(
      'plazaDisc',
      { diameter: 30, height: 0.24, tessellation: 64 },
      scene
    );
    plazaDisc.position.y = 0.02;
    const plazaTex = new BABYLON.DynamicTexture('plazaTex', 512, scene, true);
    const pCtx = plazaTex.getContext();
    pCtx.fillStyle = '#0B1324';
    pCtx.fillRect(0, 0, 512, 512);
    pCtx.strokeStyle = '#38BDF8';
    pCtx.lineWidth = 3;
    for (let r = 40; r <= 240; r += 48) {
      pCtx.beginPath();
      pCtx.arc(256, 256, r, 0, Math.PI * 2);
      pCtx.stroke();
    }
    plazaTex.update();

    const plazaMat = new BABYLON.StandardMaterial('plazaMat', scene);
    plazaMat.diffuseTexture = plazaTex;
    plazaMat.emissiveTexture = plazaTex;
    plazaMat.emissiveColor = new BABYLON.Color3(0.22, 0.45, 0.65);
    plazaDisc.material = plazaMat;
    plazaDisc.receiveShadows = true;

    const obstacles: CircleObstacle[] = [];

    // 4 Menara Obelisk
    const towerCoords = [
      { x: 0, z: -48, color: '#38BDF8', name: 'North Spire Obelisk' },
      { x: 46, z: 26, color: '#F59E0B', name: 'Solaris East Relay' },
      { x: -46, z: 26, color: '#A855F7', name: 'Void West Relay' },
      { x: 0, z: 68, color: '#10B981', name: 'Sanctuary South Spire' },
    ];

    const gyroRings: { outer: BABYLON.Mesh; inner: BABYLON.Mesh; core: BABYLON.Mesh }[] = [];

    towerCoords.forEach((t, idx) => {
      const ty = getAetherTerrainHeight(t.x, t.z);
      const c3 = BABYLON.Color3.FromHexString(t.color);

      const body = BABYLON.MeshBuilder.CreateCylinder(
        `tower_${idx}`,
        { diameterTop: 2.2, diameterBottom: 4.8, height: 20, tessellation: 8 },
        scene
      );
      body.position.set(t.x, ty + 10, t.z);
      const bodyMat = new BABYLON.PBRMetallicRoughnessMaterial(`tMat_${idx}`, scene);
      bodyMat.baseColor = new BABYLON.Color3(0.12, 0.16, 0.24);
      bodyMat.metallic = 0.65;
      bodyMat.roughness = 0.3;
      body.material = bodyMat;
      shadowGenerator.addShadowCaster(body);

      const ringMat = new BABYLON.PBRMetallicRoughnessMaterial(`rMat_${idx}`, scene);
      ringMat.baseColor = c3;
      ringMat.emissiveColor = c3.scale(0.9);

      const outer = BABYLON.MeshBuilder.CreateTorus(
        `outer_${idx}`,
        { diameter: 7.4, thickness: 0.3, tessellation: 36 },
        scene
      );
      outer.position.set(t.x, ty + 21.5, t.z);
      outer.material = ringMat;

      const inner = BABYLON.MeshBuilder.CreateTorus(
        `inner_${idx}`,
        { diameter: 5.0, thickness: 0.24, tessellation: 32 },
        scene
      );
      inner.position.set(t.x, ty + 21.5, t.z);
      inner.material = ringMat;

      const core = BABYLON.MeshBuilder.CreatePolyhedron(
        `core_${idx}`,
        { type: 1, size: 1.3 },
        scene
      );
      core.position.set(t.x, ty + 21.5, t.z);
      core.material = ringMat;

      gyroRings.push({ outer, inner, core });
      obstacles.push({ x: t.x, z: t.z, radius: 3.0, label: t.name, kind: 'TOWER' });
    });

    // Portal Stargate di (0, 50)
    const portalZ = 50;
    const portalY = getAetherTerrainHeight(0, portalZ);
    const portalArch = BABYLON.MeshBuilder.CreateTorus(
      'portalArch',
      { diameter: 9.2, thickness: 0.7, tessellation: 48 },
      scene
    );
    portalArch.position.set(0, portalY + 4.8, portalZ);
    const portalMat = new BABYLON.PBRMetallicRoughnessMaterial('portalMat', scene);
    portalMat.baseColor = BABYLON.Color3.FromHexString('#10B981');
    portalMat.emissiveColor = BABYLON.Color3.FromHexString('#059669');
    portalArch.material = portalMat;

    const portalField = BABYLON.MeshBuilder.CreateDisc(
      'portalField',
      { radius: 4.2, tessellation: 36, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
      scene
    );
    portalField.position.set(0, portalY + 4.8, portalZ);
    const fieldMat = new BABYLON.StandardMaterial('fieldMat', scene);
    fieldMat.diffuseColor = BABYLON.Color3.FromHexString('#34D399');
    fieldMat.emissiveColor = BABYLON.Color3.FromHexString('#10B981');
    fieldMat.alpha = 0.42;
    portalField.material = fieldMat;

    // Hutan Pinus Bioluminesensi (52 Pohon)
    const trunkMat = new BABYLON.PBRMetallicRoughnessMaterial('trunkMat', scene);
    trunkMat.baseColor = new BABYLON.Color3(0.24, 0.16, 0.11);
    trunkMat.roughness = 0.9;

    const leafMat = new BABYLON.PBRMetallicRoughnessMaterial('leafMat', scene);
    leafMat.baseColor = new BABYLON.Color3(0.06, 0.36, 0.3);
    leafMat.emissiveColor = new BABYLON.Color3(0.01, 0.06, 0.05);
    leafMat.roughness = 0.65;

    for (let i = 0; i < 52; i++) {
      const angle = seedHash(i * 11.3) * Math.PI * 2;
      const dist = 20 + seedHash(i * 27.9) * 78;
      const tx = Math.cos(angle) * dist;
      const tz = Math.sin(angle) * dist;
      if (Math.hypot(tx, tz - portalZ) < 10) continue;
      if (towerCoords.some((t) => Math.hypot(tx - t.x, tz - t.z) < 8.5)) continue;

      const ty = getAetherTerrainHeight(tx, tz);
      const scale = 0.85 + seedHash(i * 43.1) * 0.8;

      const trunk = BABYLON.MeshBuilder.CreateCylinder(
        `tr_${i}`,
        { diameterTop: 0.4 * scale, diameterBottom: 0.75 * scale, height: 2.6 * scale },
        scene
      );
      trunk.position.set(tx, ty + 1.3 * scale, tz);
      trunk.material = trunkMat;

      const crown1 = BABYLON.MeshBuilder.CreateCylinder(
        `cr1_${i}`,
        { diameterTop: 0, diameterBottom: 3.4 * scale, height: 3.8 * scale, tessellation: 7 },
        scene
      );
      crown1.position.set(tx, ty + 3.6 * scale, tz);
      crown1.material = leafMat;
      shadowGenerator.addShadowCaster(crown1);

      const crown2 = BABYLON.MeshBuilder.CreateCylinder(
        `cr2_${i}`,
        { diameterTop: 0, diameterBottom: 2.5 * scale, height: 3.2 * scale, tessellation: 7 },
        scene
      );
      crown2.position.set(tx, ty + 5.3 * scale, tz);
      crown2.material = leafMat;

      obstacles.push({
        x: tx,
        z: tz,
        radius: 0.9 * scale,
        label: 'Aether Pine',
        kind: 'TREE',
      });
    }

    // 10 Monolit Kuno
    const monoMat = new BABYLON.PBRMetallicRoughnessMaterial('monoMat', scene);
    monoMat.baseColor = new BABYLON.Color3(0.15, 0.2, 0.3);
    monoMat.metallic = 0.55;
    monoMat.roughness = 0.35;

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.35;
      const d = 28 + (i % 3) * 18;
      const mx = Math.cos(a) * d;
      const mz = Math.sin(a) * d;
      const my = getAetherTerrainHeight(mx, mz);

      const mBox = BABYLON.MeshBuilder.CreateBox(
        `mono_${i}`,
        { width: 1.7, height: 5.5, depth: 1.7 },
        scene
      );
      mBox.position.set(mx, my + 2.75, mz);
      mBox.rotation.y = a;
      mBox.material = monoMat;
      shadowGenerator.addShadowCaster(mBox);

      obstacles.push({
        x: mx,
        z: mz,
        radius: 1.35,
        label: 'Ancient Monolith',
        kind: 'MONOLITH',
      });
    }

    // 15 Kristal Energi Aether
    interface CrystalNode {
      mesh: BABYLON.Mesh;
      ring: BABYLON.Mesh;
      x: number;
      z: number;
      baseY: number;
      collected: boolean;
    }
    const crystals: CrystalNode[] = [];
    const cryMat = new BABYLON.PBRMetallicRoughnessMaterial('cryMat', scene);
    cryMat.baseColor = BABYLON.Color3.FromHexString('#FBBF24');
    cryMat.emissiveColor = BABYLON.Color3.FromHexString('#D97706');
    cryMat.metallic = 0.3;
    cryMat.roughness = 0.15;

    for (let i = 0; i < 15; i++) {
      const a = (i / 15) * Math.PI * 2 + 0.2;
      const r = 13 + (i % 4) * 16;
      const cx = Math.cos(a) * r;
      const cz = Math.sin(a) * r;
      const cy = getAetherTerrainHeight(cx, cz) + 1.5;

      const mesh = BABYLON.MeshBuilder.CreatePolyhedron(
        `cry_${i}`,
        { type: 1, size: 0.58 },
        scene
      );
      mesh.position.set(cx, cy, cz);
      mesh.material = cryMat;

      const ring = BABYLON.MeshBuilder.CreateTorus(
        `cryRing_${i}`,
        { diameter: 1.45, thickness: 0.06, tessellation: 24 },
        scene
      );
      ring.position.set(cx, cy, cz);
      ring.material = cryMat;

      crystals.push({ mesh, ring, x: cx, z: cz, baseY: cy, collected: false });
    }

    // Bintang Malam (1200 Titik)
    const starPositions: number[] = [];
    const starColors: number[] = [];
    for (let i = 0; i < 1200; i++) {
      const u = seedHash(i * 5.1);
      const v = seedHash(i * 9.7);
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const rad = 185 + seedHash(i * 13.3) * 20;
      const sx = rad * Math.sin(phi) * Math.cos(theta);
      const sy = Math.abs(rad * Math.cos(phi)) + 8;
      const sz = rad * Math.sin(phi) * Math.sin(theta);
      starPositions.push(sx, sy, sz);
      starColors.push(0.85, 0.92, 1.0, 1.0);
    }
    const starMesh = new BABYLON.Mesh('starfield', scene);
    const starVData = new BABYLON.VertexData();
    starVData.positions = starPositions;
    starVData.colors = starColors;
    const starIndices: number[] = [];
    for (let i = 0; i < 1200; i++) starIndices.push(i);
    starVData.indices = starIndices;
    starVData.applyToMesh(starMesh);
    const starMat = new BABYLON.StandardMaterial('starMat', scene);
    starMat.emissiveColor = new BABYLON.Color3(0.85, 0.95, 1.0);
    starMat.disableLighting = true;
    starMat.pointsCloud = true;
    starMat.pointSize = 2.2;
    starMesh.material = starMat;

    // Sistem Partikel Cuaca (Hujan & Spora Aether)
    const particleTex = new BABYLON.DynamicTexture('weatherDotTex', 64, scene, false);
    const ptx = particleTex.getContext();
    const grad = ptx.createRadialGradient(32, 32, 2, 32, 32, 28);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(56,189,248,0)');
    ptx.fillStyle = grad;
    ptx.fillRect(0, 0, 64, 64);
    particleTex.update();

    const rainSystem = new BABYLON.ParticleSystem('rainParticles', 3500, scene);
    rainSystem.particleTexture = particleTex;
    rainSystem.emitter = new BABYLON.Vector3(0, 28, 0);
    rainSystem.minEmitBox = new BABYLON.Vector3(-45, 0, -45);
    rainSystem.maxEmitBox = new BABYLON.Vector3(45, 5, 45);
    rainSystem.color1 = new BABYLON.Color4(0.65, 0.82, 1.0, 0.75);
    rainSystem.color2 = new BABYLON.Color4(0.45, 0.68, 0.95, 0.55);
    rainSystem.colorDead = new BABYLON.Color4(0.3, 0.5, 0.8, 0.0);
    rainSystem.minSize = 0.22;
    rainSystem.maxSize = 0.45;
    rainSystem.minScaleY = 5.5;
    rainSystem.maxScaleY = 9.0;
    rainSystem.minLifeTime = 0.6;
    rainSystem.maxLifeTime = 1.1;
    rainSystem.emitRate = 0;
    rainSystem.gravity = new BABYLON.Vector3(-2, -38, -1);
    rainSystem.direction1 = new BABYLON.Vector3(-1.5, -26, -0.5);
    rainSystem.direction2 = new BABYLON.Vector3(-0.5, -32, 0.5);
    rainSystem.start();

    const mistSystem = new BABYLON.ParticleSystem('aetherMist', 900, scene);
    mistSystem.particleTexture = particleTex;
    mistSystem.emitter = new BABYLON.Vector3(0, 4, 0);
    mistSystem.minEmitBox = new BABYLON.Vector3(-55, -2, -55);
    mistSystem.maxEmitBox = new BABYLON.Vector3(55, 16, 55);
    mistSystem.color1 = new BABYLON.Color4(0.22, 0.88, 0.75, 0.65);
    mistSystem.color2 = new BABYLON.Color4(0.35, 0.72, 1.0, 0.55);
    mistSystem.colorDead = new BABYLON.Color4(0.1, 0.4, 0.8, 0);
    mistSystem.minSize = 0.25;
    mistSystem.maxSize = 0.68;
    mistSystem.minLifeTime = 3.5;
    mistSystem.maxLifeTime = 7.0;
    mistSystem.emitRate = 120;
    mistSystem.gravity = new BABYLON.Vector3(0, 0.25, 0);
    mistSystem.start();

    // Material Glow untuk Karakter Cyber-Paladin & 12 Mob Yuka AI
    const cyanGlowMat = new BABYLON.StandardMaterial('cyanGlowMat', scene);
    cyanGlowMat.diffuseColor = BABYLON.Color3.FromHexString('#38BDF8');
    cyanGlowMat.emissiveColor = BABYLON.Color3.FromHexString('#0284C7');

    const goldGlowMat = new BABYLON.StandardMaterial('goldGlowMat', scene);
    goldGlowMat.diffuseColor = BABYLON.Color3.FromHexString('#FBBF24');
    goldGlowMat.emissiveColor = BABYLON.Color3.FromHexString('#D97706');

    const violetGlowMat = new BABYLON.StandardMaterial('violetGlowMat', scene);
    violetGlowMat.diffuseColor = BABYLON.Color3.FromHexString('#A855F7');
    violetGlowMat.emissiveColor = BABYLON.Color3.FromHexString('#7E22CE');

    const characterRig = createDetailedPaladinCharacter(
      scene,
      shadowGenerator,
      cyanGlowMat,
      goldGlowMat
    );
    const equipmentSystem = createCustomizableEquipmentSystem(
      scene,
      characterRig,
      camera,
      cyanGlowMat,
      goldGlowMat
    );
    const localNametag = createPlayerNametagBillboard(
      scene,
      characterRig.characterVisual,
      playerIdentityRef.current.displayName,
      playerIdentityRef.current.uid,
      customizationRef.current.equippedTool,
      true,
      sessionConfigRef.current.playMode === 'SINGLE_PLAYER' ||
        sessionConfigRef.current.roomAction === 'CREATE_ROOM'
    );
    const mobSystem = createWorldMobsWithYuka(
      scene,
      shadowGenerator,
      getAetherTerrainHeight,
      cyanGlowMat,
      goldGlowMat,
      violetGlowMat
    );
    const multiplayerManager = new AetherMultiplayerManager(
      scene,
      shadowGenerator,
      cyanGlowMat,
      goldGlowMat,
      mobSystem.mobs,
      getAetherTerrainHeight,
      playerIdentityRef.current,
      customizationRef.current,
      sessionConfigRef.current,
      (roster) => {
        setOnlinePlayers(roster);
      },
      (msgs) => {
        setChatMessages(msgs);
      }
    );
    multiplayerManagerRef.current = multiplayerManager;

    // Input Keyboard & Mouse
    const keys: Record<string, boolean> = {};
    let isPointerDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseDownStartX = 0;
    let mouseDownStartY = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        if (e.code === 'Escape') {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      const code = e.code;
      if (code === 'Enter') {
        e.preventDefault();
        setIsChatOpen(true);
        setTimeout(() => chatInputRef.current?.focus(), 20);
        return;
      }

      keys[code] = true;

      if (code === 'Backquote' || e.key === '~' || e.key === '`') {
        e.preventDefault();
        toggleCrosshairLock();
        return;
      }
      if (code === 'KeyG' || code === 'KeyP' || code === 'Tab') {
        e.preventDefault();
        setSettingsInitialTab(undefined);
        toggleSettingsPopup();
        return;
      }
      if (code === 'KeyC') {
        e.preventDefault();
        setSettingsInitialTab('CHARACTER');
        setIsSettingsOpen(true);
        isSettingsOpenRef.current = true;
        return;
      }
      if (code === 'KeyM') {
        e.preventDefault();
        setIsMinimapCollapsed((prev) => !prev);
        return;
      }
      // Hotbar Inventoris Bawah: 1 = Pedang, 2 = Tombak, 3 = Busur, 4 = Bola Salju, 0/5 = Tangan Kosong
      if (code === 'Digit1') selectWeaponTool('SWORD');
      if (code === 'Digit2') selectWeaponTool('SPEAR');
      if (code === 'Digit3') selectWeaponTool('BOW');
      if (code === 'Digit4') selectWeaponTool('SNOWBALL');
      if (code === 'Digit0' || code === 'Digit5') selectWeaponTool('NONE');

      // Aksi Serang / Tahan (Hold) untuk Memanah & Menusuk Tombak (Tombol F)
      if (code === 'KeyF') {
        e.preventDefault();
        if (!e.repeat) {
          weaponHoldStartRequestedRef.current = true;
        }
      }

      if (code === 'KeyV') cycleCameraPerspective();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
      if (e.code === 'KeyF') {
        weaponHoldReleaseRequestedRef.current = true;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isPointerDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        mouseDownStartX = e.clientX;
        mouseDownStartY = e.clientY;

        const tool = customizationRef.current.equippedTool;
        if (
          isCrosshairLockedRef.current ||
          document.pointerLockElement === canvas ||
          tool === 'BOW' ||
          tool === 'SPEAR'
        ) {
          weaponHoldStartRequestedRef.current = true;
        }
      }
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (e.button === 0) {
        const tool = customizationRef.current.equippedTool;
        if (
          isCrosshairLockedRef.current ||
          document.pointerLockElement === canvas ||
          tool === 'BOW' ||
          tool === 'SPEAR'
        ) {
          weaponHoldReleaseRequestedRef.current = true;
        } else if (isPointerDragging) {
          const dragDist = Math.hypot(
            e.clientX - mouseDownStartX,
            e.clientY - mouseDownStartY
          );
          if (dragDist < 7) {
            weaponActionRequestedRef.current = true;
          }
        }
      }
      isPointerDragging = false;
    };

    const handlePointerMove = (e: MouseEvent) => {
      const p = playerStateRef.current;
      const ds = desktopSettingsRef.current;
      const signX = ds.invertMouseX ? -1 : 1;
      const signY = ds.invertMouseY ? -1 : 1;
      const isNativePointerLocked = document.pointerLockElement === canvas;

      if (isNativePointerLocked || isCrosshairLockedRef.current) {
        const dx = e.movementX || 0;
        const dy = e.movementY || 0;
        // Geser mouse ke kanan (dx > 0) -> menengok ke kanan (+cameraYaw)
        p.cameraYaw += dx * 0.0034 * ds.mouseSensitivity * signX;
        p.cameraPitch = Math.max(
          -0.68,
          Math.min(1.15, p.cameraPitch + dy * 0.0028 * ds.mouseSensitivity * signY)
        );
      } else if (isPointerDragging && controlModeRef.current === 'DESKTOP') {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        p.cameraYaw += dx * 0.0052 * ds.mouseSensitivity * signX;
        p.cameraPitch = Math.max(
          -0.68,
          Math.min(1.15, p.cameraPitch + dy * 0.0044 * ds.mouseSensitivity * signY)
        );
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = playerStateRef.current;
      const ds = desktopSettingsRef.current;
      p.cameraDistance = Math.max(
        3.5,
        Math.min(16.5, p.cameraDistance + e.deltaY * 0.006 * ds.zoomSensitivity)
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const smoothedCamPos = new BABYLON.Vector3(0, 6, -12);
    const smoothedLookTarget = new BABYLON.Vector3(0, 2, 0);
    let portalCooldown = 0;
    let lightningTimer = 0;
    let lightningFlashIntensity = 0;
    let lastHudClockSync = 0;
    let lastFpsSync = 0;
    let elapsed = 0;

    scene.onBeforeRenderObservable.add(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
      elapsed += dt;
      const p = playerStateRef.current;

      glowLayer.intensity = bloomRef.current;

      // 1. UPDATE JAM DUNIA NYATA (1 HARI = 20 MENIT -> 24 Jam = 1200 Detik)
      if (autoDayCycleRef.current) {
        timeOfDayRef.current =
          (timeOfDayRef.current + dt * IN_GAME_HOURS_PER_REAL_SECOND) % 24;
        if (elapsed - lastHudClockSync > 0.25) {
          lastHudClockSync = elapsed;
          setTimeOfDay(timeOfDayRef.current);
        }
      }

      // Update indikator FPS & ms (Kiri Bawah Kecil) setiap 0.35 detik
      if (elapsed - lastFpsSync > 0.35) {
        lastFpsSync = elapsed;
        const currentFps = Math.round(engine.getFps());
        const currentMs = Number(engine.getDeltaTime().toFixed(1));
        setFpsStats({ fps: currentFps, ms: currentMs });
      }

      const hour = timeOfDayRef.current;
      // Sudut matahari: 06:00 terbit (0 rad), 12:00 puncak (PI/2), 18:00 terbenam (PI)
      const sunAngle = ((hour - 6) / 24) * Math.PI * 2;
      const sunY = Math.sin(sunAngle);
      const sunX = Math.cos(sunAngle);
      const orbitRadius = 155;

      sunOrb.position.set(sunX * orbitRadius, sunY * orbitRadius, -35);
      moonOrb.position.set(-sunX * orbitRadius, -sunY * orbitRadius, 35);

      const daylightFactor = Math.max(0, Math.min(1, (sunY + 0.18) / 0.65));
      const sunsetFactor = Math.max(0, 1 - Math.abs(sunY - 0.06) * 3.8);

      if (sunY > -0.1) {
        dirLight.direction = new BABYLON.Vector3(-sunX, -Math.max(0.18, sunY), 0.22).normalize();
        dirLight.position = new BABYLON.Vector3(sunX * 65, Math.max(18, sunY * 75), -20);
      } else {
        dirLight.direction = new BABYLON.Vector3(sunX, -Math.max(0.22, -sunY), -0.22).normalize();
        dirLight.position = new BABYLON.Vector3(-sunX * 65, Math.max(18, -sunY * 75), 20);
      }

      const preset = atmosphereRef.current;
      const presetTint =
        preset === 'GOLDEN_SOLARIS'
          ? new BABYLON.Color3(0.08, 0.04, 0.0)
          : preset === 'NEBULA_TWILIGHT'
          ? new BABYLON.Color3(0.05, 0.0, 0.09)
          : new BABYLON.Color3(0, 0, 0);

      // Warna Langit & Kabut Dinamis (Pagi, Siang, Sore, Malam)
      const nightSky = new BABYLON.Color3(0.025, 0.045, 0.1).add(presetTint);
      const daySky = new BABYLON.Color3(0.24, 0.54, 0.88).add(presetTint);
      const sunsetSky = new BABYLON.Color3(0.76, 0.34, 0.24).add(presetTint);

      const currentSky = BABYLON.Color3.Lerp(nightSky, daySky, daylightFactor);
      const finalSky = BABYLON.Color3.Lerp(currentSky, sunsetSky, sunsetFactor * 0.68);

      const weather = weatherModeRef.current;
      const stormDarken = weather === 'BADAI' ? 0.42 : weather === 'HUJAN' ? 0.62 : 1.0;

      // Kepadatan Kabut Atmosferik (Lebih tebal saat pagi/sore dan hujan/badai)
      const dawnDuskMistBoost = sunsetFactor * 0.0028;
      const baseTimeFog =
        0.0042 + (1 - daylightFactor) * 0.0018 + dawnDuskMistBoost;

      if (weather === 'HUJAN') {
        rainSystem.emitRate = 2200;
        mistSystem.emitRate = 45;
        scene.fogDensity = Math.max(0.0095, baseTimeFog * 1.65);
        groundMat.roughness = 0.35;
      } else if (weather === 'BADAI') {
        rainSystem.emitRate = 3500;
        mistSystem.emitRate = 85;
        scene.fogDensity = Math.max(0.0125, baseTimeFog * 2.0);
        groundMat.roughness = 0.25;
        lightningTimer -= dt;
        if (lightningTimer <= 0) {
          lightningTimer = 3.5 + Math.random() * 6.5;
          lightningFlashIntensity = 2.8;
        }
      } else if (weather === 'AETHER_MIST') {
        rainSystem.emitRate = 0;
        mistSystem.emitRate = 380;
        scene.fogDensity = Math.max(0.0082, baseTimeFog * 1.35);
        groundMat.roughness = 0.78;
      } else {
        rainSystem.emitRate = 0;
        mistSystem.emitRate = 95;
        scene.fogDensity = baseTimeFog;
        groundMat.roughness = 0.82;
      }

      if (lightningFlashIntensity > 0) {
        lightningFlashIntensity = Math.max(0, lightningFlashIntensity - dt * 9.5);
      }

      const skyWithWeather = finalSky
        .scale(stormDarken)
        .add(new BABYLON.Color3(lightningFlashIntensity * 0.35, lightningFlashIntensity * 0.4, lightningFlashIntensity * 0.5));
      skyMat.emissiveColor = skyWithWeather;
      scene.fogColor = skyWithWeather;

      const daySunColor = new BABYLON.Color3(1.0, 0.96, 0.86);
      const sunsetSunColor = new BABYLON.Color3(1.0, 0.52, 0.25);
      const nightMoonColor = new BABYLON.Color3(0.35, 0.58, 0.95);
      const sunCol = BABYLON.Color3.Lerp(
        nightMoonColor,
        BABYLON.Color3.Lerp(daySunColor, sunsetSunColor, sunsetFactor),
        daylightFactor
      );
      dirLight.diffuse = sunCol;
      dirLight.intensity =
        (0.55 + daylightFactor * 1.45) * stormDarken + lightningFlashIntensity;
      hemiLight.intensity = (0.45 + daylightFactor * 0.55) * stormDarken;

      starMesh.visibility = Math.max(0, 1 - daylightFactor * 1.35) * stormDarken;

      // 2. UPDATE SISTEM 4 MUSIM, AWAN 3D & KABUT LEMBAH RENDAH
      const season = seasonModeRef.current;
      const sMeta = getSeasonMetadata(season);
      BABYLON.Color3.LerpToRef(
        leafMat.baseColor,
        sMeta.leafColor,
        Math.min(1, dt * 4),
        leafMat.baseColor
      );
      BABYLON.Color3.LerpToRef(
        leafMat.emissiveColor,
        sMeta.leafEmissive,
        Math.min(1, dt * 4),
        leafMat.emissiveColor
      );
      BABYLON.Color3.LerpToRef(
        groundMat.baseColor,
        sMeta.groundTint,
        Math.min(1, dt * 4),
        groundMat.baseColor
      );
      if (weather === 'CERAH') {
        groundMat.roughness = sMeta.groundRoughness;
      }

      const pPosVec = new BABYLON.Vector3(p.x, p.y, p.z);
      skyCloudSystem.update(dt, elapsed, hour, weather, season, pPosVec);

      rainSystem.emitter = new BABYLON.Vector3(p.x, p.y + 26, p.z);
      mistSystem.emitter = new BABYLON.Vector3(p.x, p.y + 3, p.z);

      // Animasi Cincin Obelisk & Kristal
      gyroRings.forEach((g, idx) => {
        g.outer.rotation.y += dt * (0.85 + idx * 0.15);
        g.outer.rotation.x = Math.sin(elapsed * 0.7 + idx) * 0.35;
        g.inner.rotation.z -= dt * 1.3;
        g.inner.rotation.y -= dt * 0.65;
        g.core.rotation.y += dt * 1.9;
      });

      portalField.rotation.z += dt * 1.2;

      crystals.forEach((c, idx) => {
        if (c.collected) return;
        c.mesh.rotation.y += dt * 1.9;
        c.mesh.position.y = c.baseY + Math.sin(elapsed * 2.5 + idx) * 0.26;
        c.ring.rotation.x = Math.sin(elapsed * 1.8 + idx) * 0.6;
        c.ring.position.y = c.mesh.position.y;
      });

      // 3. UPDATE AI MOBS (YUKA ENGINE)
      mobSystem.updateMobs(dt, elapsed);

      if (Math.floor(elapsed * 5) % 5 === 0) {
        let minDist = 999;
        let closestLabel = '';
        for (const m of mobSystem.mobs) {
          const d = Math.hypot(
            m.rootNode.position.x - p.x,
            m.rootNode.position.z - p.z
          );
          if (d < minDist) {
            minDist = d;
            closestLabel = m.name;
          }
        }
        if (minDist < 32) {
          setNearestMobInfo(`${closestLabel} (${minDist.toFixed(0)}m)`);
        } else {
          setNearestMobInfo('12 Mob AI Aktif');
        }
      }

      // Jika masih di Lobby atau Pop-Up Setting terbuka
      if (!isExploringRef.current || isSettingsOpenRef.current) {
        if (!isExploringRef.current) {
          p.cameraYaw += dt * 0.16;
        }
        const idleCamX = p.x - Math.sin(p.cameraYaw) * 10.5;
        const idleCamZ = p.z - Math.cos(p.cameraYaw) * 10.5;
        const idleCamY = p.y + 4.4;
        camera.position.set(idleCamX, idleCamY, idleCamZ);
        camera.setTarget(new BABYLON.Vector3(p.x, p.y + 1.8, p.z));
        return;
      }

      // 4. LOGIKA KONTROL KARAKTER (KEYBOARD DESKTOP + ANALOG VIRTUAL PONSEL)
      const isAutoMobileSprint =
        controlModeRef.current === 'MOBILE' &&
        mobileSettingsRef.current.autoSprintOnFullTilt &&
        mobileFullTiltSprintRef.current;
      const isShiftSprint =
        keys['ShiftLeft'] ||
        keys['ShiftRight'] ||
        mobileSprintRef.current ||
        isAutoMobileSprint;
      const moveSpeed = (isShiftSprint ? 15.2 : 9.6) * speedMultRef.current;
      const turnSpeed = 2.5;

      // Q = Putar Kamera ke Kiri (-), E = Putar Kamera ke Kanan (+)
      if (keys['KeyQ']) p.cameraYaw -= turnSpeed * dt;
      if (keys['KeyE']) p.cameraYaw += turnSpeed * dt;

      let forwardInput = 0;
      let strafeInput = 0;
      if (keys['KeyW'] || keys['ArrowUp']) forwardInput += 1;
      if (keys['KeyS'] || keys['ArrowDown']) forwardInput -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) strafeInput += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) strafeInput -= 1;

      // Tambahkan vektor dari Virtual Analog Joystick Ponsel
      if (
        Math.abs(mobileMoveVecRef.current.vx) > 0.04 ||
        Math.abs(mobileMoveVecRef.current.vz) > 0.04
      ) {
        strafeInput += mobileMoveVecRef.current.vx;
        forwardInput += mobileMoveVecRef.current.vz;
      }

      const inputMag = Math.hypot(forwardInput, strafeInput);
      const isMoving = inputMag > 0.05;

      if (isMoving) {
        const normScale = inputMag > 1 ? 1 / inputMag : 1;
        const f = forwardInput * normScale;
        const s = strafeInput * normScale;

        const moveAngle = Math.atan2(s, f) + p.cameraYaw;
        const speedFactor = Math.min(1, inputMag);
        const vx = Math.sin(moveAngle) * moveSpeed * speedFactor;
        const vz = Math.cos(moveAngle) * moveSpeed * speedFactor;

        let nextX = p.x + vx * dt;
        let nextZ = p.z + vz * dt;

        const maxRadius = 104;
        const distFromOrigin = Math.hypot(nextX, nextZ);
        if (distFromOrigin > maxRadius) {
          nextX = (nextX / distFromOrigin) * maxRadius;
          nextZ = (nextZ / distFromOrigin) * maxRadius;
        }

        const playerRadius = 0.65;
        for (const obs of obstacles) {
          const dx = nextX - obs.x;
          const dz = nextZ - obs.z;
          const dist = Math.hypot(dx, dz);
          const minDist = playerRadius + obs.radius;
          if (dist < minDist && dist > 0.0001) {
            const push = minDist - dist;
            nextX += (dx / dist) * push;
            nextZ += (dz / dist) * push;
          }
        }

        p.x = nextX;
        p.z = nextZ;

        if (cameraModeRef.current === 'FIRST_PERSON') {
          p.facingYaw = p.cameraYaw;
        } else {
          let diff = moveAngle - p.facingYaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          p.facingYaw += diff * Math.min(1, dt * 12);
        }

        p.walkCycle += dt * (isShiftSprint ? 15 : 10) * speedFactor;
      } else if (cameraModeRef.current === 'FIRST_PERSON') {
        p.facingYaw = p.cameraYaw;
      }

      // Fisika Lompatan & Gravitasi (Spasi Desktop atau Tombol Lompat Ponsel)
      const groundH = getAetherTerrainHeight(p.x, p.z);
      if ((keys['Space'] || mobileJumpRequestedRef.current) && p.isGrounded) {
        p.vy = 11.4;
        p.isGrounded = false;
        mobileJumpRequestedRef.current = false;
        soundEngine.playJump();
      } else {
        mobileJumpRequestedRef.current = false;
      }

      p.vy -= 26.0 * gravityRef.current * dt;
      p.y += p.vy * dt;

      if (p.y <= groundH) {
        p.y = groundH;
        p.vy = 0;
        p.isGrounded = true;
      }

      // Koleksi Kristal
      crystals.forEach((c) => {
        if (!c.collected) {
          const d = Math.hypot(p.x - c.x, p.z - c.z);
          if (d < 2.25) {
            c.collected = true;
            c.mesh.setEnabled(false);
            c.ring.setEnabled(false);
            soundEngine.playCollect();
            setCrystalsCollected((prev) => prev + 1);
          }
        }
      });

      // Portal Stargate
      if (portalCooldown > 0) portalCooldown -= dt;
      if (Math.hypot(p.x, p.z - portalZ) < 2.8 && portalCooldown <= 0) {
        portalCooldown = 3.0;
        p.x = 0;
        p.z = -38;
        p.y = getAetherTerrainHeight(0, -38) + 3.5;
        soundEngine.playSelect();
      }

      // Zona Landmark
      const centerDist = Math.hypot(p.x, p.z);
      if (centerDist < 16) {
        setZoneName('Sanctuary Core Plaza');
      } else if (Math.hypot(p.x, p.z - portalZ) < 14) {
        setZoneName('Emerald Stargate Portal');
      } else {
        let nearTower = '';
        for (const t of towerCoords) {
          if (Math.hypot(p.x - t.x, p.z - t.z) < 15) {
            nearTower = t.name;
            break;
          }
        }
        setZoneName(nearTower || 'Aetheria Highlands');
      }

      // 5. ANIMASI RIG SENDI KARAKTER (BAHU, SIKU, PAHA, LUTUT, TORSO) & SENJATA (HOLD / CHARGE)
      equipmentSystem.applyCustomization(
        customizationRef.current,
        cameraModeRef.current === 'FIRST_PERSON'
      );

      // Mulai Menahan (Hold) untuk Busur / Tombak, atau langsung tebas untuk Pedang / Bola Salju
      if (weaponHoldStartRequestedRef.current) {
        weaponHoldStartRequestedRef.current = false;
        p.facingYaw = p.cameraYaw;
        equipmentSystem.startWeaponHold(
          new BABYLON.Vector3(p.x, p.y, p.z),
          p.cameraYaw,
          p.cameraPitch,
          mobSystem.mobs,
          (mobName, weaponName) => {
            setNearestMobInfo(`Hit: ${mobName} (${weaponName})`);
          }
        );
      }

      // Lepaskan Tahanan (Release Hold) untuk melesatkan Panah atau Menusuk Tombak Menerjang
      if (weaponHoldReleaseRequestedRef.current) {
        weaponHoldReleaseRequestedRef.current = false;
        p.facingYaw = p.cameraYaw;
        equipmentSystem.releaseWeaponHold(
          new BABYLON.Vector3(p.x, p.y, p.z),
          p.cameraYaw,
          p.cameraPitch,
          mobSystem.mobs,
          (mobName, weaponName) => {
            setNearestMobInfo(`Hit: ${mobName} (${weaponName})`);
          }
        );
      }

      // Aksi Klik Cepat
      if (weaponActionRequestedRef.current) {
        weaponActionRequestedRef.current = false;
        p.facingYaw = p.cameraYaw;
        equipmentSystem.triggerWeaponAction(
          new BABYLON.Vector3(p.x, p.y, p.z),
          p.cameraYaw,
          p.cameraPitch,
          mobSystem.mobs,
          (mobName, weaponName) => {
            setNearestMobInfo(`Hit: ${mobName} (${weaponName})`);
          }
        );
      }

      // Jika sedang menahan Busur atau Tombak, kunci arah hadap karakter ke arah bidikan kamera!
      const holdInfo = equipmentSystem.getHoldState();
      if (holdInfo.isHolding) {
        p.facingYaw = p.cameraYaw;
      }
      if (Math.floor(elapsed * 20) % 2 === 0) {
        setHoldHudState((prev) => {
          const nextPct = Math.round(holdInfo.chargeRatio * 100);
          if (
            prev.isHolding === holdInfo.isHolding &&
            prev.chargePercent === nextPct &&
            prev.tool === holdInfo.tool
          ) {
            return prev;
          }
          return {
            isHolding: holdInfo.isHolding,
            chargePercent: nextPct,
            tool: holdInfo.tool,
          };
        });
      }

      // Terapkan Maju Menerjang Beberapa Langkah (Forward Lunge) saat Menusuk Tombak!
      const spearLungeDelta = equipmentSystem.consumeSpearLungeDisplacement(dt);
      const isSpearLunging = spearLungeDelta.lengthSquared() > 0.0001;
      if (isSpearLunging) {
        let lungeX = p.x + spearLungeDelta.x;
        let lungeZ = p.z + spearLungeDelta.z;

        const maxRadius = 104;
        const dOrigin = Math.hypot(lungeX, lungeZ);
        if (dOrigin > maxRadius) {
          lungeX = (lungeX / dOrigin) * maxRadius;
          lungeZ = (lungeZ / dOrigin) * maxRadius;
        }

        const playerRadius = 0.65;
        for (const obs of obstacles) {
          const dx = lungeX - obs.x;
          const dz = lungeZ - obs.z;
          const dist = Math.hypot(dx, dz);
          const minDist = playerRadius + obs.radius;
          if (dist < minDist && dist > 0.0001) {
            const push = minDist - dist;
            lungeX += (dx / dist) * push;
            lungeZ += (dz / dist) * push;
          }
        }

        p.x = lungeX;
        p.z = lungeZ;
        p.walkCycle += dt * 24; // Langkah kaki cepat saat tombak menerjang maju
      }

      characterRig.playerRoot.position.set(p.x, p.y, p.z);
      characterRig.playerRoot.rotation.y = p.facingYaw;

      // Animasi Artikulasi Sendi Penuh (Paha + Lutut + Bahu + Siku)
      if ((isMoving || isSpearLunging) && p.isGrounded) {
        const s = Math.sin(p.walkCycle);
        const c = Math.cos(p.walkCycle);
        const strideAmp = isSpearLunging ? 0.88 : isShiftSprint ? 0.78 : 0.62;

        // Sendi Pangkal Paha (Hip Pivot)
        characterRig.leftLegPivot.rotation.x = s * strideAmp;
        characterRig.rightLegPivot.rotation.x = -s * strideAmp;

        // Sendi Lutut (Knee Joint Pivot — rotasi +X menekuk betis ke belakang secara anatomis)
        const leftKneeFlex = Math.max(0, -s) * 0.92 + Math.max(0, c) * 0.22 + 0.08;
        const rightKneeFlex = Math.max(0, s) * 0.92 + Math.max(0, -c) * 0.22 + 0.08;
        characterRig.leftKneePivot.rotation.x = leftKneeFlex;
        characterRig.rightKneePivot.rotation.x = rightKneeFlex;

        if (!equipmentSystem.isAttacking()) {
          // Sendi Bahu & Sendi Siku berayun berlawanan dengan langkah kaki
          characterRig.leftArmPivot.rotation.x = -s * 0.56;
          characterRig.rightArmPivot.rotation.x = s * 0.56;
          characterRig.leftArmPivot.rotation.y = 0;
          characterRig.rightArmPivot.rotation.y = 0;

          characterRig.leftElbowPivot.rotation.set(
            -0.32 - Math.max(0, s) * 0.45,
            0,
            0
          );
          characterRig.rightElbowPivot.rotation.set(
            -0.32 - Math.max(0, -s) * 0.45,
            0,
            0
          );
        }
        characterRig.characterVisual.position.y =
          Math.abs(Math.sin(p.walkCycle * 2)) * 0.06;
      } else if (!p.isGrounded) {
        // Animasi Lompat di Udara dengan Tekukan Lutut & Siku Dinamis (Naik vs Turun)
        const airFactor = Math.max(-1, Math.min(1, p.vy / 10));
        // Saat melompat naik (airFactor > 0), paha diangkat & lutut ditekuk; saat turun, kaki bersiap mendarat
        characterRig.leftLegPivot.rotation.x = -0.58 - airFactor * 0.18;
        characterRig.rightLegPivot.rotation.x = -0.18 + (1 - airFactor) * 0.22;
        characterRig.leftKneePivot.rotation.x = 0.85 + airFactor * 0.28;
        characterRig.rightKneePivot.rotation.x = 0.62 + airFactor * 0.22;

        if (!equipmentSystem.isAttacking()) {
          characterRig.leftArmPivot.rotation.x = -0.68 - airFactor * 0.25;
          characterRig.rightArmPivot.rotation.x = -0.48 - airFactor * 0.2;
          characterRig.leftArmPivot.rotation.y = 0;
          characterRig.rightArmPivot.rotation.y = 0;
          characterRig.leftElbowPivot.rotation.set(-0.62, 0, 0);
          characterRig.rightElbowPivot.rotation.set(-0.55, 0, 0);
        }
      } else {
        // Posisi Berdiri Siaga (Idle) dengan Lutut & Siku Rileks Alami
        characterRig.leftLegPivot.rotation.x =
          characterRig.leftLegPivot.rotation.x * 0.82 - 0.03;
        characterRig.rightLegPivot.rotation.x =
          characterRig.rightLegPivot.rotation.x * 0.82 - 0.03;
        characterRig.leftKneePivot.rotation.x =
          characterRig.leftKneePivot.rotation.x * 0.82 + 0.06;
        characterRig.rightKneePivot.rotation.x =
          characterRig.rightKneePivot.rotation.x * 0.82 + 0.06;

        if (!equipmentSystem.isAttacking()) {
          const breathe = Math.sin(elapsed * 2.2) * 0.04;
          characterRig.leftArmPivot.rotation.x = breathe;
          characterRig.rightArmPivot.rotation.x = -breathe;
          characterRig.leftArmPivot.rotation.y = 0;
          characterRig.rightArmPivot.rotation.y = 0;
          characterRig.leftElbowPivot.rotation.set(-0.24 + breathe, 0, 0);
          characterRig.rightElbowPivot.rotation.set(-0.26 - breathe, 0, 0);
        }
        characterRig.characterVisual.position.y =
          Math.sin(elapsed * 2.5) * 0.022;
      }

      equipmentSystem.updateWeaponsAndProjectiles(
        dt,
        elapsed,
        new BABYLON.Vector3(p.x, p.y, p.z),
        p.cameraYaw,
        p.cameraPitch,
        getAetherTerrainHeight,
        obstacles,
        mobSystem.mobs,
        (mobName, weaponName) => {
          setNearestMobInfo(`Hit: ${mobName} (${weaponName})`);
        }
      );

      // 6. SISTEM KAMERA MULTI-PERSPEKTIF (1ST, 2ND, 3RD PERSON) & NAMETAG 3D + MULTIPLAYER SYNC
      const mode = cameraModeRef.current;
      characterRig.playerRoot.setEnabled(mode !== 'FIRST_PERSON');
      localNametag.setVisible(mode !== 'FIRST_PERSON');
      localNametag.updateNametag(
        playerIdentityRef.current.displayName,
        playerIdentityRef.current.uid,
        customizationRef.current.equippedTool,
        true,
        holdInfo.isHolding,
        holdInfo.chargeRatio,
        multiplayerManager.getLocalChatBubble(),
        multiplayerManager.isLocalPlayerHost()
      );

      multiplayerManager.updateFrame(
        dt,
        characterRig.playerRoot.position,
        p.facingYaw,
        p.cameraPitch,
        isMoving || isSpearLunging,
        isShiftSprint,
        p.isGrounded,
        equipmentSystem.isAttacking(),
        holdInfo.isHolding,
        holdInfo.chargeRatio
      );

      if (mode === 'FIRST_PERSON') {
        const eyeX = p.x + Math.sin(p.cameraYaw) * 0.2;
        const eyeY = p.y + 1.98;
        const eyeZ = p.z + Math.cos(p.cameraYaw) * 0.2;

        const lookX =
          eyeX + Math.sin(p.cameraYaw) * Math.cos(p.cameraPitch) * 14;
        const lookY = eyeY - Math.sin(p.cameraPitch) * 14;
        const lookZ =
          eyeZ + Math.cos(p.cameraYaw) * Math.cos(p.cameraPitch) * 14;

        camera.position.set(eyeX, eyeY, eyeZ);
        camera.setTarget(new BABYLON.Vector3(lookX, lookY, lookZ));
      } else if (mode === 'SECOND_PERSON') {
        if (secondPersonVarRef.current === 'FRONT_LOCKED') {
          const frontDist = 5.4;
          const desiredCam = new BABYLON.Vector3(
            p.x + Math.sin(p.facingYaw) * frontDist,
            Math.max(
              getAetherTerrainHeight(p.x, p.z) + 1.2,
              p.y + 2.15 + Math.sin(p.cameraPitch) * 2.2
            ),
            p.z + Math.cos(p.facingYaw) * frontDist
          );
          const desiredTarget = new BABYLON.Vector3(p.x, p.y + 1.55, p.z);

          BABYLON.Vector3.LerpToRef(
            smoothedCamPos,
            desiredCam,
            Math.min(1, dt * 10),
            smoothedCamPos
          );
          BABYLON.Vector3.LerpToRef(
            smoothedLookTarget,
            desiredTarget,
            Math.min(1, dt * 12),
            smoothedLookTarget
          );
          camera.position.copyFrom(smoothedCamPos);
          camera.setTarget(smoothedLookTarget);
        } else {
          const rightVecX = Math.cos(p.cameraYaw);
          const rightVecZ = -Math.sin(p.cameraYaw);
          const shoulderOffset = 1.45;
          const backDist = 3.85;

          const desiredCam = new BABYLON.Vector3(
            p.x - Math.sin(p.cameraYaw) * backDist + rightVecX * shoulderOffset,
            Math.max(
              getAetherTerrainHeight(p.x, p.z) + 1.1,
              p.y + 2.05 + Math.sin(p.cameraPitch) * 2.6
            ),
            p.z - Math.cos(p.cameraYaw) * backDist + rightVecZ * shoulderOffset
          );
          const desiredTarget = new BABYLON.Vector3(
            p.x + Math.sin(p.cameraYaw) * 9 + rightVecX * 0.45,
            p.y + 1.65 - Math.sin(p.cameraPitch) * 4.5,
            p.z + Math.cos(p.cameraYaw) * 9 + rightVecZ * 0.45
          );

          BABYLON.Vector3.LerpToRef(
            smoothedCamPos,
            desiredCam,
            Math.min(1, dt * 12),
            smoothedCamPos
          );
          BABYLON.Vector3.LerpToRef(
            smoothedLookTarget,
            desiredTarget,
            Math.min(1, dt * 14),
            smoothedLookTarget
          );
          camera.position.copyFrom(smoothedCamPos);
          camera.setTarget(smoothedLookTarget);
        }
      } else {
        const dist = p.cameraDistance;
        const rawCamX =
          p.x - Math.sin(p.cameraYaw) * Math.cos(p.cameraPitch) * dist;
        const rawCamZ =
          p.z - Math.cos(p.cameraYaw) * Math.cos(p.cameraPitch) * dist;
        const rawCamY = p.y + 2.25 + Math.sin(p.cameraPitch) * dist;
        const floorY = getAetherTerrainHeight(rawCamX, rawCamZ) + 0.95;

        const desiredCam = new BABYLON.Vector3(
          rawCamX,
          Math.max(floorY, rawCamY),
          rawCamZ
        );
        const desiredTarget = new BABYLON.Vector3(p.x, p.y + 1.65, p.z);

        BABYLON.Vector3.LerpToRef(
          smoothedCamPos,
          desiredCam,
          Math.min(1, dt * 10),
          smoothedCamPos
        );
        BABYLON.Vector3.LerpToRef(
          smoothedLookTarget,
          desiredTarget,
          Math.min(1, dt * 12),
          smoothedLookTarget
        );
        camera.position.copyFrom(smoothedCamPos);
        camera.setTarget(smoothedLookTarget);
      }

      // 7. RENDER RADAR MINIMAP RINGKAS & TRANSPARAN (Tidak Menghalangi Pandangan)
      const miniCanvas = minimapCanvasRef.current;
      if (miniCanvas && !isMinimapCollapsedRef.current) {
        const mCtx = miniCanvas.getContext('2d');
        if (mCtx) {
          const w = miniCanvas.width;
          const h = miniCanvas.height;
          const cx = w / 2;
          const cy = h / 2;
          const scale = 0.46;

          mCtx.clearRect(0, 0, w, h);

          // Latar radar ekstra transparan agar dunia 3D di belakang tetap terlihat
          mCtx.fillStyle = 'rgba(8, 12, 20, 0.45)';
          mCtx.beginPath();
          mCtx.arc(cx, cy, w / 2 - 2, 0, Math.PI * 2);
          mCtx.fill();

          mCtx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
          mCtx.lineWidth = 1;
          [18, 36].forEach((rad) => {
            mCtx.beginPath();
            mCtx.arc(cx, cy, rad, 0, Math.PI * 2);
            mCtx.stroke();
          });

          // Kerucut Pandangan Kamera
          mCtx.save();
          mCtx.translate(cx, cy);
          mCtx.rotate(p.cameraYaw);
          mCtx.fillStyle = 'rgba(56, 189, 248, 0.16)';
          mCtx.beginPath();
          mCtx.moveTo(0, 0);
          mCtx.arc(0, 0, 28, -Math.PI / 2 - 0.42, -Math.PI / 2 + 0.42);
          mCtx.closePath();
          mCtx.fill();
          mCtx.restore();

          // Kristal
          crystals.forEach((c) => {
            if (c.collected) return;
            const dx = (c.x - p.x) * scale;
            const dz = -(c.z - p.z) * scale;
            if (Math.hypot(dx, dz) < w / 2 - 5) {
              mCtx.fillStyle = '#FBBF24';
              mCtx.beginPath();
              mCtx.arc(cx + dx, cy + dz, 2.0, 0, Math.PI * 2);
              mCtx.fill();
            }
          });

          // Mob AI
          mobSystem.mobs.forEach((mob) => {
            const dx = (mob.rootNode.position.x - p.x) * scale;
            const dz = -(mob.rootNode.position.z - p.z) * scale;
            if (Math.hypot(dx, dz) < w / 2 - 5) {
              mCtx.fillStyle =
                mob.archetype === 'AETHER_STALKER'
                  ? '#F43F5E'
                  : mob.archetype === 'SENTINEL_DRONE'
                  ? '#38BDF8'
                  : '#F59E0B';
              mCtx.beginPath();
              mCtx.arc(cx + dx, cy + dz, 2.3, 0, Math.PI * 2);
              mCtx.fill();
            }
          });

          // Pemain Multiplayer Lainnya di Radar Minimap
          multiplayerManager.getRemotePlayerPositions().forEach((rp) => {
            const dx = (rp.x - p.x) * scale;
            const dz = -(rp.z - p.z) * scale;
            if (Math.hypot(dx, dz) < w / 2 - 5) {
              mCtx.fillStyle = '#34D399';
              mCtx.beginPath();
              mCtx.arc(cx + dx, cy + dz, 3.2, 0, Math.PI * 2);
              mCtx.fill();
              mCtx.strokeStyle = '#FFFFFF';
              mCtx.lineWidth = 1;
              mCtx.stroke();
            }
          });

          // Titik Pemain di Tengah
          mCtx.fillStyle = '#FFFFFF';
          mCtx.beginPath();
          mCtx.arc(cx, cy, 3.0, 0, Math.PI * 2);
          mCtx.fill();
        }
      }
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      multiplayerManagerRef.current = null;
      multiplayerManager.dispose();
      localNametag.dispose();
      skyCloudSystem.dispose();
      scene.dispose();
      engine.dispose();
    };
  }, [
    switchPerspective,
    cycleCameraPerspective,
    toggleCrosshairLock,
    toggleSettingsPopup,
    selectWeaponTool,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 60);
    return () => clearTimeout(timer);
  }, [isGameExpanded]);

  const liveClock = formatLiveGameClock(timeOfDay);
  const dayPhase = getDayPhaseFromHour(timeOfDay);
  const currentSeasonMeta = getSeasonMetadata(seasonMode);

  return (
    <div
      className={
        isGameExpanded
          ? 'fixed inset-0 z-50 w-screen h-[100dvh] bg-[#04070D] overflow-hidden select-none'
          : 'fixed inset-0 z-40 w-screen h-[100dvh] bg-[#04070D] overflow-hidden select-none'
      }
    >
      {/* Kanvas WebGL Babylon.js */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block outline-none ${
          isCrosshairLocked ? 'cursor-none' : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* 1. KIRI ATAS (TOP-LEFT): HANYA MAP & WAKTU */}
      <div className="absolute top-3 left-3 z-20 flex items-start gap-2.5 pointer-events-none">
        {/* Map (Radar Minimap Bulat Transparan) */}
        <div className="pointer-events-auto flex flex-col items-center gap-1">
          {!isMinimapCollapsed ? (
            <div className="relative group">
              <canvas
                ref={minimapCanvasRef}
                width={88}
                height={88}
                onClick={() => setIsMinimapCollapsed(true)}
                title="Klik atau tekan M untuk menyembunyikan peta"
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border border-sky-400/30 bg-slate-950/35 backdrop-blur-sm shadow-lg opacity-85 hover:opacity-100 transition-opacity cursor-pointer"
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-slate-950/85 border border-white/15 rounded text-[8px] font-mono-tabular text-sky-300">
                MAP
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsMinimapCollapsed(false)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-900/85 border border-white/15 backdrop-blur-md text-[11px] font-semibold text-sky-300 flex items-center gap-1.5 cursor-pointer shadow"
              title="Tampilkan Map (M)"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          )}
        </div>

        {/* Waktu (Jam Dunia & Musim Saat Ini) */}
        <div className="bg-slate-950/55 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 pointer-events-auto shadow-lg">
          <div className="flex items-center gap-1.5">
            {dayPhase.phase === 'PAGI' ? (
              <Sunrise className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            ) : dayPhase.phase === 'SIANG' ? (
              <Sun className="w-3.5 h-3.5 text-sky-300 shrink-0" />
            ) : dayPhase.phase === 'SORE' ? (
              <Sunset className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-bold font-mono-tabular text-white tracking-tight">
                {liveClock.hhmm}
              </span>
              <span className="text-[10px] font-mono-tabular text-sky-400 font-semibold">
                :{liveClock.ss}
              </span>
              <span
                style={{ color: dayPhase.accentColor }}
                className="text-[10px] font-bold uppercase tracking-wider ml-1"
              >
                {dayPhase.phase}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-300 font-mono-tabular">
            <Clock className="w-2.5 h-2.5 text-sky-400" />
            <span
              style={{ color: currentSeasonMeta.accentColor }}
              className="font-semibold"
            >
              {currentSeasonMeta.name}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TENGAH ATAS (TOP-CENTER): PILIHAN FIRST PERSON (1P), 2ND PERSON (2P), 3RD PERSON (3P) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="bg-slate-950/60 backdrop-blur-md border border-white/15 rounded-xl p-1 flex items-center gap-1 shadow-lg">
          <button
            type="button"
            onClick={() => switchPerspective('FIRST_PERSON')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              cameraMode === 'FIRST_PERSON'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Pandangan Pertama (First Person)"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">First Person</span>
            <span className="sm:hidden">1P</span>
          </button>
          <button
            type="button"
            onClick={() => switchPerspective('SECOND_PERSON')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              cameraMode === 'SECOND_PERSON'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Pandangan Kedua (2nd Person)"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">2nd Person</span>
            <span className="sm:hidden">2P</span>
          </button>
          <button
            type="button"
            onClick={() => switchPerspective('THIRD_PERSON')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              cameraMode === 'THIRD_PERSON'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Pandangan Ketiga (3rd Person)"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">3rd Person</span>
            <span className="sm:hidden">3P</span>
          </button>
        </div>
      </div>

      {/* 3. KANAN ATAS (TOP-RIGHT): TOMBOL LAYAR PENUH, TOMBOL CHAT & TOMBOL SETTINGS */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-auto">
        {/* Tombol Layar Penuh (Fullscreen Android / Browser) */}
        {onToggleGameExpand && (
          <button
            type="button"
            onClick={onToggleGameExpand}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
              isGameExpanded
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                : 'bg-slate-950/60 border-white/15 text-slate-200 hover:text-white'
            }`}
            title={
              isGameExpanded
                ? 'Keluar dari Layar Penuh (Fullscreen)'
                : 'Aktifkan Layar Penuh (Fullscreen)'
            }
          >
            {isGameExpanded ? (
              <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span className="hidden sm:inline">
              {isGameExpanded ? 'Keluar Penuh' : 'Layar Penuh'}
            </span>
          </button>
        )}

        {/* Tombol Chat (Memunculkan / Menyembunyikan Kolom Chat) */}
        <button
          type="button"
          onClick={() => {
            setIsChatOpen((prev) => {
              const next = !prev;
              if (next) {
                setTimeout(() => chatInputRef.current?.focus(), 20);
              }
              return next;
            });
            soundEngine.playSelect();
          }}
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
            isChatOpen
              ? 'bg-sky-500 text-slate-950 border-sky-400'
              : 'bg-slate-950/60 border-white/15 text-slate-200 hover:text-white'
          }`}
          title="Buka / Tutup Kolom Chat (Enter)"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        {/* Tombol Settings (Memuat Semua Pengaturan Lainnya) */}
        <button
          type="button"
          onClick={() => {
            setSettingsInitialTab(undefined);
            toggleSettingsPopup();
          }}
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
            isSettingsOpen
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-950/60 border-white/15 text-slate-200 hover:text-white'
          }`}
          title="Pengaturan (G)"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* POP-UP KOLOM CHAT (Hanya muncul ketika Tombol Chat diklik) */}
      {isExploring && !isSettingsOpen && isChatOpen && (
        <div className="absolute top-14 right-3 z-20 w-72 sm:w-80 pointer-events-auto">
          <div className="bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-3 py-2 bg-slate-900/95 border-b border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  Chat{' '}
                  {sessionConfig.playMode === 'MULTIPLAYER'
                    ? `Room [${sessionConfig.roomCode}]`
                    : '(Single Player)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                title="Tutup Kolom Chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto px-3 py-2 space-y-1.5 text-[11px]">
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`leading-snug break-words ${
                    m.isSystem
                      ? 'text-amber-300/90 text-[10px] italic'
                      : 'text-slate-100'
                  }`}
                >
                  {!m.isSystem && (
                    <span className="inline-flex items-center gap-1 mr-1.5">
                      <span className="text-[9px] font-mono-tabular text-slate-500">
                        {m.timeLabel}
                      </span>
                      <span
                        className={`font-bold ${
                          m.isHost
                            ? 'text-[#FACC15]'
                            : m.senderUid === activeIdentity.uid
                            ? 'text-sky-300'
                            : 'text-white'
                        }`}
                      >
                        {m.senderName}:
                      </span>
                    </span>
                  )}
                  <span>{m.text}</span>
                </div>
              ))}
              <div ref={chatMessagesEndRef} />
            </div>

            <form
              onSubmit={handleSendChat}
              className="p-1.5 bg-slate-900/95 border-t border-white/10 flex items-center gap-1.5"
            >
              <input
                ref={chatInputRef}
                type="text"
                maxLength={160}
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Ketik pesan..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/15 focus:border-sky-400 focus:outline-none text-[11px] text-white placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shrink-0 cursor-pointer"
                title="Kirim Pesan Chat"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CROSSBAR / CROSSHAIR TENGAH LAYAR + INDIKATOR HOLD / TARIKAN BUSUR & TOMBAK */}
      {isExploring &&
        !isSettingsOpen &&
        (isCrosshairLocked ||
          cameraMode === 'FIRST_PERSON' ||
          controlMode === 'MOBILE' ||
          holdHudState.isHolding) && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
            <div className="relative flex items-center justify-center">
              <div
                style={
                  holdHudState.isHolding
                    ? {
                        transform: `scale(${1.25 - (holdHudState.chargePercent / 100) * 0.45})`,
                      }
                    : undefined
                }
                className={`w-7 h-7 rounded-full border transition-all duration-75 ${
                  holdHudState.isHolding
                    ? holdHudState.chargePercent >= 100
                      ? 'border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.95)]'
                      : 'border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                    : isCrosshairLocked
                    ? 'border-sky-400/90 shadow-[0_0_12px_rgba(56,189,248,0.8)] scale-100'
                    : 'border-white/40 scale-90'
                }`}
              />
              <div className="absolute w-3.5 h-[1.5px] bg-sky-300/80" />
              <div className="absolute h-3.5 w-[1.5px] bg-sky-300/80" />
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#38BDF8]" />
            </div>

            {holdHudState.isHolding && (
              <div className="mt-4 flex flex-col items-center gap-1 bg-slate-950/75 border border-white/15 backdrop-blur-md px-3 py-1 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 text-[10px] font-mono-tabular font-bold tracking-wider uppercase">
                  <span
                    className={
                      holdHudState.chargePercent >= 100
                        ? 'text-emerald-300'
                        : 'text-amber-300'
                    }
                  >
                    {holdHudState.tool === 'BOW'
                      ? 'Tarikan Busur'
                      : 'Ancang Tusukan'}
                  </span>
                  <span className="text-white">{holdHudState.chargePercent}%</span>
                </div>
                <div className="w-28 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${holdHudState.chargePercent}%` }}
                    className={`h-full transition-all duration-75 ${
                      holdHudState.chargePercent >= 100
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
                        : 'bg-amber-400'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        )}

      {/* KONTROL KHUSUS PONSEL / MOBILE (Virtual Analog Kiri + Geser Kamera Kanan + Tombol Aksi Tahan) */}
      {isExploring && !isSettingsOpen && controlMode === 'MOBILE' && (
        <MobileTouchControls
          mobileSettings={activeMobileSettings}
          onMoveChange={handleMobileMoveChange}
          onLookDelta={handleMobileLookDelta}
          onJumpPress={handleMobileJumpPress}
          onUseWeaponPress={startWeaponHoldAction}
          onUseWeaponRelease={releaseWeaponHoldAction}
          equippedTool={activeCustomization.equippedTool}
          isSprinting={mobileSprint}
          onToggleSprint={() => setMobileSprint((prev) => !prev)}
          cameraMode={cameraMode}
          onCycleCameraMode={cycleCameraPerspective}
        />
      )}

      {/* 4. INVENTORIS DI BAWAH (Pedang, Tombak, Busur, Bola Salju, atau Tangan Kosong) */}
      {isExploring && !isSettingsOpen && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5 bg-slate-950/70 backdrop-blur-md border border-white/15 rounded-2xl p-1.5 pointer-events-auto shadow-2xl">
          {WEAPON_TOOLS_LIST.map((w) => {
            const active = activeCustomization.equippedTool === w.id;
            const isNoneSlot = w.id === 'NONE';
            const shortLabel =
              w.id === 'SWORD'
                ? 'Pedang'
                : w.id === 'SPEAR'
                ? 'Tombak'
                : w.id === 'BOW'
                ? 'Busur'
                : w.id === 'SNOWBALL'
                ? 'Bola Salju'
                : 'Tangan Kosong';
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => selectWeaponTool(w.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  active
                    ? isNoneSlot
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                      : 'bg-sky-500/25 border-sky-400 text-white shadow-[0_0_14px_rgba(56,189,248,0.3)]'
                    : 'bg-slate-900/75 border-white/10 text-slate-400 hover:text-white'
                }`}
                title={
                  isNoneSlot
                    ? 'Tangan Kosong — Tidak memegang senjata (Tombol 0)'
                    : `${w.name} — Klik lagi untuk melepas menjadi Tangan Kosong (Tombol ${w.slotNumber})`
                }
              >
                {isNoneSlot ? (
                  <Hand className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                ) : (
                  <span className="px-1.2 py-0.2 rounded bg-slate-800 text-[9px] font-mono-tabular text-sky-300">
                    {w.slotNumber}
                  </span>
                )}
                <span className="truncate">{shortLabel}</span>
              </button>
            );
          })}

          {activeCustomization.equippedTool !== 'NONE' && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                startWeaponHoldAction();
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                releaseWeaponHoldAction();
              }}
              onMouseLeave={() => {
                if (holdHudState.isHolding) releaseWeaponHoldAction();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                startWeaponHoldAction();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                releaseWeaponHoldAction();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer shadow"
              title="Tahan & Lepas untuk Memanah / Menusuk, atau Klik untuk Menebas (Klik Kiri / Tombol F)"
            >
              <Swords className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {WEAPON_TOOLS_LIST.find((w) => w.id === activeCustomization.equippedTool)
                  ?.actionLabel || 'Gunakan'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* POP-UP MODAL SETTINGS (Memuat Semua Pengaturan & Informasi Lainnya) */}
      {isSettingsOpen && (
        <AetherSettingsModal
          initialTab={settingsInitialTab}
          characterCustomization={activeCustomization}
          onChangeCharacterCustomization={handleUpdateCustomization}
          controlMode={controlMode}
          onSelectControlMode={setControlMode}
          desktopSettings={activeDesktopSettings}
          onChangeDesktopSettings={handleUpdateDesktopSettings}
          mobileSettings={activeMobileSettings}
          onChangeMobileSettings={handleUpdateMobileSettings}
          seasonMode={seasonMode}
          onChangeSeason={setSeasonMode}
          timeOfDay={timeOfDay}
          onJumpToTime={jumpToTimeOfDay}
          autoDayCycle={autoDayCycle}
          onToggleAutoDayCycle={() => setAutoDayCycle((prev) => !prev)}
          weatherMode={weatherMode}
          onChangeWeather={setWeatherMode}
          secondPersonVariant={secondPersonVariant}
          onChangeSecondPersonVariant={(v) => onChangeSecondPersonVariant?.(v)}
          atmospherePreset={atmospherePreset}
          onChangeAtmospherePreset={(p) => onChangeAtmospherePreset?.(p)}
          speedMultiplier={speedMultiplier}
          onChangeSpeedMultiplier={(v) => onChangeSpeedMultiplier?.(v)}
          gravityScale={gravityScale}
          onChangeGravityScale={(v) => onChangeGravityScale?.(v)}
          bloomIntensity={bloomIntensity}
          onChangeBloomIntensity={(v) => onChangeBloomIntensity?.(v)}
          playerIdentity={activeIdentity}
          onChangePlayerIdentity={handleUpdateIdentity}
          sessionConfig={sessionConfig}
          onlinePlayers={onlinePlayers}
          crystalsCollected={crystalsCollected}
          totalCrystals={totalCrystals}
          zoneName={zoneName}
          nearestMobInfo={nearestMobInfo}
          isMuted={isMuted}
          onToggleSound={toggleSound}
          isCrosshairLocked={isCrosshairLocked}
          onToggleCrosshairLock={toggleCrosshairLock}
          isGameExpanded={isGameExpanded}
          onToggleGameExpand={onToggleGameExpand}
          onWarpToLocation={warpToLocation}
          fpsStats={fpsStats}
          onClose={() => {
            setIsSettingsOpen(false);
            isSettingsOpenRef.current = false;
            soundEngine.playSelect();
          }}
          onReturnToLobby={onReturnToLobby}
        />
      )}
    </div>
  );
};
