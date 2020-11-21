class DatePickerJS extends HTMLElement {

    locale = 'es';

    constructor() {
        super();

        let html = this.attachShadow({
            mode: 'open'
        });
        this.html = html;
        this.html.innerHTML = `

            <style>
                @import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');

                .gray { color: #E5E5E5; }
                
                button:focus {outline:0;}
                button {
                    cursor: pointer;
                }
                
                input:focus {outline:0;}
                input {
                    border: none;
                    text-align: center;
                    font-size: 16px;
                    padding: 5px;
                    background: #EEE;
                    border-radius: 4px;
                    color: #555;
                }
                
                .calendar {
                    font-family: 'Montserrat', sans-serif;
                    display: inline-block;
                    margin: 0 auto;
                    user-select: none;
                }
                
                .calendar-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                }
                
                button {
                    background: transparent;
                    border: none;
                    font-size: 24px;
                }
                
                .calendar-content {
                    display: grid;
                    grid-template-columns: repeat(8, minmax(30px, 1fr));
                    grid-template-rows: repeat(6, minmax(30px, 1fr));
                    align-items: center;
                    justify-content: center;
                }
                
                .calendar-content span {
                    align-self: center;
                    justify-content: center;
                    text-align: center;
                    padding: 10px;
                }
                
                .calendar-footer {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    height: 40px;
                }
                
                .calendar-content-weeknumbers {
                    display: grid;
                    grid-template-rows: repeat(6, minmax(30px, 1fr));
                    height: 100%;
                    grid-row: 2/8;
                    color: #555;
                    font-style: italic;
                    font-size: 12px;
                }
                
                .calendar-content-weekdays {
                    display: grid;
                    grid-template-columns: repeat(8, minmax(30px, 1fr));
                    height: 100%;
                    grid-column: span 8;
                    color: #555;
                }
                
                .calendar-content-days {
                    display: grid;
                    grid-template-columns: repeat(7, minmax(30px, 1fr));
                    grid-template-rows: repeat(6, minmax(30px, 1fr));
                    height: 100%;
                    grid-column: span 7;
                    grid-row: span 6;
                    color: #555;
                }
                
                .day {
                    cursor: pointer;
                }

                .today {
                    background: #E63946;
                    border-radius: 65% 30% 30% 70% / 60% 40% 60% 40% !important;
                    color: white;
                }

                .selection-date {
                    background-color: #457B9D;
                    color: #F1FAEE;
                    border-radius: 0 !important;
                }

                .today.selection-date {
                    background-color: #E63946;
                    border-radius: 5px;
                }

                .selection-only-date {
                    border-radius: 50% !important;
                }

                .selection-first-date {
                    border-radius: 50% 0 0 50% !important;
                }

                .big-selection-first-date {
                    border-radius: 50% 0 0 0 !important;
                }

                .selection-last-date {
                    border-radius: 0 50% 50% 0 !important;
                }

                .big-selection-last-date {
                    border-radius: 0 0 50% 0 !important;
                }

            </style>

            <div class="calendar">
            
                <div class="calendar-toolbar">
                    <button id="btnMonthBack">&lsaquo;</button>
                    <span class="calendar-title">Month</span>
                    <button id="btnMonthForth">&rsaquo;</button>
                </div>
            
                <div class="calendar-content">
                    <div class="calendar-content-weeknumbers"></div>
                    <div class="calendar-content-weekdays">
                        <span></span>
                    </div>
                    <div class="calendar-content-days"></div>
                </div>
            
                <div class="calendar-footer">
                    <button id="btnToday">&ofcir;</button>
                    <input type="text" id="date-input" placeholder="YYYY-MM-DD">
                </div>
                
            </div>`;
        this.prepareData();
        this.prepareHTMLElements();
        this.prepareListeners();
        this.setDate(this.today);
    }

    prepareData() {
        this.today = luxon.DateTime.local().startOf('day');
    }

    prepareHTMLElements() {
        this.daysHTMLContainer = this.html.querySelector('.calendar-content-days');
        this.weeksHTMLContainer = this.html.querySelector('.calendar-content-weeknumbers');
        this.weekdaysHTMLContainer = this.html.querySelector('.calendar-content-weekdays');

        this.monthTitle = this.html.querySelector('.calendar-title');
        this.btnMonthBack = this.html.querySelector('#btnMonthBack');
        this.btnMonthForth = this.html.querySelector('#btnMonthForth');
        this.btnYearBack = this.html.querySelector('#btnYearBack');
        this.btnYearForth = this.html.querySelector('#btnYearForth');
        this.dateInput = this.html.querySelector('#date-input');
        this.btnToday = this.html.querySelector('#btnToday');
    }

    prepareListeners() {
        this.btnMonthBack.onclick = e => this.showPrevMonth();
        this.btnMonthForth.onclick = e => this.showNextMonth();
        this.btnToday.onclick = e => {
            this.setDate(this.today);
            this.onDateClicked(null, this.today);
        }
        this.dateInput.onfocus = e => {
            this.dateInput.setSelectionRange(0, this.dateInput.value.length);
        }
        this.dateInput.onclick = e => {
            this.dateInput.setSelectionRange(0, this.dateInput.value.length);
        }
        this.dateInput.onkeyup = e => {

            if(!['Backspace', 'Delete'].includes(e.key) && [4,7].includes(this.dateInput.value.length)) this.dateInput.value += '-';

            if(['Enter', 'Tab'].includes(e.key)) {
                let date;
                try {
                    date = luxon.DateTime.fromISO(this.dateInput.value.trim());
                    this.setDate(date);
                    this.selectedDates(date, date);
                } catch(e) {
                    this.dateInput.value = '';
                }
                
                this.dateInput.setSelectionRange(0, this.dateInput.value.length);

            }

        }
    }

    refreshUI() {
        this.removeAllChildren(this.daysHTMLContainer);
        this.removeAllChildren(this.weeksHTMLContainer);
        this.removeAllChildren(this.weekdaysHTMLContainer);
        this.monthTitle.innerText = this.currMonth.setLocale(this.locale).toLocaleString({
            month: 'long',
            year: 'numeric'
        }).replace(/^\w/, c => c.toUpperCase());
        for (let i = 0; i < 42; i++) {
            let day = this.firstDayToShow.plus({
                days: i
            });
            if (i % 7 == 0) this.addWeek(day.weekNumber);
            this.addDay(day);
        }
        this.weekdaysHTMLContainer.appendChild(document.createElement('span'));
        let monday = this.today.minus({
            days: this.today.weekday - 1
        });
        for (let i = 0; i < 7; i++) {
            let span = document.createElement('span');
            span.innerText = monday.plus({
                days: i
            }).setLocale(this.locale).toFormat('EEEEE');
            this.weekdaysHTMLContainer.appendChild(span);
        }
    }

    addDay(date) {
        let number = date.day;
        let isCurrMonth = date.month == this.currMonth.month;
        let span = document.createElement('span');
        span.innerText = number;
        span.classList.add('day');
        span.onclick = e => this.onDateClicked(e, date, span);
        // span.id = `cal-day-${date.toISODate()}`;

        if (this.selectionInterval && !this.selectionInterval.invalid) {

            if(this.selectionInterval.contains(date) || date.equals(this.selectionInterval.end)) span.classList.add('selection-date');

            if(this.selectionInterval.isEmpty()) {
                if(date.equals(this.selectionInterval.start))
                    span.classList.add('selection-only-date');
            } else {
                if(date.equals(this.selectionInterval.start)) {
                    let className = this.selectionInterval.count('days') >= 8 ? 'big-selection-first-date' : 'selection-first-date';
                    span.classList.add(className);
                }
                if(date.equals(this.selectionInterval.end)) {
                    let className = this.selectionInterval.count('days') >= 8 ? 'big-selection-last-date' : 'selection-last-date';
                    span.classList.add(className);
                }
            }

        }

        if (date.equals(this.today)) span.classList.add('today');
        if (!isCurrMonth) span.classList.add('gray');

        this.daysHTMLContainer.appendChild(span);
    }

    addWeek(number) {
        let span = document.createElement('span');
        span.classList.add('gray');
        span.innerText = number;
        this.weeksHTMLContainer.appendChild(span);
    }

    removeAllChildren(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    onDateClicked(ev, date, elem) {

        if (ev && ev.shiftKey && this.lastDateClicked) {

            let start, end;
            if (this.lastDateClicked > date) {
                start = date;
                end = this.lastDateClicked;
            } else {
                start = this.lastDateClicked;
                end = date;
            }

            this.selectedDates(start, end);
        } else {
            this.selectedDates(date, date);
        }
        
        this.lastDateClicked = date;

    }

    setDate(date) {
        // Key Dates
        this.currMonth = luxon.DateTime.fromObject({
            day: 1,
            month: date.month,
            year: date.year
        });
        this.lastMonth = this.currMonth.minus({
            months: 1
        });

        // DaysToShow
        this.dtsLastMonth = this.currMonth.weekday - 1; // number of Days To Show of last month
        if (this.dtsLastMonth == 0) {
            this.firstDayToShow = this.currMonth;
        } else {
            this.firstDayToShow = luxon.DateTime.fromObject({
                day: this.lastMonth.daysInMonth - this.dtsLastMonth + 1,
                month: this.lastMonth.month,
                year: this.lastMonth.year
            });
        }

        this.refreshUI();
    }

    showPrevMonth() {
        this.currMonth = this.currMonth.plus({
            months: -1
        });
        this.setDate(this.currMonth);
    }

    showNextMonth() {
        this.currMonth = this.currMonth.plus({
            months: 1
        });
        this.setDate(this.currMonth);
    }

    showPrevYear() {
        this.currMonth = this.currMonth.plus({
            years: -1
        });
        this.setDate(this.currMonth);
    }

    showNextYear() {
        this.currMonth = this.currMonth.plus({
            years: 1
        });
        this.setDate(this.currMonth);
    }

    selectedDates(from, to) {

        if (arguments.length == 0) {

            if(!this.selectionInterval) return null;

            return {
                from: this.selectionInterval.start,
                to: this.selectionInterval.end  
            }
        }

        if (!from || !to) {
            throw Error(`'from' or 'to' are empty`);
        }

        document.querySelectorAll('.selection-date').forEach(x => x.classList.remove('selection-date'));

        this.selectionInterval = luxon.Interval.fromDateTimes(from, to);
        if (this.selectionInterval.isEmpty()) {
            this.dateInput.value = from.toISODate();
        } else {
            this.dateInput.value = `${this.selectionInterval.count('days')} days`;
        }

        let monthDiff = to.month - this.currMonth.month;
        switch (monthDiff) {
            case -1:
            case 11:
                this.showPrevMonth();
                break;
            case 1:
            case -11:
                this.showNextMonth();
                break;
        }

        if (this.onselectionchanged) {
            this.onselectionchanged({
                days: this.selectionInterval.count('days'),
                from: this.selectionInterval.start,
                to: this.selectionInterval.end,
                range: this.selectionInterval
            });
        }

        this.refreshUI();

    }

    setLocale(locale) {
        this.locale = locale;
        this.refreshUI();
    }

    onselectionchanged(dateFrom, dateTo) {}

}

window.customElements.define('datepicker-js', DatePickerJS);