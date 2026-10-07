/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Eye, Zap, ArrowUp, Smartphone, Monitor, Swords, Crosshair, Snowflake } from 'lucide-react';
import { MobileControlSettings } from '../game/aetherSkyAndClouds';
import { WeaponToolId, WEAPON_TOOLS_LIST } from '../game/aetherCharacterAndWeapons';

export type DeviceControlMode = 'DESKTOP' | 'MOBILE';

export interface DeviceDetectionResult {
  detectedMode: DeviceControlMode;
  deviceLabel: string;
  hasTouch: boolean;
  screenInfo: string;
}

/**
 * Memeriksa apakah perangkat pengguna adalah Desktop atau Ponsel/Tablet
 */
export function inspectUserDevice(): DeviceDetectionResult {
  if (typeof window === 'undefined') {
    return {
      detectedMode: 'DESKTOP',
      deviceLabel: 'Desktop PC / Laptop',
      hasTouch: false,
      screenInfo: '1920×1080',
    };
  }

  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isCoarsePointer =
    window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const maxTouch = navigator.maxTouchPoints || 0;
  const isSmallViewport = window.innerWidth <= 900;

  const isMobile = isMobileUA || (isCoarsePointer && (maxTouch > 0 || isSmallViewport));

  return {
    detectedMode: isMobile ? 'MOBILE' : 'DESKTOP',
    deviceLabel: isMobile
      ? 'Ponsel / Perangkat Layar Sentuh'
      : 'Desktop (Keyboard & Mouse)',
    hasTouch: maxTouch > 0 || isCoarsePointer,
    screenInfo: `${window.innerWidth}×${window.innerHeight}px`,
  };
}

interface MobileTouchControlsProps {
  mobileSettings: MobileControlSettings;
  onMoveChange: (vx: number, vz: number, isFullTilt: boolean) => void;
  onLookDelta: (dx: number, dy: number) => void;
  onJumpPress: () => void;
  onUseWeaponPress: () => void;
  onUseWeaponRelease?: () => void;
  equippedTool: WeaponToolId;
  isSprinting: boolean;
  onToggleSprint: () => void;
  cameraMode: 'FIRST_PERSON' | 'SECOND_PERSON' | 'THIRD_PERSON';
  onCycleCameraMode: () => void;
}

