/**
 * Font Usage Guide for Largence
 * 
 * This project uses three primary font families:
 * 
 * 1. PolySans (--font-poly-sans) - For titles, hero text, and design elements
 *    - Use: font-display or font-title classes
 *    - Weights: 300 (slim), 400 (neutral), 500 (median), 700 (bulky)
 *    - Best for: Large headings, hero sections, marketing content
 * 
 * 2. General Sans (--font-general-sans) - For primary headings and UI elements
 *    - Use: font-heading class or font-(family-name:--font-general-sans)
 *    - Weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
 *    - Best for: H1-H6 headings, subheadings, important labels
 * 
 * 3. Satoshi (--font-satoshi) - Default body text
 *    - Use: font-sans class (default)
 *    - Weights: 300 (light), 400 (regular), 500 (medium), 700 (bold), 900 (black)
 *    - Best for: Body text, paragraphs, general content
 * 
 * 4. Geist Mono (--font-geist-mono) - Code and technical content
 *    - Use: font-mono class
 *    - Best for: Code blocks, technical data
 * 
 * @example
 * // Hero title with PolySans
 * <h1 className="font-display text-6xl font-bold">Welcome to Largence</h1>
 * 
 * @example
 * // Primary heading with General Sans
 * <h2 className="font-heading text-3xl font-semibold">Our Services</h2>
 * 
 * @example
 * // Alternative syntax for General Sans
 * <h2 className="text-3xl font-semibold font-(family-name:--font-general-sans)">
 *   Our Services
 * </h2>
 * 
 * @example
 * // Body text with Satoshi (default)
 * <p className="text-base">This is regular body text using Satoshi.</p>
 * 
 * @example
 * // Design element with PolySans
 * <div className="font-title text-2xl font-medium">Feature Title</div>
 */

// Font hierarchy examples:

// Hero Section
export const HeroExample = () => (
  <div>
    <h1 className="font-display text-7xl font-bold mb-4">
      Enterprise Legal Intelligence
    </h1>
    <p className="text-xl text-muted-foreground">
      Automate contract drafting and ensure compliance across Africa
    </p>
  </div>
)

// Section with heading hierarchy
export const SectionExample = () => (
  <section>
    <h2 className="font-heading text-4xl font-semibold mb-3">
      Why Choose Largence?
    </h2>
    <h3 className="font-heading text-2xl font-medium mb-2">
      AI-Powered Automation
    </h3>
    <p className="text-base leading-relaxed">
      Generate legal documents in seconds with our advanced AI technology.
    </p>
  </section>
)

// Card with title
export const CardExample = () => (
  <div className="p-6 rounded-lg border bg-card">
    <h3 className="font-title text-xl font-medium mb-2">
      Document Drafting
    </h3>
    <p className="text-sm text-muted-foreground">
      Create contracts, NDAs, and policies with ease.
    </p>
  </div>
)

// Button with display font
export const CtaExample = () => (
  <button className="font-display text-lg font-bold px-6 py-3">
    Get Started
  </button>
)
