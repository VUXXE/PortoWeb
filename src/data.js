/**
 * Portfolio Data Configuration
 * Edit this file to customize your portfolio details, projects, skills, and links.
 * All placeholder fields are explicitly tagged with brackets [LIKE THIS] for easy replacement.
 */

export const PORTFOLIO_DATA = {
  profile: {
    handle: "exu",
    host: "portoweb",
    title: "Software Engineer & Creative Developer",
    location: "Global / Remote",
    status: "OPEN FOR CONTRACTS & ROLES",
    systemName: "PORTO-OS / MODEL 84-CRT",
    version: "v3.2.0-RELEASE",
    bio: [
      "Full-stack and systems developer building web applications, real-time networking tools, and browser graphics.",
      "Focused on system architecture, protocol design, WebGL/Web Audio experimentation, and vintage computing interfaces.",
      "Experience spanning TypeScript, Rust, Go, and Linux environment tooling."
    ]
  },

  socials: [
    { name: "GitHub", url: "https://github.com", handle: "@[YOUR_GITHUB]" },
    { name: "LinkedIn", url: "https://linkedin.com", handle: "in/[YOUR_LINKEDIN]" },
    { name: "Twitter / X", url: "https://x.com", handle: "@[YOUR_HANDLE]" },
    { name: "Email", url: "mailto:contact@example.com", handle: "[YOUR_EMAIL]@domain.com" }
  ],

  skills: [
    {
      category: "LANGUAGES & CORE",
      items: [
        { name: "TypeScript / JavaScript", tier: "PRIMARY", exp: "6+ yrs", focus: "Node.js, Canvas, Async Pipelines" },
        { name: "Rust", tier: "ACTIVE", exp: "3 yrs", focus: "Tokio async, CLI tools, Memory safety" },
        { name: "Python", tier: "PRIMARY", exp: "5 yrs", focus: "Data tooling, Scripting, Automation" },
        { name: "Go", tier: "ACTIVE", exp: "3 yrs", focus: "Microservices, Concurrency, REST" },
        { name: "SQL (PostgreSQL)", tier: "PRIMARY", exp: "5 yrs", focus: "Schema design, Indexing, Migrations" }
      ]
    },
    {
      category: "GRAPHICS & PLATFORM",
      items: [
        { name: "WebGL & GLSL", tier: "ACTIVE", exp: "3 yrs", focus: "Fragment shaders, 3D scenes, Math" },
        { name: "Canvas 2D & Web Audio", tier: "PRIMARY", exp: "4 yrs", focus: "Real-time synthesis, DSP, Visuals" },
        { name: "Modern CSS & SVG", tier: "PRIMARY", exp: "7 yrs", focus: "Filters, Animations, Responsive layout" },
        { name: "Web Platform APIs", tier: "PRIMARY", exp: "5 yrs", focus: "Performance, Web Workers, Storage" }
      ]
    },
    {
      category: "SYSTEMS & DEVOPS",
      items: [
        { name: "Linux & Shell Scripting", tier: "PRIMARY", exp: "7 yrs", focus: "POSIX, Bash, Process debugging" },
        { name: "Docker & Containers", tier: "ACTIVE", exp: "4 yrs", focus: "Multi-stage builds, Compose, Environments" },
        { name: "WebSockets & IPC", tier: "PRIMARY", exp: "4 yrs", focus: "Real-time communication, State sync" },
        { name: "CI/CD Workflows", tier: "ACTIVE", exp: "4 yrs", focus: "GitHub Actions, Automated test runners" }
      ]
    }
  ],

  projects: [
    {
      id: "neural-mesh",
      num: "01",
      title: "NEURAL-MESH // 3D Neural Viz",
      category: "Graphics / WebGL",
      year: "2025",
      tags: ["WebGL", "GLSL", "TypeScript", "Web Audio"],
      description: "Interactive real-time 3D visualization of neural network layer activations with custom GPU shaders.",
      highlights: [
        "Rendered dynamic synaptic connection meshes at 60 FPS using instanced geometry.",
        "Interactive parameter controls for layer depth, node density, and tensor slicing.",
        "Reactive audio feedback synthesized using the Web Audio API."
      ],
      links: {
        demo: "https://github.com/exu/neural-mesh",
        github: "https://github.com/exu/neural-mesh",
        demoLabel: "> VIEW PROJECT REPOSITORY"
      }
    },
    {
      id: "hyper-cache",
      num: "02",
      title: "HYPER-CACHE // Distributed Key-Value Store",
      category: "Systems / Rust / Networking",
      year: "2024",
      tags: ["Rust", "Raft", "gRPC", "Async Tokio"],
      description: "In-memory key-value database implementation featuring Raft consensus, WAL logging, and custom memory management.",
      highlights: [
        "Tested consensus and leader election recovery across simulated multi-node network partitions.",
        "Custom slab allocator designed to eliminate heap fragmentation under write churn.",
        "Asynchronous replication pipeline built on Tokio."
      ],
      links: {
        demo: "https://github.com/exu/hyper-cache",
        github: "https://github.com/exu/hyper-cache",
        demoLabel: "> VIEW PROJECT REPOSITORY"
      }
    },
    {
      id: "analog-84",
      num: "03",
      title: "ANALOG-84 // Virtual Polyphonic Synth",
      category: "Audio / DSP / Web Platform",
      year: "2024",
      tags: ["Web Audio API", "AudioWorklet", "Canvas"],
      description: "8-voice polyphonic subtractive software synthesizer emulating analog oscillator drift and multi-mode filters.",
      highlights: [
        "Low-latency DSP signal processing loop running inside an AudioWorklet thread.",
        "Real-time vector oscilloscope and Lissajous curve visualizer rendered via HTML Canvas.",
        "MIDI keyboard device connectivity via the Web MIDI standard."
      ],
      links: {
        demo: "https://github.com/exu/analog-84",
        github: "https://github.com/exu/analog-84",
        demoLabel: "> VIEW PROJECT REPOSITORY"
      }
    },
    {
      id: "micro-os",
      num: "04",
      title: "MICRO-OS // Bare-Metal x86 Kernel",
      category: "Systems / Assembly / C",
      year: "2023",
      tags: ["x86 Assembly", "C", "QEMU", "OS Dev"],
      description: "Protected-mode educational operating system kernel featuring virtual memory paging and VGA text drivers.",
      highlights: [
        "Two-stage bootloader designed to fit within a 512-byte MBR sector.",
        "Preemptive round-robin process scheduler and interrupt handling routines.",
        "Custom serial driver and built-in interactive debug shell."
      ],
      links: {
        demo: "https://github.com/exu/micro-os",
        github: "https://github.com/exu/micro-os",
        demoLabel: "> VIEW PROJECT REPOSITORY"
      }
    }
  ],

  experience: [
    {
      period: "2023 - PRESENT",
      role: "Senior Frontend & Systems Engineer",
      company: "[CURRENT COMPANY / ORGANIZATION]",
      description: "Building interactive web dashboards and real-time graphics pipelines. Profiling render lifecycles and reducing network round-trip overhead."
    },
    {
      period: "2021 - 2023",
      role: "Full-Stack Engineer",
      company: "[PREVIOUS STARTUP / AGENCY]",
      description: "Engineered distributed streaming data collectors in Go and Rust. Developed interactive visualizations and client-facing SDKs."
    },
    {
      period: "2019 - 2021",
      role: "Software Developer",
      company: "[EARLIER ROLE / CLIENT]",
      description: "Built web services, automated internal tooling, and maintained Linux application infrastructure."
    }
  ],

  asciiLogo: `
  ____   ___  ____ _____ ___    ___  ____  
 |  _ \\ / _ \\|  _ \\_   _/ _ \\  / _ \\/ ___| 
 | |_) | | | | |_) || || | | || | | \\___ \\ 
 |  __/| |_| |  _ < | || |_| || |_| |___) |
 |_|    \\___/|_| \\_\\|_| \\___/  \\___/|____/ 
                                             
   >> RETRO TERMINAL INTERFACE // PORTFOLIO SYSTEM <<
`
};
