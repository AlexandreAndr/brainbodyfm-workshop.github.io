document.addEventListener('DOMContentLoaded', function () {
    // Override the main script's timeline progress function
    function updateTimelineProgress() {
        const timelineProgress = document.getElementById('timeline-progress');

        if (!timelineProgress) {
            return;
        }

        // Call for Papers specific milestone dates
        const milestones = [
            new Date('2026-08-03'), // Submissions Open
            new Date('2026-09-05'), // Submission Deadline
            new Date('2026-09-29'), // Accept/Reject Notification
            new Date('2026-11-06'), // Camera Ready Deadline
            new Date('2026-12-06')  // Workshop — PLACEHOLDER, NeurIPS 2026 date not yet announced
        ];

        const now = new Date();

        // Markers are equal-width flex columns, so milestone i sits at (i + 0.5) / N of the
        // track. Fill to the marker we've reached, plus how far we are into the current leg.
        const N = milestones.length;
        let progress;

        if (now < milestones[0]) {
            progress = 0;                                   // nothing has happened yet
        } else if (now >= milestones[N - 1]) {
            progress = 100;                                 // past the last milestone
        } else {
            const i = milestones.findIndex(d => now < d) - 1;
            const frac = (now - milestones[i]) / (milestones[i + 1] - milestones[i]);
            progress = ((i + frac + 0.5) / N) * 100;
        }

        // Set initial width to 0 and animate to calculated progress
        timelineProgress.style.width = '0%';

        setTimeout(() => {
            timelineProgress.style.width = progress + '%';
        }, 100);
    }

    // Override the main script's timeline progress with a longer delay
    setTimeout(() => {
        updateTimelineProgress();
    }, 1500); // Longer delay to ensure it runs after the main script

    // Load and display accepted papers from CSV
    function loadAcceptedPapers() {
        fetch('brainbodyfm_accepted_submissions.csv')
            .then(response => response.text())
            .then(csvText => {
                const lines = csvText.split('\n');
                const headers = lines[0].split(',');

                const spotlightPapers = [];
                const posterPapers = [];

                // Parse CSV data (skip header row)
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = parseCSVLine(lines[i]);
                        if (values.length >= 5) {
                            const paper = {
                                title: values[0],
                                authors: values[3],
                                openReviewLink: values[2],
                                status: values[4]
                            };

                            if (paper.status === 'Spotlight') {
                                spotlightPapers.push(paper);
                            } else if (paper.status === 'Poster') {
                                posterPapers.push(paper);
                            }
                        }
                    }
                }

                // Display spotlight papers
                const spotlightList = document.getElementById('spotlight-papers');
                if (spotlightList) {
                    spotlightPapers.forEach(paper => {
                        const li = document.createElement('li');
                        li.className = 'mb-2';
                        li.innerHTML = `
                            <strong>${paper.title}</strong><br>
                            <em>${paper.authors}</em> - 
                            <a href="${paper.openReviewLink}" target="_blank">See on OpenReview</a>
                        `;
                        spotlightList.appendChild(li);
                    });
                }

                // Display poster papers
                const posterList = document.getElementById('poster-papers');
                if (posterList) {
                    posterPapers.forEach(paper => {
                        const li = document.createElement('li');
                        li.className = 'mb-2';
                        li.innerHTML = `
                            <strong>${paper.title}</strong><br>
                            <em>${paper.authors}</em> - 
                            <a href="${paper.openReviewLink}" target="_blank">See on OpenReview</a>
                        `;
                        posterList.appendChild(li);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading accepted papers:', error);
            });
    }

    // Helper function to parse CSV line (handles quoted fields with commas)
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    // Load papers when page loads
    loadAcceptedPapers();
}); 