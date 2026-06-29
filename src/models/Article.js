const mongoose = require('mongoose');

// Controlled list of blog categories provided by the client. Kept as an enum so
// the admin editor and the public filter share a single source of truth.
const CATEGORIES = [
  'Sexual Health',
  'Hair & Scalp',
  'Skin & Beauty',
  'Weight Loss',
  'Stress, Anxiety & Sleep',
  'PCOS & Women Health',
  'Diabetes & Thyroid Care',
  'Digestion & Gut Health',
  'Joint & Back Pain',
  'Child Health',
];

const STATUSES = ['draft', 'published'];

// Turn a heading into a URL-friendly slug: lowercase, alphanumerics + dashes.
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const articleSchema = new mongoose.Schema(
  {
    // The article heading shown as the <h1> and used to derive the slug.
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // SEO-friendly URL segment, e.g. /blog/managing-pcos-naturally. Unique so
    // each article has a stable, shareable link.
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
    // Thumbnail / hero image (ImageKit URL). Doubles as the OG/Twitter image.
    thumbnailUrl: {
      type: String,
      default: '',
    },
    // Short summary shown on cards and used as the default meta description.
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Full article body as HTML (produced by the admin rich-text editor).
    body: {
      type: String,
      default: '',
    },
    // Draft articles are saved but never exposed on the public site.
    status: {
      type: String,
      enum: STATUSES,
      default: 'draft',
    },
    // Optional SEO overrides. When blank we fall back to title/description.
    seoTitle: {
      type: String,
      default: '',
      trim: true,
    },
    seoDescription: {
      type: String,
      default: '',
      trim: true,
    },
    // Set the first time an article is published; used for ordering and the
    // public "posted on" date.
    publishedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

articleSchema.statics.CATEGORIES = CATEGORIES;
articleSchema.statics.STATUSES = STATUSES;
articleSchema.statics.slugify = slugify;

module.exports = mongoose.model('Article', articleSchema);
