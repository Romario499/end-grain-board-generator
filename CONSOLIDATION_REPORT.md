# DREVOCOD consolidation report

Дата финализации: 2026-08-16.

## Решение

Единая сущность проекта:

```text
DREVOCOD
└── End Grain Studio / End Grain Board Generator
```

Канонические точки:

- local: `/home/romario/.openclaw/workspace/project_os/end-grain-board-generator`;
- GitHub: `Romario499/end-grain-board-generator`;
- рабочая ветка финализации: `feature/checkerboard-manufacturing-v1`;
- pull request: `https://github.com/Romario499/end-grain-board-generator/pull/1`.

`Romario499/DREVOCOD` остаётся сохранённым приватным источником ранней бренд-платформы. Репозиторий не удалялся, не архивировался и не переписывался.

## Исходное состояние

Перед финализацией:

- canonical feature HEAD: `b81a6a91cafee73dd242ac5046561d0b4795c5d4`;
- canonical remote `main`: `4664018bfbc0952b9a239128d856350f30129864`;
- `DREVOCOD/main`: `8d71a4751d6af1021b52822e20e50be2ecaf114d`;
- histories независимы: общего Git ancestor нет;
- feature-ветка canonical repository опережала его remote `main` на 12 коммитов и совпадала со своей remote tracking branch;
- вложенных Git-репозиториев, submodules и дополнительных worktrees внутри проекта не найдено.

## Что сохранено из рабочего дерева

- продуктовая страница `product.html`, её CSS и контрактный тест;
- master PNG трёх пород древесины; оптимизированные JPG остаются runtime-источниками;
- мастер-спецификация бизнеса, продукта CUBE 18 и End Grain Studio;
- рабочее описание pull request, сохранённое в `docs/release-notes/`;
- все ранее опубликованные CUBE 18-коммиты, включая `a222655` и `b81a6a9`.

Игнорируемые `.superpowers/sdd/` и `Foto/` остаются локальными справочными/backup-материалами. Они не удалялись и не включались в продуктовый Git tree.

## Что перенесено из DREVOCOD

Из независимой истории `DREVOCOD/main@8d71a47` перенесены подтверждённо уникальные содержательные материалы:

- `brand/presentation-text.md`;
- `brand/positioning.md`;
- `brand/tone-of-voice.md`;
- `brand/brand-system.md`;
- исходные design/implementation документы создания бренд-репозитория.

Не заменялись canonical `README.md` и `.gitignore`: одноимённые версии DREVOCOD описывали пустой бренд-scaffold и конфликтовали с действующим продуктом. Пустые placeholder-каталоги также не переносились. Происхождение сохранено этим отчётом и исходным SHA.

## Коммерческие источники DREVOCOD USA

По прямому указанию владельца сохранены пять датированных source snapshots: директорский коммерческий стандарт, продуктовый стандарт, актуальная память, Obsidian project home и актуальный реестр данных. Оригинальные SHA-256 зафиксированы в [`docs/business/README.md`](./docs/business/README.md).

При конфликте действует правило: более позднее прямое решение и проверяемое текущее состояние canonical repository выше старого документа. Поэтому исторические формулировки `53/53`, `main@4664018`, «консолидация не выполнена» и «workshop layer не готов» не используются как текущий статус. Коммерческие цены, партия, KPI и каналы остаются моделью для физической и рыночной проверки.

## Фактическое состояние продукта

| Контур | Состояние |
|---|---|
| Pattern Lab | Seeded checkerboard и CUBE 18 |
| Материалы | Hard maple, black walnut, black cherry |
| Board Spec | Размеры, grid, schema V2, миграция V1 |
| Workshop Recipe | Kerf, припуски, полосы, детали, резы, объём, отход |
| CUBE 18 costing | Board feet, ставки пользователя, расходники, USD total |
| Save/Open | Локальное хранилище браузера |
| Export | PNG через общий Canvas renderer |
| Product UI | Product page + рабочая Studio |
| Runtime | Native HTML/CSS/JavaScript, без внешних зависимостей |

Граница достоверности: расчёт CUBE 18 начинается с подготовленных полос. Сырой складской раскрой, труд, доставка, налог, амортизация и физическая контрольная сборка не закрыты.

## Конкурсный benchmark

По опубликованному 2026-08-16 описанию [BoardForge](https://github.com/papsuevgeorgiy-ux/boardforge) имеет более широкий производственный контур: operation-first модель, 14 узоров, карту раскроя, breakdown потерь, shopping list, 3D/GLB, PDF/печать, Windows installer и 787 тестов.

Это зафиксировано как внешний benchmark, а не как часть текущей финализации. Код BoardForge не использовался. Добавление аналогичных возможностей относится к отдельному решению после P0; текущий scope не расширялся.

Дополнительные опубликованные ориентиры, предоставленные владельцем:

- [Endgrain](https://sander419.github.io/endgrain/);
- [Woodcut Studio](https://woodcut-studio-app.vercel.app/).

Их сравнительный UX/feature-аудит не включён в финализацию и не выдаётся за выполненный. Ссылки сохранены для отдельного конкурентного обзора.

## Внутренний ориентир: kalkulyator

Локальный самостоятельный проект `../kalkulyator` проверен только read-only. В соответствии с `AGENTS.md` код из него не переносился и архитектура End Grain Studio не менялась.

Для отдельного P1 после физической проверки CUBE 18 полезны подтверждённые паттерны `kalkulyator`:

- полностью локальная работа в браузере без обязательного API;
- раздельные слои данных и расчётной логики;
- внутренний экран себестоимости/маржи и отдельный клиентский документ;
- редактируемые ставки материалов, работ, налогов и накладных параметров;
- versioned localStorage с миграциями, JSON/Excel import/export;
- эталонные fixtures, которые защищают коммерческий результат от регрессий.

Целевой следующий контур DREVOCOD: `материал + труд + расходники + накладные → себестоимость → цена → маржа`, работающий offline-first. Это roadmap, не заявленная функция текущего P0.

## Проверка и безопасность публикации

- новые зависимости не добавлялись;
- `.env`, токены, cookies и ключи не читались и не менялись;
- force push, reset, rebase и удаление репозиториев не применялись;
- перед push выполнены `npm test`, `npm run check`, `git diff --check` и HTTP-проверка product/Studio и локальных ресурсов;
- browser-smoke через Windows Chrome был запущен, но не засчитан: браузер не смог подключиться к WSL HTTP-серверу (`ERR_CONNECTION_TIMED_OUT` на границе Windows↔WSL);
- публикация выполняется обычным fast-forward push рабочей feature-ветки.

## Остаточные риски

- необходим физический образец и сверка технологической карты;
- нет raw-stock optimizer и карты раскроя с нумерацией деталей;
- себестоимость не включает труд и накладные расходы;
- localStorage остаётся локальным, без облачной синхронизации;
- browser print/PNG download требуют финальной ручной приёмки в целевом браузере.
