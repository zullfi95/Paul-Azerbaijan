# Testing Cookie Consent Banner

## Quick Test Steps

### 1. Start Development Server

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Clear Cookie Consent (to see banner)

Open browser console (F12) and run:

```javascript
localStorage.removeItem('paul-cookie-consent');
location.reload();
```

### 3. Test Scenarios

#### Scenario A: First Visit
1. Clear localStorage as shown above
2. Refresh page
3. ✅ Banner should appear at bottom of screen
4. ✅ Should display correct language (EN/AZ)

#### Scenario B: Accept Cookies
1. Click "Accept All" button
2. ✅ Banner should disappear with smooth animation
3. ✅ Check localStorage: `localStorage.getItem('paul-cookie-consent')` should return `"accepted"`
4. Refresh page
5. ✅ Banner should NOT appear

#### Scenario C: Reject Cookies
1. Clear localStorage
2. Refresh page
3. Click "Reject All" button
4. ✅ Banner should disappear
5. ✅ Check localStorage: should return `"rejected"`
6. Refresh page
7. ✅ Banner should NOT appear

#### Scenario D: Learn More Link
1. Clear localStorage and refresh
2. Click "Learn More" link in banner message
3. ✅ Should navigate to `/cookies` page
4. ✅ Cookie policy page should display

#### Scenario E: Language Switch
1. Clear localStorage and refresh
2. Banner should show in default language (English)
3. Switch language to Azerbaijani
4. ✅ Banner text should update to Azerbaijani
5. Switch back to English
6. ✅ Banner text should update to English

#### Scenario F: Mobile Responsive
1. Clear localStorage
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M)
4. Test different screen sizes:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1200px
5. ✅ Banner should be responsive on all sizes
6. ✅ Buttons should stack vertically on mobile

### 4. Visual Checks

**Desktop View:**
- Banner spans full width at bottom
- Content is centered with max-width
- Buttons are aligned to the right
- Icon is visible on the left
- Gold/beige color scheme matches PAUL brand

**Mobile View:**
- Banner takes up less vertical space
- Buttons stack vertically and take full width
- Text is readable and not cramped
- All interactive elements are easily tappable

### 5. Accessibility Tests

```javascript
// Check ARIA attributes
const banner = document.querySelector('[role="dialog"]');
console.log('Has dialog role:', banner !== null);
console.log('Has aria-label:', banner.hasAttribute('aria-label'));

// Check keyboard navigation
// Press Tab multiple times - should focus on:
// 1. Learn More link
// 2. Accept All button
// 3. Reject All button
```

### 6. Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### 7. Performance Check

Open DevTools → Performance:
1. Record page load
2. ✅ Banner should render without blocking
3. ✅ Animation should be smooth (60fps)
4. ✅ No layout shifts or jank

## Common Issues & Solutions

### Banner doesn't appear
**Solution:** Clear localStorage and refresh:
```javascript
localStorage.clear();
location.reload();
```

### Translations don't work
**Solution:** Check that language context is properly set up in Providers

### Styles look broken
**Solution:** 
1. Check that CSS module is imported correctly
2. Verify no conflicting global styles
3. Check browser console for CSS errors

### Banner appears on every page load
**Solution:** 
1. Check localStorage is working: `localStorage.getItem('paul-cookie-consent')`
2. Verify browser doesn't block localStorage
3. Check for incognito/private mode (localStorage may not persist)

## Manual Testing Checklist

- [ ] Banner appears on first visit
- [ ] "Accept All" button works and stores consent
- [ ] "Reject All" button works and stores consent
- [ ] "Learn More" link navigates to cookie policy
- [ ] Banner doesn't reappear after consent given
- [ ] Language switching updates banner text
- [ ] Mobile responsive design works correctly
- [ ] Keyboard navigation works
- [ ] Screen reader announces banner properly
- [ ] Animation is smooth
- [ ] Brand colors match PAUL theme
- [ ] Banner doesn't cover important content
- [ ] Works in all major browsers

## Automated Testing (Future)

Consider adding:
- Unit tests for `useCookieConsent` hook
- Integration tests for CookieConsent component
- E2E tests with Playwright/Cypress

Example test structure:
```typescript
describe('CookieConsent', () => {
  it('should display on first visit', () => {});
  it('should store acceptance in localStorage', () => {});
  it('should not display after consent given', () => {});
  it('should update on language change', () => {});
});
```

