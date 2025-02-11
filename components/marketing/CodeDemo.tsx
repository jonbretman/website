// Inspired by https://github.com/rexxars/react-refractor
import rangeParser from 'parse-numeric-range';
import React from 'react';
import { CodeBlock } from '../CodeBlock';

type CodeDemoProps = React.ComponentProps<typeof CodeBlock>;

export function CodeDemo({ line, ...props }: CodeDemoProps) {
  const wrapperRef = React.useRef<HTMLPreElement>(null);

  React.useEffect(() => {
    const pre = wrapperRef.current;
    if (!pre) return;

    const PADDING = 15;
    const codeInner = pre.querySelector('code');
    const codeBlockHeight = pre.clientHeight - PADDING * 2;

    const lines = pre.querySelectorAll<HTMLElement>('.highlight-line');

    if (!line) {
      lines.forEach((line) => {
        line.classList.remove('off');
      });

      codeInner.style.transform = `translate3d(0, 0, 0)`;
      return;
    }

    const linesToHighlight = rangeParser(line);

    const firstLineNumber = Math.max(0, linesToHighlight[0] - 1);
    const lastLineNumber = Math.min(lines.length - 1, [...linesToHighlight].reverse()[0] - 1);
    const firstLine = lines[firstLineNumber];
    const lastLine = lines[lastLineNumber];

    // Prevent errors in case the right line doesnt exist
    if (!firstLine || !lastLine) {
      console.warn(`CodeDemo: Error finding the right line`);
      return;
    }

    const linesHeight = lastLine.offsetTop + lastLine.offsetHeight - firstLine.offsetTop;
    const maxDistance = codeInner.clientHeight - codeBlockHeight;

    const codeFits = linesHeight < codeBlockHeight;
    const lastLineIsBelow = lastLine.offsetTop + lastLine.offsetHeight > codeBlockHeight - PADDING;
    const lastLineIsAbove = !lastLineIsBelow;

    let translateY;
    if (codeFits && lastLineIsAbove) {
      translateY = 0;
    } else if (codeFits && lastLineIsBelow) {
      const dist = firstLine.offsetTop - (codeBlockHeight - linesHeight) / 2;
      translateY = dist > maxDistance ? maxDistance : dist;
    } else {
      translateY = firstLine.offsetTop;
    }

    lines.forEach((line, i) => {
      const lineIndex = i + 1;

      if (linesToHighlight.includes(lineIndex)) {
        line.setAttribute('data-highlighted', 'true');
      } else {
        line.setAttribute('data-highlighted', 'false');
      }
    });

    requestAnimationFrame(
      () => (codeInner.style.transform = `translate3d(0, ${-translateY}px, 0)`)
    );
  }, [line]);

  // Maybe improve the implementation below
  // below bp2 we render a normal code block without any interactive stuff
  // above bp2 we render the interactive stuff
  return (
    <>
      <CodeBlock
        ref={wrapperRef}
        {...props}
        line="0"
        display={{ initial: 'block', sm: 'none' }}
        style={{ ...props.style, padding: 'var(--space-3' }}
      />
      <CodeBlock
        ref={wrapperRef}
        {...props}
        display={{ initial: 'none', sm: 'block' }}
        isInteractive
        style={{
          overflowY: 'hidden',
          userSelect: 'none',
          ...props.style,
        }}
      />
    </>
  );
}
