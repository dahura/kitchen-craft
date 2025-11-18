// app/designer/layout.tsx
// Это Server Component по умолчанию

import { ChatPanel } from "./components/chat-panel";

export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-screen h-screen flex flex-col">
      {/* Основная область для 3D сцены */}
      <main className="flex-1 relative">{children}</main>

      {/* Footer area for chat and other panels */}
      <footer className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <ChatPanel />
      </footer>
    </section>
  );
}
