# Room 3 — The Cipher Terminal

Alien/sci-fi escape room puzzle. Part of the class escape room chain.

## Puzzle

**Type:** Cipher wheel (alien Caesar cipher)  
**Ciphertext:** ⋊ ⟐ ⟁ ✦ ⋏  
**Correct offset:** 7 (hinted in narrative as "frequency band 7")  
**Answer:** `NEXUS`

### How it works

- 26 alien symbols map to positions 0–25
- The ciphertext was encoded with offset +7: `letter index + 7 mod 26 → alien symbol`
- The player rotates the outer ring until the decoded output spells **NEXUS**
- Typing NEXUS and pressing transmit completes the room

## URLs

| Link | URL |
|------|-----|
| This room | Update when GitHub Pages is configured |
| Room 2 (previous) | Update when class shares their URL |
| Room 4 (next) | Update when class shares their URL |

Update `NEXT_ROOM_URL` in `game.js` and the `href` on the back-button in `index.html` when the class decides URLs.

## State contract

```js
// Room is unlocked when escapedRoom_2 === 'true' in localStorage
isUnlocked(3)  // returns boolean

// On success, sets escapedRoom_3 = 'true' and redirects to Room 4
completeRoom(3, nextUrl)
```

## Team assignments

| Member | File | Issue |
|--------|------|-------|
| galenginger | index.html | #1 Setup, #8 Deploy |
| DevMar1 | style.css | #3 Design, #7 Mobil |
| MrGL1 | game.js | #4 Pussel, #5 Innehåll, #10 Docs |
| Arnell96 | README.md | #2 Kontrakt, #6 Lås, #9 Integration |

## Branch strategy

```
main        ← stable/deployed
develop     ← daily integration
feature/*   ← individual work branches
```

## Testing checklist

1. Open `index.html` with `localStorage` empty → locked screen shows
2. Set `localStorage.setItem('escapedRoom_2', 'true')` → room unlocks
3. Rotate wheel to wrong offset → decoded output shows random letters
4. Rotate to offset 7 → decoded output shows **NEXUS** with cyan glow
5. Type NEXUS → success message + `escapedRoom_3` saved + redirect
6. Test on mobile (touch targets, responsive layout)
