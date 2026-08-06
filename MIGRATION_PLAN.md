# Compact Toolchain Migration Plan: v0.14 → v0.33

## ROOT CAUSE (Proven)

**`frontend/src/managed/Membership/contract/index.cjs`** was generated with compact compiler **v0.14.0**, which only emits a flat metadata object:
```js
module.exports = { contractName, languageVersion, circuits, ledger };
```

**`@midnight-ntwrk/compact-js` v2.4.3's `CompiledContract.make()`** expects a full runtime `Contract` **class** (constructor with `witnesses`, `initialState()`, `circuits`, `impureCircuits`, `provableCircuits`).

This mismatch causes `new context.ctor(context.witnesses)` to fail with `TypeError: o.ctor is not a constructor`.

## Official Source Verification

### Source: GitHub Releases (LFDT-Minokawa/compact)
- **Previous repo** `midnightntwrk/compact` → **ARCHIVED**
- **Active repo** `LFDT-Minokawa/compact`
- **Latest release**: `compactc-v0.33.0-rc.2` (prerelease, July 15, 2026)
- **Latest stable**: `compactc-v0.31.1` — "Compact toolchain 0.31.1 (Compact language 0.23.0)"
  - This matches the **leaderboard reference** which uses `pragma language_version 0.23`
  - The leaderboard's generated code calls `checkRuntimeVersion('0.16.0')`

### Source: leaderboard-ref (working implementation)
```
pragma language_version 0.23;
```
Generated `index.js`:
```js
import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');
export class Contract { ... }   // ← Full runtime class ✓
```

### Key Breaking Change (v0.14 → v0.16+)
The compact compiler **changed its output format** between v0.14 and v0.16:
- **v0.14**: Only metadata `{ contractName, languageVersion, circuits, ledger }`
- **v0.16+**: Full runtime `Contract` class with `constructor(witnesses)`, `initialState()`, etc.

## Packages to Upgrade

| Package | Current Version | Recommended Version | Reason |
|---|---|---|---|
| `@midnight-ntwrk/compact-runtime` | `^0.14.0` | `^0.16.0` | Required by v0.23 compiled output |
| `@midnight-ntwrk/midnight-js-contracts` | `^3.0.0` | `^4.1.1` | Compatible with newer SDK family |
| Compact compiler | v0.14.0 (binary used) | **v0.31.1** (stable) or **v0.33.0-rc.2** | Must generate `Contract` class |

## Files to Replace (Generated Artifacts)

After recompilation, the following files will be regenerated:

| File | Expected Change |
|---|---|
| `frontend/src/managed/Membership/contract/index.cjs` | **Replace** — will now export `Contract` class |
| `frontend/src/managed/Membership/contract/index.d.ts` | **Replace** — will reflect new API |
| `frontend/src/managed/Membership/compiler/contract.json` | **Replace** — updated metadata |
| `frontend/src/managed/Membership/keys/*` | **Regenerate** — new proving/verifying keys |
| `frontend/src/managed/Membership/zkir/*` | **Regenerate** — new ZKIR circuits |

**Copies in these directories** (sync after generation):
- `d:/MidnightVault/managed/Membership/` (root copy)
- `frontend/public/managed/Membership/` (public static copy)
- `frontend/src/managed/Membership/` (source copy)

## Import Changes Required

**`frontend/src/lib/compiled-contract.ts`** (as-is will continue to work):

The current import:
```ts
import * as MembershipContractModule from '../managed/Membership/contract/index.cjs';
const contractCtor =
  (MembershipContractModule as any).Contract ||       // Will resolve AFTER recompile
  (MembershipContractModule as any).default?.Contract ||
  (MembershipContractModule as any).default ||
  MembershipContractModule;
```

After recompilation, the generated `index.cjs` will export:
```js
module.exports = { Contract, ledger, contractName, languageVersion, circuits, ... }
```

Therefore `MembershipContractModule.Contract` will correctly resolve to the `Contract` class. **No import changes needed.**

## Compact Source Changes Required

**`contracts/Membership.compact`**:
- Update pragma from `pragma language_version >= 0.14.0` to `pragma language_version 0.23`
- Verify compatibility of `Counter` type with v0.23 (the `Counter` is a user-defined ledger type, should be compatible)
- The circuit uses `disclose()`, `Field`, `[]` return type — all supported in v0.23

## Compilation Command

```bash
# Install compact CLI v0.31.1:
# Download from: https://github.com/LFDT-Minokawa/compact/releases/tag/compactc-v0.31.1

compact compile contracts/Membership.compact managed/Membership

# Then sync to frontend locations:
cp -r managed/Membership frontend/src/managed/
cp -r frontend/src/managed/Membership public/managed/
```

## Runtime Package Update

After recompilation, update `frontend/package.json`:
```json
"@midnight-ntwrk/compact-runtime": "^0.16.0"
```

Then:
```bash
cd frontend && npm install
```

## Verification Checklist

After recompilation, verify:

1. ✅ `require('./index.cjs').Contract` is a **class** (typeof === 'function', can be called with `new`)
2. ✅ `CompiledContract.make('Membership', ContractCtor)` stores a valid constructor
3. ✅ `CompactContextInternal.createContract()` can execute `new context.ctor(context.witnesses)`
4. ✅ `npm run build` succeeds in frontend
5. ✅ Deploy button reaches `deployContract()` without `TypeError: o.ctor is not a constructor`

## What this plan DOES NOT Change

- ❌ No React components modified
- ❌ No Context APIs modified
- ❌ No provider wiring modified
- ❌ No wallet flow modified
- ❌ No business logic modified
- ❌ No handwritten runtime classes created
- ❌ No compatibility wrappers created
- ❌ No `node_modules` edited

