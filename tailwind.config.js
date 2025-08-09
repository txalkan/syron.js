module.exports = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#ffff32',
            },
            keyframes: {
                hide: {
                    from: { opacity: '1' },
                    to: { opacity: '0' },
                },
                dialogOverlayShow: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                drawerSlideLeftAndFade: {
                    from: { opacity: '0', transform: 'translateX(50%)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                drawerSlideRightAndFade: {
                    from: { opacity: '1', transform: 'translateX(0)' },
                    to: { opacity: '0', transform: 'translateX(50%)' },
                },
            },
            animation: {
                hide: 'hide 150ms cubic-bezier(0.16, 1, 0.3, 1)',
                dialogOverlayShow:
                    'dialogOverlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
                drawerSlideLeftAndFade:
                    'drawerSlideLeftAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
                drawerSlideRightAndFade:
                    'drawerSlideRightAndFade 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            },
        },
    },
    plugins: [],
}
