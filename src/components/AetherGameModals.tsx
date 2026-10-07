/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Sparkles,
  Smartphone,
  Monitor,
  CheckCircle2,
  Clock,
  Cpu,
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
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Activity,
} from 'lucide-react';
import {
  PlayerAuthIdentity,
  OnlinePlayerSummary,
  WorldSessionConfig,
  generateRandomPlayerUid,
  generateWorldRoomCode,
  sanitizePlayerUid,
  sanitizeRoomCode,
  validatePlayerIdentity,
  validateWorldSessionConfig,
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
import { AtmospherePreset, CameraPerspective } from './AetherBabylonWorld';

interface StandaloneLobbyProps {
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
  onEnterWorld: () => void;
}

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
  onEnterWorld,
}) => {
  const clock = formatLiveGameClock(initialTimeOfDay);
  const dayPhase = getDayPhaseFromHour(initialTimeOfDay);
  const seasonMeta = getSeasonMetadata(initialSeason);
  const [localValidationError, setLocalValidationError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleCopyRoomCode = () => {
    if (!sessionConfig.roomCode) return;
    navigator.clipboard?.writeText(sessionConfig.roomCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleAttemptEnterWorld = () => {
    const check = validatePlayerIdentity(playerIdentity.uid, playerIdentity.displayName);
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

  return (
    <div className="min-h-screen w-full bg-[#060A12] text-slate-100 flex flex-col justify-between p-4 sm:p-8 overflow-y-auto">
      {/* Header Bar Lobby */}
      <header className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-sky-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white font-display">
              AETHER WORLD-WEB
            </div>
            <div className="text-[11px] text-slate-400">
              Lobby Persiapan Sebelum Memulai Dunia 3D
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono-tabular">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white font-bold">{clock.hhmm}</span>
            <span className="text-slate-500">·</span>
            <span style={{ color: dayPhase.accentColor }} className="font-semibold">
              {dayPhase.label}
            </span>
            <span className="text-[11px] text-slate-400">(1 Hari = 20m)</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
            <span style={{ color: seasonMeta.accentColor }} className="font-bold">
              {seasonMeta.name}
            </span>
          </div>
        </div>
      </header>

      {/* Konten Utama Lobby */}
      <div className="max-w-6xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (7 Kolom): Pemeriksaan Perangkat & Pengaturan Pasti Desktop vs Mobile */}
        <div className="lg:col-span-7 bg-[#0B1220] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[11px] font-semibold mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BABYLON.JS 3D · MULTIPLAYER REAL-TIME · 4 MUSIM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
              Lobby Autentikasi & Konfigurasi Aetheria
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-1.5">
              Masuk ke dalam dunia <strong>Multiplayer</strong> memerlukan <strong>UID</strong> dan{' '}
              <strong>Name (Nickname)</strong> yang akan ditampilkan melayang di atas kepala karakter Anda.
            </p>
          </div>

          {/* 0. PANEL AUTENTIKASI PEMAIN (WAJIB UID & NAME / NICKNAME DI ATAS KEPALA) */}
          <div className="bg-slate-900/95 border-2 border-emerald-500/40 rounded-xl p-4 sm:p-5 space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Autentikasi Multiplayer (Wajib UID & Name)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {playerIdentity.isFirebaseVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Firebase Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    Sesi Aktif · Siap Multiplayer
                  </span>
                )}
              </div>
            </div>

            {/* Preview Badge Nickname di Atas Kepala Karakter */}
            <div className="bg-slate-950/90 border border-sky-400/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-[#061022] border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)] text-center min-w-[165px]">
                  <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono-tabular text-sky-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>UID: {(playerIdentity.uid || '---').slice(0, 14)}</span>
                  </div>
                  <div className="text-sm font-extrabold text-white tracking-tight truncate mt-0.5">
                    {playerIdentity.displayName.trim() || 'Nama Karakter'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 leading-snug">
                  <div className="font-bold text-white">Pratinjau Nametag 3D di Atas Kepala</div>
                  <div className="text-slate-400">
                    Pemain lain di dunia Aetheria akan melihat Nickname & UID ini di atas kepala Anda.
                  </div>
                </div>
              </div>

              {playerIdentity.isFirebaseVerified ? (
                <button
                  type="button"
                  onClick={onSignOutAuth}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Ganti Akun</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isAuthLoading}
                  onClick={onGoogleSignIn}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isAuthLoading ? 'Menghubungkan...' : 'Login Google (Cloud Sync)'}</span>
                </button>
              )}
            </div>

            {/* Form Input UID & Name (Nickname) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-sky-400" />
                    <span>UID Pemain (Wajib)</span>
                  </label>
                  {!playerIdentity.isFirebaseVerified && (
                    <button
                      type="button"
                      onClick={() =>
                        onChangePlayerIdentity({
                          ...playerIdentity,
                          uid: generateRandomPlayerUid(),
                        })
                      }
                      className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Generate UID</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={playerIdentity.uid}
                  disabled={playerIdentity.isFirebaseVerified}
                  onChange={(e) => {
                    setLocalValidationError(null);
                    onChangePlayerIdentity({
                      ...playerIdentity,
                      uid: sanitizePlayerUid(e.target.value),
                    });
                  }}
                  placeholder="Contoh: AETHER_7F9K2M"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/15 focus:border-sky-400 focus:outline-none text-xs font-mono-tabular text-sky-200 disabled:opacity-75"
                />
                <span className="block text-[10px] text-slate-400 mt-1">
                  {playerIdentity.isFirebaseVerified
                    ? 'UID terikat resmi dengan akun Firebase Auth Anda.'
                    : 'ID unik karakter Anda untuk sesi Multiplayer (3–64 karakter).'}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>Name / Nickname di Atas Kepala (Wajib)</span>
                  </label>
                  <span className="text-[10px] font-mono-tabular text-slate-400">
                    {playerIdentity.displayName.trim().length}/24
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
                  placeholder="Masukkan Nickname Anda..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/15 focus:border-emerald-400 focus:outline-none text-xs font-bold text-white"
                />
                <span className="block text-[10px] text-slate-400 mt-1">
                  Minimal 2 karakter. Ditampilkan langsung di atas kepala karakter 3D.
                </span>
              </div>
            </div>

            {(localValidationError || authErrorMsg) && (
              <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{localValidationError || authErrorMsg}</span>
              </div>
            )}

            {/* PEMILIH MODE PERMAINAN: SINGLE PLAYER vs MULTIPLAYER (BUAT WORLD/ROOM vs MASUK WORLD/ROOM) */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Pilih Mode Dunia: Single Player atau Multiplayer
                </span>
                <span className="text-[10px] font-mono-tabular text-slate-400">
                  {sessionConfig.playMode === 'SINGLE_PLAYER'
                    ? 'Mode Solo Offline'
                    : sessionConfig.roomAction === 'CREATE_ROOM'
                    ? `Admin Room [${sessionConfig.roomCode}]`
                    : `Join Room [${sessionConfig.roomCode || '---'}]`}
                </span>
              </div>

              {/* Tombol Utama: Single Player vs Multiplayer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setLocalValidationError(null);
                    onChangeSessionConfig({
                      ...sessionConfig,
                      playMode: 'SINGLE_PLAYER',
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    sessionConfig.playMode === 'SINGLE_PLAYER'
                      ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_18px_rgba(56,189,248,0.2)]'
                      : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      sessionConfig.playMode === 'SINGLE_PLAYER'
                        ? 'bg-sky-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Single Player (Solo)</div>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                      Main sendiri menjelajahi Dunia Aetheria & bertarung melawan 12 Mob AI.
                    </p>
                  </div>
                </button>

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
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    sessionConfig.playMode === 'MULTIPLAYER'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_18px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      sessionConfig.playMode === 'MULTIPLAYER'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Multiplayer (World / Room + Chat)
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                      Buat World/Room baru (hasilkan Code) atau Masuk World/Room via Code.
                    </p>
                  </div>
                </button>
              </div>

              {/* Sub-Opsi Khusus Multiplayer: Buat World/Room vs Masuk World/Room */}
              {sessionConfig.playMode === 'MULTIPLAYER' && (
                <div className="bg-slate-950/95 border border-emerald-500/35 rounded-xl p-3.5 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
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
                      className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        sessionConfig.roomAction === 'CREATE_ROOM'
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Buat World / Room (Admin)</span>
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
                      className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        sessionConfig.roomAction === 'JOIN_ROOM'
                          ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <DoorOpen className="w-3.5 h-3.5" />
                      <span>Masuk World / Room (Via Code)</span>
                    </button>
                  </div>

                  {sessionConfig.roomAction === 'CREATE_ROOM' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 focus:border-amber-400 focus:outline-none text-xs font-semibold text-white"
                        />
                        <span className="block text-[10px] text-slate-400 mt-1">
                          Anda akan berstatus <strong>ADMIN / HOST</strong> di World ini.
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-emerald-300">
                            Kode World / Room (Dihasilkan Admin)
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
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-amber-400/50 text-sm font-extrabold font-mono-tabular tracking-widest text-amber-300 uppercase focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopyRoomCode}
                            className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                            title="Salin Kode World/Room untuk teman"
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
                        <span className="block text-[10px] text-slate-400 mt-1">
                          Bagikan kode di atas kepada pemain lain agar mereka dapat masuk.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-sky-300 mb-1">
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
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-sky-400/50 focus:border-sky-400 focus:outline-none text-sm font-extrabold font-mono-tabular tracking-widest text-sky-200 uppercase"
                      />
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Masukkan kode yang dihasilkan oleh pemilik/admin World untuk bergabung ke ruang & kolom chat yang sama.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 1. PEMERIKSAAN PERANGKAT & PEMILIH MODE UTAMA */}
          <div className="bg-slate-900/90 border border-sky-500/30 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  1. Deteksi Perangkat: {deviceInfo.deviceLabel}
                </span>
              </div>
              <span className="text-[11px] font-mono-tabular text-slate-400">
                {deviceInfo.screenInfo} · Touch: {deviceInfo.hasTouch ? 'Ya' : 'Tidak'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectControlMode('DESKTOP')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  controlMode === 'DESKTOP'
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : 'bg-slate-950/70 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    controlMode === 'DESKTOP'
                      ? 'bg-sky-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Mode Desktop (PC)</span>
                    {deviceInfo.detectedMode === 'DESKTOP' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        Terdeteksi
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    WASD + Mouse (Geser Kanan = Tengok Kanan), Tombol <strong>~</strong> Lock Tengah.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectControlMode('MOBILE')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  controlMode === 'MOBILE'
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-950/70 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    controlMode === 'MOBILE'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Mode Ponsel (Mobile)</span>
                    {deviceInfo.detectedMode === 'MOBILE' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        Terdeteksi
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Virtual Analog Kiri + Geser Kamera Kanan + Tombol Sentuh Lompat/Lari.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. PENGATURAN PASTI SESUAI PERANGKAT YANG DIPILIH (TERPISAH DESKTOP VS MOBILE) */}
          {controlMode === 'DESKTOP' ? (
            <div className="bg-slate-900/80 border border-sky-500/25 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
                  <MousePointer className="w-4 h-4" />
                  <span>Pengaturan Pasti Kontrol Desktop (Mouse & Keyboard)</span>
                </div>
                <span className="text-[10px] text-emerald-300 font-semibold">
                  Kalibrasi Arah Mouse Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Sensitivitas Mouse</span>
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
                    <span className="text-slate-300">Kecepatan Scroll Zoom</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    onChangeDesktopSettings({
                      ...desktopSettings,
                      invertMouseX: !desktopSettings.invertMouseX,
                    })
                  }
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    !desktopSettings.invertMouseX
                      ? 'bg-sky-500/15 border-sky-400/50 text-sky-200'
                      : 'bg-amber-500/20 border-amber-400 text-amber-200'
                  }`}
                >
                  <span>Arah Horizontal (Kiri/Kanan)</span>
                  <span className="font-bold">
                    {desktopSettings.invertMouseX ? 'Terbalik (Invert)' : 'Normal (Sesuai)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChangeDesktopSettings({
                      ...desktopSettings,
                      invertMouseY: !desktopSettings.invertMouseY,
                    })
                  }
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    !desktopSettings.invertMouseY
                      ? 'bg-sky-500/15 border-sky-400/50 text-sky-200'
                      : 'bg-amber-500/20 border-amber-400 text-amber-200'
                  }`}
                >
                  <span>Arah Vertikal (Atas/Bawah)</span>
                  <span className="font-bold">
                    {desktopSettings.invertMouseY ? 'Terbalik (Invert)' : 'Normal (Sesuai)'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-emerald-500/25 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <Smartphone className="w-4 h-4" />
                  <span>Pengaturan Pasti Kontrol Ponsel (Touch & Analog)</span>
                </div>
                <span className="text-[10px] text-emerald-300 font-semibold">
                  Multi-Touch Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">Sensitivitas Geser Kamera</span>
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
                    <span className="text-slate-300">Ukuran Analog & Tombol</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    onChangeMobileSettings({
                      ...mobileSettings,
                      invertTouchX: !mobileSettings.invertTouchX,
                    })
                  }
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    !mobileSettings.invertTouchX
                      ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
                      : 'bg-amber-500/20 border-amber-400 text-amber-200'
                  }`}
                >
                  <span>Geser Horizontal</span>
                  <span className="font-bold">
                    {mobileSettings.invertTouchX ? 'Terbalik' : 'Normal'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChangeMobileSettings({
                      ...mobileSettings,
                      autoSprintOnFullTilt: !mobileSettings.autoSprintOnFullTilt,
                    })
                  }
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    mobileSettings.autoSprintOnFullTilt
                      ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200'
                      : 'bg-slate-800 border-white/10 text-slate-400'
                  }`}
                >
                  <span>Auto-Lari Analog Penuh</span>
                  <span className="font-bold">
                    {mobileSettings.autoSprintOnFullTilt ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 3. KUSTOMISASI AKHIR KARAKTER DUMMY (RAMBUT/TOPI/HELM, PAKAIAN, CELANA, AKSESORI & SENJATA) */}
          <div className="bg-slate-900/85 border border-purple-500/30 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>
                  2. Kustomisasi Akhir Karakter Dummy (Rambut/Topi/Helm, Pakaian, Celana & Aksesori)
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/30 text-purple-200">
                Model Dummy Tanpa Wajah · Mix & Match Bebas
              </span>
            </div>

            {/* A. Preset Cepat Archetype (Mengatur setelan awal yang dapat dimodifikasi bebas di bawah) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Preset Setelan Karakter (Klik untuk menerapkan paket awal, atau kustomisasi per bagian di bawah):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CHARACTER_MODELS_LIST.map((model) => {
                  const isSelected = characterCustomization.modelId === model.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() =>
                        onChangeCharacterCustomization(
                          applyModelPresetToCustomization(characterCustomization, model.id)
                        )
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_16px_rgba(56,189,248,0.2)]'
                          : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">{model.name}</span>
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: model.badgeColor }}
                        />
                      </div>
                      <div className="text-[10px] text-sky-300 font-medium mt-0.5">
                        {model.roleTitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. KEPALA DUMMY: RAMBUT, TOPI, MAHKOTA ATAU HELM (Tanpa Wajah) */}
            <div className="pt-2 border-t border-white/10 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-[11px] font-semibold text-slate-200">
                  Bagian Kepala Dummy (Rambut / Topi / Helm — Wajah Polos Dummy):
                </label>
                {/* Pilihan Warna Rambut */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Warna Rambut:</span>
                  {HAIR_COLOR_OPTIONS.map((hc) => {
                    const active = characterCustomization.hairColor === hc.id;
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

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {HEADWEAR_STYLES_LIST.map((hw) => {
                  const active = characterCustomization.headwearId === hw.id;
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
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        active
                          ? 'bg-purple-500/25 border-purple-400 text-white'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-wider text-purple-300 font-bold">
                        {hw.categoryLabel}
                      </div>
                      <div className="text-[11px] font-bold text-white truncate">{hw.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. PAKAIAN ATAS (BAJU/JAKET/ZIRAH) & CELANA BAWAHAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-[11px] font-semibold text-slate-200 mb-1.5">
                  Pakaian Atas / Baju (Top Outfit):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TOP_OUTFIT_STYLES_LIST.map((top) => {
                    const active = characterCustomization.topOutfitId === top.id;
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
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{top.name}</div>
                        <div className="text-[9px] text-slate-400 truncate">{top.subtitle}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-200 mb-1.5">
                  Celana / Bawahan Berartikulasi (Pants):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {BOTTOM_PANTS_STYLES_LIST.map((p) => {
                    const active = characterCustomization.bottomPantsId === p.id;
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
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{p.name}</div>
                        <div className="text-[9px] text-slate-400 truncate">{p.subtitle}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* D. AKSESORI BADAN, AKSESORI PUNGGUNG & TEMA WARNA PAKAIAN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Aksesori Badan Tambahan:
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {BODY_ACCESSORY_STYLES_LIST.map((bAcc) => {
                    const active = characterCustomization.bodyAccessoryId === bAcc.id;
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
                        className={`py-1.5 px-2.5 rounded-lg border text-left text-[10px] font-semibold flex items-center justify-between cursor-pointer ${
                          active
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{bAcc.name}</span>
                        <span className="text-[9px] text-amber-300 ml-1">{bAcc.categoryLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Aksesori Punggung:
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {BACK_ATTACHMENTS_LIST.map((acc) => {
                    const active = characterCustomization.backAttachment === acc.id;
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
                        className={`py-1.5 px-2.5 rounded-lg border text-left text-[10px] font-semibold truncate cursor-pointer ${
                          active
                            ? 'bg-purple-500/25 border-purple-400 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {acc.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Warna Pakaian, Celana & Aether:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {ARMOR_COLOR_THEMES.map((theme) => {
                    const active = characterCustomization.colorTheme === theme.id;
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
                        className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer ${
                          active
                            ? 'bg-white/15 border-sky-400 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/30"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.glowHex})`,
                          }}
                        />
                        <span className="text-[10px] font-semibold truncate">
                          {theme.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Pilihan Alat / Senjata Awal (Pedang, Tombak, Busur Panah, Bola Salju) */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Alat / Senjata Utama (Dapat diganti kapan saja dengan tombol 1 / 2 / 3 / 4):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-400 text-white'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-white truncate">{w.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] font-mono-tabular text-sky-300">
                          [{w.slotNumber}]
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{w.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TOMBOL UTAMA MASUK KE DUNIA */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleAttemptEnterWorld}
              className="w-full py-4 px-6 bg-sky-500 hover:bg-sky-400 active:scale-[0.99] text-slate-950 font-extrabold rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(56,189,248,0.35)] cursor-pointer text-base"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {sessionConfig.playMode === 'SINGLE_PLAYER'
                  ? `MULAI SINGLE PLAYER SEBAGAI "${playerIdentity.displayName.trim() || 'TANPA NAMA'}"`
                  : sessionConfig.roomAction === 'CREATE_ROOM'
                  ? `BUAT WORLD/ROOM [${sessionConfig.roomCode || '---'}] & MASUK (ADMIN)`
                  : `MASUK WORLD/ROOM [${sessionConfig.roomCode || '---'}] SEBAGAI "${playerIdentity.displayName.trim() || 'TANPA NAMA'}"`}
              </span>
            </button>
          </div>
        </div>

        {/* Kolom Kanan (5 Kolom): 4 Musim, Siklus Waktu & Cuaca */}
        <div className="lg:col-span-5 bg-[#0B1220] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
          <h2 className="text-base font-bold text-white font-display border-b border-white/10 pb-3">
            2. Pengaturan Musim, Waktu & Atmosfer
          </h2>

          {/* PILIHAN 4 MUSIM (SEMI, PANAS, GUGUR, DINGIN) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Pilih Musim Dunia (4 Musim)</span>
              <span style={{ color: seasonMeta.accentColor }} className="font-bold">
                {seasonMeta.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    id: 'SEMI',
                    label: 'Musim Semi',
                    sub: 'Bunga & Rumput Segar',
                    icon: Flower2,
                    color: 'text-pink-400',
                  },
                  {
                    id: 'PANAS',
                    label: 'Musim Panas',
                    sub: 'Cahaya Tropis Cerah',
                    icon: Sun,
                    color: 'text-amber-300',
                  },
                  {
                    id: 'GUGUR',
                    label: 'Musim Gugur',
                    sub: 'Daun Jingga Gugur',
                    icon: Leaf,
                    color: 'text-orange-400',
                  },
                  {
                    id: 'DINGIN',
                    label: 'Musim Dingin',
                    sub: 'Salju & Es Putih',
                    icon: Snowflake,
                    color: 'text-sky-300',
                  },
                ] as const
              ).map((s) => {
                const IconComp = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectInitialSeason(s.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                      initialSeason === s.id
                        ? 'bg-sky-500/20 border-sky-400 text-white'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${s.color}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{s.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{s.sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pilihan Waktu Awal (Pagi / Siang / Sore / Malam) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Waktu Mulai (1 Hari = 20 Menit)</span>
              <span className="font-mono-tabular text-sky-400 font-bold">{clock.hhmm}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onSelectInitialTime(6.5)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer ${
                  initialTimeOfDay >= 5 && initialTimeOfDay < 9.5
                    ? 'bg-amber-500/20 border-amber-400 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Sunrise className="w-4 h-4 text-amber-300" />
                <span>Pagi</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectInitialTime(12.0)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer ${
                  initialTimeOfDay >= 9.5 && initialTimeOfDay < 16
                    ? 'bg-sky-500/20 border-sky-400 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-sky-300" />
                <span>Siang</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectInitialTime(17.75)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer ${
                  initialTimeOfDay >= 16 && initialTimeOfDay < 19.25
                    ? 'bg-rose-500/20 border-rose-400 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Sunset className="w-4 h-4 text-rose-400" />
                <span>Sore</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectInitialTime(22.5)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer ${
                  initialTimeOfDay >= 19.25 || initialTimeOfDay < 5
                    ? 'bg-indigo-500/20 border-indigo-400 text-white'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-300" />
                <span>Malam</span>
              </button>
            </div>
          </div>

          {/* Pilihan Cuaca Awal */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Kondisi Cuaca, Awan & Kabut
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'CERAH', label: 'Cerah Berawan', icon: Sun, color: 'text-amber-300' },
                  { id: 'HUJAN', label: 'Hujan Deras', icon: CloudRain, color: 'text-sky-400' },
                  {
                    id: 'BADAI',
                    label: 'Badai Petir',
                    icon: CloudLightning,
                    color: 'text-amber-400',
                  },
                  {
                    id: 'AETHER_MIST',
                    label: 'Kabut Aether',
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
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center gap-2 cursor-pointer ${
                      initialWeather === w.id
                        ? 'bg-sky-500/20 border-sky-400 text-white'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${w.color}`} />
                    <span>{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pilihan Sudut Pandang Kamera Awal */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Sudut Pandang Kamera Awal (POV)
            </label>
            <div className="grid grid-cols-3 gap-2">
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
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                    initialCameraMode === cam.id
                      ? 'bg-sky-500/20 border-sky-400 text-white'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>{cam.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Lobby */}
      <footer className="max-w-6xl w-full mx-auto pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>Aether World-Web — Babylon.js PBR · 4 Musim · Yuka AI</span>
        <span>Pengaturan Desktop & Ponsel dapat diubah kapan saja di dalam game (Tombol G)</span>
      </footer>
    </div>
  );
};

interface SettingsModalProps {
  initialTab?: 'CHARACTER' | 'DESKTOP' | 'MOBILE' | 'WORLD';
  characterCustomization: CharacterCustomization;
  onChangeCharacterCustomization: (c: CharacterCustomization) => void;
  controlMode: DeviceControlMode;
  onSelectControlMode: (mode: DeviceControlMode) => void;
  desktopSettings: DesktopControlSettings;
  onChangeDesktopSettings: (s: DesktopControlSettings) => void;
  mobileSettings: MobileControlSettings;
  onChangeMobileSettings: (s: MobileControlSettings) => void;
  seasonMode: SeasonMode;
  onChangeSeason: (s: SeasonMode) => void;
  timeOfDay: number;
  onJumpToTime: (hour: number) => void;
  autoDayCycle: boolean;
  onToggleAutoDayCycle: () => void;
  weatherMode: WeatherMode;
  onChangeWeather: (w: WeatherMode) => void;
  secondPersonVariant: 'SHOULDER' | 'FRONT_LOCKED';
  onChangeSecondPersonVariant: (v: 'SHOULDER' | 'FRONT_LOCKED') => void;
  atmospherePreset: AtmospherePreset;
  onChangeAtmospherePreset: (p: AtmospherePreset) => void;
  speedMultiplier: number;
  onChangeSpeedMultiplier: (v: number) => void;
  gravityScale: number;
  onChangeGravityScale: (v: number) => void;
  bloomIntensity: number;
  onChangeBloomIntensity: (v: number) => void;
  playerIdentity?: PlayerAuthIdentity;
  onChangePlayerIdentity?: (id: PlayerAuthIdentity) => void;
  sessionConfig?: WorldSessionConfig;
  onlinePlayers?: OnlinePlayerSummary[];
  crystalsCollected?: number;
  totalCrystals?: number;
  zoneName?: string;
  nearestMobInfo?: string;
  isMuted?: boolean;
  onToggleSound?: () => void;
  isCrosshairLocked?: boolean;
  onToggleCrosshairLock?: () => void;
  isGameExpanded?: boolean;
  onToggleGameExpand?: () => void;
  onWarpToLocation?: (x: number, z: number, label: string) => void;
  fpsStats?: { fps: number; ms: number };
  onClose: () => void;
  onReturnToLobby?: () => void;
}

export const AetherSettingsModal: React.FC<SettingsModalProps> = ({
  initialTab,
  characterCustomization,
  onChangeCharacterCustomization,
  controlMode,
  onSelectControlMode,
  desktopSettings,
  onChangeDesktopSettings,
  mobileSettings,
  onChangeMobileSettings,
  seasonMode,
  onChangeSeason,
  timeOfDay,
  onJumpToTime,
  autoDayCycle,
  onToggleAutoDayCycle,
  weatherMode,
  onChangeWeather,
  secondPersonVariant,
  onChangeSecondPersonVariant,
  atmospherePreset,
  onChangeAtmospherePreset,
  speedMultiplier,
  onChangeSpeedMultiplier,
  gravityScale,
  onChangeGravityScale,
  bloomIntensity,
  onChangeBloomIntensity,
  playerIdentity,
  onChangePlayerIdentity,
  sessionConfig,
  onlinePlayers = [],
  crystalsCollected = 0,
  totalCrystals = 15,
  zoneName = 'Sanctuary Core Plaza',
  nearestMobInfo = '12 Mob AI Aktif',
  isMuted = false,
  onToggleSound,
  isCrosshairLocked = false,
  onToggleCrosshairLock,
  isGameExpanded = true,
  onToggleGameExpand,
  onWarpToLocation,
  fpsStats,
  onClose,
  onReturnToLobby,
}) => {
  // 4 Tab Pengaturan Terpisah: KARAKTER/SENJATA vs DESKTOP vs MOBILE vs DUNIA (Musim/Waktu/Cuaca)
  const [activeTab, setActiveTab] = useState<'CHARACTER' | 'DESKTOP' | 'MOBILE' | 'WORLD'>(
    initialTab || 'WORLD'
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const clock = formatLiveGameClock(timeOfDay);

  const handleCopyRoomCode = () => {
    if (!sessionConfig?.roomCode) return;
    navigator.clipboard?.writeText(sessionConfig.roomCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#0F172A] border border-white/15 rounded-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Pengaturan Dunia, Kontrol & Karakter
              </h3>
              <p className="text-xs text-slate-400">
                Semua kontrol sistem, cuaca, musim, teleportasi, informasi room & kustomisasi karakter
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BAR PINTASAN SISTEM & INFO SESI (Suara, Layar Penuh, Lock Crosshair, Room Code, Kristal) */}
        <div className="mb-4 p-3 rounded-xl bg-slate-900/95 border border-white/10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {onToggleSound && (
                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    isMuted
                      ? 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                      : 'bg-slate-950 border-white/15 text-slate-200 hover:text-white'
                  }`}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  )}
                  <span>{isMuted ? 'Suara: Mati' : 'Suara: Aktif'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  onSelectControlMode(controlMode === 'MOBILE' ? 'DESKTOP' : 'MOBILE')
                }
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/15 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {controlMode === 'MOBILE' ? (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mode: Ponsel</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-sky-400" />
                    <span>Mode: Desktop</span>
                  </>
                )}
              </button>

              {controlMode === 'DESKTOP' && onToggleCrosshairLock && (
                <button
                  type="button"
                  onClick={onToggleCrosshairLock}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    isCrosshairLocked
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                      : 'bg-slate-950 border-white/15 text-slate-300 hover:text-white'
                  }`}
                >
                  {isCrosshairLocked ? (
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{isCrosshairLocked ? 'Crosshair: Terkunci (~)' : 'Lock Crosshair (~)'}</span>
                </button>
              )}

              {onToggleGameExpand && (
                <button
                  type="button"
                  onClick={onToggleGameExpand}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/15 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {isGameExpanded ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Kecilkan Layar</span>
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

            {sessionConfig && (
              <div className="flex items-center gap-1.5">
                {sessionConfig.playMode === 'SINGLE_PLAYER' ? (
                  <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-400/40 text-xs font-bold text-sky-300">
                    Single Player
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopyRoomCode}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-mono-tabular font-bold text-amber-200 flex items-center gap-1.5 cursor-pointer"
                    title="Salin Kode World/Room"
                  >
                    {copiedCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>Room: {sessionConfig.roomCode}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Baris Info Kristal, Lokasi, Mob AI, FPS & Daftar Pemain Online */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-amber-300 font-semibold">
                Kristal: {crystalsCollected}/{totalCrystals}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-sky-300 font-semibold">{zoneName}</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-300 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {nearestMobInfo}
              </span>
            </div>
            {fpsStats && (
              <span className="font-mono-tabular text-[10px] text-slate-400">
                {fpsStats.fps} FPS · {fpsStats.ms}ms
              </span>
            )}
          </div>

          {sessionConfig?.playMode === 'MULTIPLAYER' && onlinePlayers.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                <span>Pemain Online di Room ({onlinePlayers.length}):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {onlinePlayers.map((pl) => (
                  <span
                    key={pl.uid}
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold flex items-center gap-1.5 ${
                      pl.isHost
                        ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                        : 'bg-slate-950 border-white/10 text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        pl.isLocal ? 'bg-sky-400' : 'bg-emerald-400'
                      }`}
                    />
                    <span>{pl.displayName}</span>
                    {pl.isHost && (
                      <span className="text-[9px] uppercase font-extrabold text-amber-400">
                        Admin
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pemilih Mode Aktif & 4 Tab Terpisah */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-900 border border-white/10 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('CHARACTER')}
            className={`py-2.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'CHARACTER'
                ? 'bg-purple-500 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Karakter & Alat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('DESKTOP');
              onSelectControlMode('DESKTOP');
            }}
            className={`py-2.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'DESKTOP'
                ? 'bg-sky-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Setting Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('MOBILE');
              onSelectControlMode('MOBILE');
            }}
            className={`py-2.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'MOBILE'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Setting Ponsel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WORLD')}
            className={`py-2.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'WORLD'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>4 Musim & Cuaca</span>
          </button>
        </div>

        {/* TAB 0: KUSTOMISASI AKHIR KARAKTER DUMMY & ALAT TEMPUR */}
        {activeTab === 'CHARACTER' && (
          <div className="space-y-4 bg-slate-900/90 border border-purple-500/30 rounded-xl p-4 sm:p-5">
            {/* Identitas Multiplayer (UID & Nickname di Atas Kepala) */}
            {playerIdentity && onChangePlayerIdentity && (
              <div className="pb-3 border-b border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-sky-300 mb-1">
                    UID Multiplayer Anda
                  </label>
                  <input
                    type="text"
                    value={playerIdentity.uid}
                    disabled={playerIdentity.isFirebaseVerified}
                    onChange={(e) =>
                      onChangePlayerIdentity({
                        ...playerIdentity,
                        uid: sanitizePlayerUid(e.target.value),
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/15 text-xs font-mono-tabular text-sky-200 disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                    Name / Nickname (Tampil di Atas Kepala)
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={playerIdentity.displayName}
                    onChange={(e) =>
                      onChangePlayerIdentity({
                        ...playerIdentity,
                        displayName: e.target.value.slice(0, 24),
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/15 text-xs font-bold text-white"
                  />
                </div>
              </div>
            )}

            {/* 1. Preset Setelan Karakter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                  1. Preset Setelan Karakter (Atau Mix & Match Bebas di Bawah)
                </label>
                <span className="text-[10px] text-slate-400">
                  Kepala Model Dummy Tanpa Wajah
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CHARACTER_MODELS_LIST.map((m) => {
                  const selected = characterCustomization.modelId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        onChangeCharacterCustomization(
                          applyModelPresetToCustomization(characterCustomization, m.id)
                        )
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selected
                          ? 'bg-purple-500/20 border-purple-400 text-white shadow-[0_0_18px_rgba(168,85,247,0.25)]'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-white truncate">{m.name}</div>
                      <div className="text-[10px] text-sky-300 font-semibold mt-0.5">
                        {m.roleTitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Kepala Dummy: Rambut, Topi, Mahkota, atau Helm */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-300">
                  2. Bagian Kepala Dummy (Rambut, Topi, Mahkota & Helm)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Warna Rambut:</span>
                  {HAIR_COLOR_OPTIONS.map((hc) => {
                    const active = characterCustomization.hairColor === hc.id;
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

              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                {HEADWEAR_STYLES_LIST.map((hw) => {
                  const active = characterCustomization.headwearId === hw.id;
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
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{hw.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-purple-300">
                          {hw.categoryLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {hw.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Pakaian Atas (Baju) & Celana Bawahan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                  3. Pakaian Atas / Baju (Top Outfit)
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {TOP_OUTFIT_STYLES_LIST.map((top) => {
                    const active = characterCustomization.topOutfitId === top.id;
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
                        className={`p-2 rounded-lg border text-left cursor-pointer flex items-center justify-between ${
                          active
                            ? 'bg-sky-500/20 border-sky-400 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{top.name}</div>
                          <div className="text-[10px] text-slate-400">{top.subtitle}</div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300">
                          {top.categoryLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                  4. Celana & Bawahan (Pants)
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {BOTTOM_PANTS_STYLES_LIST.map((p) => {
                    const active = characterCustomization.bottomPantsId === p.id;
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
                        className={`p-2 rounded-lg border text-left cursor-pointer flex items-center justify-between ${
                          active
                            ? 'bg-emerald-500/20 border-emerald-400 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.subtitle}</div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300">
                          {p.categoryLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. Aksesori Badan, Aksesori Punggung & Tema Warna Pakaian */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                  5. Aksesori Badan
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {BODY_ACCESSORY_STYLES_LIST.map((bAcc) => {
                    const active = characterCustomization.bodyAccessoryId === bAcc.id;
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
                        className={`p-1.5 rounded-lg border text-left cursor-pointer ${
                          active
                            ? 'bg-amber-500/20 border-amber-400 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{bAcc.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{bAcc.subtitle}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>6. Aksesori Punggung</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {BACK_ATTACHMENTS_LIST.map((acc) => {
                    const active = characterCustomization.backAttachment === acc.id;
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
                        className={`p-1.5 rounded-lg border text-left cursor-pointer ${
                          active
                            ? 'bg-purple-500/20 border-purple-400 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{acc.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{acc.subtitle}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-300 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-sky-400" />
                  <span>7. Warna Pakaian</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {ARMOR_COLOR_THEMES.map((theme) => {
                    const active = characterCustomization.colorTheme === theme.id;
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
                            ? 'bg-sky-500/20 border-sky-400 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/30"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.glowHex})`,
                          }}
                        />
                        <span className="text-xs font-semibold truncate">{theme.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 8. Alat & Senjata Aktif */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
                8. Alat & Senjata Aktif (Klik Kiri Mouse / Tombol F / Tombol Aksi Ponsel)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-400 text-white'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{w.name}</span>
                        <span className="text-[10px] font-mono-tabular px-1.5 py-0.5 rounded bg-slate-800 text-sky-300">
                          [{w.slotNumber}]
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                        {w.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: PENGATURAN PASTI KHUSUS DESKTOP */}
        {activeTab === 'DESKTOP' && (
          <div className="space-y-4 bg-slate-900/90 border border-sky-500/30 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Konfigurasi Khusus Desktop (Mouse & Keyboard)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Arah mouse telah disesuaikan: geser ke kanan menengok ke kanan, geser ke kiri
                  menengok ke kiri.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[11px] font-bold">
                Mode Desktop Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-semibold">
                    Sensitivitas Putaran Mouse
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
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-semibold">
                    Kecepatan Zoom Scroll Wheel
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3">
                <div className="text-xs font-semibold text-white mb-1">
                  Sumbu Horizontal Mouse (Kiri / Kanan)
                </div>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Normal: Geser mouse ke kanan memutar pandangan ke kanan.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeDesktopSettings({ ...desktopSettings, invertMouseX: false })
                    }
                    className={`py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      !desktopSettings.invertMouseX
                        ? 'bg-sky-500 text-slate-950 border-sky-400'
                        : 'bg-slate-900 text-slate-400 border-white/10'
                    }`}
                  >
                    Normal (Sesuai)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeDesktopSettings({ ...desktopSettings, invertMouseX: true })
                    }
                    className={`py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      desktopSettings.invertMouseX
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-400 border-white/10'
                    }`}
                  >
                    Invert (Balik)
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3">
                <div className="text-xs font-semibold text-white mb-1">
                  Sumbu Vertikal Mouse (Atas / Bawah)
                </div>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Normal: Geser mouse ke atas mengarahkan kamera ke atas.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeDesktopSettings({ ...desktopSettings, invertMouseY: false })
                    }
                    className={`py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      !desktopSettings.invertMouseY
                        ? 'bg-sky-500 text-slate-950 border-sky-400'
                        : 'bg-slate-900 text-slate-400 border-white/10'
                    }`}
                  >
                    Normal (Sesuai)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeDesktopSettings({ ...desktopSettings, invertMouseY: true })
                    }
                    className={`py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      desktopSettings.invertMouseY
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 text-slate-400 border-white/10'
                    }`}
                  >
                    Invert (Balik)
                  </button>
                </div>
              </div>
            </div>

            {/* Pengaturan Kecepatan & Gravitasi Karakter */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Kecepatan Lari Karakter</span>
                  <span className="font-mono-tabular text-sky-400">
                    {speedMultiplier.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.8"
                  step="0.1"
                  value={speedMultiplier}
                  onChange={(e) => onChangeSpeedMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Skala Gravitasi</span>
                  <span className="font-mono-tabular text-sky-400">
                    {gravityScale.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.6"
                  step="0.1"
                  value={gravityScale}
                  onChange={(e) => onChangeGravityScale(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PENGATURAN PASTI KHUSUS PONSEL / MOBILE */}
        {activeTab === 'MOBILE' && (
          <div className="space-y-4 bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Konfigurasi Khusus Ponsel (Virtual Analog & Layar Sentuh)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Atur sensitivitas sapuan jari di separuh kanan layar dan ukuran tombol sentuh.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                Mode Ponsel Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-semibold">
                    Sensitivitas Geser Kamera (Touch)
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
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-semibold">
                    Ukuran Analog & Tombol Aksi
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  onChangeMobileSettings({
                    ...mobileSettings,
                    invertTouchX: !mobileSettings.invertTouchX,
                  })
                }
                className={`p-3 rounded-xl border text-left cursor-pointer ${
                  !mobileSettings.invertTouchX
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-white'
                    : 'bg-amber-500/20 border-amber-400 text-amber-200'
                }`}
              >
                <div className="text-[11px] text-slate-300">Sumbu Horizontal</div>
                <div className="text-xs font-bold mt-0.5">
                  {mobileSettings.invertTouchX ? 'Terbalik (Invert)' : 'Normal (Sesuai)'}
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeMobileSettings({
                    ...mobileSettings,
                    invertTouchY: !mobileSettings.invertTouchY,
                  })
                }
                className={`p-3 rounded-xl border text-left cursor-pointer ${
                  !mobileSettings.invertTouchY
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-white'
                    : 'bg-amber-500/20 border-amber-400 text-amber-200'
                }`}
              >
                <div className="text-[11px] text-slate-300">Sumbu Vertikal</div>
                <div className="text-xs font-bold mt-0.5">
                  {mobileSettings.invertTouchY ? 'Terbalik (Invert)' : 'Normal (Sesuai)'}
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeMobileSettings({
                    ...mobileSettings,
                    autoSprintOnFullTilt: !mobileSettings.autoSprintOnFullTilt,
                  })
                }
                className={`p-3 rounded-xl border text-left cursor-pointer ${
                  mobileSettings.autoSprintOnFullTilt
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-white'
                    : 'bg-slate-950 border-white/10 text-slate-400'
                }`}
              >
                <div className="text-[11px] text-slate-300">Auto-Sprint Analog</div>
                <div className="text-xs font-bold mt-0.5">
                  {mobileSettings.autoSprintOnFullTilt ? 'Aktif (ON)' : 'Manual (OFF)'}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PENGATURAN 4 MUSIM, SIKLUS WAKTU 20 MENIT & CUACA */}
        {activeTab === 'WORLD' && (
          <div className="space-y-4">
            {/* Pilihan 4 Musim */}
            <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                4 Musim Dunia Aetheria (Mengubah Dedaunan, Tanah & Partikel)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'SEMI', label: 'Musim Semi', icon: Flower2, color: 'text-pink-400' },
                    { id: 'PANAS', label: 'Musim Panas', icon: Sun, color: 'text-amber-300' },
                    { id: 'GUGUR', label: 'Musim Gugur', icon: Leaf, color: 'text-orange-400' },
                    { id: 'DINGIN', label: 'Musim Dingin', icon: Snowflake, color: 'text-sky-300' },
                  ] as const
                ).map((s) => {
                  const IconComp = s.icon;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onChangeSeason(s.id)}
                      className={`py-2.5 px-2 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer ${
                        seasonMode === s.id
                          ? 'bg-sky-500/20 border-sky-400 text-white'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 ${s.color}`} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Siklus Jam & Waktu (1 Hari = 20 Menit) */}
            <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Jam Dunia ({clock.full}) · 1 Hari = 20 Menit
                </span>
                <button
                  type="button"
                  onClick={onToggleAutoDayCycle}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer border ${
                    autoDayCycle
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                      : 'bg-slate-800 border-white/10 text-slate-400'
                  }`}
                >
                  {autoDayCycle ? 'Jam Berjalan: ON' : 'Jam Berjalan: PAUSE'}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onJumpToTime(6.5)}
                  className="py-2 px-2 rounded-lg text-xs font-semibold border bg-slate-950 border-white/10 text-slate-300 hover:text-white flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Sunrise className="w-4 h-4 text-amber-300" />
                  <span>Pagi (06:30)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onJumpToTime(12.0)}
                  className="py-2 px-2 rounded-lg text-xs font-semibold border bg-slate-950 border-white/10 text-slate-300 hover:text-white flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Sun className="w-4 h-4 text-sky-300" />
                  <span>Siang (12:00)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onJumpToTime(17.75)}
                  className="py-2 px-2 rounded-lg text-xs font-semibold border bg-slate-950 border-white/10 text-slate-300 hover:text-white flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Sunset className="w-4 h-4 text-rose-400" />
                  <span>Sore (17:45)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onJumpToTime(22.5)}
                  className="py-2 px-2 rounded-lg text-xs font-semibold border bg-slate-950 border-white/10 text-slate-300 hover:text-white flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Moon className="w-4 h-4 text-indigo-300" />
                  <span>Malam (22:30)</span>
                </button>
              </div>

              <input
                type="range"
                min="0"
                max="23.95"
                step="0.05"
                value={timeOfDay}
                onChange={(e) => onJumpToTime(parseFloat(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Cuaca & Bloom */}
            <div className="bg-slate-900/90 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'CERAH', label: 'Cerah Berawan', icon: Sun, color: 'text-amber-300' },
                    { id: 'HUJAN', label: 'Hujan Deras', icon: CloudRain, color: 'text-sky-400' },
                    {
                      id: 'BADAI',
                      label: 'Badai Petir',
                      icon: CloudLightning,
                      color: 'text-amber-400',
                    },
                    {
                      id: 'AETHER_MIST',
                      label: 'Kabut Aether',
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
                      onClick={() => onChangeWeather(w.id)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer ${
                        weatherMode === w.id
                          ? 'bg-sky-500/20 border-sky-400 text-white'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 ${w.color}`} />
                      <span>{w.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Kamera 2nd Person
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => onChangeSecondPersonVariant('SHOULDER')}
                      className={`py-1.5 px-2 rounded text-[10px] font-semibold border cursor-pointer ${
                        secondPersonVariant === 'SHOULDER'
                          ? 'bg-sky-600/25 border-sky-400 text-white'
                          : 'bg-slate-950 border-white/10 text-slate-400'
                      }`}
                    >
                      Bahu
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeSecondPersonVariant('FRONT_LOCKED')}
                      className={`py-1.5 px-2 rounded text-[10px] font-semibold border cursor-pointer ${
                        secondPersonVariant === 'FRONT_LOCKED'
                          ? 'bg-sky-600/25 border-sky-400 text-white'
                          : 'bg-slate-950 border-white/10 text-slate-400'
                      }`}
                    >
                      Depan
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Filter Wilayah</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        { id: 'NIGHT_SANCTUARY', label: 'Sanct' },
                        { id: 'GOLDEN_SOLARIS', label: 'Solar' },
                        { id: 'NEBULA_TWILIGHT', label: 'Nebula' },
                      ] as const
                    ).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onChangeAtmospherePreset(preset.id)}
                        className={`py-1.5 px-1 rounded text-[10px] font-semibold border cursor-pointer ${
                          atmospherePreset === preset.id
                            ? 'bg-sky-600/25 border-sky-400 text-white'
                            : 'bg-slate-950 border-white/10 text-slate-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-300">Glow Bloom</span>
                    <span className="font-mono-tabular text-sky-400">
                      {bloomIntensity.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.6"
                    step="0.05"
                    value={bloomIntensity}
                    onChange={(e) => onChangeBloomIntensity(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Pintasan Teleportasi Lokasi (Fast Warp) */}
              {onWarpToLocation && (
                <div className="pt-3 border-t border-white/10">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Teleportasi Cepat (Fast Warp Lokasi)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onWarpToLocation(0, 0, 'Sanctuary Core Plaza');
                        onClose();
                      }}
                      className="py-2 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 cursor-pointer"
                    >
                      Plaza Utama
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onWarpToLocation(0, 44, 'Emerald Stargate Portal');
                        onClose();
                      }}
                      className="py-2 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-emerald-400/30 text-xs font-semibold text-emerald-300 cursor-pointer"
                    >
                      Stargate Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onWarpToLocation(0, -38, 'North Spire Obelisk');
                        onClose();
                      }}
                      className="py-2 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-sky-400/30 text-xs font-semibold text-sky-300 cursor-pointer"
                    >
                      Menara Utara
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          {onReturnToLobby ? (
            <button
              type="button"
              onClick={onReturnToLobby}
              className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Kembali ke Lobby Utama</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Babylon.js PBR · 4 Musim · Yuka AI</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Simpan & Lanjutkan Game
          </button>
        </div>
      </div>
    </div>
  );
};
