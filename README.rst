Borgmanschool Kalender in A3
============================

HTML/CSS-based calendar generator using Javascript. Use a web browser to
print the generated web page as PDF. Submit the PDF to an online print
service.

Configuration is done in ``document.html``:

.. code-block:: javascript

    const startCalendar = '2024-09-01';
    const prefillDates = {
      '2024-09-02': '1e schooldag, whoop',
      '2024-09-07': 'eindelijk weekend!!!',
      '2024-09-08': 'meer weekend...',
    };
    const calendar = new MonthCalendarBuilder(startCalendar, prefillDates);
    const calendarPages = 12; // one for each month
    for (let i = 0; i < calendarPages; ++i) {
      document.body.appendChild(calendar.generateNextCalendarPage());
    }

Styles can be adjusted in ``style.css``. E.g. by adjusting these:

.. code-block:: css

    :root {
        /* usage: `color: var(--color1)` */
        --color1: #a05fa5; /* purple */
        --color1-bright: #e7a1eb;
        --color2: #8cbe32; /* green */
        --color2-bright: #b2e458;
        --color3: #ffd700; /* yellow */
        --color3-bright: #fff940;
        --color4: #e65a19; /* orange */
        --color4-bright: #ffb56f;
        --color5: #ccc; /* black */
        --color5-bright: #f0f0f0;
    }

Example output:

.. image:: ./example.png
   :width: 800
   :alt: Screenshot of multipage A3 PDF output
