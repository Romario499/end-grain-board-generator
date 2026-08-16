# DREVOCOD: мастер-дизайн бизнеса, продукта CUBE 18 и End Grain Studio

Дата: 15 августа 2026 года

Статус: мастер-дизайн для пользовательского контроля перед подготовкой implementation plan.

## 0. Паспорт документа

Этот документ определяет не отдельный сайт, не отдельный генератор и не набор маркетинговых текстов, а единый рабочий бизнес-контур DREVOCOD.

Конечный результат:

> DREVOCOD производит и продаёт премиальную торцевую доску CUBE 18, знает её фактическую себестоимость и contribution margin, использует End Grain Studio для воспроизводимого производственного рецепта, получает доказательства качества из реального производства и измеряет возврат инвестиций в продукт, маркетинг и цифровой инструмент.

Канонические сущности:

- DREVOCOD — основной бренд и весь проект;
- CUBE 18 — первый продукт-локомотив;
- End Grain Studio / «Генератор торцевых досок» — технологическое ядро внутри DREVOCOD;
- физический продукт — первый источник выручки;
- производственный рецепт — внутренний актив;
- отдельная цифровая монетизация — только после физической проверки;
- рынок запуска — США;
- внутренняя мастерская — первый пользователь инструмента.

Канонический путь:

`/home/romario/.openclaw/workspace/project_os/end-grain-board-generator`

## 1. Главный бизнес-результат

Работа считается завершённой не тогда, когда нарисован узор, создан лендинг, получен PNG, написана презентация, рассчитана теоретическая маржа или добавлено слово AI.

Работа считается завершённой, когда существует сквозной подтверждённый цикл:

```text
позиционирование
→ оффер CUBE 18
→ лид и заказ
→ спецификация заказа
→ производственный рецепт
→ резервирование материала
→ изготовление
→ QC
→ упаковка и отгрузка
→ получение оплаты
→ фактическая себестоимость
→ contribution margin
→ отзыв и контент
→ повторное использование доказательств в продажах
→ измерение ROI
```

Каждый переход имеет владельца данных, входы, выходы, статус и критерий готовности.

## 2. Границы достоверности

### 2.1. Подтверждено

- существует рабочий визуальный P0;
- P0 проходит 53 автоматических теста;
- поддерживаются три позиции материалов;
- поддерживаются размеры, локальное сохранение и PNG;
- DREVOCOD является каноническим брендом;
- генератор является продуктом внутри DREVOCOD;
- целевая категория — премиальные торцевые разделочные доски;
- целевой рынок — США;
- CUBE 18 является продуктом-локомотивом;
- производственный/AI-слой ещё не production-ready.

### 2.2. Директорские решения для проверки

- CUBE 18: 18 × 12 × 2 дюйма;
- hard maple + American black walnut + black cherry;
- MSRP после первой партии: 389 долларов;
- первая нумерованная партия: 20 досок по 349 долларов;
- пять SKU до достижения 100 платных заказов;
- целевая мощность первого этапа: 20 досок в месяц;
- целевой gross margin до рекламы: не ниже 60%;
- целевой CAC первого заказа: не выше 20% MSRP;
- COGS CUBE 18 при MSRP 389 долларов: не выше 136 долларов;
- позиционирование: functional geometric art for the kitchen;
- слоган: Functional geometry. Built in end grain.

Эти значения используются как `directorTarget`, а не как подтверждённый факт.

### 2.3. Не подтверждено

- юридическая структура продавца;
- фактическое место производства;
- производственная мощность;
- время изготовления;
- реальная себестоимость;
- вес CUBE 18;
- стоимость упаковки;
- стоимость доставки по зонам;
- конверсия;
- CAC;
- возвраты;
- гарантийный резерв;
- отзывы;
- Made in USA claim;
- фактическая маржа;
- фактический ROI.

Неизвестные значения имеют статус `unverified` и отдельный план измерения. Они не заменяются выдуманными «среднерыночными» фактами.

## 3. Архитектура бизнеса

DREVOCOD состоит из пяти связанных контуров.

### 3.1. Продукт

Определяет, что продаётся, кому, с каким обещанием, в какой комплектации, по какой цене, с какими опциями и доказательствами.

### 3.2. Производство

Определяет, из чего и как изготовить, на каком оборудовании, с какими припусками, расходом, временем, стоимостью и контролем.

### 3.3. Продажи и маркетинг

Определяет, как клиент узнаёт о продукте, какое сообщение и доказательство получает, как оформляет заказ и как измеряется вклад канала.

### 3.4. Финансы

Определяют выручку, COGS, gross profit, channel costs, shipping subsidy, CAC, contribution margin, fixed investment, working capital, payback и ROI.

### 3.5. Цифровой контур

End Grain Studio связывает SKU, геометрию, материал, stock, операции, расход, плановую себестоимость, фактическое производство, QC и ревизию рецепта.

Цифровой контур обслуживает бизнес, а не существует ради демонстрации технологий.

## 4. Продукт CUBE 18

### 4.1. Роль

CUBE 18 — одновременно:

- полноценная рабочая доска;
- предмет функционального дизайна;
- значимый подарок;
- главный визуальный образ бренда;
- первый физический носитель технологии;
- первый проверяемый рецепт;
- исходная точка unit economics;
- первый SKU для измерения рынка.

### 4.2. Геометрия

- length: 18 inches = 457.2 mm;
- width: 12 inches = 304.8 mm;
- thickness: 2 inches = 50.8 mm;
- три ромба 60°/120° формируют оптический куб;
- maple — светлая плоскость;
- cherry — тёплая средняя плоскость;
- walnut — тёмная плоскость;
- узор строится из шестигранных end-grain модулей;
- размер ромба остаётся параметром до физического утверждения.

### 4.3. Базовая комплектация

- 3D cube pattern;
- maple, cherry, walnut;
- 18 × 12 × 2″;
- две рабочие поверхности;
- боковые выемки;
- мягкое скругление;
- mineral oil + wax finish после проверки конкретных материалов;
- care card;
- подпись мастера;
- номер партии;
- recipe revision;
- QC-карта.

### 4.4. Опции

- персонализация: директорская цена 39 долларов;
- juice groove: 35 долларов;
- care kit: 24 доллара;
- подарочная упаковка: 29 долларов.

Каждая опция должна иметь дополнительное время, материал, риск, себестоимость, цену, contribution delta и влияние на срок. Опция не публикуется, пока её экономика не проверена хотя бы на одном изделии.

### 4.5. Линейка

До 100 платных заказов:

1. CUBE 18;
2. MAPLE 18;
3. WALNUT 18;
4. PITMASTER 20;
5. CUBE 14.

Другие SKU не должны задерживать CUBE 18.

## 5. Целевая аудитория и JTBD

### 5.1. Design-conscious homeowner

Главный сегмент: покупатель 35–60 лет с доходом выше среднего.

> Когда я выбираю рабочую доску для своей кухни, я хочу получить настоящий, выразительный и долговечный предмет, который приятно использовать каждый день и не хочется убирать.

### 5.2. Premium gift buyer

> Когда мне нужен важный подарок, я хочу вручить не обезличенный товар, а весомый предмет с историей, персонализацией и ощущением ручной работы.

Основной оффер: CUBE 14 или CUBE 18, персонализация, упаковка, номер партии и maker story.

### 5.3. Home cook

> Когда я ежедневно готовлю, я хочу устойчивую доску нормального размера, которая бережно относится к ножам, удобно обслуживается и выглядит профессионально.

### 5.4. BBQ/carving

Основной будущий продукт — PITMASTER 20 после проверки первой вертикали.

### 5.5. B2B

Кандидаты:

- corporate gifts;
- kitchen studios;
- premium home stores;
- interior designers;
- chef partnerships.

B2B не масштабируется до появления физического образца, оптовой экономики, повторяемого lead time, упаковки и политики дефектов.

## 6. Смысловая упаковка

### 6.1. Определение

> DREVOCOD creates premium end-grain cutting boards where functional craftsmanship meets computational geometry.

### 6.2. Слоган

> Functional geometry. Built in end grain.

### 6.3. Обещание

DREVOCOD превращает естественный контраст американских твёрдых пород в функциональную геометрию, которую можно ежедневно использовать и воспроизводить в мастерской.

### 6.4. Причины верить

1. Реальная готовая доска.
2. Крупные фото поверхности и швов.
3. Видео изготовления.
4. Измерения и QC.
5. Сравнение цифрового проекта с изделием.
6. Номер партии и подпись.
7. Повторное изготовление.
8. Отзыв.
9. Только затем — цифровая технология.

### 6.5. Запрещённые заявления без доказательств

