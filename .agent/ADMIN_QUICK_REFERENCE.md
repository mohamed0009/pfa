# Admin Portal - Quick Reference Guide

## 🎨 Theme Configuration

### Primary Color Scheme
- **Brand Color**: `#01996d` (Green)
- **Dark Background**: `#1A1A1A` (Sidebar)
- **Light Background**: `#FAFAFA` (Page)
- **Text Primary**: `#1F1F1F`
- **Text Secondary**: `#6B6B6B`

### Typography
- **Font**: Source Sans Pro, Open Sans
- **Weights**: 400 (Regular), 600 (Semibold), 700 (Bold)

---

## 📂 Navigation Structure

```
Admin Portal
├── 📊 Dashboard              → /admin/dashboard
├── 👥 Users                  → /admin/users
│   └── User Details         → /admin/users/:id
├── 📚 Content (Badge: 3)     → /admin/content
├── 🧠 AI Supervision         → /admin/ai-supervision
│   ├── ⚙️ Configuration Tab
│   ├── 💬 Interactions Tab
│   ├── ✨ Generated Content Tab
│   └── 📚 Knowledge Base Tab
├── 🎓 Trainers (Badge: 1)    → /admin/trainers
├── 🔔 Notifications          → /admin/notifications
└── 💬 Support                → /admin/support
```

---

## 🧠 AI Supervision - Detailed Tab Functions

### Tab 1: ⚙️ Configuration
**Purpose**: Configure AI Coach behavior

| Setting | Type | Options |
|---------|------|---------|
| Language | Select | Français, English |
| Tone | Select | formal, friendly, motivating, professional |
| Detail Level | Select | concise, moderate, detailed |
| Max Length | Number | 100-2000 characters |
| Quiz Generation | Toggle | ON/OFF |
| Exercise Generation | Toggle | ON/OFF |
| Summary Generation | Toggle | ON/OFF |
| Personalization | Toggle | ON/OFF |

**Actions**: Edit, Save, Cancel

---

### Tab 2: 💬 Interactions
**Purpose**: Monitor and moderate AI conversations

**Filters**:
- All Interactions
- Flagged Only

