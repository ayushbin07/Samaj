import type { Video } from "../types";

export interface CommentItem {
  id: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export const SAMPLE_VIDEOS: Video[] = [
  {
    _id: "vid-1",
    title: "Building Modern Web Applications with Next.js 15 & React 19",
    description:
      "Deep dive into the architecture of modern scalable web applications. We explore React Server Components, server actions, optimized streaming, and responsive design patterns for creator platforms.",
    thumbnail:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    videoFile:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: 596,
    views: 14200,
    isPublished: true,
    owner: {
      _id: "user-demo-1",
      fullName: "Sarah Chen",
      username: "sarahcodes",
      email: "sarah@example.com",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-01-10T12:00:00Z",
      updatedAt: "2024-01-10T12:00:00Z",
    },
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: "vid-2",
    title: "The Art of Clean Code: Systems Architecture & Design Patterns",
    description:
      "Learn how high-performing engineering teams structure large-scale TypeScript codebases. Topics covered include modular APIs, decoupling UI from business logic, and maintainability.",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    videoFile:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: 653,
    views: 28950,
    isPublished: true,
    owner: {
      _id: "user-demo-2",
      fullName: "Alex Rivera",
      username: "alexdev",
      email: "alex@example.com",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-01-05T09:30:00Z",
      updatedAt: "2024-01-05T09:30:00Z",
    },
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    _id: "vid-3",
    title: "Design Systems in 2025: From Figma Tokens to Production CSS",
    description:
      "A complete walkthrough of building a resilient design system. We discuss CSS custom properties, responsive typography scales, dark-mode first palettes, and accessible interaction states.",
    thumbnail:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    videoFile:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: 215,
    views: 8340,
    isPublished: true,
    owner: {
      _id: "user-demo-3",
      fullName: "Elena Rostova",
      username: "elenaui",
      email: "elena@example.com",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-01-12T14:20:00Z",
      updatedAt: "2024-01-12T14:20:00Z",
    },
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    _id: "vid-4",
    title: "Full-Stack Node.js & MongoDB: Building Production-Ready APIs",
    description:
      "Learn best practices for Express, aggregation pipelines, JWT authentication, and file uploading with Multer and Cloudinary in real-world Node.js applications.",
    thumbnail:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    videoFile:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    duration: 412,
    views: 45100,
    isPublished: true,
    owner: {
      _id: "user-demo-1",
      fullName: "Sarah Chen",
      username: "sarahcodes",
      email: "sarah@example.com",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-01-10T12:00:00Z",
      updatedAt: "2024-01-10T12:00:00Z",
    },
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    _id: "vid-5",
    title: "Creative Tech Showcase: Interactive 3D & WebGL Experiences",
    description:
      "Exploring cutting edge creative development techniques with Three.js, shaders, and micro-interactions that elevate digital storytelling and user engagement.",
    thumbnail:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
    videoFile:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    duration: 340,
    views: 19800,
    isPublished: true,
    owner: {
      _id: "user-demo-4",
      fullName: "Marcus Vance",
      username: "marcusv",
      email: "marcus@example.com",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-01-15T18:00:00Z",
      updatedAt: "2024-01-15T18:00:00Z",
    },
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    _id: "vid-6",
    title: "Mastering Distributed Caching with Redis & Edge Functions",
    description:
      "Practical strategies for minimizing server load and optimizing response times using Redis caching layers, stale-while-revalidate patterns, and globally distributed CDN edges.",
    thumbnail:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    videoFile:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    duration: 520,
    views: 11200,
    isPublished: true,
    owner: {
      _id: "user-demo-2",
      fullName: "Alex Rivera",
      username: "alexdev",
      email: "alex@example.com",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      createdAt: "2024-01-05T09:30:00Z",
      updatedAt: "2024-01-05T09:30:00Z",
    },
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
];

export const INITIAL_COMMENTS: Record<string, CommentItem[]> = {
  "vid-1": [
    {
      id: "c-1",
      author: {
        name: "David Kim",
        username: "davidk",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      },
      content:
        "The breakdown of server actions and streaming rendered components was incredibly clear. Looking forward to more tutorials like this!",
      createdAt: "2 hours ago",
      likes: 24,
      isLiked: false,
    },
    {
      id: "c-2",
      author: {
        name: "Maya Patel",
        username: "mayap",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      },
      content:
        "Finally someone explained the mental model of caching without confusing diagrams. Bookmarked!",
      createdAt: "1 day ago",
      likes: 9,
      isLiked: false,
    },
  ],
  "vid-2": [
    {
      id: "c-3",
      author: {
        name: "Carlos Mendez",
        username: "carlosm",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      },
      content:
        "The architecture section at 04:30 is pure gold for engineering managers planning refactors.",
      createdAt: "3 days ago",
      likes: 18,
      isLiked: false,
    },
  ],
};
