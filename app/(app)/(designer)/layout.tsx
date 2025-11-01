// app/designer/layout.tsx
// Это Server Component по умолчанию

export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-screen h-screen flex">
      {/* В будущем здесь будет боковая панель */}
      {/* <aside className="w-[300px]">...</aside> */}

      {/* Основная область для 3D сцены */}
      <main className="flex-1">{children}</main>
    </section>
  );
}
