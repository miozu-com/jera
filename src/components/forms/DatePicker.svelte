<!--
  @component DatePicker

  A calendar date picker with single date selection.
  Renders a trigger button that opens a calendar dropdown.
  Supports min/max constraints and form submission via hidden input.
  Zero dependencies — uses native Date and Intl.DateTimeFormat.

  @example
  <DatePicker bind:value={date} placeholder="Pick a date" />

  @example With constraints
  <DatePicker
    bind:value={date}
    min="2024-01-01"
    max="2024-12-31"
    name="start_date"
    onchange={(v) => console.log(v)}
  />
-->
<script>
  import { clickOutside } from '../../actions/index.js';

  let {
    value = $bindable(null),      // ISO string 'YYYY-MM-DD' or null
    min = null,                    // ISO string — earliest selectable
    max = null,                    // ISO string — latest selectable
    placeholder = 'Select date',
    disabled = false,
    required = false,
    id = null,
    name = null,
    class: className = '',
    onchange = null
  } = $props();

  let isOpen = $state(false);

  // The month/year being viewed in the calendar
  let viewYear = $state(new Date().getFullYear());
  let viewMonth = $state(new Date().getMonth()); // 0-indexed

  // --- Date helpers (all native) ---

  function toISO(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function parseISO(str) {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return { year: y, month: m - 1, day: d };
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function firstDayOfWeek(year, month) {
    return new Date(year, month, 1).getDay(); // 0=Sun
  }

  function isSameDay(a, b) {
    return a && b && a.year === b.year && a.month === b.month && a.day === b.day;
  }

  // Format for display: "Mar 6, 2026"
  const displayFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Format month label: "March 2026"
  const monthFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Full date for aria-label: "March 6, 2026"
  const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // --- Derived state ---

  const selected = $derived(parseISO(value));

  const displayValue = $derived(
    selected
      ? displayFormatter.format(new Date(selected.year, selected.month, selected.day))
      : placeholder
  );

  const monthLabel = $derived(
    monthFormatter.format(new Date(viewYear, viewMonth, 1))
  );

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = $derived.by(() => {
    const days = [];
    const totalDays = daysInMonth(viewYear, viewMonth);
    const startDay = firstDayOfWeek(viewYear, viewMonth);

    // Previous month padding
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevDays = daysInMonth(prevYear, prevMonth);
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ year: prevYear, month: prevMonth, day: prevDays - i, isCurrentMonth: false });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({ year: viewYear, month: viewMonth, day: i, isCurrentMonth: true });
    }

    // Next month padding (fill to 42 = 6 rows)
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ year: nextYear, month: nextMonth, day: i, isCurrentMonth: false });
    }

    return days;
  });

  const todayParts = $derived.by(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  });

  // --- Logic ---

  function isDisabledDay(d) {
    const iso = toISO(d.year, d.month, d.day);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  }

  function selectDate(d) {
    if (isDisabledDay(d)) return;
    value = toISO(d.year, d.month, d.day);
    onchange?.(value);
    isOpen = false;
  }

  function prevMonthNav() {
    if (viewMonth === 0) { viewYear--; viewMonth = 11; }
    else { viewMonth--; }
  }

  function nextMonthNav() {
    if (viewMonth === 11) { viewYear++; viewMonth = 0; }
    else { viewMonth++; }
  }

  function goToToday() {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
  }

  function toggle() {
    if (disabled) return;
    if (!isOpen && selected) {
      viewYear = selected.year;
      viewMonth = selected.month;
    }
    isOpen = !isOpen;
  }

  function close() {
    isOpen = false;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="datepicker {className}"
  use:clickOutside={close}
  onkeydown={handleKeydown}
>
  <!-- Trigger button -->
  <button
    type="button"
    class="datepicker-trigger"
    class:has-value={value !== null}
    class:is-open={isOpen}
    {disabled}
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    onclick={toggle}
  >
    <svg class="trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
    <span class="trigger-text">{displayValue}</span>
    <svg class="trigger-chevron" class:rotated={isOpen} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>

  {#if name}
    <input type="hidden" {name} {id} value={value ?? ''} {required} />
  {/if}

  {#if isOpen}
    <div class="datepicker-dropdown" role="dialog" aria-label="Date picker">
      <div class="calendar-header">
        <button type="button" class="nav-btn" onclick={prevMonthNav} aria-label="Previous month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span class="month-label">{monthLabel}</span>
        <button type="button" class="nav-btn" onclick={nextMonthNav} aria-label="Next month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div class="weekdays">
        {#each weekdays as day}
          <span class="weekday">{day}</span>
        {/each}
      </div>

      <div class="day-grid" role="grid" aria-label={monthLabel}>
        {#each calendarDays as d}
          {@const disabledDay = isDisabledDay(d)}
          {@const today = isSameDay(d, todayParts)}
          {@const sel = isSameDay(d, selected)}
          <button
            type="button"
            class="day-btn"
            class:other-month={!d.isCurrentMonth}
            class:is-today={today}
            class:is-selected={sel}
            class:is-disabled={disabledDay}
            disabled={disabledDay}
            aria-label={fullDateFormatter.format(new Date(d.year, d.month, d.day))}
            aria-pressed={sel}
            aria-current={today ? 'date' : undefined}
            role="gridcell"
            onclick={() => selectDate(d)}
          >
            {d.day}
          </button>
        {/each}
      </div>

      <div class="calendar-footer">
        <button type="button" class="today-btn" onclick={goToToday}>Today</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .datepicker {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  /* ---- Trigger ---- */
  .datepicker-trigger {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 2.5rem;
    padding: 0 0.75rem;
    border-radius: var(--radius-md);
    border: var(--border-width-default) solid var(--color-base02);
    background-color: var(--color-base00);
    color: var(--color-base04);
    font-size: 0.875rem;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out);
  }

  .datepicker-trigger:hover:not(:disabled) {
    border-color: var(--color-base03);
  }

  .datepicker-trigger:focus-visible {
    outline: none;
    border-color: var(--color-base0D);
    box-shadow: var(--focus-ring-shadow);
  }

  .datepicker-trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .datepicker-trigger.has-value {
    color: var(--color-base07);
  }

  .datepicker-trigger.is-open {
    border-color: var(--color-base0D);
    box-shadow: var(--focus-ring-shadow);
  }

  .trigger-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    color: var(--color-base04);
  }

  .trigger-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .trigger-chevron {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    color: var(--color-base04);
    transition: transform var(--duration-base) var(--ease-out);
  }

  .trigger-chevron.rotated {
    transform: rotate(180deg);
  }

  /* ---- Dropdown ---- */
  .datepicker-dropdown {
    position: absolute;
    z-index: var(--z-dropdown);
    top: calc(100% + 0.25rem);
    left: 0;
    width: 17rem;
    background-color: var(--color-base01);
    border: var(--border-width-thin) solid var(--color-base02);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 0.75rem;
  }

  @media (prefers-reduced-motion: no-preference) {
    .calendar-dropdown {
      animation: datepicker-in var(--duration-fast) var(--ease-out);
    }

    @keyframes datepicker-in {
      from { opacity: 0; transform: translateY(-0.375rem); }
      to { opacity: 1; transform: translateY(0); }
    }
  }

  /* ---- Calendar header ---- */
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.625rem;
  }

  .nav-btn {
    appearance: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: var(--border-width-thin) solid var(--color-base02);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-base05);
    cursor: pointer;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  .nav-btn:hover {
    background-color: var(--color-base02);
    border-color: var(--color-base03);
  }

  .nav-btn:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }

  .nav-btn svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .month-label {
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
    color: var(--color-base06);
    user-select: none;
  }

  /* ---- Weekday row ---- */
  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.125rem;
    margin-bottom: 0.25rem;
  }

  .weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.75rem;
    font-size: var(--text-xs, 0.75rem);
    font-weight: 500;
    color: var(--color-base04);
    user-select: none;
  }

  /* ---- Day grid ---- */
  .day-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.125rem;
  }

  .day-btn {
    appearance: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1;
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-base05);
    font-size: var(--text-sm, 0.875rem);
    font-family: inherit;
    cursor: pointer;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
  }

  .day-btn:hover:not(:disabled) {
    background-color: var(--color-base02);
  }

  .day-btn:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
    position: relative;
    z-index: 1;
  }

  .day-btn.other-month {
    color: var(--color-base03);
  }

  .day-btn.is-today {
    font-weight: 700;
    color: var(--color-base0D);
  }

  .day-btn.is-selected {
    background-color: var(--color-base0D);
    color: var(--color-base00);
    font-weight: 600;
  }

  .day-btn.is-selected:hover {
    background-color: color-mix(in srgb, var(--color-base0D) 85%, var(--color-base07));
  }

  .day-btn.is-today.is-selected {
    background-color: var(--color-base0D);
    color: var(--color-base00);
  }

  .day-btn.is-disabled,
  .day-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* ---- Footer ---- */
  .calendar-footer {
    display: flex;
    justify-content: center;
    margin-top: 0.625rem;
    padding-top: 0.5rem;
    border-top: var(--border-width-thin) solid var(--color-base02);
  }

  .today-btn {
    appearance: none;
    padding: 0.25rem 0.75rem;
    border: var(--border-width-thin) solid var(--color-base02);
    border-radius: var(--radius-full);
    background: transparent;
    color: var(--color-base0D);
    font-size: var(--text-xs, 0.75rem);
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);
  }

  .today-btn:hover {
    background-color: color-mix(in srgb, var(--color-base0D) 10%, transparent);
    border-color: var(--color-base0D);
  }

  .today-btn:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring-shadow);
  }
</style>
