import { useRef } from 'react';

const CLOSE_THRESHOLD = 100;

function useDragToClose(onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    startYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const delta = Math.max(0, e.clientY - startYRef.current);
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
      panelRef.current.style.transform = `translateY(${delta}px)`;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const delta = Math.max(0, e.clientY - startYRef.current);
    if (delta >= CLOSE_THRESHOLD) {
      if (panelRef.current) {
        panelRef.current.style.transition = 'transform 0.3s ease';
        panelRef.current.style.transform = 'translateY(100%)';
      }
      setTimeout(onClose, 300);
    } else if (panelRef.current) {
      panelRef.current.style.transition = 'transform 0.3s ease';
      panelRef.current.style.transform = '';
    }
  };

  return {
    panelRef,
    dragHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}

export default useDragToClose;
