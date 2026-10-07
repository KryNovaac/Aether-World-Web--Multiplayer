/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  AetherBabylonWorld,
  AtmospherePreset,
  CameraPerspective,
} from './components/AetherBabylonWorld';
import { AetherStandaloneLobby } from './components/AetherAccountAndLobby';
import {
  DeviceControlMode,
  DeviceDetectionResult,
  inspectUserDevice,
} from './components/MobileTouchControls';
import {
  WeatherMode,
  SeasonMode,
  DesktopControlSettings,
  MobileControlSettings,
  DEFAULT_DESKTOP_SETTINGS,
  DEFAULT_MOBILE_SETTINGS,
} from './game/aetherSkyAndClouds';
import {
  CharacterCustomization,
  DEFAULT_CHARACTER_CUSTOMIZATION,
} from './game/aetherCharacterAndWeapons';
import {
  PlayerAuthIdentity,
  WorldSessionConfig,
  loadSavedPlayerIdentity,
  savePlayerIdentityToStorage,
  generateRandomPlayerUid,
  generateWorldRoomCode,
} from './game/aetherMultiplayerSystem';
import {
  auth,
  db,
  doc,
  getDoc,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from './firebase';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  // State Layar: LOBBY (Halaman Lobby Biasa Sebelum Dunia Dimulai) vs WORLD (Dunia 3D)
  const [activeScreen, setActiveScreen] = useState<'LOBBY' | 'WORLD'>('LOBBY');

  // Identitas Autentikasi Pemain (UID & Name / Nickname di atas kepala)
  const [playerIdentity, setPlayerIdentity] = useState<PlayerAuthIdentity>(() =>
    loadSavedPlayerIdentity()
  );
  const [sessionConfig, setSessionConfig] = useState<WorldSessionConfig>(() => {
    const savedId = loadSavedPlayerIdentity();
    return {
      playMode:
        savedId.isLoggedIn || savedId.isFirebaseVerified
          ? 'MULTIPLAYER'
          : 'SINGLE_PLAYER',
      roomAction: 'CREATE_ROOM',
      roomCode: generateWorldRoomCode(),
      roomName: `Dunia ${savedId.displayName || 'Aether'}`,
    };
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Pemeriksaan Perangkat Otomatis (Desktop vs Ponsel) di Lobby
  const [deviceInfo, setDeviceInfo] = useState<DeviceDetectionResult>(() =>
    inspectUserDevice()
  );
  const [controlMode, setControlMode] = useState<DeviceControlMode>(
    () => inspectUserDevice().detectedMode
  );

  // Kustomisasi Karakter & Alat/Senjata (Pedang, Tombak, Busur Panah, Bola Salju)
  const [characterCustomization, setCharacterCustomization] =
    useState<CharacterCustomization>(DEFAULT_CHARACTER_CUSTOMIZATION);

  // Pengaturan Pasti Terpisah: Desktop vs Ponsel
  const [desktopSettings, setDesktopSettings] =
    useState<DesktopControlSettings>(DEFAULT_DESKTOP_SETTINGS);
  const [mobileSettings, setMobileSettings] =
    useState<MobileControlSettings>(DEFAULT_MOBILE_SETTINGS);

  // Pengaturan Awal yang dipilih di Lobby sebelum memuat Dunia 3D
  const [initialTimeOfDay, setInitialTimeOfDay] = useState<number>(8.5);
  const [initialWeather, setInitialWeather] = useState<WeatherMode>('CERAH');
  const [initialSeason, setInitialSeason] = useState<SeasonMode>('SEMI');
  const [initialCameraMode, setInitialCameraMode] =
    useState<CameraPerspective>('THIRD_PERSON');

  // Pengaturan Fisika & Visual Dunia
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [gravityScale, setGravityScale] = useState<number>(1.0);
  const [secondPersonVariant, setSecondPersonVariant] = useState<
    'SHOULDER' | 'FRONT_LOCKED'
  >('SHOULDER');
  const [atmospherePreset, setAtmospherePreset] =
    useState<AtmospherePreset>('NIGHT_SANCTUARY');
  const [bloomIntensity, setBloomIntensity] = useState<number>(0.85);
  const [isGameExpanded, setIsGameExpanded] = useState<boolean>(false);

  // Sinkronisasi status Layar Penuh (Fullscreen) asli browser / Android
  useEffect(() => {
    const syncFullscreenState = () => {
      const docAny = document as Document & {
        webkitFullscreenElement?: Element | null;
      };
      const isNativeFs = Boolean(
        document.fullscreenElement || docAny.webkitFullscreenElement
      );
      setIsGameExpanded(isNativeFs);
    };
    document.addEventListener('fullscreenchange', syncFullscreenState);
    document.addEventListener('webkitfullscreenchange', syncFullscreenState);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState);
      document.removeEventListener('webkitfullscreenchange', syncFullscreenState);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    soundEngine.playSelect();
    const docEl = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    const docAny = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };

    const isNativeFs = Boolean(
      document.fullscreenElement || docAny.webkitFullscreenElement
    );

    if (!isNativeFs && !isGameExpanded) {
      setIsGameExpanded(true);
      try {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen({ navigationUI: 'hide' });
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
        // Kunci orientasi landscape otomatis pada ponsel Android jika didukung
        const screenAny = window.screen as Screen & {
          orientation?: { lock?: (mode: string) => Promise<void> };
        };
        if (
          (controlMode === 'MOBILE' || deviceInfo.hasTouch) &&
          screenAny.orientation?.lock
        ) {
          screenAny.orientation.lock('landscape').catch(() => {});
        }
      } catch {
        // Fallback jika berada di dalam iframe yang membatasi native fullscreen
        window.scrollTo(0, 1);
      }
    } else {
      setIsGameExpanded(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (docAny.webkitFullscreenElement && docAny.webkitExitFullscreen) {
          await docAny.webkitExitFullscreen();
        }
      } catch {
        // Ignore
      }
    }
  };

  const handleUpdatePlayerIdentity = (nextId: PlayerAuthIdentity) => {
    setPlayerIdentity(nextId);
    savePlayerIdentityToStorage(nextId);
  };

  // Sinkronisasi otomatis dengan Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const defaultName =
          user.displayName?.slice(0, 24) ||
          user.email?.split('@')[0]?.slice(0, 24) ||
          `Paladin_${user.uid.slice(0, 5)}`;

        let loadedName = defaultName;
        if (user.emailVerified) {
          try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (snap.exists()) {
              const d = snap.data();
              if (typeof d.displayName === 'string' && d.displayName.length >= 2) {
                loadedName = d.displayName.slice(0, 24);
              }
              setCharacterCustomization((prev) => ({
                modelId: d.modelId || prev.modelId,
                colorTheme: d.colorTheme || prev.colorTheme,
                hairColor: d.hairColor || prev.hairColor,
                headwearId: d.headwearId || prev.headwearId,
                topOutfitId: d.topOutfitId || prev.topOutfitId,
                bottomPantsId: d.bottomPantsId || prev.bottomPantsId,
                bodyAccessoryId: d.bodyAccessoryId || prev.bodyAccessoryId,
                backAttachment: d.backAttachment || prev.backAttachment,
                equippedTool: d.equippedTool || prev.equippedTool,
              }));
            }
          } catch {
            // Ignore initial profile read error
          }
        }

        const verifiedIdentity: PlayerAuthIdentity = {
          uid: user.uid,
          displayName: loadedName,
          isFirebaseVerified: Boolean(user.emailVerified),
          isLoggedIn: true,
          email: user.email,
          photoURL: user.photoURL,
        };
        setPlayerIdentity(verifiedIdentity);
        savePlayerIdentityToStorage(verifiedIdentity);
      }
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthErrorMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
      soundEngine.playSelect();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user')) {
        setAuthErrorMsg(
          'Popup Google Sign-In diblokir atau dibatalkan. Anda tetap dapat Login / Sign Up menggunakan Akun Aether (UID & PIN) di form bawah.'
        );
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOutAuth = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore signout error
    }
    const freshUid = generateRandomPlayerUid();
    const resetId: PlayerAuthIdentity = {
      uid: freshUid,
      displayName: `Ranger_${freshUid.slice(-4)}`,
      isFirebaseVerified: false,
      isLoggedIn: false,
      email: null,
      photoURL: null,
    };
    handleUpdatePlayerIdentity(resetId);
    soundEngine.playSelect();
  };

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(inspectUserDevice());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (activeScreen === 'LOBBY') {
    return (
      <AetherStandaloneLobby
        deviceInfo={deviceInfo}
        controlMode={controlMode}
        onSelectControlMode={(mode) => {
          setControlMode(mode);
          soundEngine.playSelect();
        }}
        desktopSettings={desktopSettings}
        onChangeDesktopSettings={(s) => {
          setDesktopSettings(s);
          soundEngine.playSelect();
        }}
        mobileSettings={mobileSettings}
        onChangeMobileSettings={(s) => {
          setMobileSettings(s);
          soundEngine.playSelect();
        }}
        characterCustomization={characterCustomization}
        onChangeCharacterCustomization={(c) => {
          setCharacterCustomization(c);
          soundEngine.playSelect();
        }}
        initialTimeOfDay={initialTimeOfDay}
        onSelectInitialTime={(hour) => {
          setInitialTimeOfDay(hour);
          soundEngine.playSelect();
        }}
        initialWeather={initialWeather}
        onSelectInitialWeather={(w) => {
          setInitialWeather(w);
          soundEngine.playSelect();
        }}
        initialSeason={initialSeason}
        onSelectInitialSeason={(season) => {
          setInitialSeason(season);
          soundEngine.playSelect();
        }}
        initialCameraMode={initialCameraMode}
        onSelectInitialCameraMode={(cam) => {
          setInitialCameraMode(cam);
          soundEngine.playSelect();
        }}
        playerIdentity={playerIdentity}
        onChangePlayerIdentity={handleUpdatePlayerIdentity}
        sessionConfig={sessionConfig}
        onChangeSessionConfig={(cfg) => {
          setSessionConfig(cfg);
          soundEngine.playSelect();
        }}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOutAuth={handleSignOutAuth}
        isAuthLoading={isAuthLoading}
        authErrorMsg={authErrorMsg}
        isFullscreen={isGameExpanded}
        onToggleFullscreen={handleToggleFullscreen}
        onEnterWorld={() => {
          soundEngine.init();
          soundEngine.playSelect();
          // Jika bermain di Ponsel / Mobile, otomatis coba aktifkan Layar Penuh saat masuk ke dunia
          if (controlMode === 'MOBILE' && !isGameExpanded) {
            handleToggleFullscreen();
          }
          setActiveScreen('WORLD');
        }}
      />
    );
  }

  return (
    <main className="w-screen h-[100dvh] bg-[#04070D] text-slate-100 overflow-hidden select-none">
      <AetherBabylonWorld
        initialControlMode={controlMode}
        initialTimeOfDay={initialTimeOfDay}
        initialWeather={initialWeather}
        initialSeason={initialSeason}
        initialCameraMode={initialCameraMode}
        characterCustomization={characterCustomization}
        onChangeCharacterCustomization={setCharacterCustomization}
        playerIdentity={playerIdentity}
        onChangePlayerIdentity={handleUpdatePlayerIdentity}
        sessionConfig={sessionConfig}
        desktopSettings={desktopSettings}
        onChangeDesktopSettings={setDesktopSettings}
        mobileSettings={mobileSettings}
        onChangeMobileSettings={setMobileSettings}
        onReturnToLobby={() => {
          soundEngine.playSelect();
          setActiveScreen('LOBBY');
        }}
        speedMultiplier={speedMultiplier}
        onChangeSpeedMultiplier={setSpeedMultiplier}
        gravityScale={gravityScale}
        onChangeGravityScale={setGravityScale}
        secondPersonVariant={secondPersonVariant}
        onChangeSecondPersonVariant={setSecondPersonVariant}
        atmospherePreset={atmospherePreset}
        onChangeAtmospherePreset={setAtmospherePreset}
        bloomIntensity={bloomIntensity}
        onChangeBloomIntensity={setBloomIntensity}
        isGameExpanded={isGameExpanded}
        onToggleGameExpand={handleToggleFullscreen}
      />
    </main>
  );
}
