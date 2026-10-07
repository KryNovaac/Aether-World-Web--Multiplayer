/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Settings,
  X,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CloudRain,
  CloudLightning,
  Wind,
  Smartphone,
  Monitor,
  CheckCircle2,
  Clock,
  Eye,
  LogOut,
  Compass,
  Flower2,
  Leaf,
  Snowflake,
  MousePointer,
  UserCheck,
  Swords,
  Shield,
  Palette,
  Users,
  KeyRound,
  RefreshCw,
  LogIn,
  AlertCircle,
  Copy,
  Check,
  Globe,
  User,
  PlusCircle,
  DoorOpen,
  Lock,
  UserPlus,
  ArrowLeft,
  Shirt,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  PlayerAuthIdentity,
  WorldSessionConfig,
  StoredLocalAccount,
  generateRandomPlayerUid,
  generateWorldRoomCode,
  sanitizePlayerUid,
  sanitizeRoomCode,
  validatePlayerIdentity,
  validateWorldSessionConfig,
  getRegisteredAccounts,
  loginLocalAccount,
  signUpLocalAccount,
} from '../game/aetherMultiplayerSystem';
import {
  DeviceControlMode,
  DeviceDetectionResult,
} from './MobileTouchControls';
import {
  WeatherMode,
  SeasonMode,
  DesktopControlSettings,
  MobileControlSettings,
  getDayPhaseFromHour,
  formatLiveGameClock,
  getSeasonMetadata,
} from '../game/aetherSkyAndClouds';
import {
  CharacterCustomization,
  CHARACTER_MODELS_LIST,
  ARMOR_COLOR_THEMES,
  BACK_ATTACHMENTS_LIST,
  HEADWEAR_STYLES_LIST,
  HAIR_COLOR_OPTIONS,
  TOP_OUTFIT_STYLES_LIST,
  BOTTOM_PANTS_STYLES_LIST,
  BODY_ACCESSORY_STYLES_LIST,
  WEAPON_TOOLS_LIST,
  applyModelPresetToCustomization,
} from '../game/aetherCharacterAndWeapons';
import { CameraPerspective } from './AetherBabylonWorld';

export interface StandaloneLobbyProps {
  deviceInfo: DeviceDetectionResult;
  controlMode: DeviceControlMode;
  onSelectControlMode: (mode: DeviceControlMode) => void;
  desktopSettings: DesktopControlSettings;
  onChangeDesktopSettings: (s: DesktopControlSettings) => void;
  mobileSettings: MobileControlSettings;
  onChangeMobileSettings: (s: MobileControlSettings) => void;
  characterCustomization: CharacterCustomization;
  onChangeCharacterCustomization: (c: CharacterCustomization) => void;
  initialTimeOfDay: number;
  onSelectInitialTime: (hour: number) => void;
  initialWeather: WeatherMode;
  onSelectInitialWeather: (w: WeatherMode) => void;
  initialSeason: SeasonMode;
  onSelectInitialSeason: (s: SeasonMode) => void;
  initialCameraMode: CameraPerspective;
  onSelectInitialCameraMode: (c: CameraPerspective) => void;
  playerIdentity: PlayerAuthIdentity;
  onChangePlayerIdentity: (id: PlayerAuthIdentity) => void;
  sessionConfig: WorldSessionConfig;
  onChangeSessionConfig: (cfg: WorldSessionConfig) => void;
  onGoogleSignIn: () => Promise<void>;
  onSignOutAuth: () => Promise<void>;
  isAuthLoading?: boolean;
  authErrorMsg?: string | null;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onEnterWorld: () => void;
}

type LobbyViewStep = 'MAIN_MENU' | 'SINGLEPLAYER_SETUP' | 'MULTIPLAYER_SETUP';

/**
 * Kanvas Panorama Dunia 3D & Karakter Pedestal bergaya Lobby Minecraft
 */
