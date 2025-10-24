// app/designer/layout.tsx
// Это Server Component по умолчанию

export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section style={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* В будущем здесь будет боковая панель */}
      {/* <aside style={{ width: '300px' }}>...</aside> */}

      {/* Основная область для 3D сцены */}
      <main style={{ flexGrow: 1 }}>{children}</main>
    </section>
  );
}
