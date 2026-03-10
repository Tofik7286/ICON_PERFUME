# 🛒 Cart Sync Implementation Guide

## ✅ Complete Status: All Changes Applied

Three files have been updated to implement Zero-Trust cart synchronization with atomic DB updates and login-time sync.

---

## 1️⃣ Frontend: Force API Call on Add

### File Modified
**`frontend/src/app/(home)/redux/cartSlice.js`**

#### What Changed
- Updated `addToCart` thunk to force backend API call for authenticated users
- Added `syncLocalCartWithDB()` thunk for login-time migration
- Updated `extraReducers` to handle sync completion

#### How It Works
```javascript
// AUTHENTICATED USERS:
// 1. Send POST /cart/ with JSON body: {variant_id, quantity}
// 2. Redux state updates ONLY after 200 OK response
// 3. If item exists, quantity is updated (not error)

// GUEST USERS:
// Save to local storage (encrypted)
```

#### Key Features
- ✅ Idempotent: Adding same item twice updates quantity
- ✅ No more stale data: Only backend response updates Redux
- ✅ Smart detection: Checks if item already exists before update

---

## 2️⃣ Backend: Atomic Cart Update

### File Modified
**`backend/mainapp/views/cart.py`**

#### What Changed
- `UserCart.post()` now uses `update_or_create()` pattern
- Supports two API modes (legacy + modern)
- Added JSON body validation for modern mode
- Returns `201 Created` for new items, `200 OK` for updates

#### How It Works
```python
# Modern Mode (Recommended):
POST /cart/
{
    "variant_id": 123,
    "quantity": 2
}

# Legacy Mode (Backward Compatible):
POST /cart/123/?quantity=2

# Both modes use atomic update_or_create:
# If item exists → quantity updated
# If item doesn't exist → new cart item created
```

#### Response Format
```json
{
    "success": true,
    "message": "Product Added To Cart Successfully",
    "cart": { /* CartSerializer data */ },
    "created": true  // true=new, false=update
}
```

---

## 3️⃣ Login-Time Sync: Guest → Authenticated

### File Modified
**`frontend/src/app/(home)/redux/cartSlice.js`** + **`frontend/src/app/(home)/sign-up/SignUp.js`**

#### What Changed
- Added `syncLocalCartWithDB()` thunk for post-login migration
- Integrated sync call in SignUp.js after successful authentication
- Automatically clears local storage after sync

#### How It Works
```javascript
// When user logs in:
1. fetchUser() - Get user profile
2. fetchCart() - Fetch DB cart
3. syncLocalCartWithDB() - Migrate local items to DB ← NEW
4. fetchWishList() - Fetch wishlist

// syncLocalCartWithDB does:
- Reads all items from local storage (encrypted cart_hashData)
- Calls POST /cart/ for each item
- On success: clears local storage + refreshes cart from DB
- Shows success message with count of synced items
```

#### Integration Points
**Already added to:** `frontend/src/app/(home)/sign-up/SignUp.js`
```javascript
dispatch(fetchUser());
dispatch(fetchCart());
dispatch(syncLocalCartWithDB()); // ← New line added
dispatch(fetchWishList());
```

---

## 🔄 Data Flow Example

### Scenario: Guest adds item, then logs in

```
1. GUEST ADDS ITEM
   ├─ Browser: No auth token → uses local storage
   └─ DB: Empty (no auth)

2. GUEST LOGS IN
   ├─ Sign-up form → POST /verify-email/
   └─ On success:
        ├─ fetchUser() → Loads user profile
        ├─ fetchCart() → Loads DB cart (empty at first)
        ├─ syncLocalCartWithDB() → KEY STEP:
        │   ├─ Reads local storage items
        │   ├─ POST /cart/ for each item
        │   ├─ Backend: update_or_create handles duplicates
        │   ├─ Clear local storage
        │   └─ Refresh cart from DB
        └─ Cart now shows all items!
```

### Scenario: Logged-in user adds item twice

```
1. POST /cart/ {variant_id: 5, quantity: 2}
   └─ Backend: Creates Cart(user, variant_id=5, qty=2)
   └─ Response: 201 Created

2. POST /cart/ {variant_id: 5, quantity: 1}
   └─ Backend: UPDATE cart to quantity=1 (via update_or_create)
   └─ Response: 200 OK
   └─ Frontend: Updates Redux state with new quantity
```

