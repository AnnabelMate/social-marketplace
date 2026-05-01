**1.HTTP Polling vs WebSockets for Real-Time Chat**

**Context:**
The marketplace requires a messaging system between buyers and sellers.
Real-time or near-real-time delivery of messages improves UX.

**Options Considered:**
- WebSockets (true real-time, persistent connection)
- HTTP Polling (repeated fetch requests on an interval)
- Server-Sent Events (one-way server push)

**Decision:**
HTTP Polling every 3 seconds.

**Reason:**
The provided backend API only exposes REST endpoints (GET/POST /messages).
Implementing WebSockets would require modifying the backend server, which
was outside the assessment scope.



**2. Lit Web Components vs React/Vue**

**Context:**
The assessment required client-side interactive UI components.
Several JavaScript frameworks were available.

**Options Considered:**
- React (large ecosystem, virtual DOM, JSX)
- Vue (simpler learning curve, Options API)
- Lit Web Components (native browser standard, lightweight)

**Decision:**
Lit Web Components (as required by the assessment spec).

**Reason:**
The assessment explicitly required Lit. Additionally, Lit components are
native Web Components — they work in any framework or vanilla HTML
without dependencies. This makes them more portable.



**3. Shadow DOM Disabled (createRenderRoot override)**

**Context:**
Lit components use Shadow DOM by default, which isolates CSS.
The project uses Tailwind CSS utility classes.

**Options Considered:**
- Keep Shadow DOM enabled and bundle Tailwind inside each component
- Disable Shadow DOM so Tailwind global styles apply normally

**Decision:**
Override `createRenderRoot()` to return `this` (Light DOM).

**Reason:**
Tailwind works by injecting a global stylesheet. Shadow DOM creates a
CSS boundary that blocks global styles from entering components.
Disabling Shadow DOM allows Tailwind classes to work naturally inside
all Lit components without any extra configuration.



**4. EJS for Server-Side Rendering + Server-Determined Components**

**Context:**
The assessment required a hybrid rendering architecture where the server
controls which components appear on each page.

**Options Considered:**
- Pure client-side SPA (React/Vue router handles everything)
- Pure server-side rendering (EJS renders all HTML)
- Hybrid: EJS shell + Lit components for interactive parts

**Decision:**
Hybrid architecture using EJS for page shell and Lit for interactive UI.

**Reason:**
This matches the assessment requirement exactly. EJS renders the outer
HTML (header, layout, initial data), while the server decides which Lit
component tags to inject into the template. Lit then hydrates those tags
in the browser.