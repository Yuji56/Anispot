'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`*, users(username)`)
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  const handleSignUp = async () => {
    setLoading(true);
    // ユーザー登録（同時にSQLトリガーが動いてusersテーブルにも保存される）
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }, // ここでユーザー名を渡す
    });
    if (error) alert(error.message);
    else {
      alert('登録完了！自動ログインします');
      await handleLogin();
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else {
      checkUser();
      setEmail(''); setPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handlePost = async () => {
    if (!content) return;
    const { error } = await supabase.from('posts').insert({
      content,
      user_id: user.id,
    });
    if (error) alert(error.message);
    else {
      setContent('');
      fetchPosts(); // 投稿後にリストを更新
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">アニメ聖地巡礼 SNS</h1>

      {/* ログインしていない時：登録・ログインフォーム */}
      {!user ? (
        <div className="border p-4 rounded bg-gray-50 space-y-4">
          <h2 className="font-bold">ログイン / 新規登録</h2>
          <input
            className="border p-2 w-full"
            placeholder="メールアドレス"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border p-2 w-full"
            type="password"
            placeholder="パスワード (6文字以上)"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="border p-2 w-full"
            placeholder="ユーザー名 (新規登録時のみ使用)"
            value={username} onChange={(e) => setUsername(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleLogin} disabled={loading} className="bg-blue-500 text-white p-2 rounded flex-1">
              ログイン
            </button>
            <button onClick={handleSignUp} disabled={loading} className="bg-green-500 text-white p-2 rounded flex-1">
              新規登録
            </button>
          </div>
        </div>
      ) : (
        /* ログインしている時：投稿フォームとログアウト */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p>ようこそ、ユーザーID: {user.email} さん</p>
            <button onClick={handleLogout} className="text-red-500 text-sm">ログアウト</button>
          </div>
          <div className="flex gap-2">
            <input
              className="border p-2 flex-1"
              placeholder="今どこにいる？"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button onClick={handlePost} className="bg-blue-600 text-white px-4 rounded">
              投稿
            </button>
          </div>
        </div>
      )}

      {/* タイムライン */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded shadow bg-white">
            <p className="font-bold text-sm text-gray-600">
              {post.users?.username || '名無し'}
            </p>
            <p className="mt-2">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}