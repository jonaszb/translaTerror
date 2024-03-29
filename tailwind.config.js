module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        fontFamily: {
            roboto: ['Roboto', 'sans-serif'],
            'source-sans': ['Source Sans Pro', 'sans-serif'],
        },
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
            },
            boxShadow: {
                'inner-white': 'inset 0 1px 1px 0px rgba(255, 255, 255, 0.1)',
            },
            width: {
                86: '21.5rem',
            },
            height: {
                92: '23rem',
            },
            gradientColorStopPositions: {
                150: '150%',
            },
        },
    },
    plugins: [],
};
