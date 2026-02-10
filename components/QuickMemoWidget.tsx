'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface QuickMemo {
  id: string;
  content: string;
  created_at: string;
  is_processed: boolean;
}

export default function QuickMemoWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [memos, setMemos] = useState<QuickMemo[]>([]);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchMemos = useCallback(async () => {
    try {
      const res = await fetch('/api/quick-memos?limit=10');
      if (res.ok) {
        const data = await res.json();
        setMemos(data);
      }
    } catch (error) {
      console.error('Failed to fetch memos:', error);
    }
  }, []);

  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!content.trim() || saving) return;

    setSaving(true);
    try {
      const res = await fetch('/api/quick-memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        const newMemo = await res.json();
        setMemos((prev) => [newMemo, ...prev]);
        setContent('');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to save memo:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/quick-memos?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMemos((prev) => prev.filter((memo) => memo.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete memo:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setContent('');
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-rose text-light rounded-lg hover:bg-rose/80 transition-colors font-medium"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'}
          />
        </svg>
        {isOpen ? '닫기' : '빠른 메모'}
      </button>

      {isOpen && (
        <div className="mt-3 animate-fadeIn">
          <div className="bg-light/10 rounded-lg p-3 shadow-lg">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메모를 입력하세요..."
              className="w-full h-20 resize-none border-0 focus:outline-none bg-transparent text-light text-sm"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setContent('');
                }}
                className="px-3 py-1.5 text-sm text-light/60 hover:text-light transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!content.trim() || saving}
                className="px-3 py-1.5 text-sm bg-teal text-white rounded hover:bg-teal/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {memos.length > 0 && (
        <div className="mt-4 space-y-2">
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="group flex items-start gap-2 p-2 bg-light/10 rounded-lg hover:bg-light/15 transition-colors"
            >
              <span className="text-rose mt-0.5">•</span>
              <span className="flex-1 text-sm text-light/80 break-words">
                {memo.content}
              </span>
              <button
                onClick={() => handleDelete(memo.id)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-light/40 hover:text-rose transition-all"
                title="삭제"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
