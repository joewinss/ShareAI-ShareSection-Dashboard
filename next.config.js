/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_INITIAL_URL: "/dashboards/crypto",
        NEXT_PUBLIC_STATE_TYPE: "context",
        NEXT_PUBLIC_FILESTACK_KEY: "Ach6MsgoQHGK6tCaq5uJgz",
        NEXT_PUBLIC_LAYOUT: "default",
        NEXT_PUBLIC_MULTILINGUAL: "true",
        NEXT_PUBLIC_PRIMARY_COLOR: "#27333C",
        NEXT_PUBLIC_SECONDARY_COLOR: "#FFFBF5",
        NEXT_PUBLIC_THEME_MODE: "light",
        NEXT_PUBLIC_NAV_STYLE: "default",
        NEXT_PUBLIC_LAYOUT_TYPE: "full-width",
    },
    // images: {
    //     // domains: ['goodnite1989-dev.s3.ap-southeast-1.amazonaws.com'], // Deprecated
    //     remotePatterns: [
    //         {
    //             protocol: 'https',
    //             hostname: 'goodnite1989.s3.ap-southeast-1.amazonaws.com',
    //             pathname: '**', // Allow all paths
    //         },
    //         {
    //             protocol: 'https',
    //             hostname: 'goodnite1989-dev.s3.ap-southeast-1.amazonaws.com',
    //             pathname: '**', // Allow all paths
    //         },
    //     ],
    // }

}

module.exports = nextConfig
