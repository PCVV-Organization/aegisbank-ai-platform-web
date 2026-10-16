# AegisBank Design System — Color Architecture & Theme Guide

Este documento describe la arquitectura de colores y tokens de diseño de **AegisBank**, estructurada bajo los estándares de confianza visual fintech (`banking-ui-ux`), accesibilidad (`accessibility-a11y` WCAG 2.1 AA/AAA) y diseño responsivo (`responsive-web-design`).

---

## 1. Descomposición de Roles de Color (Roles Funcionales)

En banca digital, los colores no se definen como simples "colores enteros", sino por sus **roles funcionales explícitos** para evitar ambigüedades entre acciones principales, elementos secundarios y estados financieros:

### 1.1 Rol Primario (`primary`)
* **Propósito**: Autoridad institucional, acciones de máxima prioridad (CTAs principales), cabeceras de módulos y avatares oficiales.
* **Tokens**:
  * `--primary`: Color institucional dominante (ej. Azul Marino Corporativo `#0f2747`).
  * `--primary-hover`: Variación de contraste para interacción hover (`#173b6c`).
  * `--primary-active`: Estado presionado (`#0a1b33`).
  * `--primary-foreground`: Texto de alto contraste sobre el fondo primario (`#ffffff`, ratio > 12:1).
  * `--primary-subtle`: Tinte suave (10%) para fondos de badges institucionales (`#e8edf5`).
  * `--primary-border`: Bordes de refuerzo para componentes primarios (`#173b6c`).

### 1.2 Rol Secundario y Superficies (`secondary`)
* **Propósito**: Separación jerárquica, botones secundarios (ej. "Cancelar", "Filtrar"), tarjetas de información secundaria y paneles contenedores.
* **Tokens**:
  * `--secondary`: Superficie neutra de soporte (`#f1f5f9`).
  * `--secondary-hover`: Estado hover para botones secundarios (`#e2e8f0`).
  * `--secondary-active`: Estado presionado (`#cbd5e1`).
  * `--secondary-foreground`: Texto nítido sobre superficie secundaria (`#0f172a`, ratio > 11:1).
  * `--secondary-border`: Línea de delimitación estructural (`#cbd5e1`).

### 1.3 Rol de Acento e Interactividad (`accent` / `ring`)
* **Propósito**: Anillos de enfoque (focus visible a11y), enlaces activos, micro-indicadores interactivos, chips de soporte conversacional y detalles de inteligencia artificial.
* **Tokens**:
  * `--accent` / `--brand-accent`: Azul eléctrico contemporáneo (`#2563eb`).
  * `--accent-hover`: Hover interactivo (`#1d4ed8`).
  * `--accent-foreground`: Texto sobre acento (`#ffffff`).
  * `--ring`: Indicador de foco de teclado accesible (`#2563eb`, outline 2px con offset 2px).
  * `--accent-subtle`: Fondo de chips o badges activos (`#eff6ff`).

### 1.4 Rol de Dock Lateral (`sidebar`)
* **Propósito**: Estructura de navegación permanente fija y de alta confianza.
* **Tokens**:
  * `--sidebar-bg`: Fondo del dock institucional (`#0f2747`).
  * `--sidebar-fg`: Texto principal (`#f8fafc`).
  * `--sidebar-muted`: Enlaces inactivos (`#94a3b8`).
  * `--sidebar-border`: Separadores translúcidos (`rgba(255, 255, 255, 0.1)`).
  * `--sidebar-hover`: Resaltado de cursor (`rgba(255, 255, 255, 0.08)`).
  * `--sidebar-active`: Enlace activo de la sección (`rgba(37, 99, 235, 0.25)`).
  * `--sidebar-active-border`: Borde indicador de selección (`#60a5fa`).

### 1.5 Roles Semánticos Financieros (`financial.*`)
* **Estándar**: Normativa estricta `banking-ui-ux` para transacciones monetarias y estados de cuentas:
  * **Positivo / Depósitos / Aprobado** (`--financial-positive`):
    * Base: `#059669` (Esmeralda) | Fondo: `#ecfdf5` | Borde: `#a7f3d0` | Texto: `#065f46` (Ratio 7.2:1 AAA).
  * **Pendiente / En Revisión / En Proceso** (`--financial-pending`):
    * Base: `#d97706` (Ámbar) | Fondo: `#fffbeb` | Borde: `#fde68a` | Texto: `#92400e` (Ratio 6.8:1 AAA).
  * **Crítico / Deudas / Vencido / Alertas** (`--financial-critical`):
    * Base: `#e11d48` (Carmesí) | Fondo: `#fff1f2` | Borde: `#fecdd3` | Texto: `#9f1239` (Ratio 7.5:1 AAA).
  * **Informativo / Cues del Asistente** (`--financial-info`):
    * Base: `#2563eb` (Azul Nítido) | Fondo: `#eff6ff` | Borde: `#bfdbfe` | Texto: `#1e40af` (Ratio 7.1:1 AAA).

