/* DEAD LETTER OFFICE — a dependency-free, procedural desk roguelike. */
(() => {
  'use strict';

  const SAVE_KEY = 'dlo:save:v1';
  const PROFILE_KEY = 'dlo:profile:v1';
  const MAX_SHIFTS = 8;
  const MAX_HAND = 6;
  const DEST = { forward: 'ПЕРЕСЛАТЬ', archive: 'АРХИВ', contain: 'ИЗОЛИРОВАТЬ' };
  const SHIFT_DATA = [
    { name: 'ПЕРВИЧНАЯ ПРИЁМКА', quota: 8, difficulty: 'I', tempo: 'НОРМАЛЬНЫЙ', briefing: 'Освойте приоритеты сортировки. Ничего необычного не ожидается. Это уже необычно.' },
    { name: 'ПОНЕДЕЛЬНИК ПО РЕГЛАМЕНТУ', quota: 8, difficulty: 'II', tempo: 'УСКОРЕННЫЙ', briefing: 'Сроки сокращены на один пункт. Понедельник признан смягчающим обстоятельством.' },
    { name: 'ОТДЕЛ ВОЗВРАТОВ', quota: 9, difficulty: 'III', tempo: 'ВОЗВРАТЫ', briefing: 'Некоторая почта вернётся. Она не согласна с вашим решением, но согласна с процедурой.' },
    { name: 'КОМИССИЯ ПО ВРЕМЕНИ', quota: 10, difficulty: 'IV', tempo: 'ПАРАДОКСАЛЬНЫЙ', briefing: 'Документы из завтра могут иметь ценность сегодня. Не уточняйте, как именно.' },
    { name: 'САНИТАРНЫЙ КОРИДОР', quota: 11, difficulty: 'V', tempo: 'ЗАРАЖЁННЫЙ', briefing: 'Заражение распространяется по соседним слотам. Соседство — административная форма близости.' },
    { name: 'КВАРТАЛЬНАЯ ОТЧЁТНОСТЬ', quota: 12, difficulty: 'VI', tempo: 'АУДИТ', briefing: 'Квота требует всех трёх направлений. Бухгалтерия отказывается считать изоляцию «результатом».' },
    { name: 'ЖИВОЙ ПОЧТОВЫЙ МЕШОК', quota: 13, difficulty: 'VII', tempo: 'БЕЗДНА', briefing: 'Специальное отправление порождает угрозы, пока не будет изолировано. Мешок отрицает родство.' },
    { name: 'ПОСЛЕДНИЙ АУДИТ', quota: 12, difficulty: 'VIII', tempo: 'ФИНАЛЬНЫЙ', briefing: 'Все прошлые регламенты действуют одновременно. Департамент уверен, что вы справитесь.' }
  ];

  const CARD_DEFS = {
    inspect: { name: 'Лупа инспектора', type: 'осмотр', icon: '◉', cost: 0, desc: 'Раскрывает все скрытые свойства выбранной посылки.', needs: true },
    uv: { name: 'Ультрафиолетовая печать', type: 'осмотр', icon: '✦', cost: 1, desc: 'Раскрывает аномалии на всей выбранной ленте.', needs: true },
    archiveRequest: { name: 'Запрос в архив', type: 'маршрутизация', icon: '▤', cost: 1, desc: 'Назначает выбранному безопасному отправлению архивный маршрут.', needs: true },
    dossier: { name: 'Протокол вскрытия', type: 'осмотр', icon: '⌁', cost: 2, desc: 'Раскрывает посылку и приносит кредит, если она опасна.', needs: true },
    census: { name: 'Перепись получателей', type: 'осмотр', icon: '☷', cost: 1, desc: 'Показывает получателей всех отправлений на столе.' },
    sideTray: { name: 'Боковой лоток', type: 'лента', icon: '⇆', cost: 1, desc: 'Сдвигает выбранное отправление на позицию ближе к началу.', needs: true },
    priority: { name: 'Приоритетный коридор', type: 'лента', icon: '⇥', cost: 1, desc: 'Перемещает выбранное отправление в начало ленты, срок −1.', needs: true },
    hold: { name: 'Задержать конвейер', type: 'лента', icon: 'Ⅱ', cost: 2, desc: 'Останавливает продвижение всех лент на один ход.' },
    swap: { name: 'Пересадка рейса', type: 'лента', icon: '⤢', cost: 2, desc: 'Меняет местами выбранное и ближайшее отправление.', needs: true },
    seal: { name: 'Красная пломба', type: 'изоляция', icon: '⬟', cost: 1, desc: 'Блокирует следующую аномалию и пропускает один тик срока.', needs: true },
    dryBox: { name: 'Сухой ящик', type: 'изоляция', icon: '▣', cost: 2, desc: 'Снижает заражение до нуля, блокируя следующую аномалию.', needs: true },
    clean: { name: 'Дезактивация', type: 'изоляция', icon: '⌇', cost: 2, desc: 'Очищает выбранное и оба соседних отправления.', needs: true },
    nullStamp: { name: 'Гашение печати', type: 'изоляция', icon: '⊘', cost: 1, desc: 'Подавляет аномалию до конца текущей смены.', needs: true },
    quarantine: { name: 'Комната карантина', type: 'изоляция', icon: '⌑', cost: 3, desc: 'Ставит щит на все опасные или заражённые отправления стола.' },
    duplicate: { name: 'Дублирующий бланк', type: 'манипуляция', icon: '▧', cost: 2, desc: 'Создаёт копию со сроком 2, ценность −2 и заражение +1; щит и связь не копируются.', needs: true },
    retarget: { name: 'Переназначение адреса', type: 'манипуляция', icon: '↺', cost: 1, desc: 'Меняет маршрут: переслать ↔ архив. Не спорит с карантином.', needs: true },
    labels: { name: 'Обмен ярлыками', type: 'манипуляция', icon: '▱', cost: 2, desc: 'Меняет ценность и секретность выбранного отправления с соседним.', needs: true },
    time: { name: 'Размагнитить время', type: 'манипуляция', icon: '◷', cost: 2, desc: 'Возвращает срок выбранного отправления к 3 и добавляет искажение.', needs: true },
    link: { name: 'Сшивка дел', type: 'комбо', icon: '∞', cost: 2, desc: 'Связывает посылку с соседней: обработка даст +2 кредита.', needs: true },
    form: { name: 'Редактор формы', type: 'маршрутизация', icon: '✎', cost: 1, desc: 'Меняет маршрут безопасного письма; заражение −1.', needs: true },
    overtime: { name: 'Сверхурочная смена', type: 'экономика', icon: '＋', cost: 0, desc: 'Даёт 2 энергии. На следующем ходу карт будет на одну меньше.' },
    premium: { name: 'Премия за точность', type: 'экономика', icon: '₽', cost: 1, desc: 'Две следующие верные сортировки дают +2 кредита.', needs: false },
    ledger: { name: 'Расходная ведомость', type: 'экономика', icon: '≡', cost: 1, desc: 'Возвращает 1 энергию и 2 кредита.', needs: false },
    advance: { name: 'Аванс', type: 'экономика', icon: '▰', cost: 2, desc: '+5 кредитов. До финала следующая квота увеличится на 2.', needs: false },
    copy: { name: 'Копирка', type: 'комбо', icon: '⧉', cost: 2, desc: 'Следующая удачная сортировка сработает дважды по награде.', needs: false },
    clip: { name: 'Скрепка дел', type: 'комбо', icon: '⌘', cost: 1, desc: 'Следующая удачная сортировка продлит срок соседней посылки.', needs: false },
    rubber: { name: 'Резиновый штамп', type: 'комбо', icon: '◌', cost: 2, desc: 'Следующая верная сортировка очистит заражение у соседа.', needs: false },
    emergency: { name: 'Приказ №0', type: 'чрезвычайное', icon: '!', cost: 0, desc: 'Мгновенно обрабатывает выбранное письмо. −2 целостности.', needs: true },
    lastHope: { name: 'Печать последней надежды', type: 'чрезвычайное', icon: '✹', cost: 3, desc: 'Поглощает первую ошибку или истечение смены; пассивные защиты сработают позже.', needs: false },
    stamp: { name: 'Канцелярская копирка', type: 'комбо', icon: '✚', cost: 1, desc: 'Следующий архив приносит +4 кредита и увеличивает серию.', needs: false },
    memo: { name: 'Служебная записка', type: 'экономика', icon: '▭', cost: 0, desc: 'Добровольное пожертвование: +2 кредита и добрый взгляд инспектора.', needs: false }
  };

  const ARTIFACT_DEFS = {
    union: { name: 'Союзный справочник', icon: '☷', desc: 'Первая карта стоимостью 2+ каждый ход дешевле на 1.' },
    clock: { name: 'Часы мёртвого почтмейстера', icon: '◷', desc: 'Первое непоглощённое истечение смены получает один дополнительный срок.' },
    blackMarket: { name: 'Чёрная рыночная наклейка', icon: '▰', desc: 'Аномальные верные отправления дают ещё 2 кредита.' },
    recursive: { name: 'Рекурсивная печать', icon: '∞', desc: 'Первый архивный успех каждого хода даёт +3 кредита.' },
    parasite: { name: 'Паразитический конверт', icon: '⌁', desc: 'Первая копия каждого хода даёт +1 кредит и добавляет ещё 1 заражение копии.' },
    machine: { name: 'Сломанная сортировочная машина', icon: '⚙', desc: 'Каждый третий успех подтягивает один случайный слот вперёд.' },
    keys: { name: 'Ящик забытых ключей', icon: '⌗', desc: 'Первая изоляция хода возвращает 1 целостность.' },
    redBook: { name: 'Красная бухгалтерская книга', icon: '▥', desc: 'Заражённые письма приносят вдвое больше кредитов.' },
    rewind: { name: 'Пломба обратного хода', icon: '↶', desc: 'Один раз за смену возвращает одну ленту на шаг назад.' },
    calendar: { name: 'Календарь без понедельников', icon: '▦', desc: 'Каждая временная посылка один раз не теряет срок при задержке.' },
    mug: { name: 'Кружка дежурного', icon: '∪', desc: 'После трёх карт за ход берёт ещё две карты.' },
    medal: { name: 'Медаль за выслугу', icon: '★', desc: 'Первая ошибка или урон от истечения, не снятые другой защитой, не снижают целостность.' }
  };

  const PARCEL_DEFS = [
    { id: 'ordinary', name: 'Обычное письмо', glyph: '✉', dest: 'forward', value: 3, life: 4, danger: false, anomaly: false, text: 'Получатель существует. Это подозрительно нормально.' },
    { id: 'dead', name: 'Письмо умершему', glyph: '†', dest: 'archive', value: 5, life: 3, danger: false, anomaly: true, text: 'Адресат официально скончался, но регулярно расписывается за почту.' },
    { id: 'breathing', name: 'Дышащая посылка', glyph: '◉', dest: 'contain', value: 7, life: 3, danger: true, anomaly: true, text: 'Дыхание синхронизировано с вентилятором. Не синхронизируйте обратно.' },
    { id: 'future', name: 'Документ из завтра', glyph: '◷', dest: 'archive', value: 8, life: 3, danger: false, anomaly: true, temporal: true, text: 'Дата отправки ещё не наступила. Подпись уже устала.' },
    { id: 'room', name: 'Конверт-комната', glyph: '▣', dest: 'forward', value: 6, life: 4, danger: false, anomaly: true, text: 'Внутри имеется помещение. Помещение не числится на балансе.' },
    { id: 'repro', name: 'Размножающийся пакет', glyph: '▧', dest: 'contain', value: 6, life: 2, danger: true, anomaly: true, text: 'Осмотр вызывает копию. Копия вызывает внутреннюю проверку.' },
    { id: 'return', name: 'Возвратное отправление', glyph: '↩', dest: 'forward', value: 5, life: 3, danger: false, anomaly: true, text: 'Уже было доставлено. Не согласно с результатом.' },
    { id: 'black', name: 'Чёрный конверт', glyph: '▰', dest: 'archive', value: 9, life: 2, danger: false, anomaly: true, secret: true, text: 'Секретность: выше ведомственной. Содержимое отрицает себя.' },
    { id: 'self', name: 'Письмо самому себе', glyph: '↺', dest: 'forward', value: 7, life: 3, danger: false, anomaly: true, temporal: true, text: 'Подпись узнаваема. Время подписи — нет.' },
    { id: 'empty', name: 'Пустая декларация', glyph: '□', dest: 'archive', value: 2, life: 4, danger: false, anomaly: false, text: 'В графе «содержимое» написано: «не ваше дело».' },
    { id: 'parasite', name: 'Паразитическая марка', glyph: '⌁', dest: 'contain', value: 8, life: 3, danger: true, anomaly: true, text: 'Марка приклеилась к делу и теперь считает себя сотрудником.' },
    { id: 'nowhere', name: 'Посылка без адреса', glyph: '⊘', dest: 'archive', value: 4, life: 3, danger: false, anomaly: true, text: 'Адресат отсутствует. Отправитель утверждает, что так и планировал.' }
  ];

  const STARTER_DECK = ['inspect', 'seal', 'sideTray', 'archiveRequest', 'time', 'clean', 'premium', 'draw', 'stamp', 'memo'];
  CARD_DEFS.draw = { name: 'Терминология', type: 'осмотр', icon: '✣', cost: 0, desc: 'Берёт две карты и даёт 1 энергию.', needs: false };

  const PARCEL_ART = { ordinary: 'parcel-ordinary', dead: 'parcel-dead', breathing: 'parcel-breathing', future: 'parcel-future', room: 'parcel-room', repro: 'parcel-repro', return: 'parcel-return', black: 'parcel-black', self: 'parcel-self', empty: 'parcel-empty', parasite: 'parcel-parasite', nowhere: 'parcel-nowhere' };
  const CARD_ART = { inspect: 'card-inspect', uv: 'card-uv', archiveRequest: 'card-archiveRequest', dossier: 'card-dossier', census: 'card-census', sideTray: 'card-sideTray', priority: 'card-priority', hold: 'card-hold', swap: 'card-swap', seal: 'card-seal', dryBox: 'card-dryBox', clean: 'card-clean', nullStamp: 'card-nullStamp', quarantine: 'card-quarantine', duplicate: 'card-duplicate', retarget: 'card-retarget', labels: 'card-labels', time: 'card-time', link: 'card-link', form: 'card-form', overtime: 'card-overtime', premium: 'card-premium', ledger: 'card-ledger', advance: 'card-advance', copy: 'card-copy', clip: 'card-clip', rubber: 'card-rubber', emergency: 'card-emergency', lastHope: 'card-lastHope', stamp: 'card-stamp', memo: 'card-memo', draw: 'card-draw' };
  const ARTIFACT_ART = { rewind: 'artifact-rewind', union: 'artifact-union', clock: 'artifact-clock', blackMarket: 'artifact-blackMarket', recursive: 'artifact-recursive', parasite: 'artifact-parasite', machine: 'artifact-machine', keys: 'artifact-keys', redBook: 'artifact-redBook', calendar: 'artifact-calendar', mug: 'artifact-mug', medal: 'artifact-medal' };
  function svgArt(symbol, className = '') { const href = document.getElementById('asset-sprite') ? `#${symbol}` : `assets.svg#${symbol}`; return `<svg class="${className}" viewBox="0 0 100 80" aria-hidden="true" focusable="false"><use href="${href}" xlink:href="${href}" width="100" height="80"></use></svg>`; }
  function parcelArt(p) { return svgArt(PARCEL_ART[p.type] || 'parcel-ordinary', 'parcel-art-svg'); }
  function cardArt(id) { return svgArt(CARD_ART[id] || 'card-inspect', 'card-art-svg'); }
  function artifactArt(id) { return svgArt(ARTIFACT_ART[id] || 'artifact-union', 'artifact-art-svg'); }
  function loadAssetSprite() { fetch('assets.svg').then(response => response.text()).then(markup => { const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml'); const defs = parsed.querySelector('defs'); if (!defs || document.getElementById('asset-sprite')) return; const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sprite.id = 'asset-sprite'; sprite.setAttribute('aria-hidden', 'true'); sprite.appendChild(document.importNode(defs, true)); document.body.prepend(sprite); render(); }).catch(() => {}); }

  const $ = (id) => document.getElementById(id);
  let state = null;
  let profile = loadProfile();
  let audioEnabled = true;
  let audioContext = null;
  let modalReturnFocus = null;

  function readStorage(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function writeStorage(key, value) { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } }
  function removeStorage(key) { try { localStorage.removeItem(key); } catch (_) {} }
  function loadProfile() { const fallback = { runs: 0, wins: 0, bestShift: 0, firstTutorial: true }; try { const saved = JSON.parse(readStorage(PROFILE_KEY)); if (!saved || typeof saved !== 'object') return fallback; const count = value => Number.isFinite(value) ? Math.max(0, value) : 0; return { runs: count(saved.runs), wins: count(saved.wins), bestShift: Math.min(MAX_SHIFTS, count(saved.bestShift)), firstTutorial: typeof saved.firstTutorial === 'boolean' ? saved.firstTutorial : true }; } catch { return fallback; } }
  function saveProfile() { writeStorage(PROFILE_KEY, JSON.stringify(profile)); }
  function randomSeed() { try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] || 123456789; } catch { return Date.now() >>> 0; } }
  function rng() { state.rng = (state.rng * 1664525 + 1013904223) >>> 0; return state.rng / 4294967296; }
  function pick(list) { return list[Math.floor(rng() * list.length)]; }
  function shuffle(list) { for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; } return list; }
  function uid(prefix = 'p') { state.nextId += 1; return `${prefix}-${state.nextId}`; }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }

  function newRun(mode = 'legacy') {
    state = { phase: 'shift', mode, seed: randomSeed(), rng: randomSeed(), nextId: 0, shift: 1, turn: 1, energy: 3, maxEnergy: 3, integrity: 18, maxIntegrity: 18, credits: 16, quota: 0, caseQuota: 0, caseNumber: 1, docket: [], docketOffice: null, processed: 0, shiftProcessed: 0, combo: 0, totalProcessed: 0, mistakes: 0, expired: 0, lanes: [[], [], []], hand: [], handLimit: 5, draw: [...STARTER_DECK], discard: [], deck: [...STARTER_DECK], artifacts: ['union'], selected: null, freeSort: true, frozen: 0, lastCard: null, playedThisTurn: [], repairPurchased: false, nextBonus: 0, nextDouble: false, nextClip: false, nextStamp: false, nextRubber: false, shield: false, shiftFlags: {}, cardCountThisTurn: 0, shiftStats: { forward: 0, archive: 0, contain: 0 }, log: [] };
    state.draw = shuffle(state.draw);
    profile.runs += 1; saveProfile(); startShift(true); saveState();
  }

  function startShift(first = false) {
    const config = SHIFT_DATA[state.shift - 1];
    if (state.mode === 'docket') return startDocketShift(first);
    const carry = { nextBonus: state.nextBonus || 0, nextDouble: !!state.nextDouble, nextClip: !!state.nextClip, nextStamp: !!state.nextStamp, nextRubber: !!state.nextRubber, drawPenalty: !!state.shiftFlags?.drawPenalty };
    state.quota = config.quota + (state.shiftFlags.quotaPlus || 0); state.shiftProcessed = 0; state.turn = 1; state.energy = 3; state.maxEnergy = 3; state.freeSort = true; state.frozen = 0; state.combo = 0; state.nextBonus = carry.nextBonus; state.nextDouble = carry.nextDouble; state.nextClip = carry.nextClip; state.nextStamp = carry.nextStamp; state.nextRubber = carry.nextRubber; state.shield = false; state.cardCountThisTurn = 0; state.lastCard = null; state.playedThisTurn = []; state.shiftStats = { forward: 0, archive: 0, contain: 0 }; state.shiftFlags = { quotaPlus: 0, expProtected: false, rewindUsed: false, recursiveUsed: false, unionUsed: false, keysUsed: false, parasiteUsed: false, mistakesShielded: false, auditNotice: false, drawPenalty: 0 };
    state.lanes = [[], [], []];
    for (let lane = 0; lane < 3; lane++) for (let i = 0; i < 4; i++) state.lanes[lane].push(generateParcel(lane, first && i === 0));
    state.hand = []; state.handLimit = carry.drawPenalty ? 4 : 5; state.draw = shuffle([...state.deck]); state.discard = [];
    drawToFive();
    logEvent(`Смена ${String(state.shift).padStart(2, '0')} начата. Ленты загружены.`);
  }

  function startDocketShift(first = false) {
    const config = SHIFT_DATA[state.shift - 1];
    state.quota = config.quota;
    state.caseQuota = 3 + Math.min(2, Math.floor((state.shift - 1) / 2));
    state.shiftProcessed = 0; state.turn = 1; state.energy = 3; state.maxEnergy = 3; state.combo = 0; state.freeSort = true; state.frozen = 0; state.docket = []; state.docketOffice = null; state.selected = null; state.cardCountThisTurn = 0; state.lastCard = null; state.playedThisTurn = [];
    state.shiftFlags = { quotaPlus: 0, expProtected: false, rewindUsed: false, recursiveUsed: false, unionUsed: false, keysUsed: false, parasiteUsed: false, mistakesShielded: false, auditNotice: false, drawPenalty: 0 };
    state.lanes = [[], [], []];
    const openingTypes = ['dead', 'future', 'ordinary', 'breathing', 'room'];
    for (let i = 0; i < 5; i++) state.lanes[0].push(generateParcel(0, false, state.shift === 1 ? openingTypes[i] : null));
    state.hand = []; state.handLimit = 5; state.draw = shuffle([...state.deck]); state.discard = []; drawToFive();
    logEvent(`Смена ${String(state.shift).padStart(2, '0')} начата. Реестр ждёт дело из ${state.caseQuota} решений.`);
  }

  function generateParcel(lane = 0, guarantee = false, forcedType = null) {
    let def;
    if (forcedType) def = PARCEL_DEFS.find(item => item.id === forcedType) || PARCEL_DEFS[0];
    else if (guarantee) def = PARCEL_DEFS[(state.shift + lane) % PARCEL_DEFS.length];
    else {
      let pool = PARCEL_DEFS.filter(d => state.shift < 3 ? !d.secret || rng() > .35 : true);
      if (state.shift <= 2 && allParcels().filter(p => p.danger).length >= 3) pool = pool.filter(d => !d.danger);
      def = pick(pool);
    }
    const shiftTightening = Math.max(0, state.shift - 2);
    const lifeBase = def.danger ? def.life + 2 : def.life;
    const p = { id: uid(), lane, type: def.id, name: def.name, glyph: def.glyph, dest: def.dest, value: def.value + Math.floor(rng() * 3), life: Math.max(1, lifeBase - (rng() < shiftTightening * .08 ? 1 : 0)), maxLife: lifeBase, danger: !!def.danger, anomaly: !!def.anomaly, temporal: !!def.temporal, secret: !!def.secret, contamination: def.danger ? 1 + (rng() < .3 ? 1 : 0) : (rng() < .14 ? 1 : 0), stability: def.danger ? 1 : 3, text: def.text, revealed: false, shield: false, suppressed: false, linked: false, tilt: (rng() * 5 - 2.5).toFixed(2) };
    if (state.shift >= 5 && rng() < .18) p.contamination += 1;
    return p;
  }

  function allParcels() { return state.lanes.flat(); }
  function findParcel(id) { return id ? allParcels().find(p => p.id === id) : null; }
  function getPosition(p) { const lane = state.lanes[p.lane] || []; return { lane, index: lane.findIndex(x => x.id === p.id) }; }
  function recycleDiscard() { if (!state.discard.length) return; const blocked = new Set(Array.isArray(state.playedThisTurn) ? state.playedThisTurn : (state.lastCard ? [state.lastCard] : [])); const discarded = state.discard.splice(0); const recyclable = discarded.filter(id => !blocked.has(id)); const held = discarded.filter(id => blocked.has(id)); state.discard.push(...held); state.draw = shuffle(recyclable); }
  function drawToFive(limit = state.handLimit ?? 5) { while (state.hand.length < limit && state.draw.length) state.hand.push(state.draw.shift()); if (!state.draw.length && state.discard.length) { recycleDiscard(); while (state.hand.length < limit && state.draw.length) state.hand.push(state.draw.shift()); } }
  function gainEnergy(amount) { state.energy = Math.min(5, state.energy + amount); state.maxEnergy = Math.max(state.maxEnergy, state.energy); }
  function discardCard(id) { state.discard.push(id); }
  function selectedParcel() { return findParcel(state.selected); }
  function requiredDestination(p) { return p.danger || p.contamination > 0 ? 'contain' : p.dest; }
  function neighborFor(p) { const pos = getPosition(p); return pos.index < 0 ? null : pos.lane[pos.index === 0 ? 1 : pos.index - 1] || null; }
  function cardCost(id) { const def = CARD_DEFS[id]; if (!def) return Infinity; const discount = state.artifacts.includes('union') && def.cost >= 2 && !state.shiftFlags.unionUsed ? 1 : 0; return Math.max(0, def.cost - discount); }
  function canPlayDocketCard(id) {
    const supported = ['inspect', 'census', 'clean', 'time', 'link', 'form', 'archiveRequest', 'retarget', 'seal', 'dryBox', 'nullStamp', 'premium', 'ledger', 'advance', 'overtime', 'memo', 'draw'];
    if (!supported.includes(id)) return false;
    if (['premium', 'ledger', 'advance', 'overtime', 'memo', 'draw', 'census'].includes(id)) return true;
    const p = selectedParcel(); if (!p) return false;
    if (id === 'inspect') return !p.revealed;
    if (id === 'clean') return p.contamination > 0 || state.lanes[0].some(x => x.contamination > 0);
    if (id === 'time') return !(p.revealed && p.temporal && p.life === 3);
    if (id === 'link') { const n = neighborFor(p); return !!n && !p.linked && !n.linked; }
    if (id === 'form' || id === 'archiveRequest' || id === 'retarget') return !p.danger && p.contamination <= 0;
    if (id === 'seal') return p.anomaly && !p.shield;
    if (id === 'dryBox') return (p.anomaly || p.contamination > 0) && !p.shield;
    return id === 'nullStamp' && p.anomaly;
  }
  function canPlayCard(id) { if (state.mode === 'docket') return canPlayDocketCard(id); if (id === 'quarantine' && !allParcels().some(p => (p.danger || p.contamination > 0) && !p.shield)) return false; if (id === 'census' && allParcels().every(p => p.revealed)) return false; if (id === 'premium' && state.nextBonus >= 2) return false; if ((id === 'copy' && state.nextDouble) || (id === 'clip' && state.nextClip) || (id === 'rubber' && state.nextRubber) || (id === 'stamp' && state.nextStamp) || (id === 'lastHope' && state.shield)) return false; const def = CARD_DEFS[id]; if (!def?.needs) return true; const p = selectedParcel(); if (!p) return false; const pos = getPosition(p); const neighbor = neighborFor(p); if (id === 'inspect' && p.revealed) return false; if (id === 'uv' && !state.lanes[p.lane].some(x => x.anomaly && !x.revealed)) return false; if (id === 'dossier' && p.revealed && (!p.danger || p.dossierPaid)) return false; if (id === 'clean' && ![p, pos.lane[pos.index - 1], pos.lane[pos.index + 1]].some(x => x?.contamination > 0)) return false; if (id === 'sideTray' && pos.index <= 0) return false; if (id === 'priority' && pos.index <= 0) return false; if (['swap', 'labels', 'link'].includes(id) && !neighbor) return false; if (id === 'labels' && p.value === neighbor.value && p.secret === neighbor.secret) return false; if (id === 'link' && (p.linked || neighbor.linked)) return false; if (id === 'duplicate' && (allParcels().length >= 15 || state.lanes[p.lane].length >= 5)) return false; if (id === 'seal' && (!p.anomaly || p.shield)) return false; if (id === 'nullStamp' && !p.anomaly) return false; if (id === 'dryBox' && ((!p.anomaly && p.contamination <= 0) || p.shield)) return false; if (id === 'time' && p.revealed && p.temporal && p.life === 3) return false; if (id === 'archiveRequest' && (p.danger || p.contamination > 0 || p.dest === 'archive')) return false; if (id === 'retarget' && (p.danger || p.contamination > 0)) return false; if (id === 'form' && p.danger) return false; return true; }

  function logEvent(message, bad = false) { state.log.unshift({ message, bad }); state.log = state.log.slice(0, 7); }
  function toast(message, bad = false) { const el = document.createElement('div'); el.className = `toast${bad ? ' bad' : ''}`; el.innerHTML = message; const stack = $('toast-stack'); while (stack.children.length >= 3) stack.children[0].remove(); stack.appendChild(el); setTimeout(() => el.remove(), 4100); }
  function beep(kind = 'click') { if (!audioEnabled) return; try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); const o = audioContext.createOscillator(); const g = audioContext.createGain(); const freqs = { click: 280, good: 520, bad: 130, stamp: 90, card: 390 }; o.frequency.value = freqs[kind] || 300; o.type = kind === 'stamp' ? 'square' : 'sine'; g.gain.setValueAtTime(.0001, audioContext.currentTime); g.gain.exponentialRampToValueAtTime(kind === 'bad' ? .04 : .08, audioContext.currentTime + .01); g.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + (kind === 'stamp' ? .18 : .1)); o.connect(g); g.connect(audioContext.destination); o.start(); o.stop(audioContext.currentTime + .2); } catch (_) {} }

  function sortSelected(destination) {
    if (!['forward', 'archive', 'contain'].includes(destination)) return toast('Маршрут не зарегистрирован в реестре.', true);
    const p = selectedParcel();
    if (!p) return toast('Сначала выберите отправление на ленте.', true);
    const valid = requiredDestination(p) === destination;
    const emergency = false;
    if (!state.freeSort) return toast('Свободная сортировка уже использована. Карточки ещё могут помочь.', true);
    if (!emergency && getPosition(p).index !== 0) return toast('Свободный штамп работает только с передним слотом ленты.', true);
    if (valid || emergency) {
      processParcel(p, destination, emergency);
    } else {
      if (state.shield) { state.shield = false; logEvent('Печать последней надежды поглотила неверный маршрут.', false); toast('<strong>ПЕЧАТЬ:</strong> ошибка списана в архив.'); } else if (!state.shiftFlags.mistakesShielded && state.artifacts.includes('medal')) { state.shiftFlags.mistakesShielded = true; logEvent('Медаль за выслугу поглотила первую ошибку.', false); toast('<strong>МЕДАЛЬ:</strong> ошибка списана в архив.', false); } else { state.integrity = Math.max(0, state.integrity - 2); state.mistakes += 1; logEvent(`Ошибка маршрутизации: ${p.name} отправлено не туда. −2 целостности.`, true); toast(`<strong>ОШИБКА:</strong> ${DEST[destination]} запрещён пунктом 4-Б.`, true); }
      state.combo = 0; state.freeSort = false; beep('bad');
      if (state.integrity <= 0) return defeat('Учреждение потеряло целостность после серии неверных маршрутов.');
    }
    state.freeSort = false;
    render(); saveState();
  }

  function processParcel(p, destination, emergency = false) {
    const pos = getPosition(p); if (pos.index < 0) return;
    const base = p.value + (state.combo > 1 ? Math.min(state.combo, 3) : 0);
    let reward = emergency ? 1 : base;
    if (!emergency && p.contamination > 0 && state.artifacts.includes('redBook')) reward *= 2;
    if (!emergency && p.anomaly && state.artifacts.includes('blackMarket')) reward += 2;
    if (!emergency && state.nextBonus > 0) { reward += 2; state.nextBonus -= 1; }
    const stampedArchive = !emergency && state.nextStamp && destination === 'archive';
    if (stampedArchive) { reward += 4; state.nextStamp = false; }
    const linkedParcel = p.linked ? findParcel(p.linked) : null;
    const linkedIndex = linkedParcel ? pos.lane.findIndex(x => x.id === linkedParcel.id) : -1;
    const linkedBonus = !!linkedParcel && linkedParcel.linked === p.id && linkedIndex >= 0 && Math.abs(pos.index - linkedIndex) === 1;
    if (linkedBonus) reward += 2;
    if (!emergency && state.nextDouble) { reward *= 2; state.nextDouble = false; }
    const neighbor = pos.lane[pos.index === 0 ? 1 : pos.index - 1]; if (!emergency && state.nextRubber && neighbor) { state.nextRubber = false; neighbor.contamination = 0; toast('РЕЗИНОВЫЙ ШТАМП: соседнее дело очищено.'); }
    state.credits += reward; state.processed += 1; state.shiftProcessed += 1; state.totalProcessed += 1; state.combo += stampedArchive ? 2 : 1; if (state.shiftStats[destination] !== undefined) state.shiftStats[destination] += 1;
    const destName = emergency ? 'ПРИКАЗ №0' : DEST[destination]; logEvent(`${destName}: ${p.name}. +${reward} кр., серия ${state.combo}.`); toast(`<strong>${destName}</strong> подтверждено · +${reward} кредитов`); beep('stamp');
    if (!emergency && state.artifacts.includes('recursive') && destination === 'archive' && !state.shiftFlags.recursiveUsed) { state.shiftFlags.recursiveUsed = true; state.credits += 3; toast('<strong>РЕКУРСИВНАЯ ПЕЧАТЬ:</strong> архив повторил премию · +3'); }
    if (destination === 'contain' && state.artifacts.includes('keys') && !state.shiftFlags.keysUsed) { state.shiftFlags.keysUsed = true; state.integrity = Math.min(state.maxIntegrity, state.integrity + 1); }
    if (linkedBonus) linkedParcel.linked = false;
    pos.lane.splice(pos.index, 1); state.selected = null;
    if (!emergency && state.nextClip) { const neighbor = pos.lane[Math.max(0, pos.index - 1)]; if (neighbor) { state.nextClip = false; neighbor.life = Math.min(neighbor.maxLife + 2, neighbor.life + 1); toast('СКРЕПКА ДЕЛ: соседнее отправление подтянуто к сроку.'); } }
    if (state.artifacts.includes('machine') && state.totalProcessed % 3 === 0) { const candidates = state.lanes.filter(l => l.length > 1); if (candidates.length) { const lane = pick(candidates); lane.unshift(lane.pop()); logEvent('Сортировочная машина дёрнулась и подтянула одну случайную ленту.'); } }
    if (shiftReady()) { if (state.integrity <= 0) defeat('Целостность учреждения исчерпана. Архив временно закрыт изнутри.'); else if (state.shift >= MAX_SHIFTS) victory(); else showReward(); }
  }

  function docketDocs() { return (state.docket || []).map(findParcel).filter(Boolean); }
  function attachDocketParcel(id) {
    const p = findParcel(id); if (!p) return;
    if (state.docket.includes(id)) { state.docket = state.docket.filter(x => x !== id); toast('Отправление возвращено в реестр.'); }
    else if (state.docket.length >= 3) return toast('В одно дело помещаются максимум три отправления.', true);
    else { state.docket.push(id); state.selected = id; toast(`<strong>ДЕЛО ${String(state.caseNumber).padStart(2, '0')}:</strong> ${escapeHtml(p.name)} добавлено.`); }
    render(); saveState();
  }
  function selectDocketOffice(office) { if (!['forward', 'archive', 'contain'].includes(office)) return; state.docketOffice = office; render(); saveState(); }
  function docketSynergies(docs, office) {
    const types = new Set(docs.map(p => p.type)); const names = [];
    const cleanCase = docs.every(p => p.contamination === 0 && !p.danger);
    if (docs.length && docs.every(p => requiredDestination(p) === office)) names.push('СОВПАДЕНИЕ МАРШРУТОВ');
    if (cleanCase && types.has('dead') && types.has('future') && office === 'archive') names.push('МЁРТВЫЙ СРОК');
    if (cleanCase && docs.filter(p => p.temporal).length >= 2 && office === 'archive') names.push('ХРОНОАРХИВ');
    if (docs.some(p => p.danger) && office === 'contain') names.push('КОНТУР КАРАНТИНА');
    if (docs.filter(p => p.contamination > 0).length >= 2 && office === 'contain') names.push('ЦЕПОЧКА ЗАРАЖЕНИЯ');
    if (docs.some(p => p.linked && docs.some(q => q.id === p.linked)) && office !== 'forward') names.push('СШИТОЕ ДЕЛО');
    if (types.has('ordinary') && docs.some(p => p.anomaly) && office === 'forward' && docs.every(p => p.contamination === 0)) names.push('ЛОЖНОЕ СПОКОЙСТВИЕ');
    return names;
  }
  function fileDocketCase() {
    const docs = docketDocs(); const office = state.docketOffice;
    if (docs.length < 2) return toast('Сначала соберите дело минимум из двух отправлений.', true);
    if (!office) return toast('Выберите ведомство, которому уйдёт дело.', true);
    const synergies = docketSynergies(docs, office); const valid = synergies.length > 0;
    const base = docs.reduce((sum, p) => sum + p.value, 0); const reward = valid ? base + docs.length * 2 + synergies.length * 3 : Math.max(0, Math.floor(base / 2));
    state.credits += reward; state.processed += docs.length; state.totalProcessed += docs.length; state.shiftProcessed += 1; state.shiftStats[office] += 1; state.combo = valid ? state.combo + 1 : 0;
    if (valid && state.nextBonus > 0) { state.credits += 2; state.nextBonus -= 1; }
    const label = synergies.length ? synergies.join(' · ') : 'НЕСОВМЕСТИМОЕ ДЕЛО';
    logEvent(`Дело ${String(state.caseNumber).padStart(2, '0')}: ${label}. +${reward} кр.${valid ? '' : ' Ошибка оформлена.'}`, !valid);
    toast(`<strong>${label}</strong> · +${reward} кредитов`, !valid); beep(valid ? 'good' : 'bad');
    const removed = new Set(state.docket); state.lanes[0] = state.lanes[0].filter(p => !removed.has(p.id)); while (state.lanes[0].length < 5) state.lanes[0].push(generateParcel(0));
    state.caseNumber += 1; state.docket = []; state.docketOffice = null; state.selected = null;
    if (shiftReady()) { if (state.shift >= MAX_SHIFTS) victory(); else showReward(); }
    render(); saveState();
  }

  function shiftReady() { if (state.mode === 'docket') return state.shiftProcessed >= state.caseQuota; if (state.shiftProcessed < state.quota) return false; if (state.shift === 6 && (state.shiftStats.forward < 2 || state.shiftStats.archive < 2 || state.shiftStats.contain < 2)) { if (!state.shiftFlags.auditNotice) { state.shiftFlags.auditNotice = true; toast('<strong>КВАРТАЛЬНЫЙ АУДИТ:</strong> нужны минимум 2 пересылки, 2 архива и 2 изоляции.'); logEvent('Квота набрана, но смешанный отчёт ещё не закрыт.', true); } return false; } return true; }

  function playDocketCard(id) {
    const index = state.hand.indexOf(id); if (index < 0) return;
    const def = CARD_DEFS[id]; const cost = cardCost(id);
    if (!canPlayDocketCard(id)) return toast(def.needs ? 'У этой карты сейчас нет допустимой цели.' : 'Карта временно недоступна.', true);
    if (cost > state.energy) return toast('Недостаточно энергии. Канцелярия не принимает кредит доверия.', true);
    if (state.artifacts.includes('union') && def.cost >= 2 && !state.shiftFlags.unionUsed) state.shiftFlags.unionUsed = true;
    state.energy -= cost; state.hand.splice(index, 1); discardCard(id); state.lastCard = id; state.playedThisTurn ||= []; state.playedThisTurn.push(id); state.cardCountThisTurn += 1; beep('card');
    const p = selectedParcel();
    switch (id) {
      case 'inspect': if (p) { p.revealed = true; toast(`Осмотрено: <strong>${escapeHtml(p.name)}</strong>.`); } break;
      case 'census': allParcels().forEach(x => x.revealed = true); toast('Перепись завершена. Реестр теперь знает лишнее.'); break;
      case 'clean': if (p) { state.lanes[0].forEach(x => { if (x.contamination > 0) x.contamination = Math.max(0, x.contamination - 1); }); toast('Дезактивация сняла по одному слою заражения с входящего реестра.'); } break;
      case 'time': if (p) { p.life = 3; p.temporal = true; p.calendarUsed = false; p.revealed = true; toast('Время размагничено. Дело снова выдержит три хода.'); } break;
      case 'link': if (p) { const other = neighborFor(p); if (other) { p.linked = other.id; other.linked = p.id; toast('Дела сшиты. Теперь их можно подать как одно подозрение.'); } } break;
      case 'form': if (p) { p.dest = p.dest === 'forward' ? 'archive' : 'forward'; p.contamination = Math.max(0, p.contamination - 1); p.revealed = true; toast(`Форма отредактирована: ${DEST[p.dest]}.`); } break;
      case 'archiveRequest': if (p) { p.dest = 'archive'; p.revealed = true; toast('Маршрут зарегистрирован: АРХИВ.'); } break;
      case 'retarget': if (p) { p.dest = p.dest === 'forward' ? 'archive' : 'forward'; p.revealed = true; toast(`Адрес изменён: ${DEST[p.dest]}.`); } break;
      case 'seal': if (p) { p.shield = true; toast('Красная пломба удержит аномалию до закрытия дела.'); } break;
      case 'dryBox': if (p) { p.contamination = 0; p.shield = true; toast('Сухой ящик запечатал заражение.'); } break;
      case 'nullStamp': if (p) { p.suppressed = true; p.anomaly = false; toast('Печать погашена до конца смены.'); } break;
      case 'premium': state.nextBonus = 2; toast('Премия зарезервирована на два закрытых дела.'); break;
      case 'ledger': gainEnergy(1); state.credits += 2; toast('Ведомость сошлась: +1 энергия, +2 кредита.'); break;
      case 'advance': state.credits += 5; state.caseQuota = Math.min(5, state.caseQuota + 1); toast(`Аванс получен. Квота текущего реестра увеличена до ${state.caseQuota}.`); break;
      case 'overtime': gainEnergy(2); state.shiftFlags.drawPenalty = 1; toast('Сверхурочная смена одобрена. Реестр не закрывается.'); break;
      case 'memo': state.credits += 2; toast('Записка принята. +2 кредита за участие в документообороте.'); break;
      case 'draw': gainEnergy(1); takeCardsIntoHand(2); toast('Терминология пополнила картотеку.'); break;
    }
    drawToFive(); render(); saveState();
  }

  function playCard(id) {
    if (state.mode === 'docket') return playDocketCard(id);
    const index = state.hand.indexOf(id); if (index < 0) return;
    const def = CARD_DEFS[id]; const cost = cardCost(id);
    if (!canPlayCard(id)) return toast(def.needs ? 'У этой карты сейчас нет допустимой цели.' : 'Карта временно недоступна.', true);
    if (cost > state.energy) return toast('Недостаточно энергии. Канцелярия не принимает кредит доверия.', true);
    if (state.artifacts.includes('union') && def.cost >= 2 && !state.shiftFlags.unionUsed) state.shiftFlags.unionUsed = true;
    state.energy -= cost; state.hand.splice(index, 1); discardCard(id); state.lastCard = id; state.playedThisTurn ||= []; state.playedThisTurn.push(id); state.cardCountThisTurn += 1; beep('card');
    const p = selectedParcel();
    switch (id) {
      case 'inspect': if (p) { p.revealed = true; toast(`Осмотрено: <strong>${escapeHtml(p.name)}</strong>.`); } break;
      case 'uv': if (p) { state.lanes[p.lane].forEach(x => { if (x.anomaly) x.revealed = true; }); toast('Ультрафиолет выявил все аномалии на ленте.'); } break;
      case 'archiveRequest': if (p) { p.dest = 'archive'; p.revealed = true; toast('Маршрут зарегистрирован: АРХИВ.'); } break;
      case 'dossier': if (p) { p.revealed = true; if (p.danger && !p.dossierPaid) { p.dossierPaid = true; state.credits += 3; toast('Опасность подтверждена. Премия за честность: +3.'); } } break;
      case 'census': allParcels().forEach(x => x.revealed = true); toast('Перепись завершена. Сотрудники найдены не все.'); break;
      case 'sideTray': if (p) { const pos = getPosition(p); if (pos.index > 0) [pos.lane[pos.index], pos.lane[pos.index - 1]] = [pos.lane[pos.index - 1], pos.lane[pos.index]]; toast('Отправление переставлено ближе к началу.'); } break;
      case 'priority': if (p) { const pos = getPosition(p); pos.lane.splice(pos.index, 1); pos.lane.unshift(p); p.life = Math.max(1, p.life - 1); toast('Приоритетный коридор активирован. Срок сокращён.'); } break;
      case 'hold': state.frozen = 1; toast('Ленты заморожены до следующего завершения хода.'); break;
      case 'swap': if (p) { const pos = getPosition(p); const other = pos.lane[pos.index === 0 ? 1 : pos.index - 1]; if (other) [pos.lane[pos.index], pos.lane[pos.index === 0 ? 1 : pos.index - 1]] = [other, p]; toast('Рейс пересажен. Надеемся, никто не заметил.'); } break;
      case 'seal': if (p) { p.shield = true; toast('Красная пломба: первая аномалия не считается.'); } break;
      case 'dryBox': if (p) { p.contamination = 0; p.shield = true; toast('Сухой ящик закрыт. Заражение удалено.'); } break;
      case 'clean': if (p) { p.contamination = 0; const pos = getPosition(p); [pos.lane[pos.index - 1], pos.lane[pos.index + 1]].forEach(n => { if (n) n.contamination = 0; }); toast('Дезактивация прошла без отчёта о побочных эффектах.'); } break;
      case 'nullStamp': if (p) { p.suppressed = true; p.anomaly = false; toast('Печать погашена до конца смены.'); } break;
      case 'quarantine': allParcels().filter(x => x.danger || x.contamination > 0).forEach(x => x.shield = true); toast('Комната карантина расширена до размеров стола.'); break;
      case 'duplicate': if (p) duplicateParcel(p); break;
      case 'retarget': if (p && !p.danger) { p.dest = p.dest === 'forward' ? 'archive' : 'forward'; p.revealed = true; toast(`Адрес изменён: ${DEST[p.dest]}.`); } break;
      case 'labels': if (p) { const pos = getPosition(p); const other = pos.lane[pos.index === 0 ? 1 : pos.index - 1]; if (other) { [p.value, other.value] = [other.value, p.value]; [p.secret, other.secret] = [other.secret, p.secret]; toast('Ярлыки обменены. Бухгалтерия почувствовала тревогу.'); } } break;
      case 'time': if (p) { p.life = 3; p.temporal = true; p.calendarUsed = false; p.revealed = true; toast('Время размагничено. Срок восстановлен до 3.'); } break;
      case 'link': if (p) { const pos = getPosition(p); const other = pos.lane[pos.index === 0 ? 1 : pos.index - 1]; if (other) { p.linked = other.id; other.linked = p.id; toast('Дела сшиты. Юридически это теперь одно дело.'); } } break;
      case 'form': if (p && !p.danger) { p.dest = p.dest === 'forward' ? 'archive' : 'forward'; p.contamination = Math.max(0, p.contamination - 1); p.revealed = true; toast(`Форма отредактирована: ${DEST[p.dest]}, заражение снижено.`); } break;
      case 'overtime': gainEnergy(2); state.shiftFlags.drawPenalty = 1; toast('Сверхурочная смена одобрена. Спать запрещено.'); break;
      case 'premium': state.nextBonus = 2; toast('Премия зарезервирована на два успеха.'); break;
      case 'ledger': gainEnergy(1); state.credits += 2; toast('Ведомость сошлась: +1 энергия, +2 кредита.'); break;
      case 'advance': state.credits += 5; if (state.shift < MAX_SHIFTS) state.shiftFlags.quotaPlus = 2; toast(state.shift < MAX_SHIFTS ? 'Аванс получен. Следующая квота увеличится на 2.' : 'Финальный аванс получен. Бухгалтерия закрывает счёт: +5 кредитов.'); break;
      case 'copy': state.nextDouble = true; toast('Копирка готова удвоить следующий успех.'); break;
      case 'clip': state.nextClip = true; toast('Скрепка готова продвинуть соседнее дело.'); break;
      case 'rubber': state.nextRubber = true; toast('Резиновый штамп очистит соседнее дело после следующего успеха.'); break;
      case 'emergency': if (p) { state.integrity = Math.max(0, state.integrity - 2); processParcel(p, 'emergency', true); if (state.phase === 'shift' && state.integrity <= 0) defeat('Приказ №0 съел последние остатки институциональной целостности.'); } break;
      case 'lastHope': state.shield = true; toast('Печать последней надежды активна до первой беды.'); break;
      case 'stamp': state.nextStamp = true; toast('Копирка настроена на архивный успех.'); break;
      case 'memo': state.credits += 2; toast('Записка принята. +2 кредита за участие в документообороте.'); break;
      case 'draw': gainEnergy(1); takeCardsIntoHand(2); toast('Терминология пополнила картотеку.'); break;
    }
    if (state.artifacts.includes('mug') && state.cardCountThisTurn === 3) { takeCardsIntoHand(2); toast('КРУЖКА ДЕЖУРНОГО: три карты — две сверху.'); }
    drawToFive(); render(); saveState();
  }

  function takeCards(n) { const out = []; for (let i = 0; i < n; i++) { if (!state.draw.length && state.discard.length) recycleDiscard(); if (state.draw.length) out.push(state.draw.shift()); } return out; }
  function takeCardsIntoHand(n) { const refillTarget = Number.isInteger(state.handLimit) ? state.handLimit : 5; const handCap = refillTarget < 5 ? refillTarget : MAX_HAND; const room = Math.max(0, handCap - state.hand.length); state.hand.push(...takeCards(Math.min(n, room))); }
  function duplicateParcel(p) { const pos = getPosition(p); if (allParcels().length >= 15) return toast('На столе больше нет свободных слотов. Дубликат остаётся в копировальном аппарате.', true); const parasiteActive = state.artifacts.includes('parasite') && !state.shiftFlags.parasiteUsed; const copy = { ...p, id: uid('copy'), name: `Копия: ${p.name}`, life: 2, maxLife: 2, value: Math.max(1, p.value - 2), contamination: Math.min(3, p.contamination + 1 + (parasiteActive ? 1 : 0)), shield: false, linked: false, dossierPaid: false, tilt: (rng() * 5 - 2.5).toFixed(2) }; pos.lane.splice(Math.min(pos.index + 1, pos.lane.length), 0, copy); if (parasiteActive) { state.shiftFlags.parasiteUsed = true; state.credits += 1; } toast('Создан экземпляр. Канцелярия уже не уверена, какой был первым.'); }

  function endDocketTurn() {
    if (state.docket.length) { state.integrity = Math.max(0, state.integrity - 1); state.mistakes += 1; logEvent('Незакрытое дело оставлено на столе. Реестр взыскал 1 целостность.', true); toast('<strong>НЕЗАКРЫТОЕ ДЕЛО:</strong> −1 целостность.', true); }
    state.docket = []; state.docketOffice = null; state.selected = null;
    state.lanes[0].forEach(p => { if (!p.shield) p.life -= 1; });
    const expired = state.lanes[0].filter(p => p.life <= 0); expired.forEach(expireParcel); state.lanes[0] = state.lanes[0].filter(p => p.life > 0);
    while (state.lanes[0].length < 5) state.lanes[0].push(generateParcel(0));
    const drawLimit = state.shiftFlags.drawPenalty ? 4 : 5;
    state.turn += 1; state.energy = 3; state.maxEnergy = 3; state.cardCountThisTurn = 0; state.hand.forEach(discardCard); state.hand = []; state.handLimit = drawLimit; state.lastCard = null; state.playedThisTurn = []; state.shiftFlags = { ...state.shiftFlags, unionUsed: false, keysUsed: false, recursiveUsed: false, parasiteUsed: false, drawPenalty: 0 }; drawToFive(drawLimit);
    if (state.integrity <= 0) defeat('Целостность учреждения исчерпана. Реестр закрыт изнутри.');
    else if (shiftReady()) { if (state.shift >= MAX_SHIFTS) victory(); else showReward(); }
    render(); saveState();
  }

  function endTurn() {
    if (!state || state.phase !== 'shift') return;
    if (state.mode === 'docket') return endDocketTurn();
    beep('click'); state.selected = null; state.combo = 0; const drawLimit = state.shiftFlags.drawPenalty ? 4 : 5; state.shiftFlags = { ...state.shiftFlags, unionUsed: false, keysUsed: false, recursiveUsed: false, parasiteUsed: false, drawPenalty: 0 };
    const rewindStates = [[], [], []]; const rewindable = [false, false, false];
    if (state.frozen > 0) { state.frozen -= 1; logEvent('Ленты не сдвинулись: задержка конвейера исполнена.'); } else {
      state.lanes.forEach((lane, laneIndex) => {
        lane.forEach(p => { if (p.shield) return; if (state.artifacts.includes('calendar') && p.temporal && !p.calendarUsed) { p.calendarUsed = true; return; } p.life -= 1; });
        const frontId = lane[0]?.id;
        const expired = lane.filter(p => p.life <= 0);
        const frontExpired = expired.some(p => p.id === frontId);
        const rescued = new Set();
        expired.forEach(p => { if (expireParcel(p)) rescued.add(p.id); });
        state.lanes[laneIndex] = lane.filter(p => p.life > 0); rewindStates[laneIndex] = state.lanes[laneIndex].map(p => ({ ...p }));
        if (!frontExpired && state.lanes[laneIndex].length && !rescued.has(state.lanes[laneIndex][0].id) && !state.lanes[laneIndex][0].shield) state.lanes[laneIndex].shift();
        const unrescuedExpiry = expired.some(p => !rescued.has(p.id));
        rewindable[laneIndex] = !frontExpired && !unrescuedExpiry && !!frontId && state.lanes[laneIndex][0]?.id !== frontId;
        if (state.lanes[laneIndex].length < 5) state.lanes[laneIndex].push(generateParcel(laneIndex));
      });
    }
    if (state.artifacts.includes('rewind') && !state.shiftFlags.rewindUsed) { const rewindLane = state.lanes.reduce((best, lane, i) => (!rewindable[i] || !lane.length ? best : best < 0 || (lane[0]?.life || 99) < (state.lanes[best][0]?.life || 99) ? i : best), -1); if (rewindLane >= 0) { state.lanes[rewindLane] = rewindStates[rewindLane].slice(); logEvent(`Пломба обратного хода вернула ленту ${String.fromCharCode(65 + rewindLane)} на один слот.`); toast('<strong>ОБРАТНЫЙ ХОД:</strong> одна лента отмотана.'); } state.shiftFlags.rewindUsed = true; }
    if (state.shift >= 5) spreadContamination();
    state.lanes.forEach(lane => lane.forEach(p => { if (p.shield) p.shield = false; }));
    state.turn += 1; state.energy = 3; state.maxEnergy = 3; state.freeSort = true; state.cardCountThisTurn = 0; state.hand.forEach(discardCard); state.hand = []; state.handLimit = drawLimit; state.lastCard = null; state.playedThisTurn = []; drawToFive();
    if (shiftReady()) { if (state.integrity <= 0) defeat('Целостность учреждения исчерпана. Архив временно закрыт изнутри.'); else if (state.shift >= MAX_SHIFTS) victory(); else showReward(); }
    else if (state.integrity <= 0) defeat('Целостность учреждения исчерпана. Архив временно закрыт изнутри.');
    render(); saveState();
  }

  function expireParcel(p) { state.expired += 1; const safeName = escapeHtml(p.name); const damage = p.danger ? 1 : (state.shift <= 2 ? 0 : 1); if (state.shield) { state.shield = false; p.life = 1; logEvent(`Печать последней надежды спасла ${p.name}.`, false); toast('<strong>ПЕЧАТЬ:</strong> истечение отменено.'); return true; } if (state.artifacts.includes('clock') && !state.shiftFlags.expProtected) { state.shiftFlags.expProtected = true; p.life = 1; logEvent(`Часы мёртвого почтмейстера дали ${p.name} ещё ход.`); toast('<strong>ЧАСЫ:</strong> время задержано на один тик.'); return true; } if (damage > 0 && !state.shiftFlags.mistakesShielded && state.artifacts.includes('medal')) { state.shiftFlags.mistakesShielded = true; p.life = 1; logEvent(`Медаль за выслугу поглотила первое истечение: ${p.name}.`); toast('<strong>МЕДАЛЬ:</strong> первое истечение смены списано без потери целостности.'); return true; } if (damage > 0) { state.integrity = Math.max(0, state.integrity - damage); state.mistakes += 1; logEvent(`Срок истёк: ${p.name}. −${damage} целостности.`, true); toast(`<strong>СРОК ИСТЁК:</strong> ${safeName} теперь числится сотрудником.`, true); } else { logEvent(`Срок истёк: ${p.name}. Учебная смена выдала предупреждение.`); toast(`<strong>ПРЕДУПРЕЖДЕНИЕ:</strong> ${safeName} вернулось в мешок без штрафа.`); } return false; }
  function spreadContamination() { state.lanes.forEach(lane => { const sources = lane.map(p => p.contamination > 0 && !p.shield); lane.forEach((p, i) => { if (sources[i] && lane[i + 1] && !lane[i + 1].shield) lane[i + 1].contamination = Math.min(3, lane[i + 1].contamination + 1); }); }); }

  function showReward() { state.phase = 'reward'; state.repairPurchased = false; state.rewardChoices = createRewards(); render(); saveState(); beep('good'); }
  function createRewards() { const pool = Object.keys(CARD_DEFS).filter(id => !state.deck.includes(id) && !(id === 'advance' && state.shift >= MAX_SHIFTS - 1)); const choices = []; if (pool.length) choices.push({ kind: 'card', id: pick(pool) }); const artPool = Object.keys(ARTIFACT_DEFS).filter(id => !state.artifacts.includes(id)); if (artPool.length) { const firstArtifact = pick(artPool); choices.push({ kind: 'artifact', id: firstArtifact }); if (state.shift % 3 === 0 && artPool.length > 1) { const remainingArtifacts = artPool.filter(id => id !== firstArtifact); choices.push({ kind: 'artifact', id: pick(remainingArtifacts) }); } } if (choices.length < 3) choices.push({ kind: 'repair', amount: 5 }); return choices.slice(0, 3); }
  function chooseReward(index) { const r = state.rewardChoices?.[index]; if (!r) return; if (r.kind === 'card') { state.deck.push(r.id); toast(`<strong>КАРТА ДОБАВЛЕНА:</strong> ${CARD_DEFS[r.id].name}`); } if (r.kind === 'artifact') { state.artifacts.push(r.id); toast(`<strong>АРТЕФАКТ:</strong> ${ARTIFACT_DEFS[r.id].name}`); } if (r.kind === 'repair') { state.integrity = Math.min(state.maxIntegrity, state.integrity + r.amount); state.credits += 4; toast(`<strong>РЕМОНТ:</strong> +${r.amount} целостности и +4 кредита.`); } if (state.shift >= MAX_SHIFTS) { victory(); return; } state.phase = 'shift'; state.shift += 1; state.rewardChoices = null; startShift(); render(); saveState(); }

  function victory() { state.phase = 'victory'; profile.wins += 1; profile.bestShift = Math.max(profile.bestShift, MAX_SHIFTS); saveProfile(); clearSave(); render(); beep('good'); }
  function defeat(reason) { state.phase = 'defeat'; state.defeatReason = reason; profile.bestShift = Math.max(profile.bestShift, state.shift); saveProfile(); clearSave(); render(); beep('bad'); }
  function normalizeLinks() { const parcels = allParcels(); parcels.forEach(p => { if (p.linked === false) return; const other = parcels.find(q => q.id === p.linked); const pos = other ? getPosition(p) : null; const otherPos = other ? getPosition(other) : null; if (!other || other.linked !== p.id || p.lane !== other.lane || pos.index < 0 || otherPos.index < 0 || Math.abs(pos.index - otherPos.index) !== 1) p.linked = false; }); }
  function saveState() { if (!state || ['victory', 'defeat'].includes(state.phase)) return; normalizeLinks(); if (!writeStorage(SAVE_KEY, JSON.stringify(state))) toast('Не удалось записать автосохранение. Бумажная копия не предусмотрена.', true); }
  function clearSave() { removeStorage(SAVE_KEY); }
  function validCardList(list) { return Array.isArray(list) && list.every(id => CARD_DEFS[id]); }
  function validParcel(p) { const def = p && PARCEL_DEFS.find(d => d.id === p.type); return !!(p && def && typeof p.id === 'string' && p.id.trim().length > 0 && p.id.length <= 80 && Number.isInteger(p.lane) && p.lane >= 0 && p.lane < 3 && typeof p.name === 'string' && p.name.length <= 120 && typeof p.glyph === 'string' && p.glyph.length <= 8 && typeof p.text === 'string' && p.text.length <= 500 && typeof p.danger === 'boolean' && p.danger === !!def.danger && ['anomaly', 'temporal', 'secret', 'revealed', 'shield', 'suppressed'].every(k => typeof p[k] === 'boolean') && (p.calendarUsed === undefined || typeof p.calendarUsed === 'boolean') && (!p.anomaly || !!def.anomaly) && Number.isInteger(p.stability) && p.stability >= 1 && p.stability <= 3 && Number.isInteger(p.value) && p.value >= 1 && p.value <= 11 && Number.isInteger(p.life) && p.life > 0 && Number.isInteger(p.maxLife) && p.maxLife > 0 && p.life <= p.maxLife + 2 && Number.isInteger(p.contamination) && p.contamination >= 0 && p.contamination <= 3 && ['forward', 'archive', 'contain'].includes(p.dest) && (p.dest !== 'contain' || p.danger)); }
  function validSave(x) {
    const rewardsOk = x?.phase !== 'reward' || (Number.isInteger(x.shift) && x.shift < MAX_SHIFTS && Array.isArray(x.rewardChoices) && x.rewardChoices.length >= 1 && x.rewardChoices.length <= 3 && x.rewardChoices.every(r => r && ['card', 'artifact', 'repair'].includes(r.kind) && (r.kind === 'repair' ? Number.isInteger(r.amount) && r.amount === 5 : (typeof r.id === 'string' && (r.kind === 'card' ? CARD_DEFS[r.id] : ARTIFACT_DEFS[r.id])))));
    const logOk = Array.isArray(x?.log) && x.log.length <= 7 && x.log.every(e => e && typeof e.message === 'string' && e.message.length <= 500 && (e.bad === undefined || typeof e.bad === 'boolean'));
    const deckSizeOk = Array.isArray(x?.deck) && x.deck.length >= 5 && x.deck.length <= STARTER_DECK.length + MAX_SHIFTS && new Set(x.deck).size === x.deck.length;
    const playedCardsOk = Array.isArray(x?.playedThisTurn ?? []) && (x.playedThisTurn ?? []).length <= (Array.isArray(x?.deck) ? x.deck.length : 0) && new Set(x.playedThisTurn ?? []).size === (x.playedThisTurn ?? []).length && validCardList(x.playedThisTurn ?? []) && (x.playedThisTurn ?? []).every(id => x.deck.includes(id));
    const baseQuota = Number.isInteger(x?.shift) ? SHIFT_DATA[x.shift - 1]?.quota : null;
    const quotaOk = Number.isInteger(x?.quota) && Number.isInteger(baseQuota) && x.quota >= baseQuota && x.quota <= baseQuota + 2;
    const countersOk = ['quota', 'shiftProcessed', 'processed', 'totalProcessed', 'combo', 'credits', 'mistakes', 'expired', 'frozen', 'cardCountThisTurn'].every(k => Number.isFinite(x?.[k])) && Number.isInteger(x.turn) && Number.isInteger(x.processed) && x.processed >= 0 && Number.isInteger(x.totalProcessed) && x.totalProcessed >= 0 && Number.isInteger(x.combo) && x.combo >= 0 && Number.isInteger(x.credits) && x.credits >= 0 && Number.isInteger(x.frozen) && x.frozen >= 0 && x.frozen <= 1 && Number.isInteger(x.cardCountThisTurn) && x.cardCountThisTurn >= 0 && quotaOk && Number.isInteger(x.shiftProcessed) && x.shiftProcessed >= 0;
    const flagsOk = x?.shiftFlags && typeof x.shiftFlags === 'object' && Number.isInteger(x.shiftFlags.quotaPlus) && x.shiftFlags.quotaPlus >= 0 && x.shiftFlags.quotaPlus <= 2 && Number.isInteger(x.shiftFlags.drawPenalty) && x.shiftFlags.drawPenalty >= 0 && x.shiftFlags.drawPenalty <= 1 && ['expProtected', 'rewindUsed', 'recursiveUsed', 'unionUsed', 'keysUsed', 'parasiteUsed', 'mistakesShielded', 'auditNotice'].every(k => typeof x.shiftFlags[k] === 'boolean');
    const scalarOk = Number.isFinite(x?.seed) && Number.isFinite(x?.rng) && Number.isInteger(x?.integrity) && Number.isInteger(x?.maxIntegrity) && x.maxIntegrity > 0 && x.integrity >= 0 && x.integrity <= x.maxIntegrity && Number.isInteger(x?.energy) && Number.isInteger(x?.maxEnergy) && x.maxEnergy >= 3 && x.maxEnergy <= 5 && x.energy >= 0 && x.energy <= x.maxEnergy && Number.isFinite(x?.nextId) && typeof x?.freeSort === 'boolean' && (x.repairPurchased === undefined || typeof x.repairPurchased === 'boolean');
    const effectsOk = Number.isInteger(x?.nextBonus) && x.nextBonus >= 0 && x.nextBonus <= 2 && ['nextDouble', 'nextClip', 'nextStamp', 'nextRubber', 'shield'].every(k => typeof x?.[k] === 'boolean');
    const multisetKey = list => Object.entries(list.reduce((counts, id) => { counts[id] = (counts[id] || 0) + 1; return counts; }, {})).sort(([a], [b]) => a.localeCompare(b)).map(([id, count]) => `${id}:${count}`).join('|');
    const inventoryOk = x && multisetKey([...(x.hand || []), ...(x.draw || []), ...(x.discard || [])]) === multisetKey(x.deck || []);
    const routeStatsOk = x?.shiftStats && ['forward', 'archive', 'contain'].every(k => Number.isInteger(x.shiftStats[k]) && x.shiftStats[k] >= 0) && ['forward', 'archive', 'contain'].reduce((total, k) => total + x.shiftStats[k], 0) <= (x.shiftProcessed || 0);
    const auditPending = x?.shift === 6 && x.shiftProcessed >= x.quota && x.shiftStats && ['forward', 'archive', 'contain'].some(k => x.shiftStats[k] < 2);
    const quotaProgressOk = x?.phase !== 'shift' || x.shiftProcessed < x.quota || auditPending;
    const artifactsOk = Array.isArray(x?.artifacts) && x.artifacts.length <= Object.keys(ARTIFACT_DEFS).length && x.artifacts.every(id => ARTIFACT_DEFS[id]) && new Set(x.artifacts).size === x.artifacts.length;
    const modeOk = !x?.mode || ['legacy', 'docket'].includes(x.mode);
    const lane0Ids = new Set(Array.isArray(x?.lanes?.[0]) ? x.lanes[0].map(p => p?.id) : []);
    const docketOk = x?.mode !== 'docket' || (Number.isInteger(x.caseQuota) && x.caseQuota >= 3 && x.caseQuota <= 5 && Number.isInteger(x.caseNumber) && x.caseNumber >= 1 && Array.isArray(x.docket) && x.docket.length <= 3 && new Set(x.docket).size === x.docket.length && x.docket.every(id => typeof id === 'string' && lane0Ids.has(id)) && (x.docketOffice === null || ['forward', 'archive', 'contain'].includes(x.docketOffice)));
    const docketProgressOk = x?.mode !== 'docket' || x.phase !== 'shift' || x.shiftProcessed < x.caseQuota;
    if (!x || !['shift', 'reward', 'pause'].includes(x.phase) || !modeOk || !docketOk || !docketProgressOk || !rewardsOk || !logOk || !deckSizeOk || !playedCardsOk || !countersOk || !flagsOk || !scalarOk || !effectsOk || !inventoryOk || !routeStatsOk || !quotaProgressOk || !Number.isInteger(x.shift) || x.shift < 1 || x.shift > MAX_SHIFTS || !Array.isArray(x.lanes) || x.lanes.length !== 3 || x.lanes.some(l => !Array.isArray(l) || l.length > 5) || !validCardList(x.hand) || !validCardList(x.deck) || !validCardList(x.draw) || !validCardList(x.discard) || !artifactsOk || !x.shiftStats) return false;
    if (x.handLimit !== undefined && (!Number.isInteger(x.handLimit) || x.handLimit < 1 || x.handLimit > 5)) return false;
    const parcels = x.lanes.flat();
    const linksOk = parcels.every(p => { if (p.linked === false) return true; if (typeof p.linked !== 'string') return false; const lane = x.lanes[p.lane]; const index = lane.findIndex(q => q.id === p.id); const otherIndex = lane.findIndex(q => q.id === p.linked); return otherIndex >= 0 && Math.abs(index - otherIndex) === 1 && lane[otherIndex].linked === p.id; });
    return parcels.every(validParcel) && linksOk && x.lanes.every((lane, laneIndex) => lane.every(p => p.lane === laneIndex)) && new Set(parcels.map(p => p.id)).size === parcels.length;
  }
  function hasUsableSave() { const raw = readStorage(SAVE_KEY); if (!raw) return false; try { if (validSave(JSON.parse(raw))) return true; } catch (_) {} writeStorage(`${SAVE_KEY}:corrupt`, raw); clearSave(); return false; }
  function loadSave() { const raw = readStorage(SAVE_KEY); if (!raw) return false; try { const x = JSON.parse(raw); if (validSave(x)) { state = x; state.playedThisTurn = Array.isArray(state.playedThisTurn) ? state.playedThisTurn : []; state.repairPurchased = state.repairPurchased === true; state.log = Array.isArray(state.log) ? state.log.filter(e => e && typeof e === 'object' && typeof e.message === 'string').map(e => ({ message: e.message, bad: e.bad === true })) : []; state.energy = Math.min(5, Math.max(0, state.energy)); state.maxEnergy = Math.min(5, Math.max(3, state.maxEnergy, state.energy)); state.handLimit = Number.isFinite(state.handLimit) ? Math.max(1, Math.min(5, state.handLimit)) : 5; if (state.hand.length > MAX_HAND) state.draw.unshift(...state.hand.splice(MAX_HAND)); writeStorage(SAVE_KEY, JSON.stringify(state)); return true; } } catch (_) {} writeStorage(`${SAVE_KEY}:corrupt`, raw); clearSave(); return false; }

  function render() {
    $('menu-screen').classList.toggle('hidden', !!state && state.phase !== 'menu'); $('game-screen').classList.toggle('hidden', !state || state.phase === 'menu');
    $('continue-btn').classList.toggle('hidden', !hasUsableSave());
    if (!state || state.phase === 'menu') return;
    if (state.phase === 'shift') renderGame();
    if (state.phase === 'reward') renderGame(); renderModal();
  }
  function renderGame() {
    if (state.mode === 'docket') return renderDocketGame();
    const config = SHIFT_DATA[state.shift - 1] || SHIFT_DATA[7]; $('shift-number').textContent = `${String(state.shift).padStart(2, '0')} / 08`; $('shift-name').textContent = config.name; $('quota-value').textContent = `${state.shiftProcessed} / ${state.quota}`; $('credits-value').textContent = state.credits; $('energy-value').textContent = `${state.energy} / ${state.maxEnergy}`; $('integrity-value').textContent = `${state.integrity} / ${state.maxIntegrity}`; $('compact-quota-value').textContent = `${state.shiftProcessed} / ${state.quota}`; $('compact-credits-value').textContent = state.credits; $('compact-integrity-value').textContent = `${state.integrity} / ${state.maxIntegrity}`; $('integrity-fill').style.width = `${Math.max(0, state.integrity / state.maxIntegrity * 100)}%`; $('briefing-text').innerHTML = `<b>ЦЕЛЬ:</b> обработать ${state.quota} отправлений.<br>${config.briefing}`; $('quota-percent').textContent = `${Math.min(100, Math.round(state.shiftProcessed / state.quota * 100))}%`; $('quota-fill').style.width = `${Math.min(100, state.shiftProcessed / state.quota * 100)}%`; $('turn-number').textContent = String(state.turn).padStart(2, '0'); const incoming = String(allParcels().length + state.shift + 2).padStart(2, '0'); $('incoming-count').textContent = incoming; $('incoming-count-context').textContent = incoming; $('tempo-value').textContent = config.tempo; $('tempo-value-context').textContent = config.tempo; $('difficulty-value').textContent = config.difficulty; $('hand-count').textContent = state.hand.length; $('artifact-count').textContent = state.artifacts.length; $('artifact-count-context').textContent = state.artifacts.length; $('desk-status').textContent = state.integrity < 5 ? 'ТРЕВОГА' : 'ГОТОВ'; $('desk-status').style.color = state.integrity < 5 ? 'var(--red2)' : 'var(--green2)';
    renderRules(config); renderArtifacts(); renderLog(); renderLanes(); renderInspector(); renderHand(); renderArmedEffects();
    $('mute-btn').textContent = `◖ ЗВУК: ${audioEnabled ? 'ВКЛ' : 'ВЫКЛ'}`;
  }
  function renderDocketGame() {
    const config = SHIFT_DATA[state.shift - 1] || SHIFT_DATA[7];
    $('shift-number').textContent = `${String(state.shift).padStart(2, '0')} / 08`; $('shift-name').textContent = 'РЕЕСТР ДЕЛ'; $('quota-value').textContent = `${state.shiftProcessed} / ${state.caseQuota}`; $('credits-value').textContent = state.credits; $('energy-value').textContent = `${state.energy} / ${state.maxEnergy}`; $('integrity-value').textContent = `${state.integrity} / ${state.maxIntegrity}`; $('compact-quota-value').textContent = `${state.shiftProcessed} / ${state.caseQuota}`; $('compact-credits-value').textContent = state.credits; $('compact-integrity-value').textContent = `${state.integrity} / ${state.maxIntegrity}`; $('integrity-fill').style.width = `${Math.max(0, state.integrity / state.maxIntegrity * 100)}%`; $('briefing-text').innerHTML = `<b>ЦЕЛЬ:</b> закрыть ${state.caseQuota} дела.<br>Соберите 2–3 отправления и найдите правило, которое связывает их.`; $('quota-percent').textContent = `${Math.min(100, Math.round(state.shiftProcessed / state.caseQuota * 100))}%`; $('quota-fill').style.width = `${Math.min(100, state.shiftProcessed / state.caseQuota * 100)}%`; $('turn-number').textContent = String(state.turn).padStart(2, '0'); const incoming = String(state.lanes[0].length).padStart(2, '0'); $('incoming-count').textContent = incoming; $('incoming-count-context').textContent = incoming; $('tempo-value').textContent = 'ДЕЛА'; $('tempo-value-context').textContent = 'ДЕЛА'; $('difficulty-value').textContent = config.difficulty; $('hand-count').textContent = state.hand.length; $('artifact-count').textContent = state.artifacts.length; $('artifact-count-context').textContent = state.artifacts.length; $('desk-status').textContent = state.integrity < 5 ? 'ТРЕВОГА' : 'РЕЕСТР ОТКРЫТ'; $('desk-status').style.color = state.integrity < 5 ? 'var(--red2)' : 'var(--green2)';
    const eyebrow = document.querySelector('.desk-title .eyebrow'); if (eyebrow) eyebrow.textContent = 'СЕКТОР 7 · КАНЦЕЛЯРИЯ СВЯЗЕЙ';
    renderRules(config); renderArtifacts(); renderLog(); renderDocketBoard(); renderInspector(); renderHand(); renderArmedEffects();
    $('mute-btn').textContent = `◖ ЗВУК: ${audioEnabled ? 'ВКЛ' : 'ВЫКЛ'}`;
  }
  function renderDocketBoard() {
    const docket = new Set(state.docket || []);
    const intake = state.lanes[0].map(p => `<div class="docket-parcel-wrap ${docket.has(p.id) ? 'in-docket' : ''}">${parcelHtml(p, state.lanes[0][0]?.id === p.id)}<button class="docket-attach" data-docket-add="${escapeHtml(p.id)}">${docket.has(p.id) ? 'УБРАТЬ ИЗ ДЕЛА' : 'В ДЕЛО'}</button></div>`).join('');
    const slots = [0, 1, 2].map(i => { const p = findParcel(state.docket[i]); return p ? `<div class="case-slot filled"><span class="case-index">${i + 1}</span>${parcelArt(p)}<b>${escapeHtml(p.name)}</b><small>${p.revealed ? DEST[requiredDestination(p)] : 'НЕ ПРОВЕРЕНО'}</small><button data-docket-remove="${escapeHtml(p.id)}" aria-label="Убрать из дела">×</button></div>` : `<div class="case-slot"><span class="case-index">${i + 1}</span><strong>СВОБОДНЫЙ ЛИСТ</strong><small>добавьте отправление</small></div>`; }).join('');
    const office = state.docketOffice;
    $('conveyors').innerHTML = `<section class="docket-board"><div class="docket-board-head"><div><span class="board-kicker">ЖУРНАЛ ВХОДЯЩИХ</span><h3>Соберите одно дело из нескольких отправлений</h3><p>Ищите совпадение маршрутов или особую связку. Несовместимое дело всё равно закроется, но учреждение выставит счёт.</p></div><div class="docket-meter"><b>${state.shiftProcessed} / ${state.caseQuota}</b><small>дел закрыто</small></div></div><div class="intake-label"><span>ВХОДЯЩИЙ РЕЕСТР</span><small>Клик — изучить · «В дело» — вложить</small></div><div class="docket-intake">${intake}</div><div class="case-tray"><div class="case-tray-head"><span>ДЕЛО ${String(state.caseNumber).padStart(2, '0')}</span><small>${state.docket.length} / 3 вложения</small></div><div class="case-slots">${slots}</div></div><div class="docket-offices"><span>КУДА ПОДАТЬ ДЕЛО</span>${[['forward','ПЕРЕСЫЛКА'],['archive','АРХИВ'],['contain','КАРАНТИН']].map(([id,label]) => `<button class="docket-office ${office === id ? 'selected' : ''} ${office === id ? `office-${id}` : ''}" data-docket-office="${id}">${label}</button>`).join('')}</div><div class="docket-status-line">${state.docket.length ? (office ? `Маршрут выбран: <b>${DEST[office]}</b>. Ищите подтверждение в составе.` : 'Состав собран. Теперь выберите ведомство.') : 'Реестр пуст. Три отправления — максимум, два — минимум.'}</div></section>`;
    $('action-dock').innerHTML = `<div class="dock-note"><span class="keyboard-key">SPACE</span><span>закрыть текущий ход</span><span class="free-sort">ДЕЛО ${String(state.caseNumber).padStart(2, '0')}</span></div><div class="docket-actions"><button class="docket-file" data-file-case ${state.docket.length < 2 || !office ? 'disabled' : ''}>ЗАКРЫТЬ ДЕЛО<small>проверить связки и получить кредит</small></button><button id="end-turn-btn" class="end-turn"><span>▶</span><b>ЗАВЕРШИТЬ ХОД</b><small>сроки входящих уменьшатся</small></button></div>`;
  }
  function renderRules(config) { const rules = [`Опасное или заражённое → <b>изоляция</b>`, `Мёртвое, неизвестное или из будущего → <b>архив</b>`, `Обычное и стабильное → <b>пересылка</b>`]; if (state.shift >= 5) rules.push('Заражение движется вправо по соседству'); $('active-rules').innerHTML = rules.map((x, i) => `<div class="rule-item"><b>${i === 0 ? '!' : i === 1 ? '◷' : '↗'}</b><span>${x}</span></div>`).join(''); }
  function renderArtifacts() { $('artifact-list').innerHTML = state.artifacts.length ? state.artifacts.map(id => `<div class="artifact">${artifactArt(id)}<div><b>${ARTIFACT_DEFS[id]?.name || id}</b><small>${ARTIFACT_DEFS[id]?.desc || ''}</small></div></div>`).join('') : '<small style="color:#758074">Пока пусто. Архив любит свободные полки.</small>'; }
  function renderArmedEffects() { const effects = []; if (state.nextBonus > 0) effects.push(`ПРЕМИЯ ×${state.nextBonus}`); if (state.nextDouble) effects.push('УДВОЕНИЕ'); if (state.nextClip) effects.push('СКРЕПКА'); if (state.nextRubber) effects.push('РЕЗИНА'); if (state.nextStamp) effects.push('АРХИВ +4'); if (state.shiftFlags.drawPenalty) effects.push('РУКА −1'); if (state.shield) effects.push('ПЕЧАТЬ'); const el = $('armed-effects'); el.textContent = effects.length ? `АКТИВНО: ${effects.join(' · ')}` : 'ЭФФЕКТЫ: —'; el.title = effects.length ? effects.join(' · ') : 'Нет вооружённых эффектов'; el.classList.toggle('empty', !effects.length); }
  function renderLog() { $('event-log').innerHTML = state.log.map(e => `<div class="log-line ${e.bad ? 'bad' : ''}">${e.bad ? '⚠ ' : '› '} ${escapeHtml(e.message)}</div>`).join(''); }
  function renderLanes() { $('conveyors').innerHTML = state.lanes.map((lane, li) => `<div class="belt"><div class="belt-head"><b>ЛЕНТА ${String.fromCharCode(65 + li)} · ВХОД ←</b><i>позиция 01 — ближе к штампу</i></div><div class="belt-slots">${Array.from({ length: 5 }, (_, i) => lane[i] ? parcelHtml(lane[i], i === 0) : '<div class="parcel empty-slot"><span>СВОБОДНО</span><small>слот ' + String(i + 1).padStart(2, '0') + '</small></div>').join('')}</div></div>`).join(''); }
  function parcelHtml(p, front) { const route = p.revealed ? DEST[requiredDestination(p)] : (p.danger ? 'АНОМАЛИЯ · ИЗОЛИРОВАТЬ' : 'НЕ ПРОВЕРЕНО'); const label = `${p.name}. ${route}. Срок ${p.life}. Стоимость ${p.value} кредитов.`; const tilt = Number.isFinite(Number(p.tilt)) ? Number(p.tilt) : 0; return `<button type="button" class="parcel parcel-${escapeHtml(p.type)} ${p.danger ? 'anomaly' : ''} ${p.life <= 1 ? 'urgent' : ''} ${state.selected === p.id ? 'selected' : ''}" data-parcel-id="${escapeHtml(p.id)}" aria-label="${escapeHtml(label)}" aria-pressed="${state.selected === p.id}" style="--tilt:${tilt}deg"><div class="parcel-code">${escapeHtml(p.id.toUpperCase())} · ${front ? 'ШТАМП' : 'ОЖИДАНИЕ'}</div><div class="parcel-art">${parcelArt(p)}</div><div class="parcel-name">${escapeHtml(p.name)}</div><div class="parcel-destination">${p.revealed ? DEST[requiredDestination(p)] : (p.danger ? 'АНОМАЛИЯ' : 'НЕ ПРОВЕРЕНО')}</div><div class="parcel-foot"><span class="deadline">СРОК ${p.life}</span><span>${p.value} кр.</span></div></button>`; }
  function renderInspector() { const p = selectedParcel(); $('inspector-empty').classList.toggle('hidden', !!p); $('inspector-content').classList.toggle('hidden', !p); if (!p) return; const facts = `${p.danger ? '<span class="fact danger">ОПАСНОСТЬ</span>' : '<span class="fact">СТАБИЛЬНО</span>'}${p.revealed ? `<span class="fact">СТАБИЛЬНОСТЬ ${p.stability}</span>` : '<span class="fact">ПОЛУСКРЫТО</span>'}${p.contamination ? `<span class="fact danger">ЗАРАЖЕНИЕ ${p.contamination}</span>` : '<span class="fact">ЧИСТО</span>'}${p.secret ? '<span class="fact danger">СЕКРЕТНО</span>' : ''}${p.temporal ? '<span class="fact">ИСКАЖЕНИЕ ВРЕМЕНИ</span>' : ''}${p.shield ? '<span class="fact">ПЕЧАТЬ</span>' : ''}`; const route = p.revealed || p.danger || p.contamination > 0 ? DEST[requiredDestination(p)] : 'НЕ ОПРЕДЕЛЁН'; const quickDestination = requiredDestination(p); const quick = getPosition(p).index === 0 && (p.revealed || p.danger || p.contamination > 0) ? `<button class="tiny-action" data-quick-sort="${quickDestination}">быстрая сортировка</button>` : ''; $('inspector-content').innerHTML = `<div class="inspector-grid"><div class="inspector-title"><span class="inspector-art">${parcelArt(p)}</span>${escapeHtml(p.name)}<small>${escapeHtml(p.text)}</small></div><div class="inspect-facts">${facts}</div><div class="inspector-destination">МАРШРУТ <b>${route}</b></div><div class="inspector-buttons"><button class="tiny-action" data-inspect="true">осмотреть</button>${quick}</div></div>`; }
  function renderHand() { const hand = $('hand'); hand.style.setProperty('--hand-columns', String(Math.min(6, Math.max(5, state.hand.length)))); hand.innerHTML = state.hand.map(id => { const c = CARD_DEFS[id]; const cost = cardCost(id); const disabled = cost > state.energy || !canPlayCard(id); const description = state.mode === 'docket' && id === 'advance' ? 'Даёт 5 кредитов и увеличивает квоту этого реестра на 1.' : c.desc; const normalizedDescription = description.endsWith('.') ? description : `${description}.`; const label = `${c.name}. ${normalizedDescription} Стоимость ${cost} энергии${disabled ? '. Сейчас недоступна.' : '.'}`; return `<button type="button" class="card ${disabled ? 'disabled' : ''}" data-card-id="${id}" aria-label="${label}" aria-disabled="${disabled}"${disabled ? ' disabled tabindex="-1"' : ''}><span class="card-cost" aria-hidden="true">${cost}</span><div class="card-icon">${cardArt(id)}</div><div class="card-name">${c.name}</div><div class="card-type">${c.type}</div><div class="card-desc">${normalizedDescription}</div></button>`; }).join(''); }

  function modalFocusables() { return [...$('modal').querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null); }
  function openModal(html) {
    const active = document.activeElement;
    if (active && active !== document.body && !$('modal').contains(active)) modalReturnFocus = active;
    $('modal').innerHTML = html;
    const heading = $('modal').querySelector('h1, h2');
    if (heading) { heading.id = heading.id || 'modal-title'; $('modal').setAttribute('aria-labelledby', heading.id); $('modal').removeAttribute('aria-label'); } else { $('modal').setAttribute('aria-label', 'Диалог'); $('modal').removeAttribute('aria-labelledby'); }
    $('modal-layer').classList.remove('hidden'); $('modal-layer').setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => { const first = modalFocusables()[0]; (first || $('modal')).focus(); });
  }
  function closeModal() {
    $('modal-layer').classList.add('hidden'); $('modal-layer').setAttribute('aria-hidden', 'true');
    const restore = modalReturnFocus; modalReturnFocus = null;
    if (restore && restore.isConnected && !restore.disabled && restore.offsetParent !== null) restore.focus();
  }
  function showArtifacts() { const items = state.artifacts.length ? state.artifacts.map(id => `<section><div class="modal-artifact-art">${artifactArt(id)}</div><h3>${ARTIFACT_DEFS[id]?.name || id}</h3><p>${ARTIFACT_DEFS[id]?.desc || ''}</p></section>`).join('') : '<p>Артефактов пока нет. Учреждение всё ещё надеется на вас.</p>'; openModal(`<div class="modal-kicker">ПАССИВНЫЕ УСТРОЙСТВА</div><h2>АРТЕФАКТЫ</h2><div class="rulebook">${items}</div><div class="modal-actions"><button class="modal-button" data-close-modal>Закрыть</button></div>`); }
  function showLog() { const items = state.log.length ? state.log.map(e => `<p class="modal-log ${e.bad ? 'bad' : ''}">${e.bad ? '⚠ ' : '› '} ${escapeHtml(e.message)}</p>`).join('') : '<p>Журнал пока пуст. Это подозрительно.</p>'; openModal(`<div class="modal-kicker">ПРОТОКОЛ ДЕЙСТВИЙ</div><h2>ЖУРНАЛ СМЕНЫ</h2><div class="modal-log-list">${items}</div><div class="modal-actions"><button class="modal-button" data-clear-log>Очистить журнал</button><button class="modal-button" data-close-modal>Закрыть</button></div>`); }
  function showCardRemoval() { const played = new Set(state.playedThisTurn || []); const ids = [...new Set(state.deck)].filter(id => CARD_DEFS[id] && !played.has(id)); const cards = ids.map(id => `<button class="remove-card-option" data-remove-card="${id}"><span class="remove-card-art">${cardArt(id)}</span><b>${CARD_DEFS[id].name}</b><small>${CARD_DEFS[id].desc}</small></button>`).join(''); const note = played.size ? '<p class="modal-note">Сыгранные в этой смене карты временно недоступны для списания — сначала завершите ход.</p>' : ''; openModal(`<div class="modal-kicker">АДМИНИСТРАТИВНАЯ РЕВИЗИЯ · 6 КРЕДИТОВ</div><h2>УБРАТЬ КАРТУ ИЗ КОЛОДЫ</h2><p>Выберите одну карту. Она больше не придёт в будущих сменах. Слабость, оформленная в двух экземплярах, всё равно считается слабостью.</p>${note}<div class="remove-grid">${cards}</div><div class="modal-actions"><button class="modal-button" data-back-reward>Назад к награде</button></div>`); }
  function buyRepair() { if (state.repairPurchased) return toast('Мастерская уже закрыла это дело до следующей смены.', true); if (state.credits < 8) return toast('Для мастерской нужно 8 кредитов.', true); if (state.integrity >= state.maxIntegrity) return toast('Целостность уже максимальна. Мастерская отказывается от чаевых.', true); state.repairPurchased = true; state.credits -= 8; state.integrity = Math.min(state.maxIntegrity, state.integrity + 2); logEvent('Мастерская восстановила 2 целостности за 8 кредитов.'); toast('<strong>МАСТЕРСКАЯ:</strong> +2 целостности · −8 кредитов.'); saveState(); render(); }
  function removeCard(id) { if (state.credits < 6) return toast('Для ревизии нужно 6 кредитов.', true); if (state.deck.length <= 5) return toast('Минимальная колода достигнута.', true); if ((state.playedThisTurn || []).includes(id)) return toast('Сыгранную карту можно списать после завершения хода.', true); const pools = [state.hand, state.draw, state.discard]; const pool = pools.find(list => list.includes(id)); const deckIndex = state.deck.indexOf(id); if (!pool || deckIndex < 0) return toast('Эта карта уже оформлена в другом деле.', true); state.credits -= 6; pool.splice(pool.indexOf(id), 1); state.deck.splice(deckIndex, 1); logEvent(`Карта удалена из колоды: ${CARD_DEFS[id]?.name || id}.`); toast(`<strong>РЕВИЗИЯ:</strong> ${CARD_DEFS[id]?.name || id} списана.`); saveState(); render(); }
  function renderModal() {
    if (!state || state.phase === 'shift') { if (state?.phase === 'shift') closeModal(); return; }
    if (state.phase === 'reward') { const choices = state.rewardChoices.map((r, i) => { if (r.kind === 'card') { const c = CARD_DEFS[r.id]; return `<button class="reward-card" data-reward="${i}"><div class="reward-icon">${cardArt(r.id)}</div><div class="reward-cost">КАРТА · ${c.cost} ЭН.</div><h3>${c.name}</h3><p>${c.desc}</p></button>`; } if (r.kind === 'artifact') { const a = ARTIFACT_DEFS[r.id]; return `<button class="reward-card special" data-reward="${i}"><div class="reward-icon">${artifactArt(r.id)}</div><div class="reward-cost">АРТЕФАКТ</div><h3>${a.name}</h3><p>${a.desc}</p></button>`; } return `<button class="reward-card" data-reward="${i}"><div class="reward-icon">${cardArt('memo')}</div><div class="reward-cost">РЕМОНТ</div><h3>Ночная мастерская</h3><p>Восстановить 5 целостности и получить 4 кредита. Ваша поломка будет рассмотрена.</p></button>`; }).join(''); const repairState = state.repairPurchased ? ' disabled aria-disabled="true"' : ''; const repairLabel = state.repairPurchased ? 'МАСТЕРСКАЯ · ИСПОЛЬЗОВАНА' : 'МАСТЕРСКАЯ'; openModal(`<div class="modal-kicker">СМЕНА ${state.shift} ЗАВЕРШЕНА</div><h2>КВОТА ВЫПОЛНЕНА</h2><p>Бюрократия временно довольна. Выберите одно улучшение перед следующей сменой.</p><div class="reward-grid">${choices}</div><div class="shop-actions"><button class="shop-button" data-shop-remove>РЕВИЗИЯ КОЛОДЫ <b>6 кр.</b></button><button class="shop-button" data-shop-repair${repairState}>${repairLabel} <b>8 кр.</b></button></div>`); }
    if (state.phase === 'pause') openModal(`<div class="modal-kicker">ДЕЛО ПРИОСТАНОВЛЕНО</div><h2>ПАУЗА</h2><p>Ленты остановлены. Они делают вид, что так было всегда.</p><div class="modal-actions"><button class="modal-button" data-resume>Вернуться к столу</button><button class="modal-button danger" data-abandon>Списать смену</button></div>`);
    if (state.phase === 'victory') openModal(`<div class="modal-kicker">ПОСЛЕДНИЙ АУДИТ · ПРОТОКОЛ ЗАКРЫТ</div><h2>ДЕПАРТАМЕНТ ВЫЖИЛ</h2><p>Вы обработали финальную квоту и доказали, что существование получателя — второстепенный вопрос.</p><div class="stats-grid"><div class="stat-tile"><span>ОБРАБОТАНО</span><b>${state.totalProcessed}</b></div><div class="stat-tile"><span>КРЕДИТЫ</span><b>${state.credits}</b></div><div class="stat-tile"><span>ОШИБКИ</span><b>${state.mistakes}</b></div></div><div class="modal-actions"><button class="modal-button" data-new-run>Начать новое дело</button><button class="modal-button" data-menu>В главное меню</button></div>`);
    if (state.phase === 'defeat') openModal(`<div class="modal-kicker">АКТ О НЕСОСТОЯВШЕМСЯ ДЕЛЕ</div><h2>СМЕНА ПРЕРВАНА</h2><p>${state.defeatReason}</p><div class="stats-grid"><div class="stat-tile"><span>СМЕНА</span><b>${state.shift} / 8</b></div><div class="stat-tile"><span>ОШИБКИ</span><b>${state.mistakes}</b></div><div class="stat-tile"><span>ИСТЕЧЕНИЯ</span><b>${state.expired}</b></div></div><div class="modal-actions"><button class="modal-button" data-new-run>Попробовать снова</button><button class="modal-button" data-menu>В главное меню</button></div>`);
  }

  function showRules() { openModal(`<div class="modal-kicker">ДЛЯ СЛУЖЕБНОГО ПОЛЬЗОВАНИЯ</div><h2>Справочник учреждения</h2><p>Выберите отправление, изучите его свойства и направьте в правильный сектор. Каждый ход ленты двигаются, сроки уменьшаются, а неподконтрольная почта начинает действовать сама.</p><div class="rulebook"><section><h3>ПРИОРИТЕТЫ</h3><p>Опасное или заражённое → <b>изоляция</b>.<br>Мёртвое, без адреса, из будущего → <b>архив</b>.<br>Обычное и стабильное → <b>пересылка</b>.<br>После очистки заражения снова действует исходный маршрут.</p></section><section><h3>ТАКТИКА</h3><p>Карты тратят энергию и меняют ленты, сроки и свойства. Один раз за ход доступна бесплатная сортировка. Серия успешных решений повышает награду.</p></section><section><h3>ДАВЛЕНИЕ</h3><p>Срок 1 означает, что отправление может исчезнуть при завершении хода. Заражение движется вправо с пятой смены. Ошибка стоит 2 целостности.<br>Защиты при истечении срабатывают по порядку: <b>Печать последней надежды → Часы → Медаль</b>.</p></section><section><h3>УПРАВЛЕНИЕ</h3><p><b>1 / 2 / 3</b> — переслать / архив / изолировать.<br><b>Space</b> — завершить ход · <b>Esc</b> — пауза · <b>R</b> — этот справочник.</p></section></div><div class="modal-actions"><button class="modal-button" data-close-modal>Закрыть справочник</button></div>`); }
  function showTutorial() { openModal(`<div class="modal-kicker">ПЕРВЫЙ НОЧНОЙ ИНСТРУКТАЖ</div><h2>ПОЧТА ЖДАТЬ НЕ БУДЕТ</h2><p>На трёх лентах прибывают отправления. Кликните по посылке, прочтите её карточку и выберите маршрут. Карты помогают менять сроки и свойства, но энергия восстанавливается только в начале хода.</p><div class="rulebook"><section><h3>НЕ СПЕШИТЕ</h3><p>Сначала осмотр, затем штамп. Неправильное решение не исправляется служебной запиской.</p></section><section><h3>СЛЕДИТЕ ЗА СРОКОМ</h3><p>После «Завершить ход» ленты сдвинутся, а сроки уменьшатся. Красная цифра — предельная.</p></section></div><div class="modal-actions"><button class="modal-button" data-close-modal>Приступить к обработке</button></div>`); }
  function showDocketTutorial() { openModal(`<div class="modal-kicker">ИНСТРУКТАЖ РЕЕСТРА</div><h2>ОДНО ДЕЛО. НЕСКОЛЬКО ПРИЧИН.</h2><p>Соберите 2–3 отправления в одно дело, выберите ведомство и закройте его. Ценность — в связке: мёртвое письмо и документ из завтра образуют «мёртвый срок», опасные отправления хотят карантин, а обычное рядом с аномалией может пройти пересылкой.</p><div class="rulebook"><section><h3>ПОРЯДОК</h3><p>Осмотрите отправления → вложите их в дело → выберите маршрут → закройте дело.</p></section><section><h3>РИСК</h3><p>Неверная связка всё равно двигает смену, но приносит меньше денег и портит отчёт. Незакрытое дело в конце хода стоит целостности.</p></section></div><div class="modal-actions"><button class="modal-button" data-close-modal>Открыть реестр</button></div>`); }

  function beginRun() { newRun(); render(); if (profile.firstTutorial) { profile.firstTutorial = false; saveProfile(); showTutorial(); } }
  function beginDocketRun() { newRun('docket'); render(); if (profile.firstTutorial) { profile.firstTutorial = false; saveProfile(); showDocketTutorial(); } }
  function continueRun() { if (loadSave()) render(); }

  function enterMenu() { state = { phase: 'menu' }; clearSave(); render(); }
  function togglePause() { if (!state || state.phase === 'menu' || state.phase === 'victory' || state.phase === 'defeat' || state.phase === 'reward') return; state.phase = state.phase === 'pause' ? 'shift' : 'pause'; saveState(); render(); }

  document.addEventListener('click', e => {
    const parcel = e.target.closest('#conveyors [data-parcel-id]'); if (parcel && state?.phase === 'shift') { state.selected = parcel.dataset.parcelId; beep(); render(); saveState(); return; }
    const addDocket = e.target.closest('[data-docket-add]'); if (addDocket && state?.mode === 'docket' && state?.phase === 'shift') { attachDocketParcel(addDocket.dataset.docketAdd); return; }
    const removeDocket = e.target.closest('[data-docket-remove]'); if (removeDocket && state?.mode === 'docket' && state?.phase === 'shift') { state.docket = state.docket.filter(id => id !== removeDocket.dataset.docketRemove); render(); saveState(); return; }
    const docketOffice = e.target.closest('[data-docket-office]'); if (docketOffice && state?.mode === 'docket' && state?.phase === 'shift') { selectDocketOffice(docketOffice.dataset.docketOffice); return; }
    if (e.target.closest('[data-file-case]') && state?.mode === 'docket' && state?.phase === 'shift') { fileDocketCase(); return; }
    const card = e.target.closest('#hand [data-card-id]'); if (card && state?.phase === 'shift') { playCard(card.dataset.cardId); return; }
    const sort = e.target.closest('.action-buttons [data-action]'); if (sort && state?.phase === 'shift') { sortSelected(sort.dataset.action); return; }
    const quick = e.target.closest('#inspector-content [data-quick-sort]'); if (quick) { sortSelected(quick.dataset.quickSort); return; }
    if (e.target.closest('[data-inspect]')) { const p = selectedParcel(); if (p) { p.revealed = true; toast(`Осмотрено: <strong>${escapeHtml(p.name)}</strong>.`); render(); saveState(); } return; }
    const reward = e.target.closest('[data-reward]'); if (reward) { chooseReward(Number(reward.dataset.reward)); return; }
    if (e.target.closest('[data-shop-remove]')) { if (state.credits < 6) return toast('Для ревизии нужно 6 кредитов.', true); showCardRemoval(); return; }
    if (e.target.closest('[data-shop-repair]')) { buyRepair(); return; }
    const removeCardButton = e.target.closest('[data-remove-card]'); if (removeCardButton) { removeCard(removeCardButton.dataset.removeCard); return; }
    if (e.target.closest('[data-back-reward]')) { renderModal(); return; }
    if (e.target.closest('[data-clear-log]')) { state.log = []; saveState(); renderGame(); showLog(); return; }
    if (e.target.closest('[data-close-modal]')) { if (state?.phase === 'reward') { closeModal(); } else { closeModal(); } return; }
    if (e.target.closest('[data-resume]')) { state.phase = 'shift'; closeModal(); saveState(); render(); return; }
    if (e.target.closest('[data-abandon]')) { enterMenu(); return; }
    if (e.target.closest('[data-new-run]')) { beginRun(); return; }
    if (e.target.closest('[data-menu]')) { enterMenu(); return; }
    if (e.target.closest('#new-run-btn')) { beginRun(); return; }
    if (e.target.closest('#docket-run-btn')) { beginDocketRun(); return; }
    if (e.target.closest('#continue-btn')) { continueRun(); return; }
    if (e.target.closest('#rules-btn') || e.target.closest('#open-rules') || e.target.closest('#open-rules-top')) { showRules(); return; }
    if (e.target.closest('#context-artifacts')) { showArtifacts(); return; }
    if (e.target.closest('#context-log')) { showLog(); return; }
    if (e.target.closest('#end-turn-btn')) { endTurn(); return; }
    if (e.target.closest('#pause-btn')) { togglePause(); return; }
    if (e.target.closest('#mute-btn')) { audioEnabled = !audioEnabled; render(); return; }
    if (e.target.closest('#save-btn')) { saveState(); toast('Сохранение принято. Ничего не подозревает.'); return; }
    if (e.target.closest('#clear-log')) { state.log = []; render(); saveState(); return; }
  });
  document.addEventListener('keydown', e => {
    const modalOpen = !$('modal-layer').classList.contains('hidden');
    if (modalOpen) {
      if (e.key === 'Tab') {
        const focusables = modalFocusables();
        if (!focusables.length) { e.preventDefault(); $('modal').focus(); return; }
        const current = document.activeElement; const index = focusables.indexOf(current);
        const next = e.shiftKey ? (index <= 0 ? focusables[focusables.length - 1] : focusables[index - 1]) : (index === focusables.length - 1 ? focusables[0] : focusables[index + 1]);
        e.preventDefault(); next.focus();
      } else if (e.key === 'Escape' && (state?.phase === 'shift' || state?.phase === 'pause')) {
        e.preventDefault(); if (state.phase === 'shift') closeModal(); else togglePause();
      }
      return;
    }
    if (e.key === 'Escape') togglePause();
    if ((e.key === 'Enter' || e.key === ' ') && e.target?.closest?.('#pause-btn')) { e.preventDefault(); togglePause(); return; }
    if (e.key === 'Enter' && e.target?.closest?.('#open-rules, #open-rules-top')) { e.preventDefault(); showRules(); return; }
    if (e.key.toLowerCase() === 'r' && state?.phase === 'shift') showRules();
    const interactive = e.target?.closest?.('[data-card-id], [data-parcel-id], button, input, select, textarea');
    if (e.code === 'Space' && state?.phase === 'shift' && !interactive) { e.preventDefault(); endTurn(); }
    if (state?.phase === 'shift' && ['1','2','3'].includes(e.key)) sortSelected(['forward','archive','contain'][Number(e.key)-1]);
  });
  $('new-run-btn').addEventListener('click', event => { event.stopPropagation(); beginRun(); });
  $('docket-run-btn').addEventListener('click', event => { event.stopPropagation(); beginDocketRun(); });
  $('continue-btn').addEventListener('click', event => { event.stopPropagation(); continueRun(); });
  render();
  loadAssetSprite();
})();
