import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

const ITEM_HEIGHT = 96;
const MIN_LOOPS = 3;
const MAX_LOOPS = 5;
const SPIN_DURATION_MS = 2000;

export interface SpinnerHandle {
  spin: () => void;
}

interface SpinnerProps {
  items: string[];
  onSpinStart?: () => void;
  onSpinEnd?: (result: string) => void;
}

const Window = styled.div`
  position: relative;
  width: min(90vw, 480px);
  height: ${ITEM_HEIGHT}px;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colors.accent};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 32px rgba(209, 31, 87, 0.25);

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 28px;
    pointer-events: none;
    z-index: 2;
  }

  &::before {
    top: 0;
    background: linear-gradient(
      to bottom,
      ${({ theme }) => theme.colors.surface},
      transparent
    );
  }

  &::after {
    bottom: 0;
    background: linear-gradient(
      to top,
      ${({ theme }) => theme.colors.surface},
      transparent
    );
  }
`;

const Reel = styled.div<{ $offset: number; $animate: boolean }>`
  display: flex;
  flex-direction: column;
  transform: translateY(-${({ $offset }) => $offset}px);
  transition: ${({ $animate }) =>
    $animate
      ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.8, 0.15, 1)`
      : "none"};
`;

const Item = styled.div`
  height: ${ITEM_HEIGHT}px;
  min-height: ${ITEM_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
  padding: 0 1.5rem 0.4rem 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const Spinner = forwardRef<SpinnerHandle, SpinnerProps>(function Spinner(
  { items, onSpinStart, onSpinEnd },
  ref,
) {
  const [baseIndex, setBaseIndex] = useState(0);
  const [renderItems, setRenderItems] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const spinningRef = useRef(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timeoutRef.current);
    spinningRef.current = false;
    setBaseIndex(0);
    setOffset(0);
    setAnimate(false);
    setRenderItems(items.length ? [items[0]] : []);
  }, [items]);

  useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  const spin = () => {
    const n = items.length;
    if (spinningRef.current || n < 2) return;

    const base = baseIndex % n;
    const loops =
      MIN_LOOPS + Math.floor(Math.random() * (MAX_LOOPS - MIN_LOOPS + 1));
    const target = Math.floor(Math.random() * n);
    const stepsToTarget = (target - base + n) % n || n;
    const totalSteps = loops * n + stepsToTarget;

    const list: string[] = [];
    for (let i = 0; i <= totalSteps; i++) {
      list.push(items[(base + i) % n]);
    }

    spinningRef.current = true;
    setRenderItems(list);
    setAnimate(false);
    setOffset(0);
    onSpinStart?.();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
        setOffset(totalSteps * ITEM_HEIGHT);
      });
    });

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setBaseIndex(target);
      setAnimate(false);
      setOffset(0);
      setRenderItems([items[target]]);
      spinningRef.current = false;
      onSpinEnd?.(items[target]);
    }, SPIN_DURATION_MS + 60);
  };

  useImperativeHandle(ref, () => ({ spin }));

  return (
    <Window>
      <Reel $offset={offset} $animate={animate}>
        {renderItems.map((word, index) => (
          <Item key={index}>{word}</Item>
        ))}
      </Reel>
    </Window>
  );
});
