import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Builder',
        short_name: 'Builder',
        description: 'Create discord embeds',
        start_url: '/',
        display: 'standalone',
        background_color: '#5865f2',
        theme_color: '#5865f2',
        icons: [
            {
                src: "https://wolfey.s-ul.eu/3kIuLqy8",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: 'https://wolfey.s-ul.eu/s6wkpCVj',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}