import React from 'react';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

export const MENU_ID = 'scene-context-menu';

interface SceneContextMenuProps {
  onDelete: (props: any) => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onCopyAttributes: () => void;
  onCopyStill: () => void;
}

export function SceneContextMenu({
  onDelete,
  onArchive,
  onDuplicate,
  onCopyAttributes,
  onCopyStill,
}: SceneContextMenuProps) {
  return (
    <Menu id={MENU_ID}>
      <Item onClick={onDelete}>Eliminar</Item>
      <Item onClick={onArchive}>Archivar</Item>
      <Item onClick={onDuplicate}>Duplicar</Item>
      <Separator />
      <Submenu label="Copiar">
        <Item onClick={onCopyAttributes}>Copiar Atributos</Item>
        <Item onClick={onCopyStill}>Copiar Still</Item>
      </Submenu>
    </Menu>
  );
}