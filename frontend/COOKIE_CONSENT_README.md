# Cookie Consent Implementation

## Overview

This implementation adds a professional cookie consent banner to the PAUL Azerbaijan website. The banner appears on the first visit and stores the user's preference in localStorage.

## Features

- ✅ Displays on first visit only
- ✅ Multi-language support (English and Azerbaijani)
- ✅ Persistent storage of user consent
- ✅ Responsive design for all screen sizes
- ✅ Smooth animations
- ✅ Accessible (ARIA labels and roles)
- ✅ Link to Cookie Policy page
- ✅ Accept All / Reject All options

## Implementation Details

### Files Created

1. **`src/hooks/useCookieConsent.ts`**
   - Custom React hook to manage cookie consent state
   - Uses localStorage to persist user preferences
   - Key: `paul-cookie-consent`
   - Values: `'accepted'`, `'rejected'`, or `null`

2. **`src/components/CookieConsent.tsx`**
   - Main banner component
   - Integrates with next-intl for translations
   - Automatically shows/hides based on consent status

3. **`src/components/CookieConsent.module.css`**
   - Responsive styles with smooth animations
   - Matches PAUL brand colors (#d4a574)
   - Mobile-first approach

### Translations Added

**English (`messages/en.json`):**
```json
{
  "cookieConsent": {
    "title": "Cookie Consent",
    "message": "We use cookies to enhance your browsing experience...",
    "acceptAll": "Accept All",
    "rejectAll": "Reject All",
    "preferences": "Cookie Preferences",
    "learnMore": "Learn More"
  }
}
```

**Azerbaijani (`messages/az.json`):**
```json
{
  "cookieConsent": {
    "title": "Kukilər üzrə Razılıq",
    "message": "Biz səyahət təcrübənizi yaxşılaşdırmaq...",
    "acceptAll": "Hamısını Qəbul Et",
    "rejectAll": "Hamısını Rədd Et",
    "preferences": "Kukilər Seçimləri",
    "learnMore": "Ətraflı Məlumat"
  }
}
```

### Integration

The component is integrated into the app through `src/app/Providers.tsx`:

```tsx
<NotificationProvider>
  {children}
  <CookieConsent />
</NotificationProvider>
```

## Usage

The cookie consent banner will automatically:
1. Show on first visit (when no consent is stored)
2. Hide after user makes a choice
3. Remember the choice across sessions
4. Update based on language selection

## Testing

To test the implementation:

1. **Clear localStorage:**
   ```javascript
   localStorage.removeItem('paul-cookie-consent');
   ```

2. **Refresh the page** - banner should appear

3. **Click "Accept All"** - banner disappears, choice is stored

4. **Check localStorage:**
   ```javascript
   localStorage.getItem('paul-cookie-consent'); // "accepted" or "rejected"
   ```

5. **Test language switching** - translations should update

6. **Test on mobile** - responsive layout should work properly

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Accessibility

- Uses semantic HTML
- Includes ARIA labels and roles
- Keyboard navigable
- Screen reader friendly

## Future Enhancements

Possible improvements:
- Add cookie preferences modal for granular control
- Integrate with analytics services based on consent
- Add cookie expiration (auto-show after X months)
- Track consent in backend database
- Add ability to change consent from settings

## Maintenance

To update translations, modify:
- `frontend/messages/en.json`
- `frontend/messages/az.json`

To update styles:
- `frontend/src/components/CookieConsent.module.css`

To modify behavior:
- `frontend/src/hooks/useCookieConsent.ts`

