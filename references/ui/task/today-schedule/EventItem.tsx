/**
 * app/_components/todo/today-schedule/EventItem.tsx
 *
 * Phase 14.35: イベントアイテムコンポーネント
 */

'use client';

import { useState, memo } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { SUIT_CONFIG } from '@/lib/types/todo';
import { CalendarEvent, EventCategory } from './types';
import {
  formatTime,
  getDurationMinutes,
  detectSuitFromTitle,
  detectSuitFromColorId,
  CATEGORY_CONFIG,
} from './utils';

interface EventItemProps {
  event: CalendarEvent;
  isNow: boolean;
  isPast: boolean;
  onCreateTask?: (category: EventCategory) => void;
  isUnclassified: boolean;
}

export const EventItem = memo(function EventItem({ event, isNow, isPast, onCreateTask, isUnclassified }: EventItemProps) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const duration = getDurationMinutes(event.start, event.end);
  const suit = detectSuitFromTitle(event.summary) || detectSuitFromColorId(event.colorId);
  const suitConfig = suit ? SUIT_CONFIG[suit] : null;

  // AIFCCタスクからスートマーク + 絵文字プレフィックスを削除した表示名
  const displayTitle = event.summary
    .replace(/\[♠\]|\[♥\]|\[♦\]|\[♣\]\s*/g, '')
    .replace(/^[⬛️⬛🟥🟨🟦]\s*/g, '')
    .trim();

  // カテゴリ選択ハンドラ
  const handleCategorySelect = (category: EventCategory) => {
    setShowCategoryPicker(false);
    onCreateTask?.(category);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        padding: '12px',
        background: isNow ? 'var(--primary-light)' : isPast ? '#fafafa' : 'white',
        borderRadius: '8px',
        border: isNow ? '2px solid var(--primary)' : '1px solid var(--border)',
        opacity: isPast ? 0.6 : 1,
        transition: 'all 0.2s',
      }}
    >
      {/* 時間表示 */}
      <div style={{ minWidth: '60px', textAlign: 'center' }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: isNow ? 'var(--primary)' : 'var(--text-dark)',
          }}
        >
          {formatTime(event.start)}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
          {duration}分
        </div>
      </div>

      {/* イベント情報 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          {/* AIFCCタスクマーク */}
          {event.isAifccTask && suitConfig && (
            <span style={{ fontSize: '14px', color: suitConfig.color }} title={suitConfig.ja}>
              {suitConfig.symbol}
            </span>
          )}

          {/* タイトル */}
          <span
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-dark)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayTitle}
          </span>

          {/* 外部リンク */}
          {event.htmlLink && (
            <a
              href={event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-light)',
                marginLeft: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
            </a>
          )}

          {/* タスク作成ボタン */}
          {!event.isAifccTask && onCreateTask && !isUnclassified && (
            <div style={{ position: 'relative', marginLeft: event.htmlLink ? '4px' : 'auto' }}>
              {suit ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateTask?.(suit);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: suitConfig?.color || 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                  title={`${suitConfig?.ja || ''}に追加`}
                >
                  <Plus size={12} />
                  <span>{suitConfig?.symbol}</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCategoryPicker(!showCategoryPicker);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="4象限タスクに追加"
                >
                  <Plus size={14} />
                </button>
              )}

              {/* カテゴリ選択ポップアップ */}
              {showCategoryPicker && !suit && (
                <CategoryPickerPopup onSelect={handleCategorySelect} />
              )}
            </div>
          )}
        </div>

        {/* 終了時間とバッジ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-light)' }}>
          <span>〜 {formatTime(event.end)}</span>
          {isUnclassified && (
            <EventBadge label="未分類" bg={CATEGORY_CONFIG.unclassified.bg} color={CATEGORY_CONFIG.unclassified.color} />
          )}
          {!event.isAifccTask && !isUnclassified && (
            <EventBadge label="外部予定" bg="#e3f2fd" color="#1565c0" />
          )}
          {event.isAifccTask && (
            <EventBadge label="AIFCCタスク" bg="#e8f5e9" color="#2e7d32" />
          )}
        </div>
      </div>
    </div>
  );
});

// イベントバッジコンポーネント
function EventBadge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{ fontSize: '10px', background: bg, color, padding: '1px 6px', borderRadius: '8px' }}>
      {label}
    </span>
  );
}

// カテゴリ選択ポップアップ
function CategoryPickerPopup({ onSelect }: { onSelect: (category: EventCategory) => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '4px',
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 100,
        minWidth: '140px',
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-light)' }}>
        カテゴリを選択
      </div>
      {(['spade', 'heart', 'diamond', 'club', 'joker'] as EventCategory[]).map((cat) => {
        const config = CATEGORY_CONFIG[cat];
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = config.bg}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: config.color, fontSize: '16px' }}>{config.symbol}</span>
            <span style={{ color: 'var(--text-dark)' }}>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
