import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
} from "@mui/material";
import { Whatshot as TrendingIcon } from "@mui/icons-material";

export function TrendingSidebar({ posts }) {
  return (
    <Card sx={{ position: "sticky", top: 100, borderRadius: 1 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Avatar sx={{ bgcolor: "orange", width: 32, height: 32 }}>
            <TrendingIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Typography variant="h6" fontWeight={800}>
            Hot Right Now
          </Typography>
        </Box>

        <List disablePadding>
          {posts.map((post, index) => (
            <ListItem
              key={post.id}
              disableGutters
              sx={{
                mb: 1,
                p: 1,
                borderRadius: 3,
                "&:hover": { bgcolor: "action.hover", cursor: "pointer" },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={
                    post.imageUrl ||
                    `/placeholder.svg?text=${post.title.slice(0, 1)}`
                  }
                  variant="rounded"
                  sx={{ width: 48, height: 48, borderRadius: 2 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    {post.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {post.likes} likes • @{post.author || "Anon"}
                  </Typography>
                }
              />
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ color: "text.disabled", ml: 1, opacity: 0.3 }}
              >
                #{index + 1}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