- production-ready AI;
- FDA approved cutting board;
- antibacterial;
- completely non-toxic;
- sustainable;
- zero waste;
- Made in USA;
- lifetime guarantee;
- handcrafted in Florida;
- patented geometry;
- unique in the world.

### 6.6. История CUBE 18

1. Три породы создают свет, полутон и тень.
2. Ромбическая геометрия формирует оптический куб.
3. Продольные заготовки превращаются в шестигранный billet.
4. Поперечный срез открывает end grain.
5. Модули собираются в рабочую поверхность.
6. Масло проявляет натуральный контраст.
7. Цифровой проект сравнивается с изделием.
8. Доска используется как инструмент, а не только как декор.

## 7. Оффер

### 7.1. Первая партия

`DREVOCOD CUBE 18 — Numbered First Edition`

Состав:

- CUBE 18;
- номер 01/20–20/20;
- подпись мастера;
- care guide;
- индивидуальная QC-карта;
- фото конкретной доски перед отправкой;
- цифровая история партии после реализации;
- цена 349 долларов.

### 7.2. После первой партии

- MSRP: 389 долларов;
- минимальная публичная акционная цена: 349 долларов;
- скидка ниже 349 долларов запрещена без пересчёта contribution и директорского решения.

### 7.3. Offer ladder

1. Контент и waitlist.
2. Care kit.
3. CUBE 14.
4. MAPLE 18 / WALNUT 18.
5. CUBE 18.
6. PITMASTER 20.
7. Персонализированный/B2B заказ.
8. Будущий цифровой производственный продукт.

## 8. Производственный рецепт

Каноническая стратегия: `rhombus-hex-billet-v1`.

```text
stock lots
→ moisture and defect control
→ longitudinal blanks
→ 60-degree rhombus prisms
→ three-species hexagonal billet
→ kerf-aware crosscuts
→ end-grain pucks
→ orientation and dry layout
→ edge modules
→ final glue-up
→ safe flattening
→ trim to 18 × 12″
→ edge features
→ sanding and finish
→ QC
```

Обычный thickness planer для готовой торцевой сборки запрещён.

Допустимые методы выравнивания:

- router sled;
- drum sander;
- CNC surfacing;
- подтверждённое ручное выравнивание.

Каждая операция хранит operation ID, входы, выходы, размеры, grain direction, kerf, allowances, machine, fixture, setup time, run time, labor time, QC, waste и actual result.

## 9. End Grain Studio

### 9.1. Первый пользователь

Собственное производство DREVOCOD.

### 9.2. Первая задача

Один физически проверяемый рецепт CUBE 18.

### 9.3. Источник истины

Project V2 хранит SKU, finished dimensions, pattern parameters, material roles, stock lots, moisture, workshop profile, kerf, allowances, glue profile, flattening method, cost inputs и verification status.

ManufacturingPlan, cut list, material usage, cost summary, render и report всегда производны.

### 9.4. Статусы

1. concept;
2. geometryCalculated;
3. recipeCalculated;
4. workshopReady;
5. prototypeBuilt;
6. physicallyVerified;
7. reproduced;
8. released.

### 9.5. Production-ready gate

- CUBE 18 изготовлена по данным системы;
- узор совпадает;
- итоговый размер отличается не более чем на 1/16″;
- фактический расход отличается не более чем на 10%;
- второй мастер повторяет изделие без устных объяснений.

## 10. Воронка продаж

### 10.1. Верх

Каналы:

- Instagram;
- TikTok;
- Pinterest;
- YouTube Shorts;
- Google Shopping после готовности карточки;
- creator collaborations.

Первый кадр показывает optical illusion, проявление рисунка маслом, переход цифровой геометрии в доску, работу ножа и физический масштаб.

### 10.2. Середина

Посадочная страница отвечает:

1. Что это?
2. Почему стоит 349/389 долларов?
3. Можно ли использовать ежедневно?
4. Из чего сделано?
5. Как изготовлено?
6. Как ухаживать?
7. Когда будет отправлено?
8. Что делать при дефекте?
9. Можно ли персонализировать?
10. Почему доверять новому бренду?

### 10.3. Низ

- комплектация;
- реальный lead time;
- доставка;
- возврат;
- гарантия;
- реальные фотографии;
- ограниченность первой партии;
- checkout;
- abandoned cart follow-up;
- post-purchase confirmation.

### 10.4. После продажи

