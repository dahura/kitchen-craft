// app/designer/page.tsx
"use client"; // Все еще нужен, так как мы импортируем клиентский компонент

import dynamic from "next/dynamic";

// Динамический импорт остается здесь
const ThreeCanvas = dynamic(() => import("./tree-canvas"), {
  ssr: false,
  loading: () => <p>Загрузка 3D редактора...</p>,
});

export default function DesignerPage() {
  // В будущем здесь можно получить данные с сервера
  // const initialData = await fetch(...)

  return <ThreeCanvas />;
}
