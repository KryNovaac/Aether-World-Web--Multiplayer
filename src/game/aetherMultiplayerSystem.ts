/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as BABYLON from '@babylonjs/core';
import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import {
  createDetailedPaladinCharacter,
  SpawnedMob,
} from './aetherWorldEntities';
import {
  CharacterCustomization,
  DEFAULT_CHARACTER_CUSTOMIZATION,
  WeaponToolId,
  createCustomizableEquipmentSystem,
} from './aetherCharacterAndWeapons';

export type GamePlayMode = 'SINGLE_PLAYER' | 'MULTIPLAYER';
export type MultiplayerRoomAction = 'CREATE_ROOM' | 'JOIN_ROOM';

export interface WorldSessionConfig {
  playMode: GamePlayMode;
  roomAction: MultiplayerRoomAction;
  roomCode: string;
  roomName: string;
  hostUid?: string;
  hostName?: string;
}

export interface ChatMessageItem {
  id: string;
  realmId: string;
  senderUid: string;
  senderName: string;
  text: string;
  timestampMs: number;
  timeLabel: string;
  isSystem?: boolean;
  isHost?: boolean;
}

export interface PlayerAuthIdentity {
  uid: string;
  displayName: string;
  isFirebaseVerified: boolean;
  isLoggedIn?: boolean;
  email?: string | null;
  photoURL?: string | null;
}

export interface StoredLocalAccount {
  uid: string;
  displayName: string;
  pinOrPassword: string;
  createdAtMs: number;
}

export interface RemotePlayerNetworkState {
  uid: string;
  realmId: string;
  displayName: string;
  x: number;
  y: number;
  z: number;
  facingYaw: number;
  aimPitch: number;
  isMoving: boolean;
  isSprinting: boolean;
  isGrounded: boolean;
  isAttacking: boolean;
  isHolding: boolean;
  chargeRatio: number;
  customization: CharacterCustomization;
  online: boolean;
  lastSeenMs: number;
  chatBubbleText?: string;
  chatBubbleExpiresMs?: number;
}

export interface OnlinePlayerSummary {
  uid: string;
  displayName: string;
  equippedTool: WeaponToolId;
  isLocal: boolean;
  isHost: boolean;
  distanceMeters: number;
  x: number;
  z: number;
}

const STORAGE_AUTH_KEY = 'aether_player_auth_identity_v1';
const STORAGE_ACCOUNTS_DB_KEY = 'aether_registered_accounts_v1';
const STORAGE_ROOMS_REGISTRY_KEY = 'aether_local_rooms_registry_v1';
const MAX_REALM_PLAYERS = 10;
const CHAT_BUBBLE_DURATION_MS = 7500;

export function getRegisteredAccounts(): StoredLocalAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_DB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function signUpLocalAccount(
  uidInput: string,
  displayNameInput: string,
  pinOrPassword: string
): { ok: boolean; error?: string; identity?: PlayerAuthIdentity } {
  const cleanUid = sanitizePlayerUid(uidInput.trim()) || generateRandomPlayerUid();
  const cleanName = displayNameInput.trim().slice(0, 24);
  const check = validatePlayerIdentity(cleanUid, cleanName);
  if (!check.valid) {
    return { ok: false, error: check.error };
  }
  if (!pinOrPassword || pinOrPassword.trim().length < 3) {
    return {
      ok: false,
      error: 'Kata Sandi / PIN akun minimal 3 karakter.',
    };
  }

  const accounts = getRegisteredAccounts();
  const existingIdx = accounts.findIndex(
    (a) => a.uid.toLowerCase() === cleanUid.toLowerCase()
  );
  const newAcc: StoredLocalAccount = {
    uid: cleanUid,
    displayName: cleanName,
    pinOrPassword: pinOrPassword.trim(),
    createdAtMs: Date.now(),
  };

  if (existingIdx >= 0) {
    accounts[existingIdx] = newAcc;
  } else {
    accounts.push(newAcc);
  }
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_DB_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore storage error
  }

  const identity: PlayerAuthIdentity = {
    uid: cleanUid,
    displayName: cleanName,
    isFirebaseVerified: false,
    isLoggedIn: true,
    email: null,
    photoURL: null,
  };
  savePlayerIdentityToStorage(identity);
  return { ok: true, identity };
}

export function loginLocalAccount(
  uidOrNameInput: string,
  pinOrPassword: string
): { ok: boolean; error?: string; identity?: PlayerAuthIdentity } {
  const query = uidOrNameInput.trim().toLowerCase();
  if (!query) {
    return { ok: false, error: 'Masukkan UID atau Name (Nickname) akun Anda.' };
  }
  const accounts = getRegisteredAccounts();
  const found = accounts.find(
    (a) =>
      a.uid.toLowerCase() === query ||
      a.displayName.toLowerCase() === query
  );
  if (!found) {
    return {
      ok: false,
      error:
        'Akun tidak ditemukan. Silakan gunakan tab Sign Up (Daftar Baru) atau Login Google.',
    };
  }
  if (found.pinOrPassword !== pinOrPassword.trim()) {
    return {
      ok: false,
      error: 'Kata Sandi / PIN yang dimasukkan tidak sesuai.',
    };
  }

  const identity: PlayerAuthIdentity = {
    uid: found.uid,
    displayName: found.displayName,
    isFirebaseVerified: false,
    isLoggedIn: true,
    email: null,
    photoURL: null,
  };
  savePlayerIdentityToStorage(identity);
  return { ok: true, identity };
}