- фото перед отправкой;
- tracking;
- care reminder;
- запрос отзыва;
- запрос пользовательского фото;
- предложение care kit;
- referral;
- фиксация причин возврата.

## 11. Продуктовая страница

1. Hero.
2. Обещание.
3. Видео узора и использования.
4. Материалы.
5. Изготовление.
6. Почему end grain.
7. Размер, вес и эргономика.
8. Комплектация.
9. Опции.
10. Уход.
11. Shipping/returns/warranty.
12. FAQ.
13. Доказательства.
14. CTA.

До появления отзывов запрещено имитировать testimonials. Показываются процесс, QC, прототип и прозрачный статус партии.

## 12. Контент-машина

Каждая доска создаёт:

- hero photo;
- top view;
- 45-degree view;
- side/handle view;
- macro end-grain;
- before/after oil;
- knife-use video;
- care video;
- packaging;
- batch number;
- digital-versus-physical comparison;
- reel;
- process video;
- B2B image;
- Pinterest image.

Контент связывается с SKU, batch ID, recipe revision, правами, каналом, стоимостью и результатом.

## 13. Каналы

### 13.1. Shopify

Каноническая витрина, контроль бренда, клиентская база и полная видимость contribution economics.

### 13.2. Etsy

Проверка подарочного спроса и персонализации с отдельной комиссионной моделью.

### 13.3. Social

Визуальное открытие, proof of process и ретаргетинг.

### 13.4. Pinterest и Google

Visual intent и search intent.

### 13.5. B2B

Небольшие тесты после подтверждения COGS, lead time, batch quality, packaging и wholesale floor price.

### 13.6. Amazon Handmade

После 20 оплаченных заказов, 10 отзывов и подтверждённой маржи.

## 14. Unit economics

### 14.1. Определения

`Gross Profit = Net Sales - COGS`

`Gross Margin = Gross Profit / Net Sales`

COGS включает древесину, клей, финиш, прямой труд и норматив производственного брака.

`Contribution Profit = Net Sales - COGS - Packaging - Channel Fees - Shipping Subsidy - Returns/Warranty Reserve - CAC`

`Contribution Margin = Contribution Profit / Net Sales`

Gross margin не является прибылью после рекламы.

### 14.2. MSRP 389 долларов

При COGS 136 долларов:

- gross profit = 253 доллара;
- gross margin = 65.04%.

После упаковки, комиссий, доставки, резерва и CAC contribution будет существенно ниже.

### 14.3. Первая партия 349 долларов

При COGS 136 долларов:

- gross profit = 213 долларов;
- gross margin = 61.03%.

Цена 349 долларов сохраняет gross margin выше 60% только при COGS не выше примерно 139.60 доллара.

Для цели COGS 35% от стартовой цены требуется не более 122.15 доллара.

### 14.4. Сценарии

Все значения — модели, а не прогноз.

| Показатель | Защитный | Базовый | Целевой |
|---|---:|---:|---:|
| Цена | $349 | $389 | $389 |
| COGS | $136 | $136 | $120 |
| Упаковка | $21 | $18 | $15 |
| Комиссии | $42 | $35 | $20 |
| Shipping subsidy | $35 | $20 | $15 |
| Reserve | $14 | $12 | $8 |
| CAC | $70 | $58 | $39 |
| Contribution profit | $31 | $110 | $172 |
| Contribution margin | 8.88% | 28.28% | 44.22% |

Защитный сценарий доказывает, что высокая gross margin сама по себе не гарантирует прибыльный заказ. Целевой сценарий требует снижения COGS, большей доли прямых продаж и CAC около 10% цены.

### 14.5. Первая партия

20 досок по 349 долларов:

- revenue = 6,980 долларов;
- COGS = 2,720 долларов при 136 долларах на доску;
- gross profit = 4,260 долларов;
- gross margin = 61.03%.

При защитных расходах:

- packaging = 420 долларов;
- channel fees = 840 долларов;
- shipping subsidy = 700 долларов;
- reserve = 280 долларов;
- CAC = 1,400 долларов;
- contribution profit = 620 долларов;
- contribution margin = 8.88%.

## 15. Себестоимость

### 15.1. Древесина

По каждой породе:

- purchased board feet;
- purchase price;
- measured dimensions;
- moisture;
- defect deduction;
- prepared blank volume;
- final product volume;
- kerf waste;
- trim waste;
- surfacing waste;
- reusable offcuts.

### 15.2. Труд

