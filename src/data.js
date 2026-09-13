/**
 * Portfolio Data Configuration
 * Edit this file to customize your portfolio details, projects, skills, and links.
 */

export const PORTFOLIO_DATA = {
  profile: {
    handle: "exu",
    host: "portoweb",
    title: "Software Engineer & Creative Technologist",
    location: "Global / Remote",
    status: "OPEN FOR CONTRACTS & FULL-TIME ROLES",
    systemName: "PORTO-OS / MODEL 84-CRT",
    version: "v3.2.0-RELEASE",
    bio: [
      "I build high-performance web systems, creative interfaces, and robust backend services.",
      "Obsessed with system architecture, low-latency applications, graphics programming, and nostalgic retro computing aesthetics.",
      "When not writing code, exploring vintage hardware, demoscene hacks, and modular synthesizers."
    ]
  },

  socials: [
    { name: "GitHub", url: "https://github.com", handle: "@exu" },
    { name: "LinkedIn", url: "https://linkedin.com", handle: "in/exu" },
    { name: "Twitter / X", url: "https://x.com", handle: "@exu_dev" },
    { name: "Email", url: "mailto:contact@example.com", handle: "contact@example.com" }
  ],

  skills: [
    {
      category: "LANGUAGES",
      items: [
        { name: "TypeScript / JavaScript", level: 95, exp: "6 yrs" },
        { name: "Rust / C++", level: 75, exp: "3 yrs" },
        { name: "Python", level: 85, exp: "5 yrs" },
        { name: "Go", level: 80, exp: "3 yrs" },
        { name: "SQL (PostgreSQL)", level: 85, exp: "5 yrs" }
      ]
    },
    {
      category: "FRONTEND & GRAPHICS",
      items: [
        { name: "WebGL / GLSL Shaders", level: 80, exp: "3 yrs" },
        { name: "Canvas 2D / Web Audio API", level: 90, exp: "4 yrs" },
        { name: "Modern CSS / SVG FX", level: 95, exp: "7 yrs" },
        { name: "React / Next.js / Vite", level: 90, exp: "5 yrs" },
        { name: "Performance & Core Web Vitals", level: 88, exp: "4 yrs" }
      ]
    },
    {
      category: "SYSTEMS & CLOUD",
      items: [
        { name: "Linux / POSIX / Shell", level: 92, exp: "7 yrs" },
        { name: "Docker / Containerization", level: 85, exp: "4 yrs" },
        { name: "Distributed Systems & Queues", level: 82, exp: "3 yrs" },
        { name: "WebSockets / Real-time IPC", level: 90, exp: "4 yrs" },
        { name: "CI/CD & Cloud Infrastructure", level: 80, exp: "4 yrs" }
      ]
    }
  ],

  projects: [
    {
      id: "neural-mesh",
      num: "01",
      title: "NEURAL-MESH // 3D Neural Viz",
      category: "Graphics / WebGL / AI",
      year: "2025",
      tags: ["WebGL", "GLSL", "TypeScript", "Web Audio"],
      description: "Interactive real-time 3D visualization of neural network layer activations, attention matrices, and tensor weight propagation with custom GPU compute shaders.",
      highlights: [
        "Rendered 500k+ dynamic synaptic connection lines at 60 FPS using instanced geometry.",
        "Synthesized reactive Web Audio sonification based on backpropagation gradients.",
        "Interactive node explorer with real-time tensor slicing."
      ],
      links: {
        demo: "https://demo.example.com/neural-mesh",
        github: "https://github.com/exu/neural-mesh"
      }
    },
    {
      id: "hyper-cache",
      num: "02",
      title: "HYPER-CACHE // Distributed KV Store",
      category: "Systems / Rust / Networking",
      year: "2024",
      tags: ["Rust", "Raft", "gRPC", "Async Tokio"],
      description: "High-throughput in-memory key-value database with Raft consensus, zero-allocation serialization, and persistent WAL logs.",
      highlights: [
        "Sustained 420k ops/sec sub-millisecond p99 latency across 5 distributed nodes.",
        "Custom memory allocator with zero fragmentation under heavy write churn.",
        "Fault-tolerant leader election and automated cluster split-brain recovery."
      ],
      links: {
        demo: "https://demo.example.com/hyper-cache",
        github: "https://github.com/exu/hyper-cache"
      }
    },
    {
      id: "vhs-synthesizer",
      num: "03",
      title: "ANALOG-84 // Virtual Polyphonic Synth",
      category: "Audio / DSP / Web Platform",
      year: "2024",
      tags: ["Web Audio API", "AudioWorklet", "WASM", "Canvas"],
      description: "Bespoke 8-voice polyphonic subtractive software synthesizer emulating analog drift, Moog-style ladder filters, and vintage tape saturation.",
      highlights: [
        "Low-latency DSP engine running inside dedicated AudioWorklet thread.",
        "Real-time oscilloscope and vector CRT Lissajous curve visualizer.",
        "Full MIDI hardware keyboard support via Web MIDI API."
      ],
      links: {
        demo: "https://demo.example.com/analog-84",
        github: "https://github.com/exu/analog-84"
      }
    },
    {
      id: "retro-kernel",
      num: "04",
      title: "MICRO-OS // Bare-Metal x86 Kernel",
      category: "Systems / Assembly / C",
      year: "2023",
      tags: ["x86 Assembly", "C", "QEMU", "OS Dev"],
      description: "Educational 32-bit protected-mode operating system kernel with multitasking, virtual memory paging, FAT12 file system, and VGA text driver.",
      highlights: [
        "Custom bootloader fitting into a 512-byte MBR sector.",
        "Preemptive round-robin process scheduler and basic system call interface.",
        "Embedded retro command-line shell with text editor."
      ],
      links: {
        demo: "https://demo.example.com/micro-os",
        github: "https://github.com/exu/micro-os"
      }
    }
  ],

  experience: [
    {
      period: "2023 - PRESENT",
      role: "Senior Systems & Frontend Engineer",
      company: "Apex Technologies Corp.",
      description: "Architected high-throughput real-time dashboards and graphics pipelines. Optimized Core Web Vitals across client portals, reducing latency by 45%."
    },
    {
      period: "2021 - 2023",
      role: "Full-Stack Engineer",
      company: "Vektor Labs",
      description: "Engineered distributed streaming data collectors in Go and Rust. Built interactive data visualizers and client SDKs in TypeScript."
    },
    {
      period: "2019 - 2021",
      role: "Software Developer",
      company: "BitStream Systems",
      description: "Developed RESTful APIs, internal automation tooling, and responsive web applications. Maintained Unix server infrastructure."
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
