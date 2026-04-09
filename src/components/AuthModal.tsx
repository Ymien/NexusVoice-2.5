import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const setUser = useStore((state) => state.setUser);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          alert('注册成功！');
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || '认证失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl p-6 m-4 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {isLogin ? '登录账号' : '注册账号'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none transition-all"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