Каждая операция хранит setup minutes, active labor minutes, passive cure time, machine time, hourly rate и rework time.

Пассивная выдержка влияет на lead time и WIP, но не приравнивается к прямому труду.

### 15.3. Брак

`Expected scrap cost per good unit = scrap rate × recoverability-adjusted cost of failed unit`

Повторно используемый материал не списывается как полный waste.

### 15.4. Клей и финиш

Фактический расход, цена объёма, setup allowance и batch ID.

### 15.5. Партия

`Batch COGS = usable wood consumed + glue + finish + direct labor + production scrap allowance`

`COGS per good unit = Batch COGS / accepted finished units`

## 16. ROI

### 16.1. ROI бизнеса

`Business ROI = (Cumulative Contribution Profit - Initial Fixed Investment) / Initial Fixed Investment`

Initial Fixed Investment:

- оснастка;
- прототипы;
- оборудование для запуска;
- бренд-ассеты;
- сайт;
- юридическая готовность;
- страхование;
- образцы;
- launch content.

Working capital показывается отдельно.

### 16.2. Payback

`Break-even units = ceiling(Initial Fixed Investment / Contribution Profit per unit)`

При базовом contribution 110 долларов:

| Investment | Break-even units |
|---:|---:|
| $5,000 | 46 |
| $10,000 | 91 |
| $20,000 | 182 |

При защитном contribution 31 доллар:

| Investment | Break-even units |
|---:|---:|
| $5,000 | 162 |
| $10,000 | 323 |
| $20,000 | 646 |

Главный управляемый показатель — contribution profit, а не только выручка или gross margin.

### 16.3. Реклама

`Marketing Contribution = Attributed Revenue - COGS - Variable Fulfillment Costs - Ad Spend`

`Marketing ROI = Marketing Contribution / Ad Spend`

`MER = Total Revenue / Total Marketing Spend`

`ROAS = Attributed Revenue / Attributed Ad Spend`

`Break-even ROAS = 1 / Pre-ad Contribution Margin`

При pre-ad contribution margin 43% break-even ROAS примерно 2.33.

ROAS не равен прибыли.

### 16.4. End Grain Studio

`Annual Tool Benefit = Units × (Labor Saving + Material Saving + Expected Rework Saving) + Avoided Prototype Cost`

`Tool ROI = (Annual Tool Benefit - Annual Operating Cost - Build Cost) / Build Cost`

`Tool Payback Years = Build Cost / (Annual Tool Benefit - Annual Operating Cost)`

Иллюстративный sensitivity scenario:

- 240 досок/год;
- 1.5 часа экономии/доску;
- прямой час 35 долларов;
- 15 долларов снижения material loss/доску;
- 680 долларов предотвращённых prototype losses;
- annual operating cost 2,000 долларов.

Результат:

- labor saving = 12,600 долларов;
- material saving = 3,600 долларов;
- avoided prototype cost = 680 долларов;
- gross annual benefit = 16,880 долларов;
- net annual benefit before build recovery = 14,880 долларов.

При build cost 25,000 долларов ориентировочный payback равен 1.68 года. Это не бюджет и не прогноз; фактическая модель использует time log и material ledger.

### 16.5. Контент

`Content ROI = Attributable Contribution Profit / Content Production Cost`

Хранятся content ID, cost, channel, publish date, assisted conversions, last-click conversions и attributed contribution.

## 17. Cash flow

Моделируются:

- предоплата за древесину;
- кондиционирование;
- длительность производства;
- срок выплаты платформой;
- упаковка;
- shipping labels;
- возвраты;
- гарантийный резерв;
- WIP;
- finished goods.

`Cash Conversion Cycle = Inventory Days + Receivable Days - Payable Days`

Для made-to-order предпочтительно принимать оплату до производства и не обещать lead time без измеренного throughput.

## 18. Финансовые стоп-условия

Нельзя масштабировать рекламу, если:

- COGS не измерен;
- contribution отрицателен;
- не учтена доставка;
- не учтены комиссии;
- нет резерва;
- CAC измеряется только через revenue;
- мощность не подтверждена;
- брак не измерен.

Нельзя расширять каталог, если:

- CUBE 18 не имеет подтверждённого рецепта;
- нет 20 платных заказов;
- нет 10 отзывов;
- нет положительного contribution;
- нет повторяемого lead time.

## 19. KPI

### Продажи

