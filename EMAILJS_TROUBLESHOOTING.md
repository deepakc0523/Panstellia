# EmailJS 400 Bad Request - Troubleshooting & Fix

## ✅ Issues Fixed

### 1. **Missing `.env.local` File** (PRIMARY CAUSE)
- **Problem**: The application was trying to read EmailJS credentials from environment variables, but `.env.local` didn't exist
- **Solution**: Created `.env.local` with all required EmailJS configuration
- **Location**: `/workspaces/Panstellia/.env.local`

### 2. **Improved Error Handling**
- **Problem**: Error messages were vague ("Email sending failed: undefined")
- **Solution**: Enhanced error logging in `src/services/emailjs.js` to properly extract error details
- **Benefit**: Now you'll see actual error messages from EmailJS API

### 3. **Better Variable Validation**
- **Problem**: Missing/null template variables could cause 400 errors
- **Solution**: Added null-coalescing and default values in:
  - `src/services/orderNotifications.js` (both customer and admin functions)
- **Ensures**: All required variables have valid values before sending

## 🔧 Next Steps to Verify

### Step 1: Verify Environment Variables
Your `.env.local` file has been created with these variables:
```
VITE_EMAILJS_SERVICE_ID=service_91mvdyj
VITE_EMAILJS_TEMPLATE_ID_ORDER=template_pmo5qzx
VITE_EMAILJS_TEMPLATE_ID_CUSTOMER=template_sru5dx9
VITE_EMAILJS_PUBLIC_KEY=ievhBmWbKSZlZjrDj
VITE_ADMIN_EMAIL=support@panstellia.com
```

⚠️ **Important**: Verify these match your actual EmailJS dashboard:
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Check **Services** tab → Copy your Service ID
3. Check **Email Templates** tab → Copy each Template ID
4. Check **Account** tab → Copy your Public Key
5. Update `.env.local` if any values are different

### Step 2: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or: Open DevTools → Settings → Network → Check "Disable cache"
- Then reload the page

### Step 3: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Test Email Sending
1. Go to checkout page
2. Select **Cash on Delivery** or enter a test payment
3. Check browser console for:
   - ✅ "EmailJS initialized successfully" (on page load)
   - ✅ "Sending customer email with variables: ..." (when order placed)
   - ✅ "Customer confirmation email sent successfully" (success)

## 📊 Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Missing env variables | Verify `.env.local` exists with correct values |
| Template variables not found | Template IDs don't match | Double-check `VITE_EMAILJS_TEMPLATE_ID_*` values |
| "EmailJS not configured" | Missing public key | Ensure `VITE_EMAILJS_PUBLIC_KEY` is set |
| "to_email is not a valid email" | Invalid email format | Verify email validation in checkout form |
| Cross-Origin-Opener-Policy warning | Browser security policy | This is normal, doesn't affect functionality |

## 🔍 Debugging Tips

### Check Template Variables Match
Your EmailJS templates MUST have these exact variables:

**Customer Template** (`template_sru5dx9`):
- `{{customer_name}}`
- `{{order_id}}`
- `{{to_email}}`
- `{{total_amount}}`
- `{{product_name}}`
- `{{payment_method}}`
- `{{shipping_address}}`
- `{{shipping_city}}`
- `{{shipping_state}}`
- `{{shipping_pincode}}`
- `{{order_date}}`
- `{{quantity}}`
- `{{email_html}}`

**Admin Template** (`template_pmo5qzx`):
- Same variables as customer template
- But `{{to_email}}` should point to admin email

### Monitor Console Output
Look for these logs:
```javascript
// On app load:
"✅ EmailJS initialized successfully"

// When order placed:
"📧 Sending customer email with variables: ..."
"✅ Customer confirmation email sent successfully: ..."
"📧 Sending admin email with variables: ..."
"✅ Admin notification email sent successfully: ..."
```

### If Still Getting 400 Errors
Check the browser console DevTools → Network tab:
1. Find the request to `api.emailjs.com/api/v1.0/email/send`
2. Click on it
3. View the **Request** payload
4. Verify all variables are present and non-empty

## 📝 Files Modified

1. **Created**: `.env.local` - Environment variables
2. **Updated**: `src/services/emailjs.js` - Better error handling
3. **Updated**: `src/services/orderNotifications.js` - Better validation

## ✨ What's Different Now

**Before:**
```
❌ Failed to send email: Ny
Error: Email sending failed: undefined
```

**After:**
```
📧 Sending customer email with variables: { to_email: "...", order_id: "..." }
✅ Customer confirmation email sent successfully: { status: 200, ... }
```

---

If you continue to get 400 errors after these steps, please:
1. Screenshot the Network tab request/response
2. Check that Service ID, Template IDs, and Public Key match exactly
3. Verify your EmailJS account has enough credits/quota
