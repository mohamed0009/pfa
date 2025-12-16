# MentalGeter - Mental Health Clinic Landing Page

A modern, responsive Angular application for a mental health clinic, featuring a beautiful landing page design with therapy services, client testimonials, and expert profiles.

## Features

- 🎨 Modern, clean UI design matching the Pinterest inspiration
- 📱 Fully responsive layout (desktop, tablet, mobile)
- 🧩 Modular Angular component architecture
- 🎭 Angular Material integration
- 🎨 Custom SCSS styling with theme colors
- 🔄 Routing support for multiple pages
- 📊 Mock data services for realistic content
- ♿ Accessible design patterns

## Project Structure

```
mental-health-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── hero/
│   │   │   ├── services/
│   │   │   ├── testimonials/
│   │   │   ├── team/
│   │   │   ├── blog/
│   │   │   └── footer/
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   └── profile/
│   │   ├── services/
│   │   │   └── data.service.ts
│   │   ├── models/
│   │   │   └── interfaces.ts
│   │   ├── app.component.*
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── assets/
│   ├── styles.scss
│   └── index.html
├── angular.json
├── package.json
└── tsconfig.json
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm start
   ```
   or
   ```bash
   ng serve
   ```

3. **Open your browser:**
   Navigate to `http://localhost:4200/`

4. **Build for production:**
   ```bash
   npm run build
   ```

## Design Features

### Color Scheme
- **Primary Green**: `#2DD4A4` (teal/mint green for CTAs and accents)
- **Dark Background**: `#1A1A1A` (dark charcoal for cards and sections)
- **Text Colors**: White and gray variants for contrast
- **Background**: Light cream/beige (`#F5F3EF`)

### Typography
- **Headings**: Bold, modern sans-serif
- **Body**: Clean, readable font family
- **Emphasis**: Strategic use of weight and color

### Sections

1. **Header/Navigation**
   - Logo and brand name
   - Main navigation links (Home, About Us, Blog, Contact)
   - Sign In and Sign Up buttons
   - Responsive mobile menu

2. **Hero Section**
   - Large background image with overlay
   - Compelling headline: "Reclaim Your Peace, Empower Your Mind"
   - CTA button "Get Started"
   - Trust indicators (Partnership logos)

3. **About Section**
   - Mission statement
   - Key value propositions
   - Statistics/metrics

4. **Services Section**
   - Three main therapy types:
     - Individual Therapy
     - Family Therapy
     - Couples Therapy
   - Each with image, description, and CTA

5. **Testimonials Section**
   - Client success stories
   - Star ratings
   - Client names and therapy types

6. **Team Section**
   - Expert profiles with photos
   - Credentials and specializations
   - Therapist bios

7. **Blog/Insights Section**
   - Featured articles
   - Mental health tips
   - Image cards with titles

8. **Footer**
   - Quick links
   - Services list
   - Contact information
   - Social media links

## Pages

- **Home** (`/`): Main landing page with all sections
- **Profile** (`/profile`): User profile page (example additional route)

## Technologies Used

- **Angular 17**: Latest stable version
- **Angular Material**: UI components
- **TypeScript**: Type-safe development
- **SCSS**: Advanced styling
- **RxJS**: Reactive programming

## Mock Data

The application uses a `DataService` to provide mock data for:
- Therapy services
- Client testimonials
- Team members/experts
- Blog articles
- Statistics and metrics

## Responsive Design

- **Desktop**: Full layout with side-by-side cards
- **Tablet**: Adjusted grid layouts
- **Mobile**: Stacked layout with hamburger menu

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Customization

### Changing Colors
Edit `src/styles.scss` to modify the theme colors:

```scss
$primary-green: #2DD4A4;
$dark-bg: #1A1A1A;
$light-bg: #F5F3EF;
```

### Adding New Sections
1. Create a new component: `ng generate component components/your-section`
2. Add the component to the home page template
3. Update the data service if needed

## License

This project is created for educational and demonstration purposes.

## Credits

Design inspiration from Pinterest: Mental health clinic landing page design





