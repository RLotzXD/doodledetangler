'use client';

import { useState } from 'react';
import { Idea, BrandTemplate } from '@/lib/types';

interface Props {
  ideas: Idea[];
  template: BrandTemplate;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export default function ExportBar({ ideas, template, cardRefs }: Props) {
  const [exporting, setExporting] = useState<'pdf' | 'pptx' | null>(null);

  async function exportPDF() {
    setExporting('pdf');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });

      for (let i = 0; i < cardRefs.current.length; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;

        const parent = card.parentElement;
        const originalTransform = parent?.style.transform || '';
        if (parent) parent.style.transform = 'scale(1)';

        const canvas = await html2canvas(card, {
          width: 1920,
          height: 1080,
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false,
        });

        if (parent) parent.style.transform = originalTransform;

        if (i > 0) pdf.addPage([1920, 1080], 'landscape');
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 1920, 1080);
      }

      pdf.save('deck.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Check console for details.');
    } finally {
      setExporting(null);
    }
  }

  async function exportPPTX() {
    setExporting('pptx');
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';

      const font = template.fontFamily.split(',')[0].trim();
      const primary = template.primaryColor.replace('#', '');
      const secondary = template.secondaryColor.replace('#', '');
      const accent = template.accentColor.replace('#', '');

      // Title slide
      const titleSlide = pptx.addSlide();
      titleSlide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { color: primary },
      });
      titleSlide.addText(template.logoPlaceholder, {
        x: 0.8, y: 1, w: 8, h: 1.5,
        fontSize: 48, bold: true,
        color: secondary,
        fontFace: font,
      });
      titleSlide.addText(`${ideas.length} Creative Ideas`, {
        x: 0.8, y: 2.8, w: 8, h: 1,
        fontSize: 28,
        color: secondary + 'BB',
        fontFace: font,
      });
      titleSlide.addText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), {
        x: 0.8, y: 3.8, w: 8, h: 0.5,
        fontSize: 14,
        color: secondary + '88',
        fontFace: font,
      });

      // Summary slide
      const summarySlide = pptx.addSlide();
      summarySlide.addText('Ideas Overview', {
        x: 0.8, y: 0.4, w: 8, h: 0.8,
        fontSize: 28, bold: true,
        color: primary,
        fontFace: font,
      });
      const summaryRows = ideas.map((idea, i) => [
        { text: `${i + 1}.`, options: { fontSize: 11, color: accent, bold: true } },
        { text: ` ${idea.headline}`, options: { fontSize: 11, color: primary, bold: true } },
        { text: ` — ${idea.subheader}`, options: { fontSize: 10, color: primary + 'AA' } },
        { text: ` [${idea.score}/10]\n`, options: { fontSize: 10, color: accent } },
      ]);
      summarySlide.addText(summaryRows.flat(), {
        x: 0.8, y: 1.4, w: 9, h: 5.5,
        wrap: true, fontFace: font,
        lineSpacingMultiple: 1.6,
      });

      // Idea slides
      for (const idea of ideas) {
        const slide = pptx.addSlide();

        slide.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: '100%', h: 0.67,
          fill: { color: primary },
        });

        slide.addText(template.logoPlaceholder, {
          x: 0.6, y: 0.15, w: 4, h: 0.4,
          fontSize: 16, bold: true,
          color: secondary, fontFace: font,
        });

        slide.addText(idea.score.toString(), {
          x: 0.8, y: 1.2, w: 0.6, h: 0.6,
          fontSize: 20, bold: true, align: 'center', valign: 'middle',
          color: accent,
          shape: pptx.ShapeType.ellipse,
        });

        slide.addText('BRIEF SCORE', {
          x: 1.5, y: 1.3, w: 2, h: 0.4,
          fontSize: 9, color: accent, fontFace: font,
        });

        slide.addText(idea.headline, {
          x: 0.8, y: 2.0, w: 8, h: 1,
          fontSize: 36, bold: true, wrap: true,
          color: primary, fontFace: font,
        });

        slide.addText(idea.subheader, {
          x: 0.8, y: 3.0, w: 7, h: 0.8,
          fontSize: 16, italic: true, wrap: true,
          color: primary + 'DD', fontFace: font,
        });

        if (idea.insight) {
          slide.addText([
            { text: 'INSIGHT\n', options: { fontSize: 8, color: accent, bold: true } },
            { text: idea.insight, options: { fontSize: 14, color: primary } },
          ], { x: 0.8, y: 4.0, w: 7, h: 0.8, wrap: true, fontFace: font });
        }

        if (idea.mechanic) {
          slide.addText([
            { text: 'HOW IT WORKS\n', options: { fontSize: 8, color: accent, bold: true } },
            { text: idea.mechanic, options: { fontSize: 14, color: primary } },
          ], { x: 0.8, y: 4.9, w: 7, h: 0.8, wrap: true, fontFace: font });
        }

        if (idea.userJourney) {
          slide.addText([
            { text: 'USER JOURNEY\n', options: { fontSize: 8, color: accent, bold: true } },
            { text: idea.userJourney, options: { fontSize: 14, color: primary } },
          ], { x: 0.8, y: 5.8, w: 7, h: 0.8, wrap: true, fontFace: font });
        }

        slide.addShape(pptx.ShapeType.rect, {
          x: 0.8, y: 6.8, w: 1.2, h: 0.04,
          fill: { color: accent },
        });
      }

      // Thank you slide
      const thankSlide = pptx.addSlide();
      thankSlide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { color: primary },
      });
      thankSlide.addText('Thank You', {
        x: 0, y: 2.5, w: '100%', h: 2,
        fontSize: 56, bold: true, align: 'center', valign: 'middle',
        color: secondary, fontFace: font,
      });

      await pptx.writeFile({ fileName: 'deck.pptx' });
    } catch (err) {
      console.error('PPTX export failed:', err);
      alert('PPTX export failed. Check console for details.');
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportPDF}
        disabled={!!exporting}
        className="text-xs border border-[var(--border)] px-3 py-1.5 hover:border-[var(--foreground)] disabled:opacity-50"
      >
        {exporting === 'pdf' ? 'Exporting...' : 'Download PDF'}
      </button>
      <button
        onClick={exportPPTX}
        disabled={!!exporting}
        className="text-xs border border-[var(--border)] px-3 py-1.5 hover:border-[var(--foreground)] disabled:opacity-50"
      >
        {exporting === 'pptx' ? 'Exporting...' : 'Download PPTX'}
      </button>
    </div>
  );
}
