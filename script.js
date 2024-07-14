function dateFromStr(s) {
    let arr = s.split('-');
    return new Date(Date.UTC(
        parseInt(arr[0]), parseInt(arr[1]) - 1, parseInt(arr[2])));
}

function dateToStr(d) {
    let year = d.getUTCFullYear();
    let month = d.getUTCMonth() + 1;
    let day = d.getUTCDate();
    if (month < 10) { month = '0' + month; } else { month = '' + month; }
    if (day < 10) { day = '0' + day; } else { day = '' + day; }
    return `${year}-${month}-${day}`
}

Date.prototype.getISOWeekNumber = function() {
    let date = new Date(this.getTime());
    date.setUTCHours(0, 0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    // Get first day of year
    let yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil((((date.getTime() - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}


class MonthCalendarBuilder {
    static monthIdsOfYear = [
        'jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    static dayIdsOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    //static monthsOfYear = [
    //   'January', 'February', 'March', 'April', 'May', 'June',
    //   'July', 'August', 'September', 'October', 'November', 'December'];
    static monthsOfYear = [
        'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
        'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

    //static daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    static daysOfWeek = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];

    static weekStartsAt = 1;  // monday is first

    static withWeekNumbers = true;

    constructor(firstDateStr, prefillDates = {}) {
        let date = dateFromStr(firstDateStr);
        if (date.getUTCDate() != 1) {
            console.error('bad date', date.toUTCString());
            window.dt = date;
        }

        this.props = MonthCalendarBuilder; // no easier access to static?
        this.year = date.getUTCFullYear();
        this.month = date.getUTCMonth();
        this.prefillDates = prefillDates;
    }

    generateNextCalendarPage() {
        const template = document.getElementById('page-template');
        if (!template) {
            console.error('missing <template id="page-template">');
        }
        const node = template.content.cloneNode(true);

        const div = node.querySelector('div');
        div.id = `page-${this.props.monthIdsOfYear[this.month]}`;

        const monthName = node.querySelector('.month-name');
        if (!monthName) {
            console.error('missing <x class="month-name"></x>');
        }
        const monthText = this.props.monthsOfYear[this.month];
        monthName.innerText = `${monthText} '${this.year % 100}`;

        const tableNode = div.querySelector('table');
        if (!tableNode) {
            console.error('missing <table> in template');
        }
        tableNode.replaceWith(this.generateCalendar());

        this.setNext();
        return div;
    }

    setNext() {
        this.month += 1;
        if (this.month == 12) {
            this.year += 1;
            this.month = 0;
        }
    }

    generateCalendar() {
        const table = document.createElement('table');
        table.className = 'month-calendar';

        const header = this.generateHeader();
        table.appendChild(header);

        const body = this.generateBody();
        table.appendChild(body);

        return table;
    }

    generateHeader() {
        const header = document.createElement('thead');
        const headerRow = document.createElement('tr');

        if (this.props.withWeekNumbers) {
            const th = document.createElement('th');
            th.className = 'weeknumber';
            headerRow.appendChild(th);
        }

        for (let idx = 0; idx < 7; ++idx) {
            const didx = (idx + this.props.weekStartsAt) % 7;
            const th = document.createElement('th');
            const dayId = this.props.dayIdsOfWeek[didx];
            th.className = `day-${dayId}`;
            th.innerText = this.props.daysOfWeek[didx];
            headerRow.appendChild(th);
        }

        header.appendChild(headerRow);
        return header;
    }

    generateBody() {
        const body = document.createElement('tbody');

        const firstDateOfMonth = new Date(Date.UTC(this.year, this.month, 1));
        const includeDaysOfPreviousMonth = (
            firstDateOfMonth.getUTCDay() + 7 - this.props.weekStartsAt) % 7;

        const firstDateOfCalendar = new Date(firstDateOfMonth);
        firstDateOfCalendar.setUTCDate(
            firstDateOfCalendar.getUTCDate() - includeDaysOfPreviousMonth);

        let weekNumber = firstDateOfMonth.getISOWeekNumber();
        let row = document.createElement('tr');
        let date = firstDateOfCalendar;

        this.addWeekNumberCell(row, date.getISOWeekNumber());

        for (let idx = 0; idx < (6 * 7); ++idx) {
            this.addDayCell(row, date);
            date.setUTCDate(date.getUTCDate() + 1); // increment by one day

            if (idx % 7 === 6) {
                body.appendChild(row);
                if (date.getUTCMonth() > this.month) {
                    break;
                }

                row = document.createElement('tr');
                weekNumber += 1;
                this.addWeekNumberCell(row, date.getISOWeekNumber());
            }
        }

        return body;
    }

    addWeekNumberCell(row, weekNumber) {
        if (this.props.withWeekNumbers) {
            const cell = document.createElement('td');
            cell.className = 'weeknumber';
            const div = document.createElement('div');
            div.innerText = weekNumber;
            cell.appendChild(div);
            row.appendChild(cell);
        }
    }

    addDayCell(row, date) {
        const isCurrentMonth = (date.getUTCMonth() == this.month);
        const dayOfMonth = date.getUTCDate();
        const didx = date.getUTCDay();
        const cell = document.createElement('td');

        const dayId = this.props.dayIdsOfWeek[didx];
        if (isCurrentMonth) {
            cell.className = `this-month day-${dayId}`;
        } else {
            cell.className = `other-month day-${dayId}`;
        }

        const dayNumberDiv = document.createElement('div');
        dayNumberDiv.className = 'daynumber';
        dayNumberDiv.innerText = dayOfMonth;

        const dayTextDiv = document.createElement('div');
        dayTextDiv.className = 'daytext';
        if (isCurrentMonth) {
            const cellText = this.prefillDates[dateToStr(date)];
            if (cellText) {
                cell.className += ' with-text';
                dayTextDiv.innerText = cellText;
            }
        }

        cell.appendChild(dayNumberDiv);
        cell.appendChild(dayTextDiv);
        row.appendChild(cell);
    }
}

// vim: set ts=8 sw=4 sts=4 et ai:
