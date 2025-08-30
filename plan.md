# 🚀 Multi-Tenant AI-Generated E-commerce Platform - Complete Implementation Plan

## **Project Overview**
Transform the current React Router v7 e-commerce platform into a multi-tenant SaaS with AI-generated sections, using Cloudflare infrastructure, Turso DB (database-per-tenant), and InstantDB for real-time cart/orders.

## **Architecture Overview**

### **Multi-Tenant Strategy: Database-Per-Tenant**
- Each tenant gets their own Turso database instance
- Complete data isolation and security
- Independent scaling per tenant
- Simplified backup and migration
- Better performance isolation

### **Technology Stack**
- **Frontend**: React Router v7 + TailwindCSS
- **Database**: Turso (SQLite) - One database per tenant
- **Real-time**: InstantDB for cart/orders
- **Edge**: Cloudflare Workers + Pages
- **Storage**: Cloudflare R2 for media
- **AI Integration**: Your "tar" app generates sections
- **Vector Search**: Custom implementation with embeddings

---

## **Phase 1: Foundation & Multi-Tenant Database Architecture**

### **Objectives**
- Set up database-per-tenant architecture with Turso
- Establish Cloudflare infrastructure
- Create tenant resolution and database routing system
- Prepare development environment

### **1.1 Master Database Schema (Tenant Registry)**
```sql
-- Master database for tenant management
-- Database: platform_master.db

CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, suspended, trial, deleted
  plan_type TEXT DEFAULT 'basic', -- basic, pro, enterprise
  database_url TEXT NOT NULL, -- Turso database URL for this tenant
  database_token TEXT NOT NULL, -- Turso auth token for this tenant
  settings JSON DEFAULT '{}',
  limits JSON DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenant_usage (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- storage, requests, ai_generations, etc.
  value INTEGER DEFAULT 0,
  period TEXT NOT NULL, -- daily, monthly, yearly
  date TEXT NOT NULL, -- YYYY-MM-DD format
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE tenant_subscriptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, cancelled, expired
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_subscription_id TEXT,
  current_period_start DATETIME,
  current_period_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenant_usage_tenant_date ON tenant_usage(tenant_id, date);
```

### **1.2 Individual Tenant Database Schema**
```sql
-- Schema for each tenant's individual database
-- Database: tenant_{tenant_id}.db

-- AI-generated sections for dynamic pages
CREATE TABLE ai_sections (
  id TEXT PRIMARY KEY,
  page_type TEXT NOT NULL, -- 'home', 'product', 'about', 'landing'
  section_type TEXT NOT NULL, -- 'hero', 'features', 'testimonials', etc.
  section_name TEXT, -- human-readable name
  ai_prompt TEXT, -- original prompt used to generate
  generated_content JSON NOT NULL, -- AI-generated structured content
  layout_variant TEXT DEFAULT 'default',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products with vector embeddings for search
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price REAL NOT NULL,
  compare_price REAL,
  cost_price REAL,
  sku TEXT UNIQUE,
  barcode TEXT,
  track_inventory BOOLEAN DEFAULT false,
  inventory_quantity INTEGER DEFAULT 0,
  weight REAL,
  image_url TEXT,
  gallery_urls JSON DEFAULT '[]',
  category TEXT,
  tags JSON DEFAULT '[]',
  metadata JSON DEFAULT '{}',
  embedding BLOB, -- vector embeddings for semantic search
  seo_title TEXT,
  seo_description TEXT,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Product categories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Custom pages
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSON, -- AI-generated page content
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  template_type TEXT DEFAULT 'default',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Site settings
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSON NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_ai_sections_page_type ON ai_sections(page_type, is_active, order_index);
CREATE INDEX idx_products_active ON products(is_active, featured);
CREATE INDEX idx_products_category ON products(category, is_active);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_categories_parent ON categories(parent_id, is_active);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_pages_slug ON pages(slug, is_published);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES 
('branding', '{"primaryColor": "#000000", "secondaryColor": "#666666", "logoUrl": "", "fontFamily": "Inter"}'),
('features', '{"aiSections": true, "vectorSearch": true, "realTimeCart": true}'),
('seo', '{"defaultTitle": "My Store", "defaultDescription": "Welcome to my store"}'),
('checkout', '{"currency": "USD", "taxRate": 0.08, "freeShippingThreshold": 50}');
```

### **1.3 Tenant Database Management System**
```typescript
// app/lib/tenant-db-manager.ts
import { createClient } from '@libsql/client';

export interface TenantDatabaseConfig {
  tenantId: string;
  databaseUrl: string;
  authToken: string;
}

export class TenantDatabaseManager {
  private masterDb: any;
  private tenantConnections: Map<string, any> = new Map();

  constructor(masterDbUrl: string, masterDbToken: string) {
    this.masterDb = createClient({
      url: masterDbUrl,
      authToken: masterDbToken,
    });
  }

  // Create new tenant database
  async createTenantDatabase(tenantId: string, subdomain: string, name: string): Promise<TenantDatabaseConfig> {
    // Create new Turso database via API
    const dbName = `tenant_${tenantId}`;
    const tursoResponse = await this.createTursoDatabase(dbName);
    
    const config: TenantDatabaseConfig = {
      tenantId,
      databaseUrl: tursoResponse.url,
      authToken: tursoResponse.token,
    };

    // Register tenant in master database
    await this.masterDb.execute({
      sql: `INSERT INTO tenants (id, subdomain, name, database_url, database_token, created_at) 
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [tenantId, subdomain, name, config.databaseUrl, config.authToken]
    });

    // Initialize tenant database schema
    await this.initializeTenantSchema(config);

    return config;
  }

  // Get tenant database connection
  async getTenantDatabase(tenantId: string): Promise<any> {
    if (this.tenantConnections.has(tenantId)) {
      return this.tenantConnections.get(tenantId);
    }

    // Get tenant config from master database
    const result = await this.masterDb.execute({
      sql: 'SELECT database_url, database_token FROM tenants WHERE id = ? AND status = "active"',
      args: [tenantId]
    });

    if (result.rows.length === 0) {
      throw new Error(`Tenant ${tenantId} not found or inactive`);
    }

    const tenant = result.rows[0];
    const connection = createClient({
      url: tenant.database_url as string,
      authToken: tenant.database_token as string,
    });

    this.tenantConnections.set(tenantId, connection);
    return connection;
  }

  // Get tenant by subdomain
  async getTenantBySubdomain(subdomain: string) {
    const result = await this.masterDb.execute({
      sql: 'SELECT * FROM tenants WHERE subdomain = ? AND status = "active"',
      args: [subdomain]
    });

    return result.rows[0] || null;
  }

  // Get tenant by custom domain
  async getTenantByCustomDomain(domain: string) {
    const result = await this.masterDb.execute({
      sql: 'SELECT * FROM tenants WHERE custom_domain = ? AND status = "active"',
      args: [domain]
    });

    return result.rows[0] || null;
  }

  private async createTursoDatabase(dbName: string) {
    // Call Turso API to create new database
    const response = await fetch('https://api.turso.tech/v1/databases', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TURSO_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: dbName,
        group: process.env.TURSO_GROUP || 'default',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create Turso database: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Create auth token for the database
    const tokenResponse = await fetch(`https://api.turso.tech/v1/databases/${dbName}/auth/tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TURSO_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        permissions: {
          read_attach: {
            databases: [dbName]
          }
        }
      }),
    });

    const tokenData = await tokenResponse.json();

    return {
      url: data.hostname,
      token: tokenData.jwt,
    };
  }

  private async initializeTenantSchema(config: TenantDatabaseConfig) {
    const db = createClient({
      url: config.databaseUrl,
      authToken: config.authToken,
    });

    // Execute schema creation SQL
    const schemaSQL = `
      -- AI-generated sections table
      CREATE TABLE ai_sections (
        id TEXT PRIMARY KEY,
        page_type TEXT NOT NULL,
        section_type TEXT NOT NULL,
        section_name TEXT,
        ai_prompt TEXT,
        generated_content JSON NOT NULL,
        layout_variant TEXT DEFAULT 'default',
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        version INTEGER DEFAULT 1,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Products table
      CREATE TABLE products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        short_description TEXT,
        price REAL NOT NULL,
        compare_price REAL,
        cost_price REAL,
        sku TEXT UNIQUE,
        barcode TEXT,
        track_inventory BOOLEAN DEFAULT false,
        inventory_quantity INTEGER DEFAULT 0,
        weight REAL,
        image_url TEXT,
        gallery_urls JSON DEFAULT '[]',
        category TEXT,
        tags JSON DEFAULT '[]',
        metadata JSON DEFAULT '{}',
        embedding BLOB,
        seo_title TEXT,
        seo_description TEXT,
        is_active BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Categories table
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        parent_id TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        seo_title TEXT,
        seo_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      -- Pages table
      CREATE TABLE pages (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content JSON,
        meta_title TEXT,
        meta_description TEXT,
        is_published BOOLEAN DEFAULT false,
        template_type TEXT DEFAULT 'default',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Site settings table
      CREATE TABLE site_settings (
        key TEXT PRIMARY KEY,
        value JSON NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX idx_ai_sections_page_type ON ai_sections(page_type, is_active, order_index);
      CREATE INDEX idx_products_active ON products(is_active, featured);
      CREATE INDEX idx_products_category ON products(category, is_active);
      CREATE INDEX idx_products_sku ON products(sku);
      CREATE INDEX idx_categories_parent ON categories(parent_id, is_active);
      CREATE INDEX idx_categories_slug ON categories(slug);
      CREATE INDEX idx_pages_slug ON pages(slug, is_published);

      -- Insert default settings
      INSERT INTO site_settings (key, value) VALUES 
      ('branding', '{"primaryColor": "#000000", "secondaryColor": "#666666", "logoUrl": "", "fontFamily": "Inter"}'),
      ('features', '{"aiSections": true, "vectorSearch": true, "realTimeCart": true}'),
      ('seo', '{"defaultTitle": "My Store", "defaultDescription": "Welcome to my store"}'),
      ('checkout', '{"currency": "USD", "taxRate": 0.08, "freeShippingThreshold": 50}');
    `;

    await db.execute(schemaSQL);
  }
}
```

### **1.4 Cloudflare Worker for Tenant Routing**
```javascript
// workers/tenant-router/src/index.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    try {
      // Resolve tenant from hostname
      const tenant = await resolveTenant(hostname, env);
      
      if (!tenant) {
        return new Response('Tenant not found', { 
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      // Add tenant context to request headers
      const modifiedRequest = new Request(request, {
        headers: {
          ...Object.fromEntries(request.headers),
          'X-Tenant-ID': tenant.id,
          'X-Tenant-Subdomain': tenant.subdomain,
          'X-Tenant-Plan': tenant.plan_type,
          'X-Tenant-DB-URL': tenant.database_url,
          'X-Tenant-DB-TOKEN': tenant.database_token,
        }
      });

      // Update last accessed time
      ctx.waitUntil(updateTenantLastAccessed(tenant.id, env));

      // Forward to application
      return fetch(modifiedRequest);
      
    } catch (error) {
      console.error('Tenant routing error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

async function resolveTenant(hostname, env) {
  // Check if it's a custom domain
  if (!hostname.includes(env.BASE_DOMAIN)) {
    return await queryTenantByCustomDomain(hostname, env);
  }
  
  // Extract subdomain
  const parts = hostname.split('.');
  if (parts.length < 3) return null; // Not a subdomain
  
  const subdomain = parts[0];
  
  // Skip www and root domain
  if (subdomain === 'www' || subdomain === env.BASE_DOMAIN.split('.')[0]) {
    return null;
  }
  
  return await queryTenantBySubdomain(subdomain, env);
}

async function queryTenantBySubdomain(subdomain, env) {
  const response = await fetch(`${env.API_BASE_URL}/api/internal/tenants/by-subdomain/${subdomain}`, {
    headers: {
      'Authorization': `Bearer ${env.INTERNAL_API_TOKEN}`,
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) return null;
  return response.json();
}

async function queryTenantByCustomDomain(domain, env) {
  const response = await fetch(`${env.API_BASE_URL}/api/internal/tenants/by-domain/${domain}`, {
    headers: {
      'Authorization': `Bearer ${env.INTERNAL_API_TOKEN}`,
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) return null;
  return response.json();
}

async function updateTenantLastAccessed(tenantId, env) {
  await fetch(`${env.API_BASE_URL}/api/internal/tenants/${tenantId}/last-accessed`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.INTERNAL_API_TOKEN}`,
    }
  });
}
```

### **1.5 Environment Configuration**
```typescript
// app/config/env.ts
export const config = {
  // Master database (tenant registry)
  masterDb: {
    url: process.env.MASTER_DB_URL!,
    authToken: process.env.MASTER_DB_TOKEN!,
  },
  
  // Turso API for database creation
  turso: {
    apiToken: process.env.TURSO_API_TOKEN!,
    group: process.env.TURSO_GROUP || 'default',
    organization: process.env.TURSO_ORG!,
  },
  
  // InstantDB for real-time features
  instantdb: {
    appId: process.env.INSTANTDB_APP_ID!,
    adminToken: process.env.INSTANTDB_ADMIN_TOKEN!,
  },
  
  // Cloudflare
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    zoneId: process.env.CLOUDFLARE_ZONE_ID!,
  },
  
  // Application
  app: {
    baseUrl: process.env.APP_BASE_URL || 'https://yourplatform.com',
    baseDomain: process.env.BASE_DOMAIN || 'yourplatform.com',
    environment: process.env.NODE_ENV || 'development',
    internalApiToken: process.env.INTERNAL_API_TOKEN!,
  },
  
  // AI/Vector search
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  
  // File storage
  r2: {
    endpoint: process.env.R2_ENDPOINT!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
  }
};
```

### **Deliverables Phase 1**
- ✅ Master database schema for tenant registry
- ✅ Individual tenant database schema template
- ✅ Tenant database management system
- ✅ Cloudflare Worker for tenant routing
- ✅ Environment configuration setup
- ✅ Database-per-tenant architecture established

### **Testing Criteria Phase 1**
- Master database created and accessible
- Tenant database creation works via API
- Cloudflare Worker routes requests correctly
- Tenant resolution works for subdomains and custom domains
- Environment variables configured properly
- Database connections functional for both master and tenant DBs

---

## **Phase 2: Tenant Context & Database Abstraction**

### **Objectives**
- Implement tenant context system in React app
- Create database abstraction layer for tenant operations
- Set up tenant middleware for request handling
- Build tenant-aware data access patterns

### **2.1 Tenant Context System**
```typescript
// app/types/tenant.ts
export interface Tenant {
  id: string;
  subdomain: string;
  customDomain?: string;
  name: string;
  status: 'active' | 'suspended' | 'trial' | 'deleted';
  planType: 'basic' | 'pro' | 'enterprise';
  databaseUrl: string;
  databaseToken: string;
  settings: TenantSettings;
  limits: TenantLimits;
  createdAt: string;
  updatedAt: string;
  lastAccessed: string;
}

export interface TenantSettings {
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl?: string;
    faviconUrl?: string;
    fontFamily: string;
  };
  features: {
    aiSections: boolean;
    vectorSearch: boolean;
    realTimeCart: boolean;
    analytics: boolean;
    customDomains: boolean;
    multiLanguage: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    googleTagManagerId?: string;
  };
  checkout: {
    currency: string;
    taxRate: number;
    freeShippingThreshold: number;
    shippingRates: Array<{
      name: string;
      price: number;
      description: string;
      estimatedDays: string;
    }>;
    paymentMethods: string[];
  };
  notifications: {
    emailNotifications: boolean;
    orderConfirmation: boolean;
    lowInventory: boolean;
    newCustomer: boolean;
  };
}

export interface TenantLimits {
  products: number;
  orders: number;
  storage: number; // in MB
  aiGenerations: number; // per month
  customDomains: number;
  users: number;
}

// app/lib/tenant-context.tsx
import { createContext, useContext, ReactNode } from 'react';
import type { Tenant } from '../types/tenant';

const TenantContext = createContext<Tenant | null>(null);

export function TenantProvider({ 
  children, 
  tenant 
}: { 
  children: ReactNode; 
  tenant: Tenant;
}) {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): Tenant {
  const tenant = useContext(TenantContext);
  if (!tenant) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return tenant;
}

export function useTenantSettings(): TenantSettings {
  const tenant = useTenant();
  return tenant.settings;
}

export function useTenantLimits(): TenantLimits {
  const tenant = useTenant();
  return tenant.limits;
}

export function useTenantBranding() {
  const tenant = useTenant();
  return tenant.settings.branding;
}

export function useTenantFeatures() {
  const tenant = useTenant();
  return tenant.settings.features;
}
```

### **2.2 Tenant Middleware & Request Handling**
```typescript
// app/lib/middleware/tenant.ts
import type { LoaderFunctionArgs } from 'react-router';
import { TenantDatabaseManager } from '../tenant-db-manager';
import { TenantDatabase } from '../db/tenant-db';
import { config } from '../config/env';

