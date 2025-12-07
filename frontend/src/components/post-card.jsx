import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Collapse,
  TextField,
  Stack,
  Paper,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  ThumbUp,
  ThumbUpOutlined,
  Comment as CommentIcon,
  MoreVert,
  Send,
  Delete,
  Edit,
  Close as CloseIcon,
} from "@mui/icons-material";
import { api } from "@/api/api";
import { translations as t } from "@/utils/translations";
const API_URL = import.meta.env.VITE_API_URL;

export function PostCard({ post: initialPost, onLike, onDelete, onEdit }) {
  const [post, setPost] = useState(initialPost);
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Синхронізація з пропсами при оновленні
  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  const loadComments = async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
      setComments([]);
    }
    try {
      const res = await api.getComments(post.id, { page: pageNum, limit: 15 });
      setComments(
        pageNum === 1
          ? res.data.comments
          : (prev) => [...prev, ...res.data.comments]
      );
      setHasMore(res.data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || sending) return;

    const tempId = Date.now();
    const optimistic = {
      id: tempId,
      content: comment,
      author_ip: "me",
      is_mine: true,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [optimistic, ...prev]);
    setPost((prev) => ({ ...prev, comments_count: prev.comments_count + 1 }));
    setComment("");
    setSending(true);

    try {
      await api.addComment(post.id, comment);
      loadComments(1);
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setPost((prev) => ({ ...prev, comments_count: prev.comments_count - 1 }));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!confirm(t.deleteComment)) return;
    try {
      await api.deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setPost((prev) => ({ ...prev, comments_count: prev.comments_count - 1 }));
    } catch {
      alert(t.deleteCommentError);
    }
  };

  const startEditComment = (id, text) => {
    setEditingCommentId(id);
    setEditingText(text);
  };

  const saveEditComment = async () => {
    if (!editingText.trim()) return;
    try {
      await api.updateComment(editingCommentId, editingText.trim());
      setComments((prev) =>
        prev.map((c) =>
          c.id === editingCommentId ? { ...c, content: editingText.trim() } : c
        )
      );
      setEditingCommentId(null);
    } catch {
      alert(t.saveCommentError);
    }
  };

  return (
    <Card sx={{ mb: 4, width: "100%" }}>
      <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, pb: { xs: 1, md: 2 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: { xs: 1, md: 2 },
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                mb: 0.5,
                fontSize: { xs: "1.25rem", md: "1.5rem", lg: "1.75rem" },
                fontWeight: 600,
              }}
            >
              {post.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}
            >
              @{post.author || t.anonymous}
            </Typography>
          </Box>

          {post.is_mine && (
            <>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={!!menuAnchor}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem
                  onClick={() => {
                    onEdit(post);
                    setMenuAnchor(null);
                  }}
                >
                  <Edit fontSize="small" sx={{ mr: 1 }} /> {t.edit}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onDelete();
                    setMenuAnchor(null);
                  }}
                >
                  <Delete fontSize="small" sx={{ mr: 1 }} /> {t.delete}
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {post.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: { xs: 1, md: 2 },
              fontSize: { xs: "0.875rem", md: "1rem" },
              lineHeight: 1.6,
            }}
          >
            {post.description}
          </Typography>
        )}
      </Box>

      {post.media_url && (
        <Box
          sx={{
            bgcolor: "#000",
            height: { xs: 400, sm: 500, md: 600, lg: 700 },
            minHeight: { xs: 400, sm: 500, md: 600, lg: 700 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {post.media_type === "video" ? (
            <video
              controls
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              poster={`${API_URL}${post.media_url}#t=0.1`}
            >
              <source src={`${API_URL}${post.media_url}`} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={`${API_URL}${post.media_url}`}
              alt={post.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
      )}

      <Box
        sx={{
          p: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          startIcon={post.has_liked ? <ThumbUp /> : <ThumbUpOutlined />}
          onClick={onLike}
          sx={{
            fontSize: { xs: "0.875rem", md: "1rem" },
            px: { xs: 1.5, md: 2 },
          }}
        >
          {post.likes}
        </Button>
        <Button
          startIcon={<CommentIcon />}
          onClick={() => {
            setExpanded(!expanded);
            if (!expanded && comments.length === 0) loadComments(1);
          }}
          sx={{
            fontSize: { xs: "0.875rem", md: "1rem" },
            px: { xs: 1.5, md: 2 },
          }}
        >
          {post.comments_count}
        </Button>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            p: { xs: 2, md: 3, lg: 4 },
            bgcolor: "grey.50",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={2} sx={{ mb: 3 }}>
            {loading && comments.length === 0 ? (
              <CircularProgress size={24} sx={{ mx: "auto" }} />
            ) : comments.length === 0 ? (
              <Typography color="text.disabled" fontStyle="italic">
                {t.noComments}
              </Typography>
            ) : (
              comments.map((c) => (
                <Paper
                  key={c.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    position: "relative",
                  }}
                >
                  {editingCommentId === c.id ? (
                    <Box display="flex" gap={1} alignItems="center">
                      <TextField
                        fullWidth
                        size="small"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        autoFocus
                      />
                      <IconButton onClick={saveEditComment} color="primary">
                        <Send />
                      </IconButton>
                      <IconButton onClick={() => setEditingCommentId(null)}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2">{c.content}</Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ mt: 1 }}
                      >
                        @{c.is_mine ? t.you : t.anonymous}
                      </Typography>
                      {c.is_mine && (
                        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                          <IconButton
                            size="small"
                            onClick={() => startEditComment(c.id, c.content)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteComment(c.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </>
                  )}
                </Paper>
              ))
            )}
            {hasMore && (
              <Button
                fullWidth
                onClick={() => loadComments(page + 1)}
                disabled={loading}
              >
                {t.loadMore}
              </Button>
            )}
          </Stack>

          <form onSubmit={handleComment}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.writeComment}
                disabled={sending}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={sending || !comment.trim()}
              >
                <Send />
              </Button>
            </Box>
          </form>
        </Box>
      </Collapse>
    </Card>
  );
}
