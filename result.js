const API_URL = 'https://softenmatching67.netlify.app/api';

// Function to fetch result data for a specific student
async function fetchResultData(studentId) {
    try {
        const response = await fetch(`${API_URL}/sheet-data`);
        const text = await response.text(); // Get response as text
        try {
            const data = JSON.parse(text); // Parse text as JSON
            // Filter for matches based on student ID
            const matches = data.slice(1).filter(row => row[0] === studentId || row[3] === studentId || row[8] === studentId);
            displayResults(matches, studentId); // Pass studentId to displayResults
            renderSpecificMatchChart(matches); // Render the specific match chart
        } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            document.getElementById('result').innerText = 'Error parsing results.';
        }
    } catch (error) {
        console.error('Error fetching results:', error);
        document.getElementById('result').innerText = 'Error fetching results.';
    }
}

// Function to display results
function displayResults(matches, studentId) {
    const resultDiv = document.getElementById('result');
    if (matches.length === 0) {
        resultDiv.innerText = 'No matches found.';
        return;
    }

    // Initialize an empty result text
    let resultText = '<h2>Match Results</h2>';

    // Loop through each match
    matches.forEach(match => {
        if (match[0] === studentId) { // Year 2 student
            resultText += `
                <p>สวัสดี ${match[1]} หม่ำๆ!</p> 
                <p><strong>Your ฟาเก้ Name</strong>: ${match[13]}</p>
                <p>&nbsp;</p> 
                <p><strong>Match 1</strong>: ${match[4]} - <strong>IG</strong>: ${match[6]}</p>
                ${match[7] ? `<p><strong>Message:</strong> ${match[7]}</p>` : ''}
            `;
            if (match[8] && match[9] && match[10] && match[11]) {
                resultText += `
                    <p>&nbsp;</p> <!-- Space before Match 2 -->
                    <p><strong>Match 2</strong>: ${match[9]} - <strong>IG</strong>: ${match[11]}</p>
                    ${match[12] ? `<p><strong>Message:</strong> ${match[12]}</p>` : ''}
                `;
            }
        } else if (match[3] === studentId || match[8] === studentId) { // Year 1 student
            const year1MatchNickname = match[3] === studentId ? match[4] : match[9]; // Choose the appropriate nickname
            const year2MatchMessage = match[3] === studentId ? match[2] : match[2]; // Year 2 message column
            resultText += `
                <p>สวัสดี ${year1MatchNickname} หม่ำๆ!</p>
                ${year2MatchMessage ? `<p>Message:${year2MatchMessage}</p>` : ''}
                <p>Hint: เร็วๆนี้!</p>
            `;
        }
    });

    // Update the resultDiv with the result text
    resultDiv.innerHTML = resultText;
}

// Function to get query parameter
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to render specific match chart
async function renderSpecificMatchChart(matches) {
    // Check if the current user is a Year 1 student
    const isYear1 = matches.some(row => row[3] === studentId || row[8] === studentId);

    let labels, similarityScores1, similarityScores2;

    if (isYear1) {
        // For Year 1 students, show only their Year 2 match's similarity score
        const year1Match = matches.find(row => row[3] === studentId || row[8] === studentId);
        const year2FakeName = year1Match[3] === studentId ? year1Match[13] : year1Match[13]; // Year 2 student's fake name
        const similarityScore = year1Match[3] === studentId ? year1Match[5] : year1Match[9]; // Similarity score
        
        labels = [`${year2FakeName} (${similarityScore}%)`];
        similarityScores1 = [parseInt(similarityScore, 10)];
        similarityScores2 = []; // No Match 2 data for Year 1 students
    } else {
        // For Year 2 students, show both matches
        labels = matches.map(row => row[13]); // Year 2 Fake names from column N
        const match1Labels = matches.map(row => `${row[4]} (${row[5]}%)`); // Match 1 labels with names and similarity percentages
        const match2Labels = matches.map(row => `${row[9]} (${row[10]}%)`); // Match 2 labels with names and similarity percentages
        similarityScores1 = matches.map(row => parseInt(row[5], 10)); // Similarity Score 1
        similarityScores2 = matches.map(row => parseInt(row[10], 10)); // Similarity Score 2

        labels = labels.map((label, index) => `${match1Labels[index]} / ${match2Labels[index]}`);
    }

    const ctx = document.getElementById('similarityChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Match 1 Similarity (%)',
                    data: similarityScores1,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Match 2 Similarity (%)',
                    data: similarityScores2,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Specific Match Similarity Scores'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label;
                            const value = context.raw;
                            return `${label}: ${value}%`;
                        }
                    }
                }
            }
        }
    });
}

// Function to fetch match data for the overall chart
async function fetchMatchData() {
    const response = await fetch(`${API_URL}/sheet-data`);
    const data = await response.json();
    return data.slice(1); // Skip the header row
}

// Function to shuffle array elements
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Function to prepare radar chart data
function prepareRadarChartData(data) {
    // Shuffle the data array
    shuffleArray(data);

    const labels = data.map(row => row[13]); // Use column N (index 13) for Year 2 fake names
    const similarityScores1 = data.map(row => parseInt(row[5], 10)); // Similarity Score 1 (column F, index 5)
    const similarityScores2 = data.map(row => parseInt(row[10], 10)); // Similarity Score 2 (column J, index 9)

    return {
        labels: labels,
        datasets: [
            {
                label: 'Match 1 Similarity (%)',
                data: similarityScores1,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'Match 2 Similarity (%)',
                data: similarityScores2,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }
        ]
    };
}

// Function to render overall chart
async function renderOverallChart() {
    const data = await fetchMatchData();
    const chartData = prepareRadarChartData(data);

    const ctx = document.getElementById('overallSimilarityChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: chartData,
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Overall Similarity Scores between Year 2 and Year 1 Matches'
                }
            }
        }
    });
}

// Main execution
const studentId = getQueryParam('studentId');
if (studentId) {
    fetchResultData(studentId);
}
renderOverallChart();
