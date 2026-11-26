// The editor's own pieces plugged into Puck (top bar, block bar, library, helpers).
// They're created once and read the latest editor state from context, so a change to the
// site (e.g. dragging a color) doesn't force Puck to rebuild all of them.
import { createContext, useContext } from "react";
import { EditorHeader } from "./EditorHeader.jsx";
import {
  AutoOpenSettings,
  BlockActionBar,
  FadePanelsWhileDragging,
  GuardDeleteKeys,
} from "./EditorHelpers.jsx";
import { PictureDrop, PuckBridge } from "./FreeHelpers.jsx";
import { SectionTemplatesButton } from "./SectionTemplates.jsx";
import { Tour } from "./Tour.jsx";

export const EditorContext = createContext(null);

function Header() {
  const e = useContext(EditorContext);
  return (
    <EditorHeader
      site={e.site}
      page={e.page}
      status={e.status}
      onOpenPage={e.openPage}
      onOpenDialog={e.setDialog}
      onHelp={() => e.setTourOpen(true)}
      onPublish={e.publish}
    />
  );
}

function TourIfOpen() {
  const e = useContext(EditorContext);
  return e.tourOpen ? <Tour onClose={() => e.setTourOpen(false)} /> : null;
}

export const stableOverrides = {
  header: Header,
  actionBar: BlockActionBar,
  // Block library: ready-made sections first, then the single blocks.
  drawer: ({ children }) => (
    <>
      <SectionTemplatesButton />
      {children}
    </>
  ),
  // Extra helpers that need to live inside the editor.
  puck: ({ children }) => (
    <>
      {children}
      <AutoOpenSettings />
      <FadePanelsWhileDragging />
      <GuardDeleteKeys />
      <PuckBridge />
      <PictureDrop />
      <TourIfOpen />
    </>
  ),
};
