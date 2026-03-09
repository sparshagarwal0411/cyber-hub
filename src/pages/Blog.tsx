import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Shield,
  PenSquare,
  ArrowLeft,
  Send,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { blogService, BlogPost, BlogComment } from "@/lib/blogService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";

function VoteBlock({
  postId,
  score,
  userVote,
  onVote,
  compact = false,
}: {
  postId: string;
  score: number;
  userVote?: number;
  onVote: (postId: string, vote: 1 | -1 | 0) => void;
  compact?: boolean;
}) {
  const handleUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onVote(postId, userVote === 1 ? 0 : 1);
  };
  const handleDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onVote(postId, userVote === -1 ? 0 : -1);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${compact ? "w-10" : "w-12"} shrink-0`}
    >
      <button
        type="button"
        onClick={handleUp}
        className={`rounded p-1 transition-colors hover:bg-primary/20 ${userVote === 1 ? "text-primary" : "text-muted-foreground"}`}
        aria-label="Upvote"
      >
        <ChevronUp className={compact ? "h-5 w-5" : "h-6 w-6"} />
      </button>
      <span className="text-sm font-bold tabular-nums text-foreground">{score}</span>
      <button
        type="button"
        onClick={handleDown}
        className={`rounded p-1 transition-colors hover:bg-primary/20 ${userVote === -1 ? "text-primary" : "text-muted-foreground"}`}
        aria-label="Downvote"
      >
        <ChevronDown className={compact ? "h-5 w-5" : "h-6 w-6"} />
      </button>
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
  depth = 0,
}: {
  comment: BlogComment;
  onReply: (parentId: string, content: string) => void;
  depth?: number;
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const submitReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText.trim());
    setReplyText("");
    setReplying(false);
  };

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-border/50 pl-4" : ""}>
      <div className="rounded-lg border border-border/50 bg-secondary/20 p-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span className="text-primary">{comment.author_name}</span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
        </div>
        <div className="mt-1 text-sm text-foreground prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{comment.content}</ReactMarkdown>
        </div>
        <button
          type="button"
          onClick={() => setReplying(!replying)}
          className="mt-2 text-xs font-bold text-primary hover:underline"
        >
          Reply
        </button>
        {replying && (
          <div className="mt-3 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitReply()}
            />
            <button
              type="button"
              onClick={submitReply}
              disabled={!replyText.trim()}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Send
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 space-y-2">
        {(comment.replies ?? []).map((r) => (
          <CommentItem key={r.id} comment={r} onReply={onReply} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}

export default function Blog() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

  const isDetail = Boolean(id);

  useEffect(() => {
    if (isDetail && id) {
      Promise.all([blogService.getPost(id), blogService.getComments(id)]).then(
        ([p, c]) => {
          setPost(p ?? null);
          setComments(c);
          setLoading(false);
        }
      );
    } else {
      blogService.listPosts().then((list) => {
        setPosts(list);
        setLoading(false);
      });
    }
  }, [isDetail, id]);

  const refreshPost = () => {
    if (id) {
      blogService.getPost(id).then((p) => setPost(p ?? null));
      blogService.getComments(id).then(setComments);
    }
  };

  const handleVote = async (postId: string, vote: 1 | -1 | 0) => {
    if (!user) {
      toast.error("Sign in to vote");
      return;
    }
    setVotingId(postId);
    try {
      await blogService.setVote(postId, vote);
      if (isDetail && post?.id === postId) {
        const updated = await blogService.getPost(postId);
        setPost(updated ?? null);
      } else {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            const newUserVote = vote;
            const delta = vote - (p.user_vote ?? 0);
            return { ...p, user_vote: newUserVote === 0 ? undefined : newUserVote, score: (p.score ?? 0) + delta };
          })
        );
      }
    } catch (e) {
      toast.error("Failed to vote");
    } finally {
      setVotingId(null);
    }
  };

  const submitComment = async () => {
    if (!id || !commentText.trim()) return;
    if (!user) {
      toast.error("Sign in to comment");
      return;
    }
    setSubmittingComment(true);
    try {
      await blogService.addComment(id, commentText.trim());
      setCommentText("");
      const next = await blogService.getComments(id);
      setComments(next);
      const updated = await blogService.getPost(id);
      setPost(updated ?? null);
      toast.success("Comment posted");
    } catch (e) {
      toast.error("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const submitNewPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    if (!user) return;
    setSubmittingPost(true);
    try {
      const created = await blogService.createPost(newTitle.trim(), newContent.trim());
      toast.success("Post created");
      setShowNewPost(false);
      setNewTitle("");
      setNewContent("");
      if (created) navigate(`/blog/${created.id}`);
      else setPosts(await blogService.listPosts());
    } catch (e) {
      toast.error("Failed to create post");
    } finally {
      setSubmittingPost(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background cyber-grid pt-24 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (isDetail && post) {
    return (
      <div className="min-h-screen bg-background cyber-grid pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to feed
          </Link>

          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border/50 p-6 md:p-8"
          >
            <div className="flex gap-4">
              <VoteBlock
                postId={post.id}
                score={post.score ?? 0}
                userVote={post.user_vote}
                onVote={handleVote}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  {post.title}
                </h1>
                <div className="mt-2 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="text-primary">{post.author_name}</span>
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
                <div className="mt-4 prose prose-sm dark:prose-invert max-w-none text-foreground">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.article>

          <section className="mt-10">
            <h2 className="text-lg font-bold text-foreground uppercase tracking-widest mb-4">
              Comments {comments.length > 0 && `(${comments.length})`}
            </h2>
            {user ? (
              <div className="flex gap-2 mb-6">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment()}
                />
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={!commentText.trim() || submittingComment}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Comment
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-6">
                <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link> to comment.
              </p>
            )}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    onReply={async (parentId, content) => {
                      if (!user) return;
                      try {
                        await blogService.addComment(id!, content, parentId);
                        setComments(await blogService.getComments(id!));
                        toast.success("Reply posted");
                      } catch {
                        toast.error("Failed to post reply");
                      }
                    }}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Community Feed</h1>
              <p className="text-sm text-muted-foreground">Posts from the CyberGuardian community. Upvote, discuss, share.</p>
            </div>
          </div>
          {user && (
            <button
              type="button"
              onClick={() => setShowNewPost(true)}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground flex items-center gap-2 hover:glow-primary"
            >
              <PenSquare className="h-4 w-4" /> New post
            </button>
          )}
        </div>

        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl border-2 border-primary/30 p-6 mb-8"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">Create post</h3>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm font-semibold outline-none focus:ring-1 focus:ring-primary mb-3"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Content (Markdown supported)"
              rows={5}
              className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-primary resize-y"
            />
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={submitNewPost}
                disabled={!newTitle.trim() || !newContent.trim() || submittingPost}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50 flex items-center gap-2"
              >
                {submittingPost ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Publish
              </button>
              <button
                type="button"
                onClick={() => { setShowNewPost(false); setNewTitle(""); setNewContent(""); }}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {posts.length === 0 ? (
            <div className="glass rounded-2xl border border-border/50 p-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-mono text-sm">No posts yet. Be the first to share.</p>
              {user && (
                <button
                  type="button"
                  onClick={() => setShowNewPost(true)}
                  className="mt-4 text-primary font-semibold hover:underline"
                >
                  Create post
                </button>
              )}
            </div>
          ) : (
            posts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/blog/${p.id}`} className="block">
                  <div className="glass rounded-2xl border border-border/50 p-4 flex gap-4 hover:border-primary/30 transition-colors">
                    <VoteBlock
                      postId={p.id}
                      score={p.score ?? 0}
                      userVote={p.user_vote}
                      onVote={handleVote}
                      compact
                    />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-foreground line-clamp-1">{p.title}</h2>
                      <div className="mt-1 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="text-primary">{p.author_name}</span>
                        <span>{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {p.comment_count ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
