import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";

export function ThemeRegistry({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
