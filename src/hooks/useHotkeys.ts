import { useEffect } from 'react';

type HotkeyCallback = (event: KeyboardEvent) => void;
type HotkeysMap = { [key: string]: HotkeyCallback };

export function useHotkeys(hotkeysMap: HotkeysMap) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const hotkey = `${event.ctrlKey ? 'ctrl+' : ''}${event.metaKey ? 'meta+' : ''}${event.shiftKey ? 'shift+' : ''}${key}`;
      
      if (hotkeysMap[hotkey]) {
        event.preventDefault();
        hotkeysMap[hotkey](event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hotkeysMap]);
}