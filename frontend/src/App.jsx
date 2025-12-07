import { useState, useEffect, useCallback } from "react";
import { Container, Grid, CircularProgress, Box } from "@mui/material";
import { Header } from "@/components/header";
import { PostCard } from "@/components/post-card";
import { PostDialog } from "@/components/post-dialog";
import { TrendingSidebar } from "@/components/trending-sidebar";
import { api } from "@/api/api";
import { translations as t } from "@/utils/translations";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPosts();
      setPosts(res.data);
    } catch {
      alert(t.loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleSubmit = async (formData) => {
    try {
      if (editingPost) {
        await api.updatePost(editingPost.id, formData);
      } else {
        await api.createPost(formData);
      }
      await loadPosts();
      setEditingPost(null);
      setDialogOpen(false);
    } catch (err) {
      alert(t.createError + " " + (err.response?.data?.error || ""));
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                has_liked: res.data.liked,
                likes: p.likes + (res.data.liked ? 1 : -1),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await api.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      alert(t.deleteError || "Failed to delete");
    }
  };

  const handleCommentCountChange = useCallback((postId, newCount) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments_count: newCount } : post
      )
    );
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  const trending = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 8 }}>
      <Header onPostClick={() => setDialogOpen(true)} />
      <Box
        sx={{
          maxWidth: { xs: "100%", sm: "100%", md: "1400px", lg: "1600px" },
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          mt: 4,
        }}
      >
        <Grid container spacing={4} justifyContent="center">
          <Grid
            item
            xs={0}
            lg={1}
            sx={{ display: { xs: "none", lg: "block" } }}
          />
          <Grid item xs={12} lg={7}>
            <Box
              sx={{
                maxWidth: { xs: "100%", lg: "none" },
                width: "100%",
              }}
            >
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => handleLike(post.id)}
                  onDelete={() => handleDelete(post.id)}
                  onEdit={(post) => {
                    setEditingPost(post);
                    setDialogOpen(true);
                  }}
                  onCommentCountChange={handleCommentCountChange}
                />
              ))}
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            lg={4}
            sx={{ display: { xs: "none", lg: "block" } }}
          >
            <TrendingSidebar posts={trending} />
          </Grid>
        </Grid>
      </Box>

      <PostDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingPost(null);
        }}
        onSubmit={handleSubmit}
        post={editingPost}
      />
    </Box>
  );
}
