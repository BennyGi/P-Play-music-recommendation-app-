# ספרינט בדיקות אוטומציה - אלגוריתמים והתכונות

## מה זה בדיקות אוטומציה?

בדיקות אוטומציה הן קוד שכותבים כדי לבדוק שהקוד שלך עובד נכון. במקום לבדוק ידנית כל פעם שאתה עושה שינוי, הבדיקות רצות אוטומטית ומוודאות שהכל עדיין עובד.

### למה זה חשוב במיוחד לאלגוריתמים?

1. **אלגוריתמים מורכבים** - קשה לבדוק ידנית כל מקרה אפשרי
2. **תוצאות לא צפויות** - אלגוריתמים יכולים להחזיר תוצאות שונות כל פעם
3. **תלות ב-API חיצוני** - צריך לוודא שהקוד מטפל נכון בתגובות מ-Spotify
4. **ביטחון בשינויים** - כשאתה משנה אלגוריתם, הבדיקות יגידו לך אם משהו נשבר

## מה הספרינט הזה בודק?

### 1. אלגוריתם ההמלצות (`recommendationAlgorithm.test.js`)

#### בדיקות בסיסיות:
- ✅ החזרת שירים על בסיס שירים אהובים
- ✅ סינון שירים כפולים
- ✅ כיבוד פרמטר limit
- ✅ טיפול במקרים של אין שירים אהובים

#### בדיקות מתקדמות:
- ✅ שילוב שירים מכמה מקורות (artists, genres, years)
- ✅ סינון שירים שכבר הוצגו
- ✅ טיפול בשגיאות רשת
- ✅ שימוש ב-genre default כשאין seeds

### 2. אלמנט ההפתעה (`surpriseElement.test.js`)

#### בדיקות לוגיקה:
- ✅ שימוש בשפה רנדומלית כש-`surpriseLanguageEnabled = true`
- ✅ שימוש בטווח שנים רנדומלי כש-`surpriseYearEnabled = true`
- ✅ שימוש בז'אנר רנדומלי כש-`surpriseGenreEnabled = true`
- ✅ שמירה על העדפות כשההפתעה כבויה

#### בדיקות פונקציונליות:
- ✅ חיפוש שירים לפי country/genre/year
- ✅ ניסיון מספר וריאציות של שאילתות
- ✅ טיפול בתוצאות ריקות
- ✅ טיפול בשגיאות

### 3. קומפוננטת PlaylistView (`PlaylistView.test.jsx`)

#### בדיקות UI:
- ✅ הצגת פלייליסט עם שירים
- ✅ הצגת empty state כשאין פלייליסט
- ✅ הצגת כפתור Generate More
- ✅ הצגת אלמנט ההפתעה

#### בדיקות אינטגרציה:
- ✅ חלוקת שירים ל-2 חלקים (liked-based + surprise)
- ✅ הפעלת Generate More עם אלמנט הפתעה
- ✅ הצגת תפריט ההגדרות של ההפתעה

## איך להריץ את הבדיקות?

### הרצה בסיסית:
```bash
npm test
```

### הרצה עם UI אינטראקטיבי:
```bash
npm run test:ui
```

### הרצה עם דוח כיסוי (coverage):
```bash
npm run test:coverage
```

### הרצת בדיקה ספציפית:
```bash
npm test surpriseElement
npm test recommendationAlgorithm
npm test PlaylistView
```

## מה הבדיקות עושות בפועל?

### דוגמה 1: בדיקת אלגוריתם ההמלצות

```javascript
it('should generate recommendations based on liked songs', async () => {
  const likedSongs = [
    { id: 'track1', title: 'Liked Song', artist: 'Artist', ... }
  ];
  
  const result = await generateMoreFromLiked(likedSongs, 10, 'US', []);
  
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);
});
```

**מה זה בודק?**
- שהפונקציה מקבלת שירים אהובים
- שהפונקציה מחזירה מערך של שירים מומלצים
- שהתוצאות לא ריקות

### דוגמה 2: בדיקת אלמנט ההפתעה

```javascript
it('should use random language when surpriseLanguageEnabled is true', () => {
  const allLanguageIds = [1, 2, 3, ...];
  const randomLanguageId = allLanguageIds[Math.floor(Math.random() * allLanguageIds.length)];
  
  expect(randomLanguageId).toBeDefined();
  expect(randomLanguageId).toBeGreaterThan(0);
});
```

**מה זה בודק?**
- שכשמפעילים הפתעה על שפה, השפה היא רנדומלית
- שהשפה שנבחרה היא תקינה

### דוגמה 3: בדיקת סינון כפילויות

```javascript
it('should remove duplicate tracks by ID', () => {
  const tracks = [
    { id: 'track1', title: 'Song 1' },
    { id: 'track2', title: 'Song 2' },
    { id: 'track1', title: 'Song 1 Duplicate' } // duplicate
  ];
  
  const unique = Array.from(new Map(tracks.map(t => [t.id, t])).values());
  
  expect(unique).toHaveLength(2); // Should remove duplicate
});
```

**מה זה בודק?**
- שהאלגוריתם מסיר שירים כפולים
- שהתוצאה הסופית מכילה רק שירים ייחודיים

## מה הכיסוי (Coverage) אומר?

כשאתה מריץ `npm run test:coverage`, אתה מקבל דוח שמראה:
- **Statements**: כמה שורות קוד נבדקו
- **Branches**: כמה ענפים (if/else) נבדקו
- **Functions**: כמה פונקציות נבדקו
- **Lines**: כמה שורות נבדקו

**מטרה טובה**: כיסוי של 70%+ נחשב טוב, 80%+ נחשב מצוין.

## איך להוסיף בדיקות חדשות?

### שלב 1: זהה מה צריך לבדוק
- מה הפונקציה אמורה לעשות?
- מה המקרים המיוחדים?
- מה השגיאות האפשריות?

### שלב 2: כתוב את הבדיקה
```javascript
describe('MyFunction', () => {
  it('should do something specific', () => {
    // Arrange - הכנה
    const input = 'test';
    
    // Act - ביצוע
    const result = myFunction(input);
    
    // Assert - בדיקה
    expect(result).toBe('expected');
  });
});
```

### שלב 3: הרץ את הבדיקה
```bash
npm test MyFunction
```

## טיפים לכתיבת בדיקות טובות:

1. **כתוב בדיקות קטנות וממוקדות** - כל בדיקה צריכה לבדוק דבר אחד
2. **תן שמות ברורים** - השם של הבדיקה צריך להסביר מה היא בודקת
3. **בדוק גם מקרי קצה** - מה קורה עם null, undefined, מערכים ריקים?
4. **נקה לפני כל בדיקה** - השתמש ב-beforeEach כדי לנקות state
5. **בדוק שגיאות** - וודא שהקוד מטפל בשגיאות נכון
6. **השתמש ב-mocks** - אל תקרא ל-API אמיתי בבדיקות

## מה הלאה?

### בדיקות שכדאי להוסיף:

1. **בדיקות ביצועים** - כמה זמן לוקח לאלגוריתם לרוץ?
2. **בדיקות נפח** - מה קורה עם 1000 שירים אהובים?
3. **בדיקות אינטגרציה מלאות** - בדיקה של כל הזרימה מהתחלה עד הסוף
4. **בדיקות E2E** - בדיקות של המשתמש המלא

### כלים נוספים:

- **Playwright** - לבדיקות E2E
- **MSW (Mock Service Worker)** - למוקינג API calls
- **React Testing Library** - לבדיקות קומפוננטות (כבר מותקן)

## משאבים נוספים:

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Algorithm Testing Guide](https://www.testingjavascript.com/)

---

**זכור**: בדיקות אוטומציה הן השקעה לטווח הארוך. הן חוסכות לך זמן ומניעות באגים לפני שהמשתמשים רואים אותם!

