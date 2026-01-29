# בדיקות אוטומציה - Music Recommendation App

## מה זה בדיקות אוטומציה?

בדיקות אוטומציה הן קוד שכותבים כדי לבדוק שהקוד שלך עובד נכון. במקום לבדוק ידנית כל פעם שאתה עושה שינוי, הבדיקות רצות אוטומטית ומוודאות שהכל עדיין עובד.

## למה זה חשוב?

1. **מניעת באגים** - הבדיקות תופסות בעיות לפני שהמשתמשים רואים אותן
2. **ביטחון בשינויים** - אתה יכול לשנות קוד בביטחון כי הבדיקות יגידו לך אם משהו נשבר
3. **תיעוד** - הבדיקות מסבירות איך הקוד אמור לעבוד
4. **איכות** - קוד עם בדיקות הוא קוד איכותי יותר

## מה הבדיקות שלנו בודקות?

### 1. StorageService Tests (`utils/storage.test.js`)
- ✅ רישום והתחברות משתמשים
- ✅ שמירה וטעינה של העדפות
- ✅ ניהול פלייליסטים
- ✅ שירים אהובים (לפי משתמש)
- ✅ ספריית פלייליסטים

### 2. SpotifyService Tests (`services/spotifyService.test.js`)
- ✅ חיפוש שירים לפי ז'אנר ושנים
- ✅ קבלת שירים פופולריים לפי מדינה
- ✅ קבלת שירים מובילים של אומן
- ✅ טיפול בשגיאות

### 3. Component Tests (`components/GenreSelection.test.jsx`)
- ✅ טעינת הקומפוננטה
- ✅ בחירת ז'אנרים
- ✅ כפתורי המשך ודילוג
- ✅ ולידציה (כפתור Continue לא פעיל כשלא בחרו)

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

## איך לכתוב בדיקה חדשה?

### דוגמה לבדיקת פונקציה:
```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myFile';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### דוגמה לבדיקת קומפוננטה:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## מבנה הקבצים:

```
src/tests/
├── setup.js                    # הגדרות כלליות לבדיקות
├── README.md                   # הקובץ הזה
├── utils/
│   └── storage.test.js        # בדיקות ל-StorageService
├── services/
│   └── spotifyService.test.js # בדיקות ל-SpotifyService
└── components/
    └── GenreSelection.test.jsx # בדיקות לקומפוננטות
```

## טיפים לכתיבת בדיקות טובות:

1. **כתוב בדיקות קטנות וממוקדות** - כל בדיקה צריכה לבדוק דבר אחד
2. **תן שמות ברורים** - השם של הבדיקה צריך להסביר מה היא בודקת
3. **בדוק גם מקרי קצה** - מה קורה עם null, undefined, מערכים ריקים?
4. **נקה לפני כל בדיקה** - השתמש ב-beforeEach כדי לנקות state
5. **בדוק שגיאות** - וודא שהקוד מטפל בשגיאות נכון

## מה הלאה?

כשאתה מוסיף פיצ'ר חדש:
1. כתוב בדיקות לפני או יחד עם הקוד
2. הרץ את הבדיקות כדי לוודא שהן עוברות
3. ודא שהכיסוי (coverage) גבוה מספיק

## משאבים נוספים:

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

