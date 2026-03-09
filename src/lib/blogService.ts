import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  score?: number;
  comment_count?: number;
  user_vote?: number;
}

export interface PostVote {
  id: string;
  post_id: string;
  user_id: string;
  vote: number;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  replies?: BlogComment[];
}

export const blogService = {
  async listPosts(): Promise<BlogPost[]> {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    const postIds = (posts ?? []).map((p) => p.id);

    const [votesData, countsData] = await Promise.all([
      postIds.length
        ? supabase
            .from("post_votes")
            .select("post_id, vote")
            .in("post_id", postIds)
            .eq("user_id", user?.id ?? "")
        : { data: [] as { post_id: string; vote: number }[] },
      postIds.length
        ? supabase.from("blog_comments").select("post_id").in("post_id", postIds)
        : { data: [] as { post_id: string }[] },
    ]);

    const votesByPost = new Map<string, number>();
    (votesData.data ?? []).forEach((v) => votesByPost.set(v.post_id, v.vote));

    const countByPost = new Map<string, number>();
    (countsData.data ?? []).forEach((c) => {
      countByPost.set(c.post_id, (countByPost.get(c.post_id) ?? 0) + 1);
    });

    const allVotes =
      postIds.length > 0
        ? await supabase.from("post_votes").select("post_id, vote").in("post_id", postIds)
        : { data: [] as { post_id: string; vote: number }[] };
    const scoreByPost = new Map<string, number>();
    (allVotes.data ?? []).forEach((v) => {
      scoreByPost.set(v.post_id, (scoreByPost.get(v.post_id) ?? 0) + v.vote);
    });

    return (posts ?? []).map((p) => ({
      ...p,
      score: scoreByPost.get(p.id) ?? 0,
      comment_count: countByPost.get(p.id) ?? 0,
      user_vote: user ? votesByPost.get(p.id) : undefined,
    })) as BlogPost[];
  },

  async getPost(id: string): Promise<BlogPost | null> {
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !post) return null;

    const [{ data: votes }, { data: comments }, { data: { user } }] = await Promise.all([
      supabase.from("post_votes").select("user_id, vote").eq("post_id", id),
      supabase.from("blog_comments").select("id").eq("post_id", id),
      supabase.auth.getUser(),
    ]);

    const score = (votes ?? []).reduce((s, v) => s + v.vote, 0);
    const userVote = user ? (votes ?? []).find((v) => v.user_id === user.id)?.vote : undefined;

    return {
      ...post,
      score,
      comment_count: (comments ?? []).length,
      user_vote: userVote,
    } as BlogPost;
  },

  async createPost(title: string, content: string): Promise<BlogPost | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const authorName =
      (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Anonymous";

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        user_id: user.id,
        author_name: authorName,
        title,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data as BlogPost;
  },

  async setVote(postId: string, vote: 1 | -1 | 0): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    if (vote === 0) {
      await supabase.from("post_votes").delete().eq("post_id", postId).eq("user_id", user.id);
      return;
    }

    await supabase.from("post_votes").upsert(
      { post_id: postId, user_id: user.id, vote },
      { onConflict: "post_id,user_id" }
    );
  },

  async getComments(postId: string): Promise<BlogComment[]> {
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) return [];

    const topLevel = (data ?? []).filter((c) => !c.parent_id);
    const byParent = new Map<string, BlogComment[]>();
    (data ?? []).forEach((c) => {
      if (c.parent_id) {
        const list = byParent.get(c.parent_id) ?? [];
        list.push(c as BlogComment);
        byParent.set(c.parent_id, list);
      }
    });

    const attachReplies = (comment: BlogComment): BlogComment => ({
      ...comment,
      replies: (byParent.get(comment.id) ?? []).map(attachReplies),
    });

    return topLevel.map(attachReplies) as BlogComment[];
  },

  async addComment(
    postId: string,
    content: string,
    parentId?: string
  ): Promise<BlogComment | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const authorName =
      (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Anonymous";

    const { data, error } = await supabase
      .from("blog_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        author_name: authorName,
        content,
        parent_id: parentId ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as BlogComment;
  },
};
