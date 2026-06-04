'use client';

import { Idea, BrandTemplate } from '@/lib/types';
import React from 'react';

interface Props {
  idea: Idea;
  template: BrandTemplate;
  index: number;
  total: number;
  onFieldClick?: (field: string) => void;
}

function EditableSpan({ field, children, style, onFieldClick }: {
  field: string;
  children: React.ReactNode;
  style: React.CSSProperties;
  onFieldClick?: (field: string) => void;
}) {
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        onFieldClick?.(field);
      }}
      style={{ ...style, cursor: onFieldClick ? 'pointer' : 'default' }}
      className={onFieldClick ? 'hover:outline hover:outline-1 hover:outline-dashed hover:outline-current' : ''}
    >
      {children}
    </span>
  );
}

const IdeaCard = React.forwardRef<HTMLDivElement, Props>(
  function IdeaCard({ idea, template, index, total, onFieldClick }, ref) {
    return (
      <div
        ref={ref}
        className="idea-card"
        style={{
          width: 1920,
          height: 1080,
          fontFamily: template.fontFamily,
          backgroundColor: template.secondaryColor,
          color: template.primaryColor,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            backgroundColor: template.primaryColor,
            color: template.secondaryColor,
            padding: '24px 60px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 'bold', letterSpacing: 2 }}>
            {template.logoPlaceholder}
          </span>
          <span style={{ fontSize: 16, opacity: 0.7 }}>
            IDEA {index + 1} OF {total}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '60px 120px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 72px)' }}>
          {/* Score badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                border: `3px solid ${template.accentColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 'bold',
                color: template.accentColor,
              }}
            >
              {idea.score}
            </div>
            <span style={{ fontSize: 12, color: template.accentColor, textTransform: 'uppercase', letterSpacing: 2 }}>
              Brief Score
            </span>
          </div>

          {/* Headline */}
          <EditableSpan field="headline" onFieldClick={onFieldClick} style={{
            fontSize: 56,
            fontWeight: 'bold',
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: '85%',
            display: 'block',
          }}>
            {idea.headline}
          </EditableSpan>

          {/* Subheader */}
          <EditableSpan field="subheader" onFieldClick={onFieldClick} style={{
            fontSize: 24,
            lineHeight: 1.5,
            opacity: 0.85,
            maxWidth: '75%',
            marginBottom: 40,
            fontStyle: 'italic',
            display: 'block',
          }}>
            {idea.subheader}
          </EditableSpan>

          {/* Insight */}
          {idea.insight && (
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: template.accentColor, display: 'block', marginBottom: 6 }}>
                Insight
              </span>
              <EditableSpan field="insight" onFieldClick={onFieldClick} style={{ fontSize: 20, lineHeight: 1.4, maxWidth: '70%', display: 'block' }}>
                {idea.insight}
              </EditableSpan>
            </div>
          )}

          {/* How it works */}
          <div style={{ flex: 1 }}>
            {idea.mechanic && (
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: template.accentColor, display: 'block', marginBottom: 6 }}>
                  How It Works
                </span>
                <EditableSpan field="mechanic" onFieldClick={onFieldClick} style={{ fontSize: 18, lineHeight: 1.4, maxWidth: '70%', display: 'block' }}>
                  {idea.mechanic}
                </EditableSpan>
              </div>
            )}

            {idea.userJourney && (
              <div>
                <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: template.accentColor, display: 'block', marginBottom: 6 }}>
                  User Journey
                </span>
                <EditableSpan field="userJourney" onFieldClick={onFieldClick} style={{ fontSize: 18, lineHeight: 1.4, maxWidth: '70%', display: 'block' }}>
                  {idea.userJourney}
                </EditableSpan>
              </div>
            )}
          </div>

          {/* Bottom accent line */}
          <div
            style={{
              width: 120,
              height: 4,
              backgroundColor: template.accentColor,
            }}
          />
        </div>
      </div>
    );
  }
);

export default IdeaCard;
