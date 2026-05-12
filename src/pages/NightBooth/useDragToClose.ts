import { useRef } from 'react';

const CLOSE_THRESHOLD = 100;

function useDragToClose(onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  const snapBack = () => {
    if (panelRef.current) {
      panelRef.current.style.transition = 'transform 0.3s ease';
      panelRef.current.style.transform = '';
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const delta = Math.max(0, e.clientY - startYRef.current);
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
      panelRef.current.style.transform = `translateY(${delta}px)`;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const delta = Math.max(0, e.clientY - startYRef.current);
    if (delta >= CLOSE_THRESHOLD) {
      if (panelRef.current) {
        panelRef.current.style.transition = 'transform 0.3s ease';
        panelRef.current.style.transform = 'translateY(100%)';
      }
      setTimeout(onClose, 300);
    } else {
      snapBack();
    }
  };

  const onPointerCancel = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    snapBack();
  };

  return {
    panelRef,
    dragHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  };
}

export default useDragToClose;