export const MobileTouchControls: React.FC<MobileTouchControlsProps> = ({
  mobileSettings,
  onMoveChange,
  onLookDelta,
  onJumpPress,
  onUseWeaponPress,
  onUseWeaponRelease,
  equippedTool,
  isSprinting,
  onToggleSprint,
  cameraMode,
  onCycleCameraMode,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickTouchIdRef = useRef<number | null>(null);
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isStickActive, setIsStickActive] = useState(false);

  const scale = mobileSettings.joystickScale || 1.0;
  const maxRadius = 46 * scale;

  const updateJoystickFromPoint = (clientX: number, clientY: number) => {
    const base = joystickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobOffset({ x: kx, y: ky });

    const normX = kx / maxRadius;
    const normZ = -ky / maxRadius;
    const tiltRatio = clampedDist / maxRadius;
    onMoveChange(normX, normZ, tiltRatio > 0.82);
  };

  const resetJoystick = () => {
    joystickTouchIdRef.current = null;
    setIsStickActive(false);
    setKnobOffset({ x: 0, y: 0 });
    onMoveChange(0, 0, false);
  };

  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    joystickTouchIdRef.current = touch.identifier;
    setIsStickActive(true);
    updateJoystickFromPoint(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === joystickTouchIdRef.current) {
        updateJoystickFromPoint(t.clientX, t.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        resetJoystick();
        break;
      }
    }
  };

  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    joystickTouchIdRef.current = e.pointerId;
    setIsStickActive(true);
    updateJoystickFromPoint(e.clientX, e.clientY);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (joystickTouchIdRef.current !== e.pointerId) return;
    updateJoystickFromPoint(e.clientX, e.clientY);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (joystickTouchIdRef.current !== e.pointerId) return;
    resetJoystick();
  };

  const handleLookTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    lookTouchIdRef.current = touch.identifier;
    lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === lookTouchIdRef.current) {
        const dx = t.clientX - lastLookPosRef.current.x;
        const dy = t.clientY - lastLookPosRef.current.y;
        lastLookPosRef.current = { x: t.clientX, y: t.clientY };
        onLookDelta(dx, dy);
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        break;
      }
    }
  };

  const stickSizePx = Math.round(120 * scale);
  const knobSizePx = Math.round(50 * scale);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden">
      {/* Zona Geser Kamera (Separuh Kanan Layar) */}
      <div
        className="absolute top-14 right-0 bottom-14 w-1/2 pointer-events-auto touch-none"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
        onTouchCancel={handleLookTouchEnd}
      />

      {/* Virtual Analog Joystick Android (Kiri Bawah — Bulat dalam Bulat Tepat di Tengah) */}
      <div
        ref={joystickBaseRef}
        style={{ width: `${stickSizePx}px`, height: `${stickSizePx}px` }}
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
        onTouchCancel={handleJoystickTouchEnd}
        onPointerDown={handleJoystickPointerDown}
        onPointerMove={handleJoystickPointerMove}
        onPointerUp={handleJoystickPointerUp}
        onPointerCancel={handleJoystickPointerUp}
        className={`absolute bottom-14 left-5 sm:bottom-12 sm:left-8 rounded-full pointer-events-auto touch-none transition-colors ${
          isStickActive
            ? 'bg-slate-900/70 border-2 border-sky-400/85 shadow-[0_0_26px_rgba(56,189,248,0.35)]'
            : 'bg-slate-950/50 border-2 border-white/25 shadow-lg'
        } backdrop-blur-md`}
      >
        {/* Indikator Arah Mata Angin Analog (Atas, Bawah, Kiri, Kanan) */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/30 pointer-events-none" />
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/30 pointer-events-none" />
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/30 pointer-events-none" />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/30 pointer-events-none" />

        {/* Lingkaran Panduan Dalam (Tepat di Tengah Lingkaran Luar) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[62%] h-[62%] rounded-full border border-white/15 bg-white/[0.03] pointer-events-none" />

        {/* Titik Poros Tengah Analog */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-400/40 pointer-events-none" />

        {/* Bulatan Knob Analog (Tepat di Tengah saat diam, bergerak mulus mengikuti jempol) */}
        <div
          style={{
            width: `${knobSizePx}px`,
            height: `${knobSizePx}px`,
            left: '50%',
            top: '50%',
            marginLeft: `-${knobSizePx / 2}px`,
            marginTop: `-${knobSizePx / 2}px`,
            transform: `translate3d(${knobOffset.x}px, ${knobOffset.y}px, 0)`,
          }}
          className={`absolute rounded-full pointer-events-none transition-shadow ${
            isStickActive
              ? 'bg-gradient-to-b from-sky-300 to-sky-500 border-2 border-white shadow-[0_0_18px_rgba(56,189,248,0.95)]'
              : 'bg-gradient-to-b from-white/95 to-slate-200/90 border-2 border-white/80 shadow-md'
          }`}
        >
          {/* Bulatan Grip Dalam Knob (Tepat di Tengah Knob) */}
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full border ${
              isStickActive
                ? 'bg-sky-950/35 border-white/60'
                : 'bg-slate-900/25 border-slate-500/40'
            }`}
          />
        </div>
      </div>

      {/* Kluster Tombol Aksi Ponsel (Kanan Bawah) */}
      <div
        style={{ transform: `scale(${scale})`, transformOrigin: 'bottom right' }}
        className="absolute bottom-14 right-5 flex items-end gap-3 pointer-events-auto"
      >
        <div className="flex flex-col gap-2.5 items-end">
          <button
            type="button"
            onTouchStart={(e) => {
              e.stopPropagation();
              onToggleSprint();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSprint();
            }}
            className={`w-13 h-13 rounded-full border backdrop-blur-md flex flex-col items-center justify-center active:scale-95 transition-all shadow-lg ${
              isSprinting
                ? 'bg-amber-500/90 border-amber-300 text-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.6)]'
                : 'bg-slate-950/65 border-white/25 text-slate-200'
            }`}
            title="Toggle Lari Cepat (Sprint)"
          >
            <Zap className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
              Lari
            </span>
          </button>
        </div>

        {/* Tombol Gunakan Alat / Tahan untuk Memanah & Menusuk (Hanya tampil jika tidak tangan kosong) */}
        {equippedTool !== 'NONE' && (
          <button
            type="button"
            onTouchStart={(e) => {
              e.stopPropagation();
              onUseWeaponPress();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onUseWeaponRelease?.();
            }}
            onTouchCancel={(e) => {
              e.stopPropagation();
              onUseWeaponRelease?.();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onUseWeaponPress();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              onUseWeaponRelease?.();
            }}
            className="w-16 h-16 rounded-full bg-emerald-500/85 active:bg-emerald-400 border-2 border-emerald-200/85 text-slate-950 font-bold flex flex-col items-center justify-center shadow-[0_0_22px_rgba(16,185,129,0.5)] active:scale-95 transition-all backdrop-blur-md"
            title="Tekan / Tahan untuk Menggunakan Alat & Senjata"
          >
            {equippedTool === 'BOW' ? (
              <Crosshair className="w-5 h-5 stroke-[2.5]" />
            ) : equippedTool === 'SNOWBALL' ? (
              <Snowflake className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Swords className="w-5 h-5 stroke-[2.5]" />
            )}
            <span className="text-[9px] font-extrabold tracking-wider uppercase mt-0.5">
              {WEAPON_TOOLS_LIST.find((w) => w.id === equippedTool)?.actionLabel.split(' ')[0] ||
                'Aksi'}
            </span>
          </button>
        )}

        <button
          type="button"
          onTouchStart={(e) => {
            e.stopPropagation();
            onJumpPress();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onJumpPress();
          }}
          className="w-20 h-20 rounded-full bg-sky-500/85 active:bg-sky-400 border-2 border-sky-200/80 text-slate-950 font-bold flex flex-col items-center justify-center shadow-[0_0_24px_rgba(56,189,248,0.45)] active:scale-95 transition-all backdrop-blur-md"
          title="Lompat"
        >
          <ArrowUp className="w-6 h-6 stroke-[2.5]" />
          <span className="text-[10px] font-extrabold tracking-wider uppercase">
            Lompat
          </span>
        </button>
      </div>
    </div>
  );
};

export const DeviceBadgeIcon: React.FC<{ mode: DeviceControlMode }> = ({ mode }) =>
  mode === 'MOBILE' ? (
    <Smartphone className="w-4 h-4 text-emerald-400" />
  ) : (
    <Monitor className="w-4 h-4 text-sky-400" />
  );