- paid orders;
- net sales;
- AOV;
- units/order;
- option attach rate;
- refunds;
- cancellations.

### Маркетинг

- qualified sessions;
- conversion;
- add-to-cart;
- checkout completion;
- CAC;
- MER;
- channel contribution;
- organic/paid mix.

### Производство

- good units;
- first-pass yield;
- scrap;
- rework;
- direct labor hours;
- cycle time;
- lead time;
- on-time shipment;
- material variance;
- dimension variance.

### Финансы

- COGS/unit;
- gross margin;
- contribution/unit;
- contribution margin;
- inventory cash;
- break-even units remaining;
- cumulative ROI.

### Качество

- defect rate;
- shipping damage;
- warranty claims;
- seam defects;
- flatness rejection;
- rating.

### End Grain Studio

- compile success;
- calculation time;
- material estimate variance;
- time saved;
- manual corrections;
- physical builds;
- independent reproductions.

## 20. 90-дневная программа

### Дни 1–15

- утвердить модуль;
- описать оборудование;
- измерить kerf;
- сделать test rhombus;
- сделать test billet;
- проверить углы;
- зафиксировать оснастку;
- сформировать цифровую геометрию.

Выход: fixture, допуски, фото и operation times.

### Дни 16–30

- изготовить полный прототип;
- измерить material ledger;
- измерить время;
- зафиксировать дефекты;
- получить вес;
- проверить ручки и finish;
- снять контент;
- обновить рецепт.

Выход: prototypeBuilt, preliminary COGS, QC и recipe revision.

### Дни 31–45

- дополнительные эталоны;
- рецепт второму мастеру;
- сбор вопросов;
- корректировка;
- packaging test;
- shipping quotes;
- оценка мощности.

Выход: physicallyVerified/reproduced либо точный список блокеров.

### Дни 46–60

- фотосессия;
- видео;
- product page;
- policies;
- waitlist;
- e-mail flow;
- Etsy draft;
- price test;
- dashboard.

Выход: витрина, checkout и измеряемая воронка.

### Дни 61–90

- открыть 20 мест;
- контролировать channel contribution;
- производить по recipe revision;
- собирать actual cost;
- отгружать;
- получать отзывы;
- пересчитывать ROI;
- не масштабировать убыточный канал.

Выход: фактические заказы, unit economics, производительность и решение о MSRP.

## 21. Dashboard

### Сегодня

- новые заказы;
- блокеры;
- операции;
- материалы;
- сроки;
- QC;
- отгрузки.

### Неделя

- orders;
- throughput;
- on-time;
- COGS;
- contribution;
- spend;
- CAC;
- content.

### Партия

- planned/actual stock;
- planned/actual labor;
- yield;
- defects;
- contribution;
- feedback;
- recipe revision.

### Накопительно

- cumulative contribution;
- recovered investment;
- payback progress;
- ROI;
- repeat purchase;
- SKU/channel comparison.

## 22. Идентификаторы и трассировка

- customer ID;
- order ID;
- order line ID;
- SKU;
- product revision;
- recipe revision;
- batch ID;
- board serial number;
- stock lot ID;
- ManufacturingPlan ID;
- QC ID;
- shipment ID;
- content ID;
- campaign ID.

Board serial number связывает заказ, рецепт, stock, операции, QC, фото, доставку, обращение и отзыв.

## 23. Юридический release gate

До оплаты подтверждаются:

- юридическое лицо;
- payment account;
- sales-tax setup;
- terms;
- privacy;
- shipping;
- returns;
- warranty;
- product-liability insurance;
- паспорта клея, масла и воска;
- происхождение;
- процесс дефектов;
- shipping damage;
- support contact.

Документ не утверждает юридическую готовность, а устанавливает release gate.

## 24. Архитектура репозитория

Стабильный P0 не переносится в начале.

```text
end-grain-board-generator/
├── brand/
│   ├── positioning/
│   ├── claims/
│   └── guidelines/
├── business/
│   ├── product/
│   ├── marketing/
│   ├── operations/
│   ├── finance/
│   └── validation/
├── site/
├── assets/
│   ├── brand/
│   ├── materials/
│   ├── product/
│   └── content/
├── docs/
│   ├── superpowers/specs/
│   ├── technical/
│   ├── manufacturing/
│   └── archive/
├── src/
│   ├── domain/
│   ├── templates/cube18/
│   ├── geometry/
│   ├── manufacturing/
│   ├── validation/
│   ├── costing/
│   ├── rendering/
│   ├── reporting/
│   ├── storage/
│   ├── application/
│   └── ui/
└── tests/
```

