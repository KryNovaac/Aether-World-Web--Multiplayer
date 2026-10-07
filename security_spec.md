# Security Specification — Aether World-Web Multiplayer

## 1. Data Invariants
1. **Identity Integrity (`UserProfile` & `PlayerWorldState`)**:
   - A document at `/users/{userId}` can only be read (`get`), created, or updated by the authenticated and email-verified user whose `request.auth.uid == userId` and `uid == request.auth.uid`.
   - A document at `/players/{playerId}` can only be created, updated, or deleted by the authenticated and email-verified user whose `request.auth.uid == playerId` and `uid == request.auth.uid`.
2. **Zero PII Storage**:
   - Neither `/users/{userId}`, `/players/{playerId}`, nor `/realms/{realmId}` may ever store PII fields (`email`, `phoneNumber`, `address`). Strict `keys().hasOnly(...)` guards reject any shadow/ghost fields.
3. **No Blanket List Reads**:
   - `allow list` is completely disabled (`false`) across all collections. All multiplayer synchronization uses direct single-document `get` (`doc(db, 'realms', 'aether_main')` and `doc(db, 'players', peerUid)`).
4. **Relational Sync & Bounded Roster (`RealmRoster`)**:
   - A document at `/realms/{realmId}` must have `realmId == 'aether_main'`, a bounded `activePlayerIds` list (`size() >= 1 && size() <= 10`), and the caller (`request.auth.uid`) must have an existing `/players/{request.auth.uid}` document (`exists(...)`).
5. **Temporal & Immutable Fields**:
   - `createdAt` must equal `request.time` on creation and remain immutable (`incoming().createdAt == existing().createdAt`) on update.
   - `updatedAt` must always equal `request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Payload 1 (Identity Spoofing on `/users/{userId}`)**: Authenticated user `uid_attacker` attempts to create `/users/uid_victim` with `{ uid: "uid_victim", displayName: "Spoofed" }`. -> **DENIED** (`userId == request.auth.uid`).
2. **Payload 2 (Unverified Email Spoof)**: Authenticated user with `email_verified: false` attempts to write `/players/uid_attacker`. -> **DENIED** (`isVerifiedUser()`).
3. **Payload 3 (Shadow / Ghost Field Injection)**: User sends `/users/uid_1` with `{ ..., isAdmin: true }`. -> **DENIED** (`data.keys().hasOnly(...)`).
4. **Payload 4 (Denial-of-Wallet Oversized Nickname)**: User sends `displayName` of 5,000 characters to `/players/uid_1`. -> **DENIED** (`displayName.size() <= 24`).
5. **Payload 5 (ID Poisoning)**: User attempts to access `/players/invalid$id!@#`. -> **DENIED** (`isValidId(playerId)` regex `^[a-zA-Z0-9_\-]+$`).
6. **Payload 6 (Immutable `createdAt` Tampering)**: User updates `/users/uid_1` changing `createdAt` to `request.time`. -> **DENIED** (`incoming().createdAt == existing().createdAt`).
7. **Payload 7 (Forged Client Timestamp)**: User creates `/players/uid_1` with a past/future `updatedAt` instead of `serverTimestamp()`. -> **DENIED** (`incoming().updatedAt == request.time`).
8. **Payload 8 (Cross-Player Position Hijack)**: User `uid_attacker` attempts to update `/players/uid_victim` coordinates `{ x: 999, y: 0, z: 999 }`. -> **DENIED** (`playerId == request.auth.uid && existing().uid == request.auth.uid`).
9. **Payload 9 (Unbounded Array Exhaustion on `/realms/aether_main`)**: User attempts to write 50 UIDs into `activePlayerIds`. -> **DENIED** (`data.activePlayerIds.size() <= 10`).
10. **Payload 10 (Orphaned Realm Registration)**: User attempts to add their UID to `/realms/aether_main` without first creating `/players/{request.auth.uid}`. -> **DENIED** (`exists(/databases/$(database)/documents/players/$(request.auth.uid))`).
11. **Payload 11 (Unauthorized Collection Listing)**: User executes `getDocs(collection(db, 'users'))` or `getDocs(collection(db, 'players'))`. -> **DENIED** (`allow list` is denied).
12. **Payload 12 (Value Poisoning on Update)**: User updates `x` coordinate on `/players/uid_1` with a string `"not-a-number"`. -> **DENIED** (`isValidPlayerState(incoming())` wraps all update branches).