---

## 📋 Testing Checklist

### Frontend Testing
- [ ] Guest adds item → stored in local storage
- [ ] Guest logs in → cart syncs to DB
- [ ] Logged-in user adds item → backend called immediately
- [ ] Add same item twice → quantity updates (no duplicate)
- [ ] Check response: `created` flag = true for new, false for update

### Backend Testing
```bash
# Test atomic update_or_create
curl -X POST http://localhost:8000/cart/ \
  -H "Content-Type: application/json" \
  -H "Cookie: is_logged_in=<token>" \
  -d '{"variant_id": 123, "quantity": 2}'

# Response: 201 Created (new item)

curl -X POST http://localhost:8000/cart/ \
  -H "Content-Type: application/json" \
  -H "Cookie: is_logged_in=<token>" \
  -d '{"variant_id": 123, "quantity": 3}'

# Response: 200 OK (quantity updated to 3)
```

---

## 🔐 Security Notes

### Zero-Trust Implementation
- ✅ Authenticated users: DB is ONLY source of truth
- ✅ Request body `cart_data` is stripped for logged-in users
- ✅ Guest checkout has separate validation
- ✅ Backend validates user via `request.user` (not cookies)

### CSRF & CORS
- ✅ Uses `credentials: "include"` for cross-origin cookies
- ✅ Backend checks `request.user` (not trusting client data)
- ✅ POST to `/cart/` with JSON payload (not form-data)

---

## 📝 API Endpoints Reference

### Add/Update Cart Item
```
POST /cart/

Request Body:
{
    "variant_id": integer,
    "quantity": integer
}

Response (201 Created - new item):
{
    "success": true,
    "message": "Product Added To Cart Successfully",
    "cart": { /* CartSerializer */ },
    "created": true
}

Response (200 OK - quantity updated):
{
    "success": true,
    "message": "Cart Updated Successfully",
    "cart": { /* CartSerializer */ },
    "created": false
}
```

### Fetch Cart
```
GET /cart/
Response: { success: true, cart_items: [...] }
```

### Remove Item
```
DELETE /cart/<variant_id>/
Response: { success: true, message: "..." }
```

---

## 🚀 Troubleshooting

### Issue: Items not syncing after login
**Solution:**
- Check browser DevTools → Application → Cookies → `is_logged_in` exists
- Check `secureLocalStorage` → verify `cart_hashData` has encrypted items
- Check network tab → POST /cart/ requests showing success (200/201)

### Issue: Duplicate items appearing
**Solution:**
- This shouldn't happen with `update_or_create` logic
- If it does: Backend issue, check query to ensure `user` + `variant` uniqueness

### Issue: Stock check fails on checkout
**Solution:**
- Backend `calculate_checkout_total` validates stock before creating order
- Add item with invalid quantity → get 409 CONFLICT with message
- Refresh page and try again

### Issue: Local storage items not clearing
**Solution:**
- `syncLocalCartWithDB()` clears `cart_hashData` on success
- If sync fails: manual clear via DevTools Console:
  ```javascript
  import secureLocalStorage from 'react-secure-storage';
  secureLocalStorage.removeItem('cart_hashData');
  ```

---

## 📚 Files Summary

| File | Change | Purpose |
|------|--------|---------|
| `frontend/.../redux/cartSlice.js` | Updated `addToCart`, added `syncLocalCartWithDB`, updated reducers | Force API sync + login migration |
| `backend/mainapp/views/cart.py` | Added `json` import, refactored `post()` method | Atomic update_or_create |
| `frontend/.../sign-up/SignUp.js` | Added import, added dispatch call | Integration point for sync |

---

## ✨ What's Next?

All core functionality is implemented. To fully test:

1. **Start backend**: `python manage.py runserver`
2. **Start frontend**: `npm run dev`
3. **Test guest → login flow**
4. **Monitor DevTools → Network tab** during operations
5. **Check Redux DevTools** for state changes

---

*Last Updated: March 10, 2026*