export function generateRandomPlayerUid(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AETHER_${suffix}`;
}

export function generateWorldRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function sanitizeRoomCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 16);
}

export function sanitizePlayerUid(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

export function validatePlayerIdentity(
  uid: string,
  displayName: string
): { valid: boolean; error?: string } {
  const cleanUid = sanitizePlayerUid(uid.trim());
  const cleanName = displayName.trim();

  if (!cleanUid || cleanUid.length < 3) {
    return {
      valid: false,
      error: 'UID wajib diisi (minimal 3 karakter huruf/angka, contoh: AETHER_01).',
    };
  }
  if (!cleanName || cleanName.length < 2) {
    return {
      valid: false,
      error: 'Name (Nickname) wajib diisi minimal 2 karakter untuk ditampilkan di atas kepala.',
    };
  }
  if (cleanName.length > 24) {
    return {
      valid: false,
      error: 'Name (Nickname) maksimal 24 karakter.',
    };
  }
  return { valid: true };
}

export function validateWorldSessionConfig(
  session: WorldSessionConfig
): { valid: boolean; error?: string } {
  if (session.playMode === 'SINGLE_PLAYER') {
    return { valid: true };
  }
  const cleanCode = sanitizeRoomCode(session.roomCode.trim());
  if (!cleanCode || cleanCode.length < 4) {
    return {
      valid: false,
      error:
        session.roomAction === 'CREATE_ROOM'
          ? 'Kode World/Room wajib minimal 4 karakter (klik Generate Code).'
          : 'Masukkan Kode World/Room yang valid (minimal 4 karakter) untuk bergabung.',
    };
  }
  if (session.roomAction === 'CREATE_ROOM' && session.roomName.trim().length < 2) {
    return {
      valid: false,
      error: 'Nama World/Room wajib diisi minimal 2 karakter.',
    };
  }
  return { valid: true };
}

export function registerRoomLocally(
  roomCode: string,
  roomName: string,
  hostUid: string,
  hostName: string
) {
  try {
    const raw = localStorage.getItem(STORAGE_ROOMS_REGISTRY_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[roomCode] = {
      roomCode,
      roomName,
      hostUid,
      hostName,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_ROOMS_REGISTRY_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage errors
  }
}

export function lookupRoomLocally(roomCode: string): {
  roomCode: string;
  roomName: string;
  hostUid: string;
  hostName: string;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_ROOMS_REGISTRY_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[roomCode] || null;
  } catch {
    return null;
  }
}

export function loadSavedPlayerIdentity(): PlayerAuthIdentity {
  try {
    const raw =
      sessionStorage.getItem(STORAGE_AUTH_KEY) ||
      localStorage.getItem(STORAGE_AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.uid === 'string' &&
        typeof parsed.displayName === 'string'
      ) {
        return {
          uid: sanitizePlayerUid(parsed.uid) || generateRandomPlayerUid(),
          displayName: parsed.displayName.slice(0, 24) || 'Ksatria Aether',
          isFirebaseVerified: Boolean(parsed.isFirebaseVerified),
          isLoggedIn: Boolean(parsed.isLoggedIn || parsed.isFirebaseVerified),
          email: parsed.email || null,
          photoURL: parsed.photoURL || null,
        };
      }
    }
  } catch {
    // Fallback below
  }
  const freshUid = generateRandomPlayerUid();
  return {
    uid: freshUid,
    displayName: `Ranger_${freshUid.slice(-4)}`,
    isFirebaseVerified: false,
    isLoggedIn: false,
    email: null,
    photoURL: null,
  };
}

export function savePlayerIdentityToStorage(identity: PlayerAuthIdentity): void {
  try {
    const serialized = JSON.stringify(identity);
    sessionStorage.setItem(STORAGE_AUTH_KEY, serialized);
    localStorage.setItem(STORAGE_AUTH_KEY, serialized);
  } catch {
    // Ignore storage quota errors
  }
}

function getWeaponShortBadge(tool: WeaponToolId): string {
  switch (tool) {
    case 'SWORD':
      return 'PEDANG AETHER';
    case 'SPEAR':
      return 'TOMBAK ASTRAL';
    case 'BOW':
      return 'BUSUR PANAH';
    case 'SNOWBALL':
      return 'BOLA SALJU';
    case 'NONE':
      return 'TANGAN KOSONG';
  }
}

function formatNowHHMM(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Membangun 3D Floating Name di atas kepala karakter:
 * - Ukuran proporsional (tidak terlalu besar)
 * - Hanya menampilkan Name (tanpa UID, tanpa kotak/bungkus)
 * - Berwarna keemasan (#FACC15) jika Admin/Host, putih (#FFFFFF) untuk pemain biasa
 */
export function createPlayerNametagBillboard(
  scene: BABYLON.Scene,
  parentNode: BABYLON.TransformNode,
  initialName: string,
  initialUid: string,
  initialTool: WeaponToolId,
  isLocalPlayer: boolean,
  initialIsHost = false
) {
  const billboardPlane = BABYLON.MeshBuilder.CreatePlane(
    `nametagPlane_${initialUid}`,
    { width: 1.35, height: 0.36 },
    scene
  );
  billboardPlane.parent = parentNode;
  billboardPlane.position.set(0, 2.34, 0);
  billboardPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  billboardPlane.isPickable = false;
  billboardPlane.renderingGroupId = 1;

  const dynTex = new BABYLON.DynamicTexture(
    `nametagTex_${initialUid}`,
    { width: 512, height: 136 },
    scene,
    true
  );
  dynTex.hasAlpha = true;

  const mat = new BABYLON.StandardMaterial(`nametagMat_${initialUid}`, scene);
  mat.diffuseTexture = dynTex;
  mat.emissiveTexture = dynTex;
  mat.opacityTexture = dynTex;
  mat.disableLighting = true;
  mat.backFaceCulling = false;
  mat.useAlphaFromDiffuseTexture = true;
  billboardPlane.material = mat;

  let lastRenderedSignature = '';

  const updateNametag = (
    displayName: string,
    _uid: string,
    _equippedTool: WeaponToolId,
    _isLocal: boolean,
    _isHolding = false,
    _chargeRatio = 0,
    chatBubbleText = '',
    isHost = false
  ) => {
    const cleanBubble = chatBubbleText.trim().slice(0, 42);
    const cleanNick = (displayName || 'Player').trim().slice(0, 24);
    const signature = `${cleanNick}|${cleanBubble}|${isHost}`;
    if (signature === lastRenderedSignature) return;
    lastRenderedSignature = signature;

    const ctx = dynTex.getContext() as unknown as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, 512, 136);
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';

    // Jika sedang mengirim pesan chat singkat, tampilkan teks tipis di atas nama
    if (cleanBubble.length > 0) {
      ctx.font = '600 18px sans-serif';
      const msg =
        chatBubbleText.trim().length > 40
          ? `"${cleanBubble}..."`
          : `"${cleanBubble}"`;
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.strokeText(msg, 256, 36);
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText(msg, 256, 36);
    }

    // Murni hanya teks Name (tanpa kotak/bungkus, tanpa UID)
    // Berwarna keemasan (#FACC15) jika Admin/Host, putih (#FFFFFF) jika bukan Admin
    ctx.font = '700 28px sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.strokeText(cleanNick, 256, 92);

    ctx.fillStyle = isHost ? '#FACC15' : '#FFFFFF';
    ctx.fillText(cleanNick, 256, 92);
    ctx.shadowBlur = 0;

    dynTex.update();
  };

  updateNametag(
    initialName,
    initialUid,
    initialTool,
    isLocalPlayer,
    false,
    0,
    '',
    initialIsHost
  );

  return {
    mesh: billboardPlane,
    updateNametag,
    setVisible: (visible: boolean) => {
      billboardPlane.isVisible = visible;
    },
    dispose: () => {
      billboardPlane.dispose();
      mat.dispose();
      dynTex.dispose();
    },
  };
}

function lerpAngleShortest(a: number, b: number, t: number): number {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

interface RemotePlayerAvatar {
  uid: string;
  state: RemotePlayerNetworkState;
  rig: ReturnType<typeof createDetailedPaladinCharacter>;
  equipmentSystem: ReturnType<typeof createCustomizableEquipmentSystem>;
  dummyCamera: BABYLON.FreeCamera;
  nametag: ReturnType<typeof createPlayerNametagBillboard>;
  walkCycleTime: number;
  wasHolding: boolean;
  lastAttackTriggerMs: number;
  appliedCustomizationSig: string;
}

/**
 * Manajer Sinkronisasi Multiplayer Real-Time & Kolom Chat per World/Room Code:
 * - Mendukung Mode SINGLE_PLAYER (Solo) maupun MULTIPLAYER (Buat Room / Masuk Room via Code).
 * - Menyinkronkan posisi, rotasi, kustomisasi pakaian, senjata, dan pesan chat per Room Code.
 */
export class AetherMultiplayerManager {
  private scene: BABYLON.Scene;
  private shadowGenerator: BABYLON.ShadowGenerator;
  private cyanGlowMat: BABYLON.StandardMaterial;
  private goldGlowMat: BABYLON.StandardMaterial;
  private spawnedMobs: SpawnedMob[];
  private getTerrainHeight: (x: number, z: number) => number;

  private identity: PlayerAuthIdentity;
  private localCustomization: CharacterCustomization;
  private sessionConfig: WorldSessionConfig;
  private roomHostUid: string;
  private roomHostName: string;

  private remoteAvatars = new Map<string, RemotePlayerAvatar>();
  private chatMessages: ChatMessageItem[] = [];
  private seenMessageIds = new Set<string>();
  private localChatBubbleText = '';
  private localChatBubbleExpiresMs = 0;

  private broadcastChannel: BroadcastChannel | null = null;
  private realmUnsubscribe: (() => void) | null = null;
  private playerUnsubscribes = new Map<string, () => void>();

  private lastNetworkBroadcastMs = 0;
  private lastFirestoreSyncMs = 0;
  private isFirestoreDocCreated = false;
  private onRosterChangedCallback?: (players: OnlinePlayerSummary[]) => void;
  private onChatUpdatedCallback?: (messages: ChatMessageItem[]) => void;

  constructor(
    scene: BABYLON.Scene,
    shadowGenerator: BABYLON.ShadowGenerator,
    cyanGlowMat: BABYLON.StandardMaterial,
    goldGlowMat: BABYLON.StandardMaterial,
    spawnedMobs: SpawnedMob[],
    getTerrainHeight: (x: number, z: number) => number,
    initialIdentity: PlayerAuthIdentity,
    initialCustomization: CharacterCustomization,
    sessionConfig: WorldSessionConfig,
    onRosterChanged?: (players: OnlinePlayerSummary[]) => void,
    onChatUpdated?: (messages: ChatMessageItem[]) => void
  ) {
    this.scene = scene;
    this.shadowGenerator = shadowGenerator;
    this.cyanGlowMat = cyanGlowMat;
    this.goldGlowMat = goldGlowMat;
    this.spawnedMobs = spawnedMobs;
    this.getTerrainHeight = getTerrainHeight;
    this.identity = initialIdentity;
    this.localCustomization = initialCustomization;
    this.sessionConfig = {
      ...sessionConfig,
      roomCode: sanitizeRoomCode(sessionConfig.roomCode) || 'AE7K9M',
    };
    this.roomHostUid =
      sessionConfig.roomAction === 'CREATE_ROOM'
        ? initialIdentity.uid
        : sessionConfig.hostUid || '';
    this.roomHostName =
      sessionConfig.roomAction === 'CREATE_ROOM'
        ? initialIdentity.displayName
        : sessionConfig.hostName || 'Admin';

    this.onRosterChangedCallback = onRosterChanged;
    this.onChatUpdatedCallback = onChatUpdated;

    // Tambahkan pesan selamat datang di Kolom Chat
    if (this.sessionConfig.playMode === 'SINGLE_PLAYER') {
      this.appendSystemChatMessage(
        `Mode Single Player aktif. Selamat menjelajah Dunia Aetheria, ${initialIdentity.displayName}!`
      );
    } else if (this.sessionConfig.roomAction === 'CREATE_ROOM') {
      registerRoomLocally(
        this.sessionConfig.roomCode,
        this.sessionConfig.roomName,
        initialIdentity.uid,
        initialIdentity.displayName
      );
      this.appendSystemChatMessage(
        `World/Room "${this.sessionConfig.roomName}" dibuat! Bagikan Kode Room [${this.sessionConfig.roomCode}] kepada pemain lain untuk bergabung.`
      );
    } else {
      const localRoom = lookupRoomLocally(this.sessionConfig.roomCode);
      if (localRoom) {
        this.roomHostUid = localRoom.hostUid;
        this.roomHostName = localRoom.hostName;
      }
      this.appendSystemChatMessage(
        `Bergabung ke World/Room Kode [${this.sessionConfig.roomCode}] sebagai ${initialIdentity.displayName}.`
      );
    }

    if (this.sessionConfig.playMode === 'MULTIPLAYER') {
      this.initBroadcastChannel();
      this.initFirestoreSync();
    }
  }

  private appendSystemChatMessage(text: string) {
    const sysMsg: ChatMessageItem = {
      id: `sys_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      realmId: this.sessionConfig.roomCode,
      senderUid: 'SYSTEM',
      senderName: 'SISTEM AETHER',
      text,
      timestampMs: Date.now(),
      timeLabel: formatNowHHMM(),
      isSystem: true,
    };
    this.seenMessageIds.add(sysMsg.id);
    this.chatMessages = [...this.chatMessages.slice(-49), sysMsg];
    this.onChatUpdatedCallback?.(this.chatMessages);
  }

  public getLocalChatBubble(): string {
    if (
      this.localChatBubbleText &&
      performance.now() < this.localChatBubbleExpiresMs
    ) {
      return this.localChatBubbleText;
    }
    return '';
  }

  public isLocalPlayerHost(): boolean {
    if (this.sessionConfig.playMode === 'SINGLE_PLAYER') return true;
    return (
      this.sessionConfig.roomAction === 'CREATE_ROOM' ||
      this.roomHostUid === this.identity.uid
    );
  }

  public async sendChatMessage(rawText: string) {
    const cleanText = rawText.trim().slice(0, 160);
    if (!cleanText) return;

    const msgId = `msg_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)
      .replace(/[^a-zA-Z0-9]/g, '')}`;
    const roomCode = this.sessionConfig.roomCode;

    const msgItem: ChatMessageItem = {
      id: msgId,
      realmId: roomCode,
      senderUid: this.identity.uid,
      senderName: this.identity.displayName,
      text: cleanText,
      timestampMs: Date.now(),
      timeLabel: formatNowHHMM(),
      isHost: this.isLocalPlayerHost(),
    };

    this.seenMessageIds.add(msgId);
    this.chatMessages = [...this.chatMessages.slice(-49), msgItem];
    this.onChatUpdatedCallback?.(this.chatMessages);

    // Tampilkan balon chat di atas kepala karakter lokal selama 7.5 detik
    this.localChatBubbleText = cleanText;
    this.localChatBubbleExpiresMs = performance.now() + CHAT_BUBBLE_DURATION_MS;

    if (this.sessionConfig.playMode === 'SINGLE_PLAYER') {
      return;
    }

    // 1. Kirim instan melalui BroadcastChannel ke tab/window lain di Room yang sama
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'CHAT_MESSAGE',
          realmId: roomCode,
          payload: msgItem,
        });
      } catch {
        // Ignore
      }
    }

    // 2. Sinkronkan ke Cloud Firestore pada dokumen `/realms/{roomCode}`
    if (this.canUseVerifiedFirestore()) {
      const realmRef = doc(db, 'realms', roomCode);
      try {
        const snap = await getDoc(realmRef);
        if (snap.exists()) {
          const data = snap.data();
          const existingIds: string[] = Array.isArray(data?.activePlayerIds)
            ? data.activePlayerIds.filter((id: unknown) => typeof id === 'string')
            : [this.identity.uid];
          const nextIds = existingIds.includes(this.identity.uid)
            ? existingIds
            : [...existingIds.slice(-(MAX_REALM_PLAYERS - 1)), this.identity.uid];

          await updateDoc(realmRef, {
            activePlayerIds: nextIds.length > 0 ? nextIds : [this.identity.uid],
            lastMessageId: msgId,
            lastMessageSender: this.identity.displayName.slice(0, 24),
            lastMessageUid: this.identity.uid,
            lastMessageText: cleanText,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `realms/${roomCode}`);
      }
    }
  }

  private handleIncomingChatMessage(msgItem: ChatMessageItem) {
    if (!msgItem || !msgItem.id || this.seenMessageIds.has(msgItem.id)) return;
    if (msgItem.realmId !== this.sessionConfig.roomCode) return;

    this.seenMessageIds.add(msgItem.id);
    this.chatMessages = [...this.chatMessages.slice(-49), msgItem];
    this.onChatUpdatedCallback?.(this.chatMessages);

    // Tampilkan balon chat di atas kepala avatar pengirim
    const remoteAvatar = this.remoteAvatars.get(msgItem.senderUid);
    if (remoteAvatar) {
      remoteAvatar.state.chatBubbleText = msgItem.text;
      remoteAvatar.state.chatBubbleExpiresMs =
        performance.now() + CHAT_BUBBLE_DURATION_MS;
    }
  }

  public updateIdentityAndCustomization(
    newIdentity: PlayerAuthIdentity,
    newCustomization: CharacterCustomization
  ) {
    const uidChanged = this.identity.uid !== newIdentity.uid;
    this.identity = newIdentity;
    this.localCustomization = newCustomization;

    if (this.sessionConfig.playMode === 'SINGLE_PLAYER') return;

    if (uidChanged) {
      this.cleanupFirestoreListeners();
      this.isFirestoreDocCreated = false;
      this.initFirestoreSync();
    } else {
      this.syncUserProfileToFirestore();
    }
  }

  private initBroadcastChannel() {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      this.broadcastChannel = new BroadcastChannel('aether_multiplayer_bus_v1');
      this.broadcastChannel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;

        if (msg.type === 'PLAYER_STATE' && msg.payload) {
          const pkt = msg.payload as RemotePlayerNetworkState;
          if (
            pkt.uid &&
            pkt.uid !== this.identity.uid &&
            pkt.realmId === this.sessionConfig.roomCode
          ) {
            this.handleIncomingRemoteState(pkt);
          }
        } else if (
          msg.type === 'CHAT_MESSAGE' &&
          msg.realmId === this.sessionConfig.roomCode &&
          msg.payload
        ) {
          this.handleIncomingChatMessage(msg.payload as ChatMessageItem);
        } else if (
          msg.type === 'PLAYER_LEAVE' &&
          typeof msg.uid === 'string' &&
          msg.realmId === this.sessionConfig.roomCode
        ) {
          this.removeRemoteAvatar(msg.uid);
        }
      };
    } catch {
      // BroadcastChannel not supported in some restricted environments
    }
  }

  private canUseVerifiedFirestore(): boolean {
    if (this.sessionConfig.playMode === 'SINGLE_PLAYER') return false;
    const currentUser = auth.currentUser;
    return Boolean(
      currentUser &&
        currentUser.emailVerified &&
        currentUser.uid === this.identity.uid
    );
  }

  private async syncUserProfileToFirestore() {
    if (!this.canUseVerifiedFirestore()) return;
    const uid = this.identity.uid;
    const userRef = doc(db, 'users', uid);
    try {
      const snap = await getDoc(userRef);
      const c = this.localCustomization;
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid,
          displayName: this.identity.displayName.slice(0, 24),
          modelId: c.modelId,
          colorTheme: c.colorTheme,
          hairColor: c.hairColor,
          headwearId: c.headwearId,
          topOutfitId: c.topOutfitId,
          bottomPantsId: c.bottomPantsId,
          bodyAccessoryId: c.bodyAccessoryId,
          backAttachment: c.backAttachment,
          equippedTool: c.equippedTool,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userRef, {
          displayName: this.identity.displayName.slice(0, 24),
          modelId: c.modelId,
          colorTheme: c.colorTheme,
          hairColor: c.hairColor,
          headwearId: c.headwearId,
          topOutfitId: c.topOutfitId,
          bottomPantsId: c.bottomPantsId,
          bodyAccessoryId: c.bodyAccessoryId,
          backAttachment: c.backAttachment,
          equippedTool: c.equippedTool,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  }

  private async registerInRealmRoster() {
    if (!this.canUseVerifiedFirestore()) return;
    const uid = this.identity.uid;
    const roomCode = this.sessionConfig.roomCode;
    const realmRef = doc(db, 'realms', roomCode);
    try {
      const snap = await getDoc(realmRef);
      if (!snap.exists()) {
        const initMsgId = `init_${roomCode}`;
        this.seenMessageIds.add(initMsgId);
        await setDoc(realmRef, {
          realmId: roomCode,
          roomName: (this.sessionConfig.roomName || `Room ${roomCode}`).slice(0, 32),
          hostUid: uid,
          hostName: this.identity.displayName.slice(0, 24),
          seasonMode: 'SEMI',
          weatherMode: 'CERAH',
          activePlayerIds: [uid],
          lastMessageId: initMsgId,
          lastMessageSender: this.identity.displayName.slice(0, 24),
          lastMessageUid: uid,
          lastMessageText: `World/Room ${roomCode} dibuka oleh ${this.identity.displayName}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const data = snap.data();
        if (typeof data?.hostUid === 'string') {
          this.roomHostUid = data.hostUid;
        }
        if (typeof data?.hostName === 'string') {
          this.roomHostName = data.hostName;
        }
        const existingIds: string[] = Array.isArray(data?.activePlayerIds)
          ? data.activePlayerIds.filter((id: unknown) => typeof id === 'string')
          : [];
        if (!existingIds.includes(uid)) {
          const updatedIds = [...existingIds.slice(-(MAX_REALM_PLAYERS - 1)), uid];
          await updateDoc(realmRef, {
            activePlayerIds: updatedIds,
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `realms/${roomCode}`);
    }
  }

  private initFirestoreSync() {
    if (!this.canUseVerifiedFirestore()) return;

    this.syncUserProfileToFirestore();

    const roomCode = this.sessionConfig.roomCode;
    const realmRef = doc(db, 'realms', roomCode);
    this.realmUnsubscribe = onSnapshot(
      realmRef,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (typeof data?.hostUid === 'string') {
          this.roomHostUid = data.hostUid;
        }
        if (typeof data?.hostName === 'string') {
          this.roomHostName = data.hostName;
        }
        const activeIds: string[] = Array.isArray(data?.activePlayerIds)
          ? data.activePlayerIds
          : [];
        this.syncRemotePlayerListeners(activeIds);

        // Periksa apakah ada pesan chat terbaru di Room ini
        if (
          typeof data?.lastMessageId === 'string' &&
          !data.lastMessageId.startsWith('init_') &&
          !this.seenMessageIds.has(data.lastMessageId) &&
          typeof data?.lastMessageText === 'string' &&
          typeof data?.lastMessageSender === 'string' &&
          typeof data?.lastMessageUid === 'string'
        ) {
          this.handleIncomingChatMessage({
            id: data.lastMessageId,
            realmId: roomCode,
            senderUid: data.lastMessageUid,
            senderName: data.lastMessageSender,
            text: data.lastMessageText,
            timestampMs: Date.now(),
            timeLabel: formatNowHHMM(),
            isHost: data.lastMessageUid === this.roomHostUid,
          });
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `realms/${roomCode}`);
      }
    );
  }

  private syncRemotePlayerListeners(activeIds: string[]) {
    const remoteIds = new Set(
      activeIds.filter((id) => typeof id === 'string' && id !== this.identity.uid)
    );

    for (const [uid, unsub] of this.playerUnsubscribes.entries()) {
      if (!remoteIds.has(uid)) {
        unsub();
        this.playerUnsubscribes.delete(uid);
        this.removeRemoteAvatar(uid);
      }
    }

    for (const remoteUid of remoteIds) {
      if (!this.playerUnsubscribes.has(remoteUid)) {
        const pRef = doc(db, 'players', remoteUid);
        const unsub = onSnapshot(
          pRef,
          (snap) => {
            if (!snap.exists()) {
              this.removeRemoteAvatar(remoteUid);
              return;
            }
            const d = snap.data();
            if (
              !d ||
              d.online === false ||
              d.realmId !== this.sessionConfig.roomCode
            ) {
              this.removeRemoteAvatar(remoteUid);
              return;
            }
            const pkt: RemotePlayerNetworkState = {
              uid: d.uid || remoteUid,
              realmId: d.realmId || this.sessionConfig.roomCode,
              displayName: d.displayName || 'Player',
              x: typeof d.x === 'number' ? d.x : 0,
              y: typeof d.y === 'number' ? d.y : 0,
              z: typeof d.z === 'number' ? d.z : -10,
              facingYaw: typeof d.facingYaw === 'number' ? d.facingYaw : 0,
              aimPitch: typeof d.aimPitch === 'number' ? d.aimPitch : 0,
              isMoving: Boolean(d.isMoving),
              isSprinting: Boolean(d.isSprinting),
              isGrounded: d.isGrounded !== false,
              isAttacking: Boolean(d.isAttacking),
              isHolding: Boolean(d.isHolding),
              chargeRatio: typeof d.chargeRatio === 'number' ? d.chargeRatio : 0,
              customization: {
                modelId: d.modelId || DEFAULT_CHARACTER_CUSTOMIZATION.modelId,
                colorTheme:
                  d.colorTheme || DEFAULT_CHARACTER_CUSTOMIZATION.colorTheme,
                hairColor:
                  d.hairColor || DEFAULT_CHARACTER_CUSTOMIZATION.hairColor,
                headwearId:
                  d.headwearId || DEFAULT_CHARACTER_CUSTOMIZATION.headwearId,
                topOutfitId:
                  d.topOutfitId || DEFAULT_CHARACTER_CUSTOMIZATION.topOutfitId,
                bottomPantsId:
                  d.bottomPantsId ||
                  DEFAULT_CHARACTER_CUSTOMIZATION.bottomPantsId,
                bodyAccessoryId:
                  d.bodyAccessoryId ||
                  DEFAULT_CHARACTER_CUSTOMIZATION.bodyAccessoryId,
                backAttachment:
                  d.backAttachment ||
                  DEFAULT_CHARACTER_CUSTOMIZATION.backAttachment,
                equippedTool:
                  d.equippedTool || DEFAULT_CHARACTER_CUSTOMIZATION.equippedTool,
              },
              online: true,
              lastSeenMs: performance.now(),
            };
            this.handleIncomingRemoteState(pkt);
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `players/${remoteUid}`);
          }
        );
        this.playerUnsubscribes.set(remoteUid, unsub);
      }
    }
  }

  private getCustomizationSig(c: CharacterCustomization): string {
    return `${c.modelId}|${c.colorTheme}|${c.hairColor}|${c.headwearId}|${c.topOutfitId}|${c.bottomPantsId}|${c.bodyAccessoryId}|${c.backAttachment}|${c.equippedTool}`;
  }

  private handleIncomingRemoteState(pkt: RemotePlayerNetworkState) {
    pkt.lastSeenMs = performance.now();
    let avatar = this.remoteAvatars.get(pkt.uid);

    if (!avatar) {
      const rig = createDetailedPaladinCharacter(
        this.scene,
        this.shadowGenerator,
        this.cyanGlowMat,
        this.goldGlowMat
      );
      rig.playerRoot.position.set(pkt.x, pkt.y, pkt.z);
      rig.characterVisual.rotation.y = pkt.facingYaw;

      const dummyCamera = new BABYLON.FreeCamera(
        `remoteDummyCam_${pkt.uid}`,
        new BABYLON.Vector3(0, -999, 0),
        this.scene
      );

      const equipmentSystem = createCustomizableEquipmentSystem(
        this.scene,
        rig,
        dummyCamera,
        this.cyanGlowMat,
        this.goldGlowMat
      );
      equipmentSystem.applyCustomization(pkt.customization, false);

      const nametag = createPlayerNametagBillboard(
        this.scene,
        rig.characterVisual,
        pkt.displayName,
        pkt.uid,
        pkt.customization.equippedTool,
        false,
        pkt.uid === this.roomHostUid
      );

      avatar = {
        uid: pkt.uid,
        state: pkt,
        rig,
        equipmentSystem,
        dummyCamera,
        nametag,
        walkCycleTime: 0,
        wasHolding: false,
        lastAttackTriggerMs: 0,
        appliedCustomizationSig: this.getCustomizationSig(pkt.customization),
      };
      this.remoteAvatars.set(pkt.uid, avatar);
      this.appendSystemChatMessage(
        `${pkt.displayName} (UID: ${pkt.uid.slice(0, 8)}) bergabung ke World/Room.`
      );
    } else {
      const prevAttacking = avatar.state.isAttacking;
      const existingBubble = avatar.state.chatBubbleText;
      const existingBubbleExp = avatar.state.chatBubbleExpiresMs;
      avatar.state = {
        ...pkt,
        chatBubbleText: pkt.chatBubbleText || existingBubble,
        chatBubbleExpiresMs: pkt.chatBubbleExpiresMs || existingBubbleExp,
      };

      const newSig = this.getCustomizationSig(pkt.customization);
      if (newSig !== avatar.appliedCustomizationSig) {
        avatar.appliedCustomizationSig = newSig;
        avatar.equipmentSystem.applyCustomization(pkt.customization, false);
      }

      const activeBubble =
        avatar.state.chatBubbleText &&
        avatar.state.chatBubbleExpiresMs &&
        performance.now() < avatar.state.chatBubbleExpiresMs
          ? avatar.state.chatBubbleText
          : '';

      avatar.nametag.updateNametag(
        pkt.displayName,
        pkt.uid,
        pkt.customization.equippedTool,
        false,
        pkt.isHolding,
        pkt.chargeRatio,
        activeBubble,
        pkt.uid === this.roomHostUid
      );

      if (pkt.isHolding && !avatar.wasHolding) {
        avatar.wasHolding = true;
        avatar.equipmentSystem.startWeaponHold(
          avatar.rig.playerRoot.position,
          pkt.facingYaw,
          pkt.aimPitch,
          this.spawnedMobs
        );
      } else if (!pkt.isHolding && avatar.wasHolding) {
        avatar.wasHolding = false;
        avatar.equipmentSystem.releaseWeaponHold(
          avatar.rig.playerRoot.position,
          pkt.facingYaw,
          pkt.aimPitch,
          this.spawnedMobs
        );
      } else if (
        pkt.isAttacking &&
        !prevAttacking &&
        performance.now() - avatar.lastAttackTriggerMs > 280
      ) {
        avatar.lastAttackTriggerMs = performance.now();
        avatar.equipmentSystem.triggerWeaponAction(
          avatar.rig.playerRoot.position,
          pkt.facingYaw,
          pkt.aimPitch,
          this.spawnedMobs
        );
      }
    }
  }

  private removeRemoteAvatar(uid: string) {
    const avatar = this.remoteAvatars.get(uid);
    if (!avatar) return;
    const leavingName = avatar.state.displayName;
    avatar.nametag.dispose();
    avatar.dummyCamera.dispose();
    avatar.rig.playerRoot.dispose();
    this.remoteAvatars.delete(uid);
    this.appendSystemChatMessage(`${leavingName} keluar dari World/Room.`);
  }

  public updateFrame(
    dt: number,
    localPos: BABYLON.Vector3,
    facingYaw: number,
    aimPitch: number,
    isMoving: boolean,
    isSprinting: boolean,
    isGrounded: boolean,
    isAttacking: boolean,
    isHolding: boolean,
    chargeRatio: number
  ) {
    if (this.sessionConfig.playMode === 'SINGLE_PLAYER') {
      return;
    }

    const now = performance.now();

    // 1. Update & Interpolate Remote Avatars
    for (const [uid, avatar] of this.remoteAvatars.entries()) {
      if (
        !this.playerUnsubscribes.has(uid) &&
        now - avatar.state.lastSeenMs > 25000
      ) {
        this.removeRemoteAvatar(uid);
        continue;
      }

      const st = avatar.state;
      const targetPos = new BABYLON.Vector3(st.x, st.y, st.z);
      avatar.rig.playerRoot.position = BABYLON.Vector3.Lerp(
        avatar.rig.playerRoot.position,
        targetPos,
        Math.min(1, dt * 12)
      );

      avatar.rig.characterVisual.rotation.y = lerpAngleShortest(
        avatar.rig.characterVisual.rotation.y,
        st.facingYaw,
        Math.min(1, dt * 14)
      );

      // Update nametag if chat bubble expires
      const activeBubble =
        st.chatBubbleText &&
        st.chatBubbleExpiresMs &&
        now < st.chatBubbleExpiresMs
          ? st.chatBubbleText
          : '';
      avatar.nametag.updateNametag(
        st.displayName,
        st.uid,
        st.customization.equippedTool,
        false,
        st.isHolding,
        st.chargeRatio,
        activeBubble,
        st.uid === this.roomHostUid
      );

      const {
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
      } = avatar.rig;

      headGroup.rotation.x = BABYLON.Scalar.Lerp(
        headGroup.rotation.x,
        BABYLON.Scalar.Clamp(st.aimPitch * 0.55, -0.45, 0.45),
        Math.min(1, dt * 10)
      );

      if (!st.isGrounded) {
        torsoPivot.position.y = BABYLON.Scalar.Lerp(torsoPivot.position.y, 0.98, dt * 10);
        leftLegPivot.rotation.x = BABYLON.Scalar.Lerp(leftLegPivot.rotation.x, -0.45, dt * 10);
        rightLegPivot.rotation.x = BABYLON.Scalar.Lerp(rightLegPivot.rotation.x, 0.25, dt * 10);
        leftKneePivot.rotation.x = BABYLON.Scalar.Lerp(leftKneePivot.rotation.x, 0.85, dt * 10);
        rightKneePivot.rotation.x = BABYLON.Scalar.Lerp(rightKneePivot.rotation.x, 0.55, dt * 10);
      } else if (st.isMoving) {
        const freq = st.isSprinting ? 13.5 : 9.0;
        const amp = st.isSprinting ? 0.68 : 0.44;
        avatar.walkCycleTime += dt * freq;
        const phase = avatar.walkCycleTime;

        const leftThigh = Math.sin(phase) * amp;
        const rightThigh = -Math.sin(phase) * amp;
        leftLegPivot.rotation.x = leftThigh;
        rightLegPivot.rotation.x = rightThigh;
        leftKneePivot.rotation.x = Math.max(0, -Math.cos(phase) * amp * 1.15) + 0.08;
        rightKneePivot.rotation.x = Math.max(0, Math.cos(phase) * amp * 1.15) + 0.08;

        torsoPivot.position.y = 0.94 + Math.abs(Math.sin(phase * 2)) * 0.045;
        torsoPivot.rotation.y = Math.sin(phase) * 0.08;

        if (!st.isHolding && !st.isAttacking) {
          leftArmPivot.rotation.x = -leftThigh * 0.65;
          rightArmPivot.rotation.x = -rightThigh * 0.65;
          leftElbowPivot.rotation.x = -0.25 - Math.max(0, leftThigh) * 0.35;
          rightElbowPivot.rotation.x = -0.25 - Math.max(0, rightThigh) * 0.35;
        }
      } else {
        avatar.walkCycleTime = 0;
        const breath = Math.sin(now * 0.0025) * 0.015;
        torsoPivot.position.y = BABYLON.Scalar.Lerp(
          torsoPivot.position.y,
          0.94 + breath,
          dt * 8
        );
        torsoPivot.rotation.y = BABYLON.Scalar.Lerp(torsoPivot.rotation.y, 0, dt * 8);
        leftLegPivot.rotation.x = BABYLON.Scalar.Lerp(leftLegPivot.rotation.x, 0, dt * 10);
        rightLegPivot.rotation.x = BABYLON.Scalar.Lerp(rightLegPivot.rotation.x, 0, dt * 10);
        leftKneePivot.rotation.x = BABYLON.Scalar.Lerp(leftKneePivot.rotation.x, 0.04, dt * 10);
        rightKneePivot.rotation.x = BABYLON.Scalar.Lerp(rightKneePivot.rotation.x, 0.04, dt * 10);
      }

      avatar.equipmentSystem.updateWeaponsAndProjectiles(
        dt,
        now * 0.001,
        avatar.rig.playerRoot.position,
        st.facingYaw,
        st.aimPitch,
        this.getTerrainHeight,
        [],
        this.spawnedMobs
      );
    }

    // 2. Broadcast Local State at 20Hz to BroadcastChannel & 4Hz to Firestore
    if (now - this.lastNetworkBroadcastMs >= 50) {
      this.lastNetworkBroadcastMs = now;
      const packet: RemotePlayerNetworkState = {
        uid: this.identity.uid,
        realmId: this.sessionConfig.roomCode,
        displayName: this.identity.displayName,
        x: Number(localPos.x.toFixed(2)),
        y: Number(localPos.y.toFixed(2)),
        z: Number(localPos.z.toFixed(2)),
        facingYaw: Number(facingYaw.toFixed(3)),
        aimPitch: Number(aimPitch.toFixed(3)),
        isMoving,
        isSprinting,
        isGrounded,
        isAttacking,
        isHolding,
        chargeRatio: Number(chargeRatio.toFixed(2)),
        customization: this.localCustomization,
        online: true,
        lastSeenMs: now,
      };

      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({
            type: 'PLAYER_STATE',
            payload: packet,
          });
        } catch {
          // Ignore channel closed error
        }
      }

      if (now - this.lastFirestoreSyncMs >= 260) {
        this.lastFirestoreSyncMs = now;
        this.publishPlayerStateToFirestore(packet);
        this.emitRosterSummary(localPos);
      }
    }
  }

  private async publishPlayerStateToFirestore(pkt: RemotePlayerNetworkState) {
    if (!this.canUseVerifiedFirestore()) return;
    const uid = this.identity.uid;
    const roomCode = this.sessionConfig.roomCode;
    const playerRef = doc(db, 'players', uid);
    const c = pkt.customization;

    const clampCoord = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0));

    try {
      if (!this.isFirestoreDocCreated) {
        const snap = await getDoc(playerRef);
        if (!snap.exists()) {
          await setDoc(playerRef, {
            uid,
            realmId: roomCode,
            displayName: pkt.displayName.slice(0, 24),
            x: clampCoord(pkt.x, -250, 250),
            y: clampCoord(pkt.y, -50, 250),
            z: clampCoord(pkt.z, -250, 250),
            facingYaw: pkt.facingYaw,
            aimPitch: pkt.aimPitch,
            isMoving: pkt.isMoving,
            isSprinting: pkt.isSprinting,
            isGrounded: pkt.isGrounded,
            isAttacking: pkt.isAttacking,
            isHolding: pkt.isHolding,
            chargeRatio: clampCoord(pkt.chargeRatio, 0, 1),
            modelId: c.modelId,
            colorTheme: c.colorTheme,
            hairColor: c.hairColor,
            headwearId: c.headwearId,
            topOutfitId: c.topOutfitId,
            bottomPantsId: c.bottomPantsId,
            bodyAccessoryId: c.bodyAccessoryId,
            backAttachment: c.backAttachment,
            equippedTool: c.equippedTool,
            online: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(playerRef, {
            realmId: roomCode,
            displayName: pkt.displayName.slice(0, 24),
            x: clampCoord(pkt.x, -250, 250),
            y: clampCoord(pkt.y, -50, 250),
            z: clampCoord(pkt.z, -250, 250),
            facingYaw: pkt.facingYaw,
            aimPitch: pkt.aimPitch,
            isMoving: pkt.isMoving,
            isSprinting: pkt.isSprinting,
            isGrounded: pkt.isGrounded,
            isAttacking: pkt.isAttacking,
            isHolding: pkt.isHolding,
            chargeRatio: clampCoord(pkt.chargeRatio, 0, 1),
            modelId: c.modelId,
            colorTheme: c.colorTheme,
            hairColor: c.hairColor,
            headwearId: c.headwearId,
            topOutfitId: c.topOutfitId,
            bottomPantsId: c.bottomPantsId,
            bodyAccessoryId: c.bodyAccessoryId,
            backAttachment: c.backAttachment,
            equippedTool: c.equippedTool,
            online: true,
            updatedAt: serverTimestamp(),
          });
        }
        this.isFirestoreDocCreated = true;
        await this.registerInRealmRoster();
      } else {
        await updateDoc(playerRef, {
          realmId: roomCode,
          displayName: pkt.displayName.slice(0, 24),
          x: clampCoord(pkt.x, -250, 250),
          y: clampCoord(pkt.y, -50, 250),
          z: clampCoord(pkt.z, -250, 250),
          facingYaw: pkt.facingYaw,
          aimPitch: pkt.aimPitch,
          isMoving: pkt.isMoving,
          isSprinting: pkt.isSprinting,
          isGrounded: pkt.isGrounded,
          isAttacking: pkt.isAttacking,
          isHolding: pkt.isHolding,
          chargeRatio: clampCoord(pkt.chargeRatio, 0, 1),
          modelId: c.modelId,
          colorTheme: c.colorTheme,
          hairColor: c.hairColor,
          headwearId: c.headwearId,
          topOutfitId: c.topOutfitId,
          bottomPantsId: c.bottomPantsId,
          bodyAccessoryId: c.bodyAccessoryId,
          backAttachment: c.backAttachment,
          equippedTool: c.equippedTool,
          online: true,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `players/${uid}`);
    }
  }

  private emitRosterSummary(localPos: BABYLON.Vector3) {
    if (!this.onRosterChangedCallback) return;
    const list: OnlinePlayerSummary[] = [
      {
        uid: this.identity.uid,
        displayName: this.identity.displayName,
        equippedTool: this.localCustomization.equippedTool,
        isLocal: true,
        isHost: this.isLocalPlayerHost(),
        distanceMeters: 0,
        x: Math.round(localPos.x),
        z: Math.round(localPos.z),
      },
    ];

    for (const avatar of this.remoteAvatars.values()) {
      const dist = BABYLON.Vector3.Distance(
        localPos,
        avatar.rig.playerRoot.position
      );
      list.push({
        uid: avatar.uid,
        displayName: avatar.state.displayName,
        equippedTool: avatar.state.customization.equippedTool,
        isLocal: false,
        isHost: avatar.uid === this.roomHostUid,
        distanceMeters: Math.round(dist),
        x: Math.round(avatar.rig.playerRoot.position.x),
        z: Math.round(avatar.rig.playerRoot.position.z),
      });
    }

    this.onRosterChangedCallback(list);
  }

  public getRemotePlayerPositions(): {
    uid: string;
    displayName: string;
    x: number;
    z: number;
  }[] {
    const out: { uid: string; displayName: string; x: number; z: number }[] = [];
    for (const avatar of this.remoteAvatars.values()) {
      out.push({
        uid: avatar.uid,
        displayName: avatar.state.displayName,
        x: avatar.rig.playerRoot.position.x,
        z: avatar.rig.playerRoot.position.z,
      });
    }
    return out;
  }

  private cleanupFirestoreListeners() {
    if (this.realmUnsubscribe) {
      this.realmUnsubscribe();
      this.realmUnsubscribe = null;
    }
    for (const unsub of this.playerUnsubscribes.values()) {
      unsub();
    }
    this.playerUnsubscribes.clear();
  }

  public async dispose() {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'PLAYER_LEAVE',
          uid: this.identity.uid,
          realmId: this.sessionConfig.roomCode,
        });
        this.broadcastChannel.close();
      } catch {
        // Ignore
      }
      this.broadcastChannel = null;
    }

    this.cleanupFirestoreListeners();

    for (const uid of Array.from(this.remoteAvatars.keys())) {
      const av = this.remoteAvatars.get(uid);
      if (av) {
        av.nametag.dispose();
        av.dummyCamera.dispose();
        av.rig.playerRoot.dispose();
      }
    }
    this.remoteAvatars.clear();

    if (this.canUseVerifiedFirestore() && this.isFirestoreDocCreated) {
      const uid = this.identity.uid;
      try {
        await deleteDoc(doc(db, 'players', uid));
      } catch {
        // Ignore on unload
      }
    }
  }
}
