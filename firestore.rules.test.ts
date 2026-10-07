/**
 * Firestore Security Rules Test Specification (Dirty Dozen Verification)
 * Verifies that all 12 adversarial payloads in security_spec.md return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_SECURITY_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on /users/{userId}',
    operation: 'create',
    path: '/users/uid_victim',
    auth: { uid: 'uid_attacker', email_verified: true },
    payload: { uid: 'uid_victim', displayName: 'Spoofed' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Write Attempt',
    operation: 'create',
    path: '/players/uid_attacker',
    auth: { uid: 'uid_attacker', email_verified: false },
    payload: { uid: 'uid_attacker', displayName: 'Unverified' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Ghost Field Injection (isAdmin: true)',
    operation: 'create',
    path: '/users/uid_1',
    auth: { uid: 'uid_1', email_verified: true },
    payload: { uid: 'uid_1', displayName: 'Knight', isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Oversized String Denial-of-Wallet',
    operation: 'update',
    path: '/players/uid_1',
    auth: { uid: 'uid_1', email_verified: true },
    payload: { displayName: 'A'.repeat(5000) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'ID Poisoning via Invalid Path Characters',
    operation: 'get',
    path: '/players/invalid$id!@#',
    auth: { uid: 'uid_1', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Immutable createdAt Field Tampering',
    operation: 'update',
    path: '/users/uid_1',
    auth: { uid: 'uid_1', email_verified: true },
    payload: { createdAt: '2099-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Forged Client Timestamp on updatedAt',
    operation: 'create',
    path: '/players/uid_1',
    auth: { uid: 'uid_1', email_verified: true },
    payload: { updatedAt: '2000-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Cross-Player Coordinate Hijack',
    operation: 'update',
    path: '/players/uid_victim',
    auth: { uid: 'uid_attacker', email_verified: true },
    payload: { x: 999, y: 0, z: 999 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unbounded Array Exhaustion on /realms/aether_main',
    operation: 'update',
    path: '/realms/aether_main',
    auth: { uid: 'uid_1', email_verified: true },
    payload: {
      realmId: 'aether_main',
      activePlayerIds: Array.from({ length: 50 }, (_, i) => `uid_${i}`),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Orphaned Realm Registration Without Player Doc',
    operation: 'create',
    path: '/realms/aether_main',
    auth: { uid: 'uid_no_player_doc', email_verified: true },
    payload: { realmId: 'aether_main', activePlayerIds: ['uid_no_player_doc'] },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unauthorized Collection Listing on /users',
    operation: 'list',
    path: '/users',
    auth: { uid: 'uid_1', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Value Poisoning on Update (Invalid Coordinate Type)',
    operation: 'update',
    path: '/players/uid_1',
    auth: { uid: 'uid_1', email_verified: true },
    payload: { x: 'not-a-number' },
    expectedResult: 'PERMISSION_DENIED',
  },
];