Дополнительные продукты станут основанием для отдельного решения о monorepo. Сейчас это преждевременно.

## 25. Декомпозиция

### A. CUBE 18 proof

Геометрия, billet, прототип, измерения и COGS.

### B. End Grain Studio production core

Project V2, CUBE 18 generator, recipe compiler, feasibility, material balance, cost model и print report.

### C. Business foundation

Product definition, claims register, policies, SKU economics и dashboard model.

### D. Marketing package

Positioning, product page, photo/video system, channel assets и launch offer.

### E. Commerce and measurement

Shopify, Etsy, checkout, analytics, order-to-production handoff и contribution dashboard.

Публикация C и D зависит от физического доказательства A.

## 26. Приёмка бизнеса

Минимально рабочий бизнес существует, когда:

- CUBE 18 существует физически;
- рецепт воспроизводим;
- COGS измерен;
- цена установлена;
- contribution рассчитан;
- product page готова;
- checkout работает;
- policies опубликованы;
- упаковка проверена;
- доставка рассчитана;
- заказ проходит до отгрузки;
- serial number связывает данные;
- actual result попадает в dashboard;
- ROI пересчитывается из реальных данных.

Упакованный бизнес существует, когда:

- позиционирование единообразно;
- фото и видео реальны;
- утверждения доказаны;
- контент приводит измеряемый трафик;
- продажи не требуют устного объяснения;
- производство не требует устного объяснения;
- каналы оцениваются по contribution;
- масштабирование имеет stop/go gate.

## 27. Definition of Done первой вертикали

```text
источник
→ продуктовая страница
→ заказ и оплата
→ order specification
→ ManufacturingPlan
→ stock reservation
→ изготовление
→ QC
→ фото
→ упаковка
→ tracking
→ доставка
→ actual COGS
→ contribution profit
→ feedback
→ ROI dashboard
```

Ни один переход не требует скрытой таблицы, неучтённого расхода или неподтверждённого заявления.

## 28. Нефункциональные принципы

- локальная работа Studio не требует backend;
- доменные расчёты не зависят от DOM;
- финансовые формулы тестируются;
- внутренние размеры — мм;
- валюта хранится с ISO code;
- денежные значения рассчитываются в минимальных денежных единицах;
- V1 не перезаписывается;
- изменение входа инвалидирует расчёт;
- director targets маркируются;
- actual values имеют дату и источник;
- ошибка рендера не повреждает рецепт;
- ошибка финансового импорта не заменяет факты;
- зависимости добавляются только по решению владельца.

## 29. Риски

### Продукт

- неверный масштаб модуля;
- чрезмерный вес;
- неудобные ручки;
- непринятие цены.

### Производство

- угловая ошибка;
- небезопасный распил;
- открытые швы;
- разница влажности;
- высокий scrap;
- долгий труд;
- недостаточный open time.

### Маркетинг

- технология затмевает пользу;
- неподтверждённые claims;
- просмотры без покупок;
- смешение gift/self-purchase.

### Финансы

- gross margin принимается за contribution;
- не учтена доставка;
- труд основателя считается бесплатным;
- CAC рассчитан неверно;
- inventory создаёт кассовый разрыв;
- скидки уничтожают прибыль.

### Цифровой продукт

- картинка расходится с производством;
- миграция теряет данные;
- localStorage теряется;
- точность расчёта выше точности входов;
- универсальный scope блокирует CUBE 18.

## 30. Зафиксированные решения

1. DREVOCOD — единый бренд и проект.
2. CUBE 18 — первый коммерческий и производственный сценарий.
3. End Grain Studio сначала внутренний инструмент.
4. Физический продукт предшествует AI-монетизации.
5. Стратегия CUBE 18 — rhombus-hex-billet.
6. Цена 349/389 долларов — директорское решение для проверки.
7. Бизнес управляется contribution margin.
8. ROI рассчитывается из фактического contribution.
9. Gross margin не заменяет contribution.
10. Claims следуют за доказательствами.
11. Новые SKU не блокируют CUBE 18.
12. Масштабирование имеет финансовые стоп-условия.
13. Каждый экземпляр получает serial number.
14. Recipe revision связывается с batch и QC.
15. Итог проекта — заказ, изделие, прибыль и данные, а не только интерфейс.
