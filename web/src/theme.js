import { createTheme } from "@material-ui/core";
// import { deepPurple, green } from "@material-ui/core/colors";

const theme = createTheme({
    // direction: "rtl",
    palette: {
        // type: 'dark',

        // primary: {
        //     main: deepPurple[500]
        // },

        background: {
            paper: '#fff',
            default: '#fff'
        },

        //Blue
        primary: {
            main: '#2196f3',
            light: '#4dabf5',
            dark: '#1769aa',
            contrastText: '#fff',
        },
        secondary: {
            light: '#039be5',
            main: '#f44336',
            dark: '#ba000d',
            contrastText: '#fff',
        },
    },
    typography: {
        button: {
            textTransform: "none"
        }
    },
});
theme.typography.h3 = {
    fontSize: '1.2rem',
    '@media (min-width:600px)': {
        fontSize: '1.5rem',
    },
    [theme.breakpoints.up('md')]: {
        fontSize: '2.4rem',
    }
};

export default theme;