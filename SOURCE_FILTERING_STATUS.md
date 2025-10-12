# Source Filtering Status

## ✅ Working Sources (7/9)

### **Original Sources (5)**
- ✅ Krebs on Security
- ✅ BleepingComputer  
- ✅ Dark Reading
- ✅ The Hacker News
- ✅ SecurityWeek

### **Phase 1 Additions (2/3)**
- ✅ The Record
- ✅ Ars Technica Security
- ❌ Wired Security - **Not working**

### **Community (0/1)**
- ❌ Reddit r/netsec - **Not working**

---

## 🐛 Known Issues

### **1. Wired Security**
**Status:** Not filtering correctly  
**Possible Causes:**
- RSS feed title doesn't match pattern
- Feed might be named differently (e.g., "WIRED", "Wired.com", "Wired - Security")
- Need to check actual source name via Debug Info

**Current Patterns:**
```javascript
'wired': ['wired']
```

**To Fix:**
1. Enable only Wired in Settings
2. Click "Show Debug Info"
3. Note exact source name
4. Add pattern to `sourcePatterns` in App.jsx

---

### **2. Reddit r/netsec**
**Status:** Not filtering correctly  
**Possible Causes:**
- Source name might be "Reddit r/netsec" vs "reddit"
- Case sensitivity issue
- Different format in API response

**Current Patterns:**
```javascript
'reddit': ['reddit', 'netsec', 'r/netsec']
```

**To Fix:**
1. Enable only Reddit in Settings
2. Click "Show Debug Info"  
3. Note exact source name
4. Add pattern to `sourcePatterns` in App.jsx

---

## 🔧 How to Debug & Fix

### **Step 1: Identify Actual Source Name**
1. Open Settings
2. Click "Disable All"
3. Enable ONLY the problematic source
4. Click "Save Endpoint"
5. Close Settings
6. Open Settings again
7. Click "Show Debug Info"
8. Note the exact source name shown

### **Step 2: Update Source Patterns**
Edit `/src/App.jsx` around line 173:

```javascript
const sourcePatterns = {
  // ... existing patterns ...
  
  // Add the actual source name you found
  'wired': ['wired', 'ACTUAL_NAME_HERE'],
  'reddit': ['reddit', 'netsec', 'r/netsec', 'ACTUAL_NAME_HERE'],
}
```

### **Step 3: Rebuild & Test**
```bash
npm run build
# Test locally or deploy
```

---

## 📊 Success Rate

**Overall:** 7/9 sources (78%)  
**Original Sources:** 5/5 (100%)  
**Phase 1 Sources:** 2/3 (67%)  
**Community Sources:** 0/1 (0%)

---

## 💡 Possible Source Names to Try

### **For Wired:**
- "WIRED"
- "Wired.com"
- "Wired - Security"
- "Wired Threat Level"
- "Wired Security"

### **For Reddit:**
- "Reddit r/netsec"
- "reddit"
- "/r/netsec"
- "netsec"

---

## 🎯 Next Steps

1. **Test when ready** - Use Debug Info to identify exact names
2. **Update patterns** - Add actual names to sourcePatterns
3. **Rebuild** - `npm run build`
4. **Deploy** - Push to S3/CloudFront
5. **Verify** - Test filtering with only those sources enabled

---

**Last Updated:** 2025-01-12  
**Status:** 7/9 working, 2 pending investigation  
**Priority:** Low (can be fixed when needed)