**Table Columns**:
1. **Date** - Timestamp of interaction
2. **User** - Name + Role badge
3. **Question** - Truncated preview (60 chars)
4. **Sentiment** - Color-coded badge
   - 😊 Positive (Green #10b981)
   - 😐 Neutral (Gray #6b7280)
   - 😞 Negative (Red #dc2626)
5. **Response Time** - In milliseconds
6. **Actions**
   - 👁️ View Details
   - 🚩 Flag / ✅ Unflag

**Modal Features**:
- Full conversation display
- User information
- Sentiment analysis
- Flag with reason
- Flag management

**Statistics Tracked**:
- Total interactions count
- Average response time
- Flagged interactions count
- Sentiment breakdown

---

### Tab 3: ✨ Generated Content
**Purpose**: Review AI-generated pedagogical content

**Filters**:
- All Types
- Quiz Only
- Exercise Only
- Summary Only

**Card Display**:
- Content type icon with color
  - 📝 Quiz (Blue #4A90E2)
  - 📋 Exercise (Green #2DD4A4)
  - 📄 Summary (Orange #FFB800)
- Course name
- Usage count
- Rating (⭐ x/5)
- Generation date
- Archive action

**Statistics**:
- Quiz count
- Exercise count
- Summary count
- Average content rating

---

### Tab 4: 📚 Knowledge Base
**Purpose**: Manage AI training documents

**Features**:
- Upload new documents
- View document status
- Delete documents

**Table Columns**:
1. **Title** - Document name
2. **Category** - Classification
3. **Type** - File extension (pdf, docx, etc.)
4. **Size** - In MB
5. **Status** - Processing state
   - 🟢 Active (#10b981)
   - 🟡 Processing (#f59e0b)
   - 🔴 Error (#dc2626)
6. **Uploaded By** - User name
7. **Date** - Upload timestamp
8. **Actions** - Delete button

**Statistics**:
- Knowledge base total size
- Indexed documents count

---

## 🎨 Styling Reference

### Component Styles

#### Sidebar
```
Width: 280px (normal) | 80px (collapsed)
Background: #1A1A1A
Color: White
Shadow: 4px 0 20px rgba(0, 0, 0, 0.1)
```

#### Top Bar
```
Height: 70px
Background: White
Shadow: 0 2px 10px rgba(0, 0, 0, 0.05)
Position: Sticky
```

#### Tabs Navigation
```
Background: White
Padding: 8px
Border Radius: 12px
Gap: 8px
Active Tab: Green (#01996d) background
```

#### Cards
```
Background: White
Border Radius: 12px
Padding: 24px
Shadow: 0 2px 10px rgba(0, 0, 0, 0.05)
Hover: 0 8px 32px rgba(0, 0, 0, 0.16)
```

#### Tables
```
Background: White
Border Radius: 12px
Row Hover: rgba(#01996d, 0.02)
Flagged Row: rgba(#dc2626, 0.05) + left border
Header: #F5F5F5 background
```

#### Modals
```
Max Width: 700px
Max Height: 85vh
Border Radius: 16px
Shadow: 0 20px 60px rgba(0, 0, 0, 0.3)
Backdrop: blur(4px)
```

#### Buttons
```scss
Primary:
  Background: #01996d
  Hover: #009978
  
Secondary:
  Background: #F5F5F5
  Hover: Darken 5%
  
Danger:
  Background: #dc2626
  Hover: Darken 8%
```

#### Toggle Switch
```
Width: 48px
Height: 26px
Off: Gray (#E5E7EB)
On: Green (#01996d)
Ball Size: 20px
```

---

## 📊 Statistics Dashboard

### AI Supervision Stats

```typescript
aiStats = {
  // Interactions
  totalInteractions: number        // Total conversation count
  averageResponseTime: number      // In milliseconds
  flaggedInteractions: number      // Problematic interactions
  
  // Sentiment
  sentimentBreakdown: {
    positive: number               // % positive
    neutral: number                // % neutral
    negative: number               // % negative
  }
  
  // Generated Content
  generatedContentCount: {
    quiz: number                   // Quiz count
    exercise: number               // Exercise count
    summary: number                // Summary count
  }
  averageContentRating: number    // Out of 5
  
  // Knowledge Base
  knowledgeBaseSize: number       // Total MB
  indexedDocuments: number        // Processed docs
}
```

---

## 🎯 Key Features for Examination

### Design Excellence
✅ Coursera-inspired professional theme
✅ Consistent color palette (#01996d green accent)
✅ Source Sans Pro typography
✅ Material Design icons
✅ Smooth animations (0.3s ease)
✅ Responsive layout (mobile/tablet/desktop)

### AI Supervision Capabilities
✅ **4-tab comprehensive system**
✅ Real-time configuration
✅ Interaction monitoring & moderation
✅ Content quality review
✅ Knowledge base management
✅ Sentiment analysis
✅ Flag system for problematic interactions
✅ Statistical dashboards

### User Experience
✅ Collapsible sidebar
✅ Sticky top bar
✅ Search functionality
✅ Badge notifications
✅ Filter systems
✅ Modal dialogs
✅ Hover effects
✅ Active state indicators

### Technical Implementation
✅ Angular standalone components
✅ SCSS with variables
✅ RxJS observables
✅ Two-way data binding
✅ Lazy-loaded routes
✅ Service-based architecture

---

## 📱 Responsive Breakpoints

```scss
Mobile (< 640px):
  - Hide search bar
  - Hide profile info
  - Reduce padding

Tablet (< 968px):
  - Sidebar slides off-screen
  - Toggle opens overlay
  - Main content full width

Desktop (>= 968px):
  - Full layout
  - Fixed sidebar
  - All features visible
```

---

## 🔍 Examination Talking Points

1. **Professional Theme System**
   - "We use a Coursera-inspired design with consistent variables"
   - "Green accent (#01996d) for brand identity"

2. **AI Supervision Architecture**
   - "4-tab system for complete AI management"
   - "Configuration, Monitoring, Content Review, Knowledge Base"

3. **User Interaction**
   - "Flag system for quality control"
   - "Sentiment analysis on all interactions"
   - "Real-time statistics dashboard"

4. **Scalability**
   - "Service-based architecture for data management"
   - "Lazy-loaded routes for performance"
   - "Modular SCSS with variables"

5. **User Experience**
   - "Smooth transitions and hover effects"
   - "Responsive design for all devices"
   - "Clear visual feedback on all actions"

---

*Quick Reference for PFA Examination - 2025*