const AetherLobbyPanoramaBackdrop: React.FC<{
  season: SeasonMode;
  timeOfDay: number;
  weather: WeatherMode;
}> = ({ season, timeOfDay, weather }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;

    const particles = Array.from({ length: 42 }, (_, i) => ({
      x: (i * 97) % 1000,
      y: (i * 53) % 600,
      size: 2 + (i % 4),
      speedX: 0.25 + (i % 3) * 0.15,
      speedY: 0.35 + (i % 4) * 0.2,
      phase: i * 0.7,
    }));

    const render = () => {
      t += 0.008;
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);

      // Langit dinamis sesuai jam dunia
      const isNight = timeOfDay >= 19.25 || timeOfDay < 5;
      const isSunset =
        (timeOfDay >= 16 && timeOfDay < 19.25) ||
        (timeOfDay >= 5 && timeOfDay < 7);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (isNight) {
        skyGrad.addColorStop(0, '#040814');
        skyGrad.addColorStop(0.55, '#0B1730');
        skyGrad.addColorStop(1, '#11223E');
      } else if (isSunset) {
        skyGrad.addColorStop(0, '#1B1938');
        skyGrad.addColorStop(0.5, '#592B47');
        skyGrad.addColorStop(1, '#C46D4E');
      } else {
        skyGrad.addColorStop(0, '#0C2444');
        skyGrad.addColorStop(0.55, '#1B4B78');
        skyGrad.addColorStop(1, '#3A7CA5');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Cahaya Matahari / Bulan lembut di cakrawala
      const orbX = w * 0.32 + Math.sin(t * 0.35) * 40;
      const orbY = h * 0.28;
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 8, orbX, orbY, 170);
      if (isNight) {
        orbGrad.addColorStop(0, 'rgba(186, 230, 253, 0.75)');
        orbGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.2)');
        orbGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else {
        orbGrad.addColorStop(0, 'rgba(253, 230, 138, 0.85)');
        orbGrad.addColorStop(0.35, 'rgba(251, 191, 36, 0.22)');
        orbGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      }
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 170, 0, Math.PI * 2);
      ctx.fill();

      // Awan Berarak Bergaya Blocky / Stylized Panorama
      ctx.fillStyle = isNight
        ? 'rgba(148, 163, 184, 0.08)'
        : 'rgba(255, 255, 255, 0.12)';
      for (let i = 0; i < 7; i++) {
        const cx = ((i * 290 + t * 22 * (1 + (i % 2) * 0.3)) % (w + 320)) - 160;
        const cy = h * 0.14 + (i % 3) * 48;
        const cw = 150 + (i % 3) * 55;
        const ch = 26 + (i % 2) * 12;
        ctx.fillRect(cx, cy, cw, ch);
        ctx.fillRect(cx + 24, cy - 12, cw * 0.6, 12);
      }

      // Siluet Pegunungan & Pulau Melayang Panorama (Slow Panning seperti Minecraft)
      const panOffset = Math.sin(t * 0.25) * 45;
      const hillColorFar =
        season === 'DINGIN'
          ? '#1E293B'
          : season === 'GUGUR'
          ? '#1E1B24'
          : '#0F1E32';
      const hillColorNear =
        season === 'DINGIN'
          ? '#26354A'
          : season === 'GUGUR'
          ? '#271E29'
          : '#0B1728';

      ctx.fillStyle = hillColorFar;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 60; x += 60) {
        const y =
          h * 0.64 +
          Math.sin((x + panOffset) * 0.004) * 55 +
          Math.cos((x + panOffset) * 0.009) * 28;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Siluet Menara Sanctuary Aether di Kejauhan
      const towerX = w * 0.22 - panOffset * 0.5;
      const towerBaseY = h * 0.63;
      ctx.fillStyle = '#0D1829';
      ctx.fillRect(towerX - 18, towerBaseY - 95, 36, 95);
      ctx.beginPath();
      ctx.moveTo(towerX - 26, towerBaseY - 95);
      ctx.lineTo(towerX, towerBaseY - 135);
      ctx.lineTo(towerX + 26, towerBaseY - 95);
      ctx.closePath();
      ctx.fill();

      // Kristal Aether Melayang di Puncak Menara
      const crystalY = towerBaseY - 155 + Math.sin(t * 2.5) * 6;
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.moveTo(towerX, crystalY - 12);
      ctx.lineTo(towerX + 8, crystalY);
      ctx.lineTo(towerX, crystalY + 12);
      ctx.lineTo(towerX - 8, crystalY);
      ctx.closePath();
      ctx.fill();

      // Bukit Depan
      ctx.fillStyle = hillColorNear;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 50; x += 50) {
        const y =
          h * 0.76 +
          Math.sin((x - panOffset * 1.3) * 0.005 + 1.2) * 38 +
          Math.cos((x - panOffset) * 0.011) * 18;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Partikel Musim & Cuaca
      for (const p of particles) {
        p.x = (p.x + p.speedX + w) % w;
        p.y = (p.y + (weather === 'HUJAN' || weather === 'BADAI' ? 4.5 : p.speedY)) % h;

        if (weather === 'HUJAN' || weather === 'BADAI') {
          ctx.strokeStyle = 'rgba(125, 211, 252, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 3, p.y + 12);
          ctx.stroke();
        } else {
          if (season === 'SEMI') ctx.fillStyle = 'rgba(244, 114, 182, 0.55)';
          else if (season === 'PANAS') ctx.fillStyle = 'rgba(250, 204, 21, 0.55)';
          else if (season === 'GUGUR') ctx.fillStyle = 'rgba(251, 146, 60, 0.55)';
          else ctx.fillStyle = 'rgba(226, 232, 240, 0.65)';

          ctx.fillRect(
            p.x + Math.sin(t * 2 + p.phase) * 8,
            p.y,
            p.size,
            p.size
          );
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [season, timeOfDay, weather]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

/**
 * Pratinjau Karakter Dummy 3D Pedestal ala "Dressing Room" di Kanan Lobby Minecraft
 */
const AetherCharacterPedestalPreview: React.FC<{
  playerIdentity: PlayerAuthIdentity;
  customization: CharacterCustomization;
  isUserLoggedIn: boolean;
  onOpenDressingRoom: () => void;
}> = ({ playerIdentity, customization, isUserLoggedIn, onOpenDressingRoom }) => {
  const theme =
    ARMOR_COLOR_THEMES.find((t) => t.id === customization.colorTheme) ||
    ARMOR_COLOR_THEMES[0];
  const hair =
    HAIR_COLOR_OPTIONS.find((h) => h.id === customization.hairColor) ||
    HAIR_COLOR_OPTIONS[0];
  const weapon =
    WEAPON_TOOLS_LIST.find((w) => w.id === customization.equippedTool) ||
    WEAPON_TOOLS_LIST[0];
  const headwear =
    HEADWEAR_STYLES_LIST.find((h) => h.id === customization.headwearId) ||
    HEADWEAR_STYLES_LIST[0];

  return (
    <div className="flex flex-col items-center select-none">
      {/* NAMA DI ATAS KEPALA: Hanya teks Name tanpa kotak/bungkus dan tanpa UID */}
      <div className="mb-1.5 text-center pointer-events-none">
        <span className="text-xs font-bold text-[#FACC15] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
          {playerIdentity.displayName.trim() || 'Ksatria Aether'}
        </span>
      </div>

      {/* PANGGUNG VISUAL KARAKTER DUMMY ARTIKULASI */}
      <div
        onClick={onOpenDressingRoom}
        title="Klik untuk membuka Ruang Ganti / Kustomisasi Karakter"
        className="relative w-52 h-64 flex flex-col items-center justify-center cursor-pointer group"
      >
        {/* Cahaya Aura Belakang Karakter */}
        <div
          className="absolute w-36 h-36 rounded-full blur-2xl opacity-35 group-hover:opacity-55 transition-opacity"
          style={{ backgroundColor: theme.glowHex }}
        />

        {/* Sayap / Aksesori Punggung */}
        {customization.backAttachment === 'AETHER_WINGS' && (
          <div className="absolute top-12 flex items-center justify-between w-44 pointer-events-none">
            <div
              className="w-12 h-20 -rotate-12 rounded-tl-2xl border-l-2 border-t-2 opacity-80"
              style={{
                borderColor: theme.glowHex,
                background: `linear-gradient(135deg, ${theme.glowHex}44, transparent)`,
              }}
            />
            <div
              className="w-12 h-20 rotate-12 rounded-tr-2xl border-r-2 border-t-2 opacity-80"
              style={{
                borderColor: theme.glowHex,
                background: `linear-gradient(225deg, ${theme.glowHex}44, transparent)`,
              }}
            />
          </div>
        )}

        {/* Kepala Dummy Tanpa Wajah + Rambut / Topi / Helm */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Topi / Mahkota / Rambut Atas */}
          {customization.headwearId !== 'DUMMY_BALD' && (
            <div
              className="w-12 h-4 -mb-1 rounded-t-lg border border-white/25 shadow"
              style={{
                backgroundColor:
                  headwear.categoryLabel === 'Rambut'
                    ? hair.hex
                    : headwear.categoryLabel === 'Bangsawan'
                    ? '#FACC15'
                    : theme.primaryHex,
              }}
            />
          )}
          {/* Kepala Manekin Polos */}
          <div className="w-11 h-11 rounded-xl bg-slate-200 border-2 border-slate-400 shadow-inner flex items-center justify-center relative">
            {/* Garis Visor Halus jika Helm */}
            {(customization.headwearId === 'HELM_KNIGHT' ||
              customization.headwearId === 'HELM_RANGER_HOOD') && (
              <div
                className="w-8 h-2 rounded-sm"
                style={{ backgroundColor: theme.glowHex }}
              />
            )}
          </div>
        </div>

        {/* Badan / Torso + Lengan Kiri Kanan + Senjata */}
        <div className="relative z-10 flex items-start justify-center mt-1">
          {/* Lengan Kiri */}
          <div
            className="w-4 h-16 rounded-lg mr-1 border border-white/15 origin-top -rotate-6"
            style={{ backgroundColor: theme.primaryHex }}
          />

          {/* Torso Pakaian Atas */}
          <div
            className="w-14 h-18 rounded-xl border-2 border-white/20 flex flex-col items-center justify-between py-2 shadow-lg"
            style={{ backgroundColor: theme.primaryHex }}
          >
            <div
              className="w-6 h-6 rounded-md rotate-45 border border-white/40"
              style={{ backgroundColor: theme.glowHex }}
            />
            <div className="w-full h-2 bg-slate-950/60 border-y border-amber-400/50" />
          </div>

          {/* Lengan Kanan + Senjata yang Dipegang */}
          <div className="relative flex items-center">
            <div
              className="w-4 h-16 rounded-lg ml-1 border border-white/15 origin-top rotate-12"
              style={{ backgroundColor: theme.primaryHex }}
            />
            {/* Representasi Visual Senjata di Tangan Kanan */}
            <div className="absolute -right-7 -top-4 pointer-events-none">
              {customization.equippedTool === 'SWORD' && (
                <div className="w-2.5 h-20 rounded-t-full bg-gradient-to-t from-amber-400 via-sky-300 to-white rotate-12 shadow-[0_0_12px_#38BDF8]" />
              )}
              {customization.equippedTool === 'SPEAR' && (
                <div className="w-1.5 h-28 rounded-t-full bg-gradient-to-t from-slate-400 via-amber-300 to-sky-300 rotate-6 shadow-[0_0_12px_#38BDF8]" />
              )}
              {customization.equippedTool === 'BOW' && (
                <div className="w-6 h-18 rounded-r-full border-r-4 border-y-2 border-amber-400 rotate-6" />
              )}
              {customization.equippedTool === 'SNOWBALL' && (
                <div className="w-6 h-6 rounded-full bg-sky-100 border-2 border-sky-300 shadow-[0_0_12px_#BAE6FD]" />
              )}
            </div>
          </div>
        </div>

        {/* Celana & Kaki Berartikulasi */}
        <div className="relative z-10 flex items-start justify-center gap-2 -mt-0.5">
          <div className="w-5 h-16 rounded-b-lg bg-slate-800 border border-white/15 flex flex-col justify-end">
            <div className="w-full h-4 rounded-b-md bg-slate-950" />
          </div>
          <div className="w-5 h-16 rounded-b-lg bg-slate-800 border border-white/15 flex flex-col justify-end">
            <div className="w-full h-4 rounded-b-md bg-slate-950" />
          </div>
        </div>

        {/* Pijakan Pedestal Batu Aether */}
        <div className="w-40 h-5 -mt-1 rounded-full bg-slate-900/95 border-2 border-sky-400/50 shadow-[0_6px_25px_rgba(0,0,0,0.85)]" />
      </div>

      {/* Info Senjata & Tombol "Dressing Room" (Kustomisasi Karakter) */}
      <div className="mt-2 text-center space-y-2">
        <div className="text-[11px] text-slate-300 font-medium">
          Senjata: <span className="text-sky-300 font-bold">{weapon.name}</span> ·{' '}
          <span className="text-slate-400">{headwear.name}</span>
        </div>
        <button
          type="button"
          onClick={onOpenDressingRoom}
          className="px-5 py-2.5 rounded-lg bg-slate-900/95 hover:bg-slate-800 border-2 border-white/25 hover:border-sky-400 text-xs font-extrabold text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all mx-auto"
        >
          <Shirt className="w-4 h-4 text-purple-400" />
          <span>Dressing Room (Kustomisasi)</span>
        </button>
      </div>
    </div>
  );
};

export const AetherStandaloneLobby: React.FC<StandaloneLobbyProps> = ({
  deviceInfo,
  controlMode,
  onSelectControlMode,
  desktopSettings,
  onChangeDesktopSettings,
  mobileSettings,
  onChangeMobileSettings,
  characterCustomization,
  onChangeCharacterCustomization,
  initialTimeOfDay,
  onSelectInitialTime,
  initialWeather,
  onSelectInitialWeather,
  initialSeason,
  onSelectInitialSeason,
  initialCameraMode,
  onSelectInitialCameraMode,
  playerIdentity,
  onChangePlayerIdentity,
  sessionConfig,
  onChangeSessionConfig,
  onGoogleSignIn,
  onSignOutAuth,
  isAuthLoading = false,
  authErrorMsg = null,
  isFullscreen = false,
  onToggleFullscreen,
  onEnterWorld,
}) => {
  const clock = formatLiveGameClock(initialTimeOfDay);
  const dayPhase = getDayPhaseFromHour(initialTimeOfDay);
  const seasonMeta = getSeasonMetadata(initialSeason);

  const isUserLoggedIn = Boolean(
    playerIdentity.isLoggedIn || playerIdentity.isFirebaseVerified
  );

  // Layar aktif di dalam Lobby bergaya Minecraft:
  // MAIN_MENU -> Layar Utama saat baru masuk
  // SINGLEPLAYER_SETUP -> Layar "Create / Configure Singleplayer World"
  // MULTIPLAYER_SETUP -> Layar "Multiplayer Realms / Room Code"
  const [lobbyStep, setLobbyStep] = useState<LobbyViewStep>('MAIN_MENU');

  const [localValidationError, setLocalValidationError] = useState<string | null>(
    null
  );
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Modal Pengaturan Akun (Login / Sign Up)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [accountTab, setAccountTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPin, setLoginPin] = useState<string>('');
  const [signupUid, setSignupUid] = useState<string>(
    () => playerIdentity.uid || generateRandomPlayerUid()
  );
  const [signupName, setSignupName] = useState<string>(
    () => playerIdentity.displayName || ''
  );
  const [signupPin, setSignupPin] = useState<string>('');
  const [accountFormError, setAccountFormError] = useState<string | null>(null);
  const [accountSuccessMsg, setAccountSuccessMsg] = useState<string | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<StoredLocalAccount[]>(() =>
    getRegisteredAccounts()
  );

  // Modal Dressing Room (Kustomisasi Karakter) & Options (Kontrol Perangkat)
  const [isWardrobeModalOpen, setIsWardrobeModalOpen] = useState<boolean>(false);
  const [wardrobeModalTab, setWardrobeModalTab] = useState<
    'WARDROBE' | 'CONTROLS'
  >('WARDROBE');

  const openAccountSettings = (preferredTab?: 'LOGIN' | 'SIGNUP') => {
    setSavedAccounts(getRegisteredAccounts());
    setAccountFormError(null);
    setAccountSuccessMsg(null);
    if (preferredTab) {
      setAccountTab(preferredTab);
    } else {
      setAccountTab(getRegisteredAccounts().length > 0 ? 'LOGIN' : 'SIGNUP');
    }
    setSignupUid(playerIdentity.uid || generateRandomPlayerUid());
    setSignupName(playerIdentity.displayName || '');
    setIsAccountModalOpen(true);
  };

  const handleCopyRoomCode = () => {
    if (!sessionConfig.roomCode) return;
    navigator.clipboard?.writeText(sessionConfig.roomCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleLocalLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFormError(null);
    setAccountSuccessMsg(null);
    const res = loginLocalAccount(loginIdentifier, loginPin);
    if (!res.ok || !res.identity) {
      setAccountFormError(res.error || 'Gagal masuk ke akun.');
      return;
    }
    onChangePlayerIdentity(res.identity);
    setSavedAccounts(getRegisteredAccounts());
    setAccountSuccessMsg(`Berhasil masuk sebagai ${res.identity.displayName}!`);
    setLoginPin('');
    setLocalValidationError(null);
  };

  const handleLocalSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAccountFormError(null);
    setAccountSuccessMsg(null);
    const res = signUpLocalAccount(signupUid, signupName, signupPin);
    if (!res.ok || !res.identity) {
      setAccountFormError(res.error || 'Gagal mendaftarkan akun baru.');
      return;
    }
    onChangePlayerIdentity(res.identity);
    setSavedAccounts(getRegisteredAccounts());
    setAccountSuccessMsg(
      `Akun ${res.identity.displayName} (${res.identity.uid}) berhasil dibuat dan aktif!`
    );
    setSignupPin('');
    setLocalValidationError(null);
  };

  const handleAttemptEnterWorld = () => {
    if (sessionConfig.playMode === 'MULTIPLAYER' && !isUserLoggedIn) {
      setLocalValidationError(
        'Mode Multiplayer memerlukan Login terlebih dahulu. Silakan Login atau Sign Up pada menu Pengaturan Akun.'
      );
      openAccountSettings('LOGIN');
      return;
    }

    const check = validatePlayerIdentity(
      playerIdentity.uid,
      playerIdentity.displayName
    );
    if (!check.valid) {
      setLocalValidationError(
        check.error || 'UID dan Name wajib diisi sebelum masuk ke dalam game.'
      );
      return;
    }
    const sessionCheck = validateWorldSessionConfig(sessionConfig);
    if (!sessionCheck.valid) {
      setLocalValidationError(
        sessionCheck.error || 'Pengaturan World/Room belum lengkap.'
      );
      return;
    }
    setLocalValidationError(null);
    onEnterWorld();
  };

  // Komponen Pengaturan World (4 Musim, Waktu, Cuaca, Kamera POV) di dalam layar Singleplayer / Multiplayer
  const renderWorldEnvironmentSettings = () => (
    <div className="space-y-4">
      {/* 1. Pilihan 4 Musim Dunia */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200">
            Musim Dunia (4 Musim Aetheria)
          </span>
          <span style={{ color: seasonMeta.accentColor }} className="font-bold">
            {seasonMeta.name}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              {
                id: 'SEMI',
                label: 'Musim Semi',
                sub: 'Bunga & Segar',
                icon: Flower2,
                color: 'text-pink-400',
              },
              {
                id: 'PANAS',
                label: 'Musim Panas',
                sub: 'Cerah Tropis',
                icon: Sun,
                color: 'text-amber-300',
              },
              {
                id: 'GUGUR',
                label: 'Musim Gugur',
                sub: 'Daun Jingga',
                icon: Leaf,
                color: 'text-orange-400',
              },
              {
                id: 'DINGIN',
                label: 'Musim Dingin',
                sub: 'Salju & Es',
                icon: Snowflake,
                color: 'text-sky-300',
              },
            ] as const
          ).map((s) => {
            const IconComp = s.icon;
            const active = initialSeason === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectInitialSeason(s.id)}
                className={`p-2.5 rounded-lg text-left border-2 transition-all cursor-pointer flex items-center gap-2 ${
                  active
                    ? 'bg-sky-500/25 border-sky-400 text-white'
                    : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
                }`}
              >
                <IconComp className={`w-4 h-4 shrink-0 ${s.color}`} />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{s.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {s.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Waktu Mulai & Kondisi Cuaca */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Waktu Mulai Dunia</span>
            <span className="font-mono-tabular text-sky-400 font-bold">
              {clock.hhmm} ({dayPhase.label})
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => onSelectInitialTime(6.5)}
              className={`py-2 px-1.5 rounded-lg text-[11px] font-bold border-2 flex flex-col items-center gap-1 cursor-pointer ${
                initialTimeOfDay >= 5 && initialTimeOfDay < 9.5
                  ? 'bg-amber-500/25 border-amber-400 text-white'
                  : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
              }`}
            >
              <Sunrise className="w-3.5 h-3.5 text-amber-300" />
              <span>Pagi</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectInitialTime(12.0)}
              className={`py-2 px-1.5 rounded-lg text-[11px] font-bold border-2 flex flex-col items-center gap-1 cursor-pointer ${
                initialTimeOfDay >= 9.5 && initialTimeOfDay < 16
                  ? 'bg-sky-500/25 border-sky-400 text-white'
                  : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-sky-300" />
              <span>Siang</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectInitialTime(17.75)}
              className={`py-2 px-1.5 rounded-lg text-[11px] font-bold border-2 flex flex-col items-center gap-1 cursor-pointer ${
                initialTimeOfDay >= 16 && initialTimeOfDay < 19.25
                  ? 'bg-rose-500/25 border-rose-400 text-white'
                  : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
              }`}
            >
              <Sunset className="w-3.5 h-3.5 text-rose-400" />
              <span>Sore</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectInitialTime(22.5)}
              className={`py-2 px-1.5 rounded-lg text-[11px] font-bold border-2 flex flex-col items-center gap-1 cursor-pointer ${
                initialTimeOfDay >= 19.25 || initialTimeOfDay < 5
                  ? 'bg-indigo-500/25 border-indigo-400 text-white'
                  : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span>Malam</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-200">
            Kondisi Cuaca Awal
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: 'CERAH', label: 'Cerah', icon: Sun, color: 'text-amber-300' },
                {
                  id: 'HUJAN',
                  label: 'Hujan',
                  icon: CloudRain,
                  color: 'text-sky-400',
                },
                {
                  id: 'BADAI',
                  label: 'Badai',
                  icon: CloudLightning,
                  color: 'text-amber-400',
                },
                {
                  id: 'AETHER_MIST',
                  label: 'Kabut',
                  icon: Wind,
                  color: 'text-emerald-400',
                },
              ] as const
            ).map((w) => {
              const IconComp = w.icon;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onSelectInitialWeather(w.id)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold border-2 flex items-center gap-1.5 cursor-pointer ${
                    initialWeather === w.id
                      ? 'bg-sky-500/25 border-sky-400 text-white'
                      : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 shrink-0 ${w.color}`} />
                  <span className="truncate">{w.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Kamera POV & Senjata Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-200">
            Kamera Awal (POV)
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'FIRST_PERSON', label: '1st Person' },
                { id: 'SECOND_PERSON', label: '2nd Person' },
                { id: 'THIRD_PERSON', label: '3rd Person' },
              ] as const
            ).map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => onSelectInitialCameraMode(cam.id)}
                className={`py-2 px-2 rounded-lg text-[11px] font-bold border-2 flex items-center justify-center gap-1 cursor-pointer ${
                  initialCameraMode === cam.id
                    ? 'bg-sky-500/25 border-sky-400 text-white'
                    : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3 text-sky-400 shrink-0" />
                <span className="truncate">{cam.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-200">
            Senjata Utama Awal (Slot 1–4)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {WEAPON_TOOLS_LIST.map((w) => {
              const active = characterCustomization.equippedTool === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() =>
                    onChangeCharacterCustomization({
                      ...characterCustomization,
                      equippedTool: w.id,
                    })
                  }
                  className={`py-2 px-1.5 rounded-lg border-2 text-center cursor-pointer transition-all ${
                    active
                      ? 'bg-emerald-500/25 border-emerald-400 text-white'
                      : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-[10px] font-bold truncate">
                    {w.name.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full bg-[#060A12] text-slate-100 flex flex-col justify-between overflow-x-hidden select-none">
      {/* LATAR BELAKANG PANORAMA DUNIA HIDUP (Seperti Panorama Title Screen Minecraft) */}
      <AetherLobbyPanoramaBackdrop
        season={initialSeason}
        timeOfDay={initialTimeOfDay}
        weather={initialWeather}
      />

      {/* Lapisan Scrim Vignette Halus agar Teks & Menu Utama Tajam */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/35 to-slate-950/80 pointer-events-none z-0" />

      {/* ===================================================================== */}
      {/* TOP BAR ALA MINECRAFT: KIRI = PROFIL GAMERTag/AKUN, KANAN = JAM/MODE */}
      {/* ===================================================================== */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 flex flex-wrap items-center justify-between gap-3">
        {/* Kiri Atas: Badge Akun Pemain (Gamertag / Login Status) */}
        <button
          type="button"
          onClick={() => openAccountSettings()}
          className="px-3.5 py-2 rounded-lg bg-slate-950/85 hover:bg-slate-900 border-2 border-white/20 hover:border-sky-400 flex items-center gap-2.5 cursor-pointer transition-all shadow-lg backdrop-blur-md"
        >
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isUserLoggedIn ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <div className="text-left">
            <div className="text-xs font-extrabold text-white leading-none">
              {isUserLoggedIn
                ? playerIdentity.displayName
                : 'Belum Login (Mode Tamu)'}
            </div>
            <div className="text-[10px] font-mono-tabular text-sky-300 mt-0.5">
              {isUserLoggedIn
                ? `UID: ${playerIdentity.uid.slice(0, 14)}`
                : 'Klik untuk Login / Sign Up Akun'}
            </div>
          </div>
        </button>

        {/* Kanan Atas: Status Dunia & Pemilih Cepat Perangkat */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/80 border border-white/15 text-xs font-mono-tabular text-slate-300 backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white font-bold">{clock.hhmm}</span>
            <span>·</span>
            <span style={{ color: seasonMeta.accentColor }} className="font-bold">
              {seasonMeta.name}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              onSelectControlMode(
                controlMode === 'DESKTOP' ? 'MOBILE' : 'DESKTOP'
              )
            }
            className="px-3 py-2 rounded-lg bg-slate-950/85 hover:bg-slate-900 border-2 border-white/20 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
            title="Klik untuk mengganti mode kontrol Desktop PC atau Ponsel"
          >
            {controlMode === 'DESKTOP' ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                <span>Desktop PC</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mobile Touch</span>
              </>
            )}
          </button>

          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`px-3 py-2 rounded-lg border-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer backdrop-blur-md transition-all ${
                isFullscreen
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                  : 'bg-slate-950/85 hover:bg-slate-900 border-white/20 text-slate-200 hover:border-sky-400'
              }`}
              title="Aktifkan / Keluar dari Layar Penuh (Fullscreen)"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Keluar Penuh</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Layar Penuh</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* ===================================================================== */}
      {/* TENGAH LAYAR: TATA LETAK LOBBY UTAMA ALA MINECRAFT                     */}
      {/* ===================================================================== */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 my-auto py-6">
        {lobbyStep === 'MAIN_MENU' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Spacer Kiri di Layar Lebar agar Menu Utama Tepat di Tengah (seperti Minecraft) */}
            <div className="hidden lg:block lg:col-span-3" />

            {/* KOLOM TENGAH (6 KOLOM): LOGO UTAMA & DERETAN TOMBOL VERTIKAL ALA MINECRAFT */}
            <div className="lg:col-span-6 flex flex-col items-center text-center">
              {/* LOGO EMBLEM UTAMA */}
              <div className="mb-8 select-none">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-500/15 border border-sky-400/40 text-sky-300 text-[11px] font-bold tracking-widest uppercase mb-2">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Four Seasons 3D Sandbox</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-display drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                  AETHER WORLD
                </h1>
                <div className="text-xs sm:text-sm font-bold text-amber-300 tracking-wider uppercase mt-1 drop-shadow">
                  Web 3D Edition · Singleplayer & Multiplayer Realms
                </div>
              </div>

              {/* STACK TOMBOL UTAMA ALA MINECRAFT (Singleplayer -> Multiplayer -> Account & Options) */}
              <div className="w-full max-w-sm space-y-3">
                {/* 1. TOMBOL SINGLEPLAYER (ATAS) */}
                <button
                  type="button"
                  onClick={() => {
                    setLocalValidationError(null);
                    onChangeSessionConfig({
                      ...sessionConfig,
                      playMode: 'SINGLE_PLAYER',
                    });
                    setLobbyStep('SINGLEPLAYER_SETUP');
                  }}
                  className="w-full py-3.5 px-5 rounded-lg bg-slate-900/95 hover:bg-sky-500 hover:text-slate-950 text-white border-2 border-white/30 hover:border-sky-300 font-extrabold text-base tracking-wide shadow-[0_5px_0_rgba(15,23,42,0.95)] active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <User className="w-5 h-5 text-sky-400 group-hover:text-slate-950 transition-colors" />
                  <span>Singleplayer</span>
                </button>

                {/* 2. TOMBOL MULTIPLAYER (DI BAWAHNYA — PERLU LOGIN TERLEBIH DAHULU) */}
                <button
                  type="button"
                  onClick={() => {
                    setLocalValidationError(null);
                    onChangeSessionConfig({
                      ...sessionConfig,
                      playMode: 'MULTIPLAYER',
                      roomCode:
                        sessionConfig.roomCode || generateWorldRoomCode(),
                    });
                    setLobbyStep('MULTIPLAYER_SETUP');
                  }}
                  className="w-full py-3.5 px-5 rounded-lg bg-slate-900/95 hover:bg-emerald-500 hover:text-slate-950 text-white border-2 border-white/30 hover:border-emerald-300 font-extrabold text-base tracking-wide shadow-[0_5px_0_rgba(15,23,42,0.95)] active:translate-y-0.5 transition-all flex flex-col items-center justify-center cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-emerald-400 group-hover:text-slate-950 transition-colors" />
                    <span>Multiplayer</span>
                    {!isUserLoggedIn && (
                      <Lock className="w-4 h-4 text-amber-400 group-hover:text-slate-950" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-900 mt-0.5">
                    {isUserLoggedIn
                      ? `Siap Bermain (${playerIdentity.displayName})`
                      : 'Perlu Login Terlebih Dahulu'}
                  </span>
                </button>

                {/* 3. BARIS BAWAH: SETTING AKUN (LOGIN/SIGNUP) & OPTIONS (KONTROL/DUNIA) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => openAccountSettings()}
                    className="py-3 px-3 rounded-lg bg-slate-900/95 hover:bg-slate-800 text-white border-2 border-white/25 hover:border-sky-400 font-bold text-xs shadow-[0_4px_0_rgba(15,23,42,0.95)] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate">
                      {isUserLoggedIn ? 'Akun Saya' : 'Login / Sign Up'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWardrobeModalTab('CONTROLS');
                      setIsWardrobeModalOpen(true);
                    }}
                    className="py-3 px-3 rounded-lg bg-slate-900/95 hover:bg-slate-800 text-white border-2 border-white/25 hover:border-purple-400 font-bold text-xs shadow-[0_4px_0_rgba(15,23,42,0.95)] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">Options & Kontrol...</span>
                  </button>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN (3 KOLOM): PEDESTAL KARAKTER DUMMY & DRESSING ROOM ALA MINECRAFT BEDROCK */}
            <div className="lg:col-span-3 flex justify-center">
              <AetherCharacterPedestalPreview
                playerIdentity={playerIdentity}
                customization={characterCustomization}
                isUserLoggedIn={isUserLoggedIn}
                onOpenDressingRoom={() => {
                  setWardrobeModalTab('WARDROBE');
                  setIsWardrobeModalOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUB-LAYAR 1: PENGATURAN WORLD SINGLEPLAYER (Setelah Klik Singleplayer) */}
        {/* ===================================================================== */}
        {lobbyStep === 'SINGLEPLAYER_SETUP' && (
          <div className="max-w-2xl mx-auto bg-slate-950/90 border-2 border-white/25 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/15 pb-3.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLobbyStep('MAIN_MENU')}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 cursor-pointer"
                  title="Kembali ke Lobby Utama"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-extrabold text-white font-display">
                    Singleplayer — Buat & Atur World
                  </h2>
                  <p className="text-xs text-slate-400">
                    Atur nama karakter, musim, waktu, dan cuaca sebelum memulai dunia solo Anda
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-sky-400">Mode Solo</span>
            </div>

            {localValidationError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{localValidationError}</span>
              </div>
            )}

            {/* Nama Karakter di Atas Kepala */}
            <div className="bg-slate-900/90 border border-white/15 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-white block">
                  Nama Karakter (Tampil di Atas Kepala)
                </label>
                <span className="text-[11px] text-slate-400">
                  Nama ini akan tampil pada nametag 3D karakter Anda.
                </span>
              </div>
              <input
                type="text"
                maxLength={24}
                value={playerIdentity.displayName}
                onChange={(e) => {
                  setLocalValidationError(null);
                  onChangePlayerIdentity({
                    ...playerIdentity,
                    displayName: e.target.value.slice(0, 24),
                  });
                }}
                placeholder="Nama Karakter..."
                className="sm:w-60 px-3.5 py-2 rounded-lg bg-slate-950 border border-white/20 focus:border-sky-400 focus:outline-none text-xs font-bold text-white"
              />
            </div>

            {/* Pengaturan World (4 Musim, Waktu, Cuaca, Kamera, Senjata) */}
            {renderWorldEnvironmentSettings()}

            {/* Bar Tombol Bawah ala Minecraft: Back vs Create / Play World */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/15">
              <button
                type="button"
                onClick={() => setLobbyStep('MAIN_MENU')}
                className="py-3 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border-2 border-white/20 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Lobby</span>
              </button>

              <button
                type="button"
                onClick={handleAttemptEnterWorld}
                className="sm:col-span-2 py-3.5 px-6 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm shadow-[0_4px_0_#0369A1] active:translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  Mulai Singleplayer World (&ldquo;
                  {playerIdentity.displayName.trim() || 'Ksatria'}&rdquo;)
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SUB-LAYAR 2: MULTIPLAYER REALMS / ROOMS (Setelah Klik Multiplayer)     */}
        {/* ===================================================================== */}
        {lobbyStep === 'MULTIPLAYER_SETUP' && (
          <div className="max-w-2xl mx-auto bg-slate-950/90 border-2 border-white/25 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/15 pb-3.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLobbyStep('MAIN_MENU')}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 cursor-pointer"
                  title="Kembali ke Lobby Utama"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-extrabold text-white font-display">
                    Multiplayer — Buat atau Masuk World / Room
                  </h2>
                  <p className="text-xs text-slate-400">
                    Bermain bersama secara real-time lengkap dengan Kolom Chat & Nametag 3D
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-bold ${
                  isUserLoggedIn ? 'text-emerald-400' : 'text-amber-300'
                }`}
              >
                {isUserLoggedIn ? 'Akun Terverifikasi' : 'Wajib Login'}
              </span>
            </div>

            {(localValidationError || authErrorMsg) && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{localValidationError || authErrorMsg}</span>
              </div>
            )}

            {!isUserLoggedIn ? (
              /* GERBANG WAJIB LOGIN TERLEBIH DAHULU UNTUK MULTIPLAYER */
              <div className="bg-slate-900/95 border-2 border-amber-400/40 rounded-xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-extrabold text-white font-display">
                    Perlu Login Terlebih Dahulu untuk Multiplayer
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Untuk membuat World/Room baru (menghasilkan Code Admin) atau masuk ke World teman serta menggunakan Kolom Chat, silakan <strong>Login</strong> atau <strong>Sign Up</strong> akun terlebih dahulu.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => openAccountSettings('LOGIN')}
                    className="py-3 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login Akun</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAccountSettings('SIGNUP')}
                    className="py-3 px-4 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up Baru</span>
                  </button>

                  <button
                    type="button"
                    disabled={isAuthLoading}
                    onClick={onGoogleSignIn}
                    className="py-3 px-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Globe className="w-4 h-4" />
                    <span>
                      {isAuthLoading ? 'Menghubungkan...' : 'Login Google'}
                    </span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setLobbyStep('MAIN_MENU')}
                    className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    ← Kembali ke Menu Utama Lobby
                  </button>
                </div>
              </div>
            ) : (
              /* SUDAH LOGIN: TAMPILKAN OPSI BUAT WORLD/ROOM ATAU MASUK VIA CODE */
              <div className="space-y-4">
                {/* Bar Identitas Aktif */}
                <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">Akun Aktif:</span>
                    <span className="font-extrabold text-white">
                      {playerIdentity.displayName}
                    </span>
                    <span className="font-mono-tabular text-sky-300 text-[11px]">
                      ({playerIdentity.uid})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAccountSettings()}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    Ganti / Atur Akun
                  </button>
                </div>

                {/* Tab Pilihan Multiplayer: Buat World/Room (Admin) vs Masuk World/Room (Via Code) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLocalValidationError(null);
                      const generated =
                        sessionConfig.roomCode.length >= 4
                          ? sessionConfig.roomCode
                          : generateWorldRoomCode();
                      onChangeSessionConfig({
                        ...sessionConfig,
                        roomAction: 'CREATE_ROOM',
                        roomCode: generated,
                        roomName:
                          sessionConfig.roomName ||
                          `Dunia ${playerIdentity.displayName.trim() || 'Aether'}`,
                      });
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      sessionConfig.roomAction === 'CREATE_ROOM'
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Buat World / Room (Admin)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Hasilkan Code Room & atur dunia
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLocalValidationError(null);
                      onChangeSessionConfig({
                        ...sessionConfig,
                        roomAction: 'JOIN_ROOM',
                      });
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      sessionConfig.roomAction === 'JOIN_ROOM'
                        ? 'bg-sky-500/20 border-sky-400 text-white'
                        : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
                    }`}
                  >
                    <DoorOpen className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Masuk World / Room (Code)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Gabung dengan Code dari Admin
                      </div>
                    </div>
                  </button>
                </div>

                {sessionConfig.roomAction === 'CREATE_ROOM' ? (
                  <div className="space-y-4">
                    <div className="bg-slate-900/90 border border-amber-400/35 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 mb-1">
                          Nama World / Room Anda (Admin)
                        </label>
                        <input
                          type="text"
                          maxLength={32}
                          value={sessionConfig.roomName}
                          onChange={(e) => {
                            setLocalValidationError(null);
                            onChangeSessionConfig({
                              ...sessionConfig,
                              roomName: e.target.value.slice(0, 32),
                            });
                          }}
                          placeholder="Contoh: Sanctuary Aetheria"
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/20 focus:border-amber-400 focus:outline-none text-xs font-bold text-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-emerald-300">
                            Kode World / Room (Admin Code)
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              onChangeSessionConfig({
                                ...sessionConfig,
                                roomCode: generateWorldRoomCode(),
                              })
                            }
                            className="text-[10px] text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Acak Code</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            maxLength={16}
                            value={sessionConfig.roomCode}
                            onChange={(e) => {
                              setLocalValidationError(null);
                              onChangeSessionConfig({
                                ...sessionConfig,
                                roomCode: sanitizeRoomCode(e.target.value),
                              });
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-amber-400/50 text-sm font-extrabold font-mono-tabular tracking-widest text-amber-300 uppercase focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopyRoomCode}
                            className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedCode ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Disalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pengaturan World untuk Room yang dibuat Admin */}
                    {renderWorldEnvironmentSettings()}
                  </div>
                ) : (
                  <div className="bg-slate-900/90 border border-sky-400/35 rounded-xl p-4 space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-sky-300 mb-1.5">
                        Masukkan Kode World / Room Tujuan
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        value={sessionConfig.roomCode}
                        onChange={(e) => {
                          setLocalValidationError(null);
                          onChangeSessionConfig({
                            ...sessionConfig,
                            roomCode: sanitizeRoomCode(e.target.value),
                          });
                        }}
                        placeholder="Ketik Kode Room dari Admin (contoh: AE7K9M)..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-sky-400/50 focus:border-sky-400 focus:outline-none text-sm font-extrabold font-mono-tabular tracking-widest text-sky-200 uppercase"
                      />
                      <span className="block text-[11px] text-slate-400 mt-1">
                        Masukkan kode dari pemilik/Admin World untuk bergabung ke ruang & kolom chat yang sama.
                      </span>
                    </div>
                  </div>
                )}

                {/* Bar Tombol Bawah: Back vs Masuk Multiplayer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => setLobbyStep('MAIN_MENU')}
                    className="py-3 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border-2 border-white/20 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Lobby</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAttemptEnterWorld}
                    className="sm:col-span-2 py-3.5 px-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-[0_4px_0_#047857] active:translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {sessionConfig.roomAction === 'CREATE_ROOM'
                        ? `Buat World/Room [${sessionConfig.roomCode || '---'}] & Masuk`
                        : `Masuk World/Room [${sessionConfig.roomCode || '---'}] Sekarang`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* FOOTER BAR ALA MINECRAFT TITLE SCREEN                                 */}
      {/* ===================================================================== */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 font-medium">
        <span>Aether World 3D · Babylon.js Four Seasons Engine</span>
        <span>
          {isUserLoggedIn
            ? `Logged in as ${playerIdentity.displayName} (${playerIdentity.uid})`
            : 'Singleplayer Ready · Login untuk Multiplayer'}
        </span>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: SETTING PENGATURAN AKUN (LOGIN / SIGN UP / KELOLA AKUN)          */}
      {/* ========================================================================= */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#0B1220] border-2 border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Pengaturan Akun (Login & Sign Up)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kelola UID & Name (Nickname di atas kepala) untuk mode Multiplayer
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Akun Saat Ini */}
            <div className="bg-slate-950/90 border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-slate-400">
                  Status Sesi Saat Ini
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {isUserLoggedIn ? (
                    <span className="text-emerald-400">
                      Sudah Login: {playerIdentity.displayName} (
                      {playerIdentity.uid})
                    </span>
                  ) : (
                    <span className="text-amber-300">
                      Belum Login (Silakan Login atau Sign Up di bawah)
                    </span>
                  )}
                </div>
              </div>
              {isUserLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    onSignOutAuth();
                    setAccountSuccessMsg('Anda telah keluar dari akun.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>

            {/* Pemilih Tab: LOGIN vs SIGN UP */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAccountTab('LOGIN');
                  setAccountFormError(null);
                  setAccountSuccessMsg(null);
                }}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  accountTab === 'LOGIN'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Login (Masuk Akun)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountTab('SIGNUP');
                  setAccountFormError(null);
                  setAccountSuccessMsg(null);
                }}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  accountTab === 'SIGNUP'
                    ? 'bg-purple-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up (Daftar Baru)</span>
              </button>
            </div>

            {accountFormError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{accountFormError}</span>
              </div>
            )}

            {accountSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{accountSuccessMsg}</span>
              </div>
            )}

            {accountTab === 'LOGIN' ? (
              <form onSubmit={handleLocalLoginSubmit} className="space-y-4">
                {savedAccounts.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Pilih Cepat Akun Tersimpan di Perangkat Ini:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {savedAccounts.map((acc) => (
                        <button
                          key={acc.uid}
                          type="button"
                          onClick={() => {
                            setLoginIdentifier(acc.uid);
                            setAccountFormError(null);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                            loginIdentifier === acc.uid
                              ? 'bg-sky-500/20 border-sky-400 text-white'
                              : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          {acc.displayName} ({acc.uid})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    UID atau Name (Nickname) Akun
                  </label>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Masukkan UID (mis. AETHER_7F9K2M) atau Nickname..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 focus:border-sky-400 focus:outline-none text-xs font-semibold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Kata Sandi / PIN Akun
                  </label>
                  <input
                    type="password"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="Masukkan Kata Sandi / PIN..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 focus:border-sky-400 focus:outline-none text-xs font-semibold text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login ke Akun Aether</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleLocalSignUpSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-200">
                      UID Pemain Baru (Wajib)
                    </label>
                    <button
                      type="button"
                      onClick={() => setSignupUid(generateRandomPlayerUid())}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Generate UID</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={signupUid}
                    onChange={(e) =>
                      setSignupUid(sanitizePlayerUid(e.target.value))
                    }
                    placeholder="Contoh: AETHER_7F9K2M"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 focus:border-purple-400 focus:outline-none text-xs font-mono-tabular text-sky-200"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-200">
                      Name / Nickname di Atas Kepala (Wajib)
                    </label>
                    <span className="text-[11px] font-mono-tabular text-slate-400">
                      {signupName.trim().length}/24
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={24}
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value.slice(0, 24))}
                    placeholder="Contoh: Arshandy_Paladin"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 focus:border-purple-400 focus:outline-none text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Buat Kata Sandi / PIN (Minimal 3 Karakter)
                  </label>
                  <input
                    type="password"
                    value={signupPin}
                    onChange={(e) => setSignupPin(e.target.value)}
                    placeholder="Buat Kata Sandi / PIN untuk login kembali..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 focus:border-purple-400 focus:outline-none text-xs font-semibold text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar & Aktifkan Akun Sekarang</span>
                </button>
              </form>
            )}

            {/* Opsi Alternatif: Login Google Cloud Sync */}
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <div className="text-[11px] text-slate-400 text-center">
                Atau gunakan akun Google untuk sinkronisasi profil Cloud otomatis:
              </div>
              <button
                type="button"
                disabled={isAuthLoading}
                onClick={async () => {
                  await onGoogleSignIn();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Globe className="w-4 h-4" />
                <span>
                  {isAuthLoading
                    ? 'Menghubungkan Google...'
                    : 'Login / Sign Up dengan Google (Cloud Sync)'}
                </span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DRESSING ROOM (KUSTOMISASI KARAKTER) & OPTIONS (KONTROL)         */}
      {/* ========================================================================= */}
      {isWardrobeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-[#0B1220] border-2 border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Shirt className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Dressing Room & Options (Kustomisasi Karakter & Kontrol)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pilih Setelan Karakter, Rambut/Topi/Helm, Pakaian, Celana, Aksesori & Sensitivitas Perangkat
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWardrobeModalOpen(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => setWardrobeModalTab('WARDROBE')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  wardrobeModalTab === 'WARDROBE'
                    ? 'bg-purple-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Swords className="w-4 h-4" />
                <span>Dressing Room (Pakaian & Senjata)</span>
              </button>
              <button
                type="button"
                onClick={() => setWardrobeModalTab('CONTROLS')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                  wardrobeModalTab === 'CONTROLS'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <MousePointer className="w-4 h-4" />
                <span>Options (Kontrol Desktop & Ponsel)</span>
              </button>
            </div>

            {wardrobeModalTab === 'WARDROBE' ? (
              <div className="space-y-4">
                {/* Preset Cepat Archetype */}
                <div className="bg-slate-950/90 border border-white/10 rounded-xl p-4 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-200">
                    Preset Setelan Karakter Dummy:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CHARACTER_MODELS_LIST.map((model) => {
                      const isSelected =
                        characterCustomization.modelId === model.id;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() =>
                            onChangeCharacterCustomization(
                              applyModelPresetToCustomization(
                                characterCustomization,
                                model.id
                              )
                            )
                          }
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-500/25 border-purple-400 text-white'
                              : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold text-white truncate">
                            {model.name}
                          </div>
                          <div className="text-[10px] text-sky-300 truncate mt-0.5">
                            {model.roleTitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Kepala Dummy: Rambut, Topi, Helm */}
                <div className="bg-slate-950/90 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-purple-300">
                      Bagian Kepala Dummy (Rambut / Topi / Helm — Wajah Polos Dummy)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">
                        Warna Rambut:
                      </span>
                      {HAIR_COLOR_OPTIONS.map((hc) => {
                        const active =
                          characterCustomization.hairColor === hc.id;
                        return (
                          <button
                            key={hc.id}
                            type="button"
                            onClick={() =>
                              onChangeCharacterCustomization({
                                ...characterCustomization,
                                hairColor: hc.id,
                              })
                            }
                            title={hc.name}
                            style={{ backgroundColor: hc.hex }}
                            className={`w-4 h-4 rounded-full cursor-pointer transition-transform ${
                              active
                                ? 'ring-2 ring-sky-400 scale-115'
                                : 'opacity-70 hover:opacity-100 border border-white/25'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {HEADWEAR_STYLES_LIST.map((hw) => {
                      const active =
                        characterCustomization.headwearId === hw.id;
                      return (
                        <button
                          key={hw.id}
                          type="button"
                          onClick={() =>
                            onChangeCharacterCustomization({
                              ...characterCustomization,
                              headwearId: hw.id,
                            })
                          }
                          className={`p-2 rounded-lg border text-left cursor-pointer ${
                            active
                              ? 'bg-purple-500/25 border-purple-400 text-white'
                              : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-[9px] text-purple-300 font-bold">
                            {hw.categoryLabel}
                          </div>
                          <div className="text-[11px] font-bold text-white truncate">
                            {hw.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pakaian Atas & Celana */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/90 border border-white/10 rounded-xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-sky-300">
                      Pakaian Atas / Baju (Top Outfit)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TOP_OUTFIT_STYLES_LIST.map((top) => {
                        const active =
                          characterCustomization.topOutfitId === top.id;
                        return (
                          <button
                            key={top.id}
                            type="button"
                            onClick={() =>
                              onChangeCharacterCustomization({
                                ...characterCustomization,
                                topOutfitId: top.id,
                              })
                            }
                            className={`p-2 rounded-lg border text-left cursor-pointer ${
                              active
                                ? 'bg-sky-500/25 border-sky-400 text-white'
                                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-bold truncate">
                              {top.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {top.subtitle}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-950/90 border border-white/10 rounded-xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-emerald-300">
                      Celana / Bawahan Berartikulasi (Pants)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {BOTTOM_PANTS_STYLES_LIST.map((p) => {
                        const active =
                          characterCustomization.bottomPantsId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() =>
                              onChangeCharacterCustomization({
                                ...characterCustomization,
                                bottomPantsId: p.id,
                              })
                            }
                            className={`p-2 rounded-lg border text-left cursor-pointer ${
                              active
                                ? 'bg-emerald-500/25 border-emerald-400 text-white'
                                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-bold truncate">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {p.subtitle}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Aksesori Badan, Punggung & Warna */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/90 border border-white/10 rounded-xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-amber-300">
                      Aksesori Badan
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {BODY_ACCESSORY_STYLES_LIST.map((bAcc) => {
                        const active =
                          characterCustomization.bodyAccessoryId === bAcc.id;
                        return (
                          <button
                            key={bAcc.id}
                            type="button"
                            onClick={() =>
                              onChangeCharacterCustomization({
                                ...characterCustomization,
                                bodyAccessoryId: bAcc.id,
                              })
                            }
                            className={`py-1.5 px-2.5 rounded-lg border text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                              active
                                ? 'bg-amber-500/20 border-amber-400 text-white'
                                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="truncate">{bAcc.name}</span>
                            <span className="text-[10px] text-amber-300 ml-1">
                              {bAcc.categoryLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-950/90 border border-white/10 rounded-xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Aksesori Punggung</span>
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {BACK_ATTACHMENTS_LIST.map((acc) => {
                        const active =
                          characterCustomization.backAttachment === acc.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() =>
                              onChangeCharacterCustomization({
                                ...characterCustomization,
                                backAttachment: acc.id,
                              })
                            }
                            className={`py-1.5 px-2.5 rounded-lg border text-left text-xs font-semibold truncate cursor-pointer ${
                              active
                                ? 'bg-purple-500/25 border-purple-400 text-white'
                                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {acc.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-950/90 border border-white/10 rounded-xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Tema Warna Pakaian</span>
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {ARMOR_COLOR_THEMES.map((theme) => {
                        const active =
                          characterCustomization.colorTheme === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() =>
                              onChangeCharacterCustomization({
                                ...characterCustomization,
                                colorTheme: theme.id,
                              })
                            }
                            className={`p-1.5 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
                              active
                                ? 'bg-white/15 border-sky-400 text-white'
                                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/30"
                              style={{
                                background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.glowHex})`,
                              }}
                            />
                            <span className="text-xs font-semibold truncate">
                              {theme.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-950/90 border border-sky-500/25 rounded-xl p-4 space-y-3.5">
                  <div className="text-xs font-bold text-sky-300">
                    Pengaturan Kontrol Desktop (Mouse & Keyboard)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">
                          Sensitivitas Mouse
                        </span>
                        <span className="font-mono-tabular text-sky-400 font-bold">
                          {desktopSettings.mouseSensitivity.toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="2.5"
                        step="0.1"
                        value={desktopSettings.mouseSensitivity}
                        onChange={(e) =>
                          onChangeDesktopSettings({
                            ...desktopSettings,
                            mouseSensitivity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">
                          Kecepatan Scroll Zoom
                        </span>
                        <span className="font-mono-tabular text-sky-400 font-bold">
                          {desktopSettings.zoomSensitivity.toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={desktopSettings.zoomSensitivity}
                        onChange={(e) =>
                          onChangeDesktopSettings({
                            ...desktopSettings,
                            zoomSensitivity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/90 border border-emerald-500/25 rounded-xl p-4 space-y-3.5">
                  <div className="text-xs font-bold text-emerald-300">
                    Pengaturan Kontrol Ponsel (Touch & Virtual Analog)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">
                          Sensitivitas Geser Kamera
                        </span>
                        <span className="font-mono-tabular text-emerald-400 font-bold">
                          {mobileSettings.touchSensitivity.toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="2.5"
                        step="0.1"
                        value={mobileSettings.touchSensitivity}
                        onChange={(e) =>
                          onChangeMobileSettings({
                            ...mobileSettings,
                            touchSensitivity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">
                          Ukuran Analog & Tombol
                        </span>
                        <span className="font-mono-tabular text-emerald-400 font-bold">
                          {Math.round(mobileSettings.joystickScale * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.85"
                        max="1.25"
                        step="0.05"
                        value={mobileSettings.joystickScale}
                        onChange={(e) =>
                          onChangeMobileSettings({
                            ...mobileSettings,
                            joystickScale: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsWardrobeModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold cursor-pointer"
              >
                Simpan & Kembali ke Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
