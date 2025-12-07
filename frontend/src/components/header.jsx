import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material";
import { Add as AddIcon, Code as LogoIcon } from "@mui/icons-material";
import { translations as t } from "@/utils/translations";

export function Header({ onPostClick }) {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      sx={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255,255,255,0.8)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{ justifyContent: "space-between", height: 80 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "white",
                p: 1,
                borderRadius: 3,
                display: "flex",
                boxShadow: "0 4px 0 #6D28D9",
              }}
            >
              <LogoIcon />
            </Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ ml: 1.5, letterSpacing: -0.5 }}
            >
              {t.appName}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onPostClick}
            sx={{ borderRadius: 4, px: 3 }}
          >
            {t.newPost}
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
