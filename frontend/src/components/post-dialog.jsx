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
  VideoCall,
  Image as ImageIcon,
} from "@mui/icons-material";
import { translations as t } from "@/utils/translations";
const API_URL = import.meta.env.VITE_API_URL;

export function PostDialog({ open, onClose, onSubmit, post = null }) {
  const isEdit = post !== null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");

  useEffect(() => {
    if (open && isEdit && post) {
      setTitle(post.title || "");
      setDescription(post.description || "");
      setAuthor(post.author || "");
      setMediaPreview(post.media_url ? `${API_URL}${post.media_url}` : "");
    }
    if (open && !isEdit) {
      setTitle("");
      setDescription("");
      setAuthor("");
      setMedia(null);
      setMediaPreview("");
    }
  }, [open, post, isEdit]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url + (file.type.startsWith("video") ? "#t=0.1" : ""));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formData = new FormData();
    formData.append("title", title.trim());
    if (description.trim()) formData.append("description", description.trim());
    if (author.trim()) formData.append("author", author.trim());
    if (media) formData.append("media", media);

    onSubmit(formData);
    onClose();
  };

  const isVideo =
    mediaPreview &&
    (media?.type.startsWith("video") ||
      mediaPreview.includes(".mp4") ||
      mediaPreview.includes(".webm") ||
      mediaPreview.includes(".mov"));

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

            <Box>
              <input
                accept="image/*,video/*"
                style={{ display: "none" }}
                id="media-upload"
                type="file"
                onChange={handleMediaChange}
              />
              <label htmlFor="media-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{
                    height: 160,
                    p: 0,
                    border: "2px dashed",
                    borderColor: "divider",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {mediaPreview ? (
                    isVideo ? (
                      <video
                        src={mediaPreview}
                        controls
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        {t.addMedia}
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        {t.mediaHint}
                      </Typography>
                    </Box>
                  )}
                </Button>
              </label>

              {mediaPreview && (
                <Box sx={{ mt: 1, textAlign: "center" }}>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setMedia(null);
                      setMediaPreview("");
                    }}
                  >
                    {t.removeMedia}
                  </Button>
                </Box>
              )}
            </Box>
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
