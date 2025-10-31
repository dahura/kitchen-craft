# План миграции текстур комнат

## Задача
Переместить текстуры из двух папок `white_plaster_02_4k.blend` и `white_plaster_02_4k.blend 2` в организованную структуру `public/textures/rooms/`.

## Исходные файлы
### Папка 1: `white_plaster_02_4k.blend/textures/`
- `white_plaster_02_diff_4k.jpg` → `public/textures/rooms/walls/white-plaster/diffuse.jpg`
- `white_plaster_02_disp_4k.png` → `public/textures/rooms/walls/white-plaster/displacement.jpg`
- `white_plaster_02_nor_gl_4k.exr` → `public/textures/rooms/walls/white-plaster/normal.jpg`
- `white_plaster_02_rough_4k.jpg` → `public/textures/rooms/walls/white-plaster/roughness.jpg`

### Папка 2: `white_plaster_02_4k.blend 2/textures/`
- `white_plaster_02_diff_4k.jpg` → `public/textures/rooms/floors/white-plaster/diffuse.jpg`
- `white_plaster_02_disp_4k.png` → `public/textures/rooms/floors/white-plaster/displacement.jpg`
- `white_plaster_02_nor_gl_4k.exr` → `public/textures/rooms/floors/white-plaster/normal.jpg`
- `white_plaster_02_rough_4k.jpg` → `public/textures/rooms/floors/white-plaster/roughness.jpg`

## Команды для выполнения

```bash
# Создаем недостающие папки
mkdir -p public/textures/rooms/floors/white-plaster

# Копируем текстуры для стен
cp "white_plaster_02_4k.blend/textures/white_plaster_02_diff_4k.jpg" "public/textures/rooms/walls/white-plaster/diffuse.jpg"
cp "white_plaster_02_4k.blend/textures/white_plaster_02_disp_4k.png" "public/textures/rooms/walls/white-plaster/displacement.jpg"
cp "white_plaster_02_4k.blend/textures/white_plaster_02_nor_gl_4k.exr" "public/textures/rooms/walls/white-plaster/normal.jpg"
cp "white_plaster_02_4k.blend/textures/white_plaster_02_rough_4k.jpg" "public/textures/rooms/walls/white-plaster/roughness.jpg"

# Копируем текстуры для пола
cp "white_plaster_02_4k.blend 2/textures/white_plaster_02_diff_4k.jpg" "public/textures/rooms/floors/white-plaster/diffuse.jpg"
cp "white_plaster_02_4k.blend 2/textures/white_plaster_02_disp_4k.png" "public/textures/rooms/floors/white-plaster/displacement.jpg"
cp "white_plaster_02_4k.blend 2/textures/white_plaster_02_nor_gl_4k.exr" "public/textures/rooms/floors/white-plaster/normal.jpg"
cp "white_plaster_02_4k.blend 2/textures/white_plaster_02_rough_4k.jpg" "public/textures/rooms/floors/white-plaster/roughness.jpg"

# Удаляем исходные папки после успешного копирования
rm -rf "white_plaster_02_4k.blend"
rm -rf "white_plaster_02_4k.blend 2"
```

## Примечания
- Текстуры из первой папки используются для стен
- Текстуры из второй папки используются для пола
- Потолок будет использовать белый цвет без текстур по умолчанию
- Форматы .exr для normal map конвертируются в .jpg для совместимости