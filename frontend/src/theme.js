import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#8B5CF6" },
    secondary: { main: "#EC4899" },
    background: { default: "#F3F4F6", paper: "#FFFFFF" },
    text: { primary: "#1F2937" },
  },
  shape: { borderRadius: 24 },
  typography: {
    fontFamily: "'Geist', sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: "12px 28px",
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(139,92,246,0.25)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 20px rgba(139,92,246,0.35)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 16,
            backgroundColor: "#F9FAFB",
          },
        },
      },
    },
  },
});