const dbManager = new TenantDatabaseManager(
  config.masterDb.url,
  config.masterDb.authToken
);

export async function getTenantFromRequest(request: Request) {
  const tenantId = request.headers.get('X-Tenant-ID');
  const tenantDbUrl = request.headers.get('X-Tenant-DB-URL');
  const tenantDbToken = request.headers.get('X-Tenant-DB-TOKEN');
  
  if (!tenantId || !tenantDbUrl || !tenantDbToken) {
    throw new Response('Tenant information missing', { status: 400 });
  }
  
  // Create tenant object from headers
  const tenant = {
    id: tenantId,
    subdomain: request.headers.get('X-Tenant-Subdomain') || '',
    name: '', // Will be loaded from database if needed
    status: 'active' as const,
    planType: (request.headers.get('X-Tenant-Plan') as any) || 'basic',
    databaseUrl: tenantDbUrl,
    databaseToken: tenantDbToken,
    settings: {} as any, // Will be loaded from tenant database
    limits: {} as any,
    createdAt: '',
    updatedAt: '',
    lastAccessed: ''
  };
  
  return tenant;
}

export async function requireTenant(args: LoaderFunctionArgs) {
  const tenant = await getTenantFromRequest(args.request);
  const db = new TenantDatabase(tenant);
  
  // Load tenant settings from their database
  const settings = await db.getAllSettings();
  tenant.settings = {
    branding: settings.branding || {
      primaryColor: '#000000',
      secondaryColor: '#666666',
      accentColor: '#3b82f6',
      fontFamily: 'Inter'
    },
    features: settings.features || {
      aiSections: true,
      vectorSearch: true,
      realTimeCart: true,
      analytics: false,
      customDomains: false,
      multiLanguage: false
    },
    seo: settings.seo || {
      defaultTitle: 'My Store',
      defaultDescription: 'Welcome to my store'
    },
    checkout: settings.checkout || {
      currency: 'USD',
      taxRate: 0.08,
      freeShippingThreshold: 50,
      shippingRates: [],
      paymentMethods: ['stripe']
    },
    notifications: settings.notifications || {
      emailNotifications: true,
      orderConfirmation: true,
      lowInventory: false,
      newCustomer: false
    }
  };
  
  return { tenant, db };
}

// Internal API routes for Cloudflare Worker
export async function handleInternalTenantRequest(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Verify internal API token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const token = authHeader.slice(7);
  if (token !== config.app.internalApiToken) {
    return new Response('Invalid token', { status: 401 });
  }
  
  if (path.startsWith('/api/internal/tenants/by-subdomain/')) {
    const subdomain = path.split('/').pop();
    const tenant = await dbManager.getTenantBySubdomain(subdomain!);
    return Response.json(tenant);
  }
  
  if (path.startsWith('/api/internal/tenants/by-domain/')) {
    const domain = path.split('/').pop();
    const tenant = await dbManager.getTenantByCustomDomain(domain!);
    return Response.json(tenant);
  }
  
  if (path.match(/\/api\/internal\/tenants\/(.+)\/last-accessed/)) {
    const tenantId = path.split('/')[4];
    // Update last accessed time in master database
    await dbManager.masterDb.execute({
      sql: 'UPDATE tenants SET last_accessed = datetime("now") WHERE id = ?',
      args: [tenantId]
    });
    return new Response('OK');
  }
  
  return new Response('Not Found', { status: 404 });
}
```

### **Deliverables Phase 2**
- ✅ Tenant context system with React hooks
- ✅ Database abstraction layer for tenant operations
- ✅ Tenant middleware for request handling
- ✅ Internal API routes for Cloudflare Worker integration
- ✅ Type-safe tenant operations

### **Testing Criteria Phase 2**
- Tenant context works across React components
- Database operations are tenant-isolated
- Middleware correctly extracts and loads tenant data
- Internal API routes respond correctly to Worker requests
- No cross-tenant data access possible

---

## **Phase 3: AI Section System Architecture**

### **Objectives**
- Design AI section component system
- Create section templates and variants
- Build dynamic section renderer
- Integrate with "tar" app data structure

### **3.1 AI Section Types & Content Structure**
```typescript
// app/types/ai-sections.ts
export interface AISection {
  id: string;
  pageType: 'home' | 'product' | 'about' | 'landing' | 'category';
  sectionType: SectionType;
  sectionName?: string;
  aiPrompt: string;
  generatedContent: SectionContent;
  layoutVariant: string;
  orderIndex: number;
  isActive: boolean;
  version: number;
  generatedAt: string;
  updatedAt: string;
  aiMetadata?: {
    generatedFrom: string;
    confidenceScore: number;
    generationModel: string;
    tokens: number;
    processingTime: number;
  };
}

export type SectionType = 
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'product_showcase'
  | 'cta'
  | 'stats'
  | 'faq'
  | 'newsletter'
  | 'about_story'
  | 'contact_info'
  | 'gallery'
  | 'pricing'
  | 'team'
  | 'blog_preview'
  | 'social_proof'
  | 'process_steps'
  | 'benefits'
  | 'comparison'
  | 'timeline';

export interface SectionContent {
  // Common fields
  title?: string;
  subtitle?: string;
  description?: string;
  
  // Visual elements
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  
  // Interactive elements
  ctaPrimary?: CTAButton;
  ctaSecondary?: CTAButton;
  
  // Section-specific content
  [key: string]: any;
}

export interface CTAButton {
  text: string;
  action: string; // URL or route
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  openInNewTab?: boolean;
}

// Hero section specific content
export interface HeroContent extends SectionContent {
  headline: string;
  subheadline: string;
  heroImage?: string;
  videoUrl?: string;
  features?: string[];
  socialProof?: {
    text: string;
    avatars: string[];
    rating?: number;
  };
}

// Features section specific content
export interface FeaturesContent extends SectionContent {
  features: Array<{
    title: string;
    description: string;
    icon: string;
    image?: string;
  }>;
  layout: 'grid' | 'list' | 'cards' | 'alternating';
}

// Product showcase specific content
export interface ProductShowcaseContent extends SectionContent {
  displayType: 'featured' | 'category' | 'search' | 'manual';
  productIds?: string[];
  categoryFilter?: string;
  searchQuery?: string;
  limit: number;
  showPrices: boolean;
  showDescriptions: boolean;
  layout: 'grid' | 'carousel' | 'masonry';
}

// Testimonials section specific content
export interface TestimonialsContent extends SectionContent {
  testimonials: Array<{
    content: string;
    author: string;
    role?: string;
    company?: string;
    avatar?: string;
    rating?: number;
  }>;
  layout: 'carousel' | 'grid' | 'single' | 'masonry';
  showRatings: boolean;
}
```

### **3.2 Dynamic AI Section Renderer**
```typescript
// app/components/ai-sections/AISection.tsx
import type { AISection } from '../../types/ai-sections';
import { AI_SECTION_COMPONENTS } from './index';

interface AISectionProps {
  section: AISection;
  className?: string;
}

export function AISection({ section, className }: AISectionProps) {
  const Component = AI_SECTION_COMPONENTS[section.sectionType];
  
  if (!Component) {
    console.warn(`Unknown section type: ${section.sectionType}`);
    return (
      <div className="p-8 bg-gray-100 text-center">
        <p>Unknown section type: {section.sectionType}</p>
      </div>
    );
  }
  
  return (
    <Component 
      content={section.generatedContent}
      variant={section.layoutVariant}
      metadata={section.aiMetadata}
      className={className}
    />
  );
}

// app/components/ai-sections/index.ts
export { AIHeroSection } from './AIHeroSection';
export { AIFeaturesSection } from './AIFeaturesSection';
export { AITestimonialsSection } from './AITestimonialsSection';
export { AIProductShowcaseSection } from './AIProductShowcaseSection';
export { AICTASection } from './AICTASection';
export { AIStatsSection } from './AIStatsSection';
export { AIFAQSection } from './AIFAQSection';
export { AINewsletterSection } from './AINewsletterSection';

import type { SectionType } from '../../types/ai-sections';

export const AI_SECTION_COMPONENTS = {
  hero: AIHeroSection,
  features: AIFeaturesSection,
  testimonials: AITestimonialsSection,
  product_showcase: AIProductShowcaseSection,
  cta: AICTASection,
  stats: AIStatsSection,
  faq: AIFAQSection,
  newsletter: AINewsletterSection,
} as const;
```

### **3.3 Hero Section Component Example**
```typescript
// app/components/ai-sections/AIHeroSection.tsx
import { Link } from 'react-router';
import type { HeroContent } from '../../types/ai-sections';
import { useTenantBranding } from '../../lib/tenant-context';
import { cn } from '../../lib/utils';

interface AIHeroSectionProps {
  content: HeroContent;
  variant: string;
  className?: string;
  metadata?: any;
}

export function AIHeroSection({ content, variant, className, metadata }: AIHeroSectionProps) {
  const branding = useTenantBranding();
  
  const variants = {
    centered: 'text-center',
    split_left: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
    split_right: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
    overlay: 'relative bg-cover bg-center min-h-screen flex items-center',
    minimal: 'text-center py-20',
  };

  const containerClass = variants[variant as keyof typeof variants] || variants.centered;

  const sectionStyle = {
    backgroundColor: content.backgroundColor || 'transparent',
    backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
    color: content.textColor || branding.primaryColor,
    '--primary-color': branding.primaryColor,
    '--secondary-color': branding.secondaryColor,
  } as React.CSSProperties;

  return (
    <section 
      className={cn('py-20 px-4', className)}
      style={sectionStyle}
    >
      {content.backgroundImage && variant === 'overlay' && (
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      )}
      
      <div className={cn('container mx-auto relative z-10', containerClass)}>
        {variant === 'split_right' && content.heroImage && (
          <div className="order-1 lg:order-2">
            <img 
              src={content.heroImage} 
              alt={content.headline}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
        
        <div className={cn(
          'space-y-6',
          variant === 'split_right' ? 'order-2 lg:order-1' : ''
        )}>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            {content.headline}
          </h1>
          
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl">
            {content.subheadline}
          </p>
          
          {content.features && content.features.length > 0 && (
            <ul className="space-y-2 text-lg">
              {content.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {content.ctaPrimary && (
              <Link 
                to={content.ctaPrimary.action}
                className={cn(
                  'px-8 py-4 rounded-lg font-semibold text-center transition-all',
                  'bg-primary text-white hover:bg-primary/90'
                )}
                target={content.ctaPrimary.openInNewTab ? '_blank' : undefined}
              >
                {content.ctaPrimary.text}
              </Link>
            )}
            
            {content.ctaSecondary && (
              <Link 
                to={content.ctaSecondary.action}
                className={cn(
                  'px-8 py-4 rounded-lg font-semibold text-center transition-all',
                  'border-2 border-current hover:bg-current hover:text-white'
                )}
                target={content.ctaSecondary.openInNewTab ? '_blank' : undefined}
              >
                {content.ctaSecondary.text}
              </Link>
            )}
          </div>
          
          {content.socialProof && (
            <div className="pt-8 flex items-center justify-center lg:justify-start space-x-4">
              <div className="flex -space-x-2">
                {content.socialProof.avatars.map((avatar, index) => (
                  <img 
                    key={index}
                    src={avatar} 
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm opacity-80">{content.socialProof.text}</p>
                {content.socialProof.rating && (
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={cn(
                          'text-yellow-400',
                          i < content.socialProof!.rating! ? 'opacity-100' : 'opacity-30'
                        )}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {(variant === 'split_left' || variant === 'centered') && content.heroImage && (
          <div className="mt-8 lg:mt-0">
            <img 
              src={content.heroImage} 
              alt={content.headline}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </section>
  );
}
```

### **Deliverables Phase 3**
- ✅ AI section type definitions and interfaces
- ✅ Dynamic section renderer system
- ✅ Hero section component with multiple variants
- ✅ Section component registry
- ✅ Integration structure for "tar" app

### **Testing Criteria Phase 3**
- AI sections render correctly with different variants
- Section content is properly typed and validated
- Dynamic section loading works
- Hero section displays all content types properly
- Section registry correctly maps types to components

---

## **Phase 4: InstantDB Integration & Real-time Cart**

### **Objectives**
- Set up InstantDB for real-time cart management
- Create cart state management system
- Implement real-time cart operations
- Build order management system

### **4.1 InstantDB Schema & Setup**
```typescript
// app/lib/db/instant-db.ts
import { init, tx, id } from '@instantdb/react';
import { config } from '../config/env';

// Initialize InstantDB
export const instantDB = init({
  appId: config.instantdb.appId,
});

// InstantDB schema
export const instantSchema = {
  carts: {
    id: 'string',
    tenant_id: 'string',
    session_id: 'string',
    user_id: 'string?',
    items: 'json',
    subtotal: 'number',
    tax: 'number',
    shipping: 'number',
    total: 'number',
    currency: 'string',
    expires_at: 'number',
    created_at: 'number',
    updated_at: 'number'
  },
  
  cart_items: {
    id: 'string',
    cart_id: 'string',
    product_id: 'string',
    variant_id: 'string?',
    quantity: 'number',
    price: 'number',
    product_data: 'json',
    added_at: 'number'
  },
  
  orders: {
    id: 'string',
    tenant_id: 'string',
    order_number: 'string',
    customer_info: 'json',
    billing_address: 'json',
    shipping_address: 'json',
    items: 'json',
    subtotal: 'number',
    tax: 'number',
    shipping: 'number',
    total: 'number',
    currency: 'string',
    status: 'string',
    payment_status: 'string',
    payment_method: 'string?',
    notes: 'string?',
    created_at: 'number',
    updated_at: 'number'
  }
};

export class TenantInstantDB {
  constructor(private tenantId: string) {}

  // Cart operations
  async createCart(sessionId: string, userId?: string) {
    const cartId = id();
    const now = Date.now();
    
    await instantDB.transact([
      tx.carts[cartId].update({
        tenant_id: this.tenantId,
        session_id: sessionId,
        user_id: userId || null,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        currency: 'USD',
        expires_at: now + (7 * 24 * 60 * 60 * 1000), // 7 days
        created_at: now,
        updated_at: now,
      })
    ]);
    
    return cartId;
  }

  async addToCart(cartId: string, productId: string, quantity: number, price: number, productData: any, variantId?: string) {
    const itemId = id();
    
    await instantDB.transact([
      tx.cart_items[itemId].update({
        cart_id: cartId,
        product_id: productId,
        variant_id: variantId || null,
        quantity,
        price,
        product_data: productData,
        added_at: Date.now(),
      })
    ]);
    
    await this.updateCartTotals(cartId);
    return itemId;
  }

  async updateCartItem(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(itemId);
    }
    
    await instantDB.transact([
      tx.cart_items[itemId].update({ quantity })
    ]);
    
    // Get cart ID to update totals
    const item = await instantDB.queryOnce({
      cart_items: {
        $: { where: { id: itemId } }
      }
    });
    
    if (item.cart_items[0]) {
      await this.updateCartTotals(item.cart_items[0].cart_id);
    }
  }

  async removeFromCart(itemId: string) {
    const item = await instantDB.queryOnce({
      cart_items: {
        $: { where: { id: itemId } }
      }
    });
    
    await instantDB.transact([
      tx.cart_items[itemId].delete()
    ]);
    
    if (item.cart_items[0]) {
      await this.updateCartTotals(item.cart_items[0].cart_id);
    }
  }

  private async updateCartTotals(cartId: string) {
    const result = await instantDB.queryOnce({
      cart_items: {
        $: { where: { cart_id: cartId } }
      }
    });
    
    const items = result.cart_items;
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Get tenant settings for tax calculation
    const taxRate = 0.08; // This should come from tenant settings
    const freeShippingThreshold = 50; // This should come from tenant settings
    
    const tax = subtotal * taxRate;
    const shipping = subtotal >= freeShippingThreshold ? 0 : 10;
    const total = subtotal + tax + shipping;
    
    await instantDB.transact([
      tx.carts[cartId].update({
        subtotal,
        tax,
        shipping,
        total,
        updated_at: Date.now(),
      })
    ]);
  }

  // React hooks for real-time data
  useCart(sessionId: string) {
    return instantDB.useQuery({
      carts: {
        $: { 
          where: { 
            tenant_id: this.tenantId, 
            session_id: sessionId 
          } 
        }
      },
      cart_items: {
        $: { 
          where: { 
            cart_id: { in: instantDB.carts.session_id[sessionId].id }
          }
        }
      }
    });
  }

  useCartItems(cartId: string) {
    return instantDB.useQuery({
      cart_items: {
        $: { where: { cart_id: cartId } }
      }
    });
  }
}
```

### **4.2 Cart Context & Hooks**
```typescript
// app/lib/cart-context.tsx
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useTenant } from './tenant-context';
import { TenantInstantDB } from './db/instant-db';

interface CartContextType {
  cartId: string | null;
  sessionId: string;
  addToCart: (productId: string, quantity: number, price: number, productData: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const tenant = useTenant();
  const [cartId, setCartId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  const instantDB = new TenantInstantDB(tenant.id);

  useEffect(() => {
    // Generate or retrieve session ID
    let session = localStorage.getItem('cart_session_id');
    if (!session) {
      session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session_id', session);
    }
    setSessionId(session);

    // Find or create cart
    initializeCart(session);
  }, [tenant.id]);

  const initializeCart = async (session: string) => {
    try {
      setIsLoading(true);
      
      // Check for existing cart
      const result = await instantDB.instantDB.queryOnce({
        carts: {
          $: { 
            where: { 
              tenant_id: tenant.id, 
              session_id: session,
              expires_at: { '>': Date.now() }
            } 
          }
        }
      });

      if (result.carts.length > 0) {
        setCartId(result.carts[0].id);
      } else {
        // Create new cart
        const newCartId = await instantDB.createCart(session);
        setCartId(newCartId);
      }
    } catch (error) {
      console.error('Failed to initialize cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number, price: number, productData: any) => {
    if (!cartId) return;
    
    try {
      await instantDB.addToCart(cartId, productId, quantity, price, productData);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await instantDB.updateCartItem(itemId, quantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await instantDB.removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!cartId) return;
    
    try {
      // Remove all items
      const items = await instantDB.instantDB.queryOnce({
        cart_items: {
          $: { where: { cart_id: cartId } }
        }
      });

      const deleteTransactions = items.cart_items.map(item => 
        tx.cart_items[item.id].delete()
      );

      await instantDB.instantDB.transact(deleteTransactions);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{
      cartId,
      sessionId,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function useCartData() {
  const { sessionId } = useCart();
  const tenant = useTenant();
  const instantDB = new TenantInstantDB(tenant.id);
  
  return instantDB.useCart(sessionId);
}
```

### **Deliverables Phase 4**
- ✅ InstantDB schema and setup
- ✅ Real-time cart operations
- ✅ Cart context and React hooks
- ✅ Session-based cart management
- ✅ Automatic cart total calculations

### **Testing Criteria Phase 4**
- Cart operations work in real-time
- Cart persists across browser sessions
- Cart totals calculate correctly
- Multiple users can have separate carts
- Cart expires after set time period

---

## **Phase 5: Vector Search & Product Discovery**

### **Objectives**
- Implement vector embeddings for products
- Create semantic search functionality
- Build product recommendation system
- Integrate with AI-generated product showcases

### **5.1 Vector Embeddings System**
```typescript
// app/lib/vector-search.ts
import { config } from '../config/env';

export class VectorSearchService {
  private openaiApiKey: string;

  constructor() {
    this.openaiApiKey = config.openai.apiKey;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  async generateProductEmbedding(product: {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
  }): Promise<number[]> {
    // Combine product information for embedding
    const text = [
      product.name,
      product.description || '',
      product.category || '',
      ...(product.tags || [])
    ].filter(Boolean).join(' ');

    return this.generateEmbedding(text);
  }

  // Cosine similarity calculation
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Search products by similarity
  async searchProducts(
    db: any, 
    queryEmbedding: number[], 
    limit: number = 10,
    threshold: number = 0.7
  ) {
    // Get all products with embeddings
    const result = await db.query(`
      SELECT id, name, description, price, image_url, category, embedding
      FROM products 
      WHERE is_active = true AND embedding IS NOT NULL
    `);

    const products = result.rows.map((row: any) => ({
      ...row,
      embedding: new Float32Array(row.embedding),
      similarity: this.cosineSimilarity(
        queryEmbedding, 
        Array.from(new Float32Array(row.embedding))
      )
    }));

    // Filter by threshold and sort by similarity
    return products
      .filter(p => p.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ embedding, ...product }) => product);
  }

  // Get product recommendations
  async getRecommendations(
    db: any,
    productId: string,
    limit: number = 5
  ) {
    // Get the current product's embedding
    const result = await db.query(
      'SELECT embedding FROM products WHERE id = ? AND embedding IS NOT NULL',
      [productId]
    );

    if (result.rows.length === 0) {
      return [];
    }

    const productEmbedding = Array.from(new Float32Array(result.rows[0].embedding));
    
    // Find similar products (excluding the current one)
    const allProducts = await db.query(`
      SELECT id, name, description, price, image_url, category, embedding
      FROM products 
      WHERE is_active = true AND embedding IS NOT NULL AND id != ?
    `, [productId]);

    const recommendations = allProducts.rows.map((row: any) => ({
      ...row,
      similarity: this.cosineSimilarity(
        productEmbedding,
        Array.from(new Float32Array(row.embedding))
      )
    }));

    return recommendations
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ embedding, ...product }) => product);
  }
}
```

### **Deliverables Phase 5**
- ✅ Vector embedding generation system
- ✅ Semantic product search functionality
- ✅ Product recommendation engine
- ✅ Cosine similarity calculations
- ✅ Integration with OpenAI embeddings API

---

## **Phases 6-10: Remaining Implementation**

Due to space constraints, here's a summary of the remaining phases:

### **Phase 6: Dynamic Theming & Customization**
- Tenant-specific CSS variables
- Dynamic theme generation from AI content
- Logo and branding customization
- Layout variations per tenant

### **Phase 7: Integration with "tar" App**
- API endpoints for receiving AI-generated sections
- Webhook system for real-time updates
- Section validation and fallbacks
- Bulk section operations

### **Phase 8: Performance Optimization**
- Section caching strategies
- Database query optimization
- Cloudflare edge caching
- Image optimization with Cloudflare

### **Phase 9: Production Deployment**
- Cloudflare Pages deployment
- DNS configuration for subdomains
- SSL certificate management
- Environment variable setup

### **Phase 10: Testing & Launch**
- End-to-end testing
- Performance testing
- Security testing
- Production monitoring setup

## **Cost Estimation**
- **Turso**: $29/month per tenant (or free tier)
- **InstantDB**: $25/month
- **Cloudflare Workers**: $5/month + usage
- **OpenAI API**: ~$10-50/month depending on usage
- **Total per tenant**: ~$70-110/month

## **Timeline**
- **Total Duration**: 7 days
- **Phase 1-2**: Days 1-2 (Foundation)
- **Phase 3-4**: Days 3-4 (Core Features)
- **Phase 5-6**: Days 5-6 (Advanced Features)
- **Phase 7-10**: Day 7 (Integration & Deployment)
```
```