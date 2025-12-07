import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
} from "@mui/icons-material";
import { translations as t } from "@/utils/translations";

export function PostDialog({ open, onClose, onSubmit, post = null }) {
  const isEdit = post !== null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    if (open && isEdit && post) {
      setTitle(post.title || "");
      setDescription(post.description || "");
      setAuthor(post.author || "");
    }
    if (open && !isEdit) {
      setTitle("");
      setDescription("");
      setAuthor("");
    }
  }, [open, post, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formData = new FormData();
    formData.append("title", title.trim());
    if (description.trim()) formData.append("description", description.trim());
    if (author.trim()) formData.append("author", author.trim());

    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          {isEdit ? t.editPost : t.createPost}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label={t.title}
              required
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />

            <TextField
              label={t.description}
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <TextField
              label={t.username}
              fullWidth
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">@</InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>{t.cancel}</Button>
          <Button type="submit" variant="contained" disabled={!title.trim()}>
            {isEdit ? t.save : t.publish}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