### 1.6 Lienzo Base y Superficies (`base`)
* **Tokens**:
  * `--background`: Fondo general del viewport (`#f8fafc`).
  * `--foreground`: Tipografía principal de alto contraste (`#0f172a`, Ratio 15.6:1 AAA).
  * `--card`: Fondo de tarjeta bancaria blanca pura (`#ffffff`).
  * `--muted`: Contenedores sutiles de fondo (`#f1f5f9`).
  * `--border`: Separadores de tarjetas y líneas divisorias (`#e2e8f0`).

---

## 2. Catálogo de Paletas Institucionales Pre-configuradas

En [`src/design-system/tokens.ts`](./tokens.ts) se encuentran catalogadas y mapeadas 4 paletas completas:

| Paleta | Código | Rol Primario | Rol Secundario | Rol Acento | Enfoque Institucional |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Corporate Navy** (Activa) | `AEGIS-NAVY` | `#0f2747` | `#f1f5f9` | `#2563eb` | Banca comercial e institucional clásica |
| **Private Emerald** | `AEGIS-EMERALD` | `#064e3b` | `#f0fdf4` | `#10b981` | Banca privada, Wealth Management y finanzas sostenibles |
| **Fintech Sapphire** | `AEGIS-SAPPHIRE` | `#1e3a8a` | `#f8fafc` | `#0284c7` | Banca digital retail moderna y ágil |
| **Midnight Slate** | `AEGIS-SLATE` | `#090d16` | `#f8fafc` | `#38bdf8` | Banca corporativa ejecutiva y tesorería |

---

## 3. Cómo Cambiar la Paleta en 1 Solo Paso Fácil

Cuando el equipo decida cambiar la paleta de la web, **no es necesario tocar CSS ni clases de Tailwind en los componentes**. Se hace de manera centralizada en una sola línea:

### Opción A: Configuración por Defecto
Abra [`src/design-system/theme.ts`](./theme.ts) y edite el valor `defaultTheme`:

```typescript
export const THEME_CONFIG: ThemeConfig = {
  defaultTheme: "emerald", // Cambie a: "navy" | "emerald" | "sapphire" | "slate"
  storageKey: "aegisbank_color_theme",
};
```
Al guardar, toda la aplicación se adapta automáticamente aplicando la inyección atómica de tokens.

### Opción B: Cambio Programático en Código
Importe y llame la función `applyTheme`:

```typescript
import { applyTheme } from "@/design-system/theme";

// Aplica la paleta en tiempo de ejecución
applyTheme("sapphire");
```

---

## 4. Cómo Agregar una Nueva Paleta Corporativa en Minutos

Para añadir un nuevo tema (ej. `platinum` o `ruby`), agregue una entrada en el objeto `BANK_PALETTES` en [`src/design-system/tokens.ts`](./tokens.ts):

```typescript
export const BANK_PALETTES: Record<string, BankPaletteDefinition> = {
  // ... paletas existentes ...
  platinum: {
    id: "platinum",
    name: "Aegis Platinum",
    code: "AEGIS-PLATINUM",
    description: "Paleta metalizada para clientes de alta gama.",
    primary: {
      DEFAULT: "#334155",
      hover: "#1e293b",
      active: "#0f172a",
      foreground: "#ffffff",
      subtle: "#f1f5f9",
      border: "#1e293b",
    },
    secondary: {
      DEFAULT: "#f8fafc",
      hover: "#f1f5f9",
      active: "#e2e8f0",
      foreground: "#1e293b",
      border: "#cbd5e1",
    },
    accent: {
      DEFAULT: "#64748b",
      hover: "#475569",
      foreground: "#ffffff",
      ring: "#94a3b8",
      subtle: "#f1f5f9",
    },
    sidebar: {
      bg: "#1e293b",
      fg: "#f8fafc",
      muted: "#94a3b8",
      border: "rgba(255, 255, 255, 0.1)",
      hover: "rgba(255, 255, 255, 0.08)",
      active: "rgba(100, 116, 139, 0.25)",
      activeBorder: "#94a3b8",
    },
    financial: STANDARD_FINANCIAL_SEMANTICS,
    base: STANDARD_BASE_NEUTRALS,
  },
};
```
¡Listo! La función `applyTheme("platinum")` inyectará todas las variables automáticamente sin tocar un solo botón o tarjeta.

---

## 5. Garantía de Accesibilidad (WCAG 2.1)

Todos los pares de color están validados para cumplir con:
1. **Ratio de Contraste para Texto Normal**: Mínimo 4.5:1 (Nivel AA) y > 7.0:1 (Nivel AAA).
2. **Anillos de Foco Visibles**: `outline: 2px solid var(--ring)` con `outline-offset: 2px` en todos los elementos interactivos.
3. **No Dependencia del Color Solo**: Cada badge o estado semántico acompaña al color con iconos explícitos y etiquetas textuales ("Aprobado", "Pendiente", "Vencido").
