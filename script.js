document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('stats-form');
    const statsList = document.getElementById('stats-list');
    const pieChartContainer = document.getElementById('pie-chart');
    const barChartContainer = document.getElementById('bar-chart');
    const lineChartContainer = document.getElementById('line-chart');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const LCname = document.getElementById('LCname').value;
        const CCname = document.getElementById('CCname').value;

        statsList.innerHTML = `<li>Loading stats for ${LCname} and ${CCname}...</li>`;

        try {
            // Fetch LeetCode stats
            const lcResponse = await fetch(`https://leetcode-stats-api.herokuapp.com/${LCname}`);
            const lcData = await lcResponse.json();

            let leetcodeStats = `<li><strong>LeetCode Stats:</strong><br>`;
            if (lcData.status === "error") {
                leetcodeStats += `User "${LCname}" not found.</li>`;
            } else {
                leetcodeStats += `
                    Total Solved: ${lcData.totalSolved}<br>
                    Easy: ${lcData.easySolved}/${lcData.totalEasy}<br>
                    Medium: ${lcData.mediumSolved}/${lcData.totalMedium}<br>
                    Hard: ${lcData.hardSolved}/${lcData.totalHard}<br>
                    Acceptance Rate: ${lcData.acceptanceRate}%
                </li>`;
                
                // Create visualizations if data is valid
                createDonutChart(lcData);
                createBarChart(lcData);
                createLineChart(lcData);
                createHeatMap(lcData);
            }

            // Fetch CodeChef stats
            const ccResponse = await fetch(`https://codechef-api.vercel.app/handle/${CCname}`);
            const ccData = await ccResponse.json();

            let codechefStats = `<li><strong>CodeChef Stats:</strong><br>`;
            if (ccData.status === "FAILED") {
                codechefStats += `User "${CCname}" not found.</li>`;
            } else {
                codechefStats += `
                    Name: ${ccData.name || 'N/A'}<br>
                    Stars: ${ccData.stars}<br>
                    Rating: ${ccData.rating}<br>
                    Highest Rating: ${ccData.highest_rating}<br>
                    Global Rank: ${ccData.global_rank}<br>
                    Country Rank: ${ccData.country_rank}
                </li>`;
            }

            // Display all stats
            statsList.innerHTML = `
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
                ${leetcodeStats}
                ${codechefStats}
            `;
            
        } catch (error) {
            statsList.innerHTML = `<li>Error fetching data: ${error.message}</li>`;
        }
    });

    // Function to create donut chart for difficulty breakdown
    function createDonutChart(data) {
        // Clear previous chart if it exists
        pieChartContainer.innerHTML = '<h3>Difficulty Breakdown</h3>';
        
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;
        
        const svg = d3.select('#pie-chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);
            
        const color = d3.scaleOrdinal()
            .domain(['Easy', 'Medium', 'Hard'])
            .range(['#00b8a3', '#ffc01e', '#ff375f']);
            
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);
            
        const arc = d3.arc()
            .innerRadius(radius * 0.5) // This makes it a donut chart
            .outerRadius(radius * 0.8);
            
        const pieData = [
            { name: 'Easy', value: data.easySolved },
            { name: 'Medium', value: data.mediumSolved },
            { name: 'Hard', value: data.hardSolved }
        ];
        
        // Filter out categories with zero values
        const filteredData = pieData.filter(d => d.value > 0);
        
        // If all categories are zero, display a message
        if (filteredData.length === 0) {
            pieChartContainer.innerHTML += '<p>No problems solved yet!</p>';
            return;
        }
        
        const path = svg.selectAll('path')
            .data(pie(filteredData))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.name))
            .attr('stroke', 'white')
            .style('stroke-width', '2px')
            .style('opacity', 0.7);
            
        // Add percentages in the center
        const text = svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .text(`${data.totalSolved} Total`);
            
        // Add a legend
        const legend = svg.selectAll('.legend')
            .data(filteredData)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(-40, ${i * 20 - 40})`);
            
        legend.append('rect')
            .attr('width', 16)
            .attr('height', 16)
            .attr('fill', d => color(d.name));
            
        legend.append('text')
            .attr('x', 24)
            .attr('y', 12)
            .text(d => `${d.name}: ${d.value}`);
    }
    
    // Function to create bar chart for progress vs total problems
    function createBarChart(data) {
        // Clear previous chart if it exists
        barChartContainer.innerHTML = '<h3>Progress vs Total Problems</h3>';
        
        const margin = {top: 20, right: 30, bottom: 40, left: 60};
        const width = 500 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        
        const svg = d3.select('#bar-chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
            
        const categories = ['Easy', 'Medium', 'Hard'];
        const solved = [data.easySolved, data.mediumSolved, data.hardSolved];
        const total = [data.totalEasy, data.totalMedium, data.totalHard];
        
        const x = d3.scaleBand()
            .domain(categories)
            .range([0, width])
            .padding(0.3);
            
        const y = d3.scaleLinear()
            .domain([0, d3.max(total)])
            .range([height, 0]);
            
        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x));
            
        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(y));
            
        // Add Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -margin.left + 20)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .text('Problems Count');
            
        // Total problem bars (background)
        svg.selectAll('.bar-total')
            .data(total)
            .enter()
            .append('rect')
            .attr('class', 'bar-total')
            .attr('x', (d, i) => x(categories[i]))
            .attr('y', d => y(d))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d))
            .attr('fill', '#dddddd');
            
        // Solved problem bars
        svg.selectAll('.bar-solved')
            .data(solved)
            .enter()
            .append('rect')
            .attr('class', 'bar-solved')
            .attr('x', (d, i) => x(categories[i]))
            .attr('y', d => y(d))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d))
            .attr('fill', (d, i) => {
                const colors = ['#00b8a3', '#ffc01e', '#ff375f'];
                return colors[i];
            });
            
        // Add text labels for percentages
        svg.selectAll('.label')
            .data(categories)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', (d) => x(d) + x.bandwidth() / 2)
            .attr('y', (d, i) => y(solved[i]) - 5)
            .attr('text-anchor', 'middle')
            .text((d, i) => {
                const percentage = total[i] > 0 ? Math.round((solved[i] / total[i]) * 100) : 0;
                return `${percentage}%`;
            });
            
        // Add legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 100}, 0)`);
            
        legend.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', '#dddddd');
            
        legend.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .text('Total Available');
            
        legend.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('y', 20)
            .attr('fill', '#00b8a3');
            
        legend.append('text')
            .attr('x', 20)
            .attr('y', 32)
            .text('Solved');
    }
    
    // Function to create line chart for submission history
    function createLineChart(data) {
        // Clear previous chart if it exists
        lineChartContainer.innerHTML = '<h3>Submission History</h3>';
        
        // Check if submissionCalendar exists and has data
        if (!data.submissionCalendar || Object.keys(data.submissionCalendar).length === 0) {
            lineChartContainer.innerHTML += '<p>No submission history data available.</p>';
            return;
        }
        
        const margin = {top: 20, right: 30, bottom: 60, left: 60};
        const width = 500 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        
        const svg = d3.select('#line-chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
            
        // Process submissionCalendar data
        const timeData = [];
        let cumulativeCount = 0;
        
        // Sort timestamps chronologically
        const sortedTimestamps = Object.keys(data.submissionCalendar).sort((a, b) => parseInt(a) - parseInt(b));
        
        sortedTimestamps.forEach(timestamp => {
            const count = data.submissionCalendar[timestamp];
            cumulativeCount += count;
            
            // Convert Unix timestamp (seconds) to JavaScript Date
            const date = new Date(parseInt(timestamp) * 1000);
            
            timeData.push({
                date: date,
                count: count,
                cumulative: cumulativeCount
            });
        });
        
        // Create scales
        const x = d3.scaleTime()
            .domain(d3.extent(timeData, d => d.date))
            .range([0, width]);
            
        const y = d3.scaleLinear()
            .domain([0, d3.max(timeData, d => d.cumulative)])
            .range([height, 0])
            .nice();
            
        // Add X axis
        const xAxis = svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(Math.min(timeData.length, 7)));
            
        // Rotate X axis labels for better readability
        xAxis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");
            
        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(y));
            
        // Add X axis label
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + margin.bottom - 5)
            .text('Date');
            
        // Add Y axis label
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -margin.left + 20)
            .attr('x', -height / 2)
            .attr('text-anchor', 'middle')
            .text('Cumulative Submissions');
            
        // Add the line for cumulative submissions
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.cumulative))
            .curve(d3.curveMonotoneX);
            
        svg.append('path')
            .datum(timeData)
            .attr('fill', 'none')
            .attr('stroke', '#00b8a3')
            .attr('stroke-width', 2)
            .attr('d', line);
            
        // Add the area under the line
        const area = d3.area()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y(d.cumulative))
            .curve(d3.curveMonotoneX);
            
        svg.append('path')
            .datum(timeData)
            .attr('fill', '#00b8a3')
            .attr('fill-opacity', 0.1)
            .attr('d', area);
            
        // Add the dots
        svg.selectAll('circle')
            .data(timeData)
            .enter()
            .append('circle')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.cumulative))
            .attr('r', 4)
            .attr('fill', '#00b8a3');
    }

    // Function to create heat map for coding activity
    function createHeatMap(data) {
        const heatMapContainer = document.getElementById('heat-map');
        heatMapContainer.innerHTML = '<h3>Coding Activity Heat Map</h3>';

        // Check if submissionCalendar exists and has data
        if (!data.submissionCalendar || Object.keys(data.submissionCalendar).length === 0) {
            heatMapContainer.innerHTML += '<p>No submission history data available.</p>';
            return;
        }

        const margin = {top: 50, right: 30, bottom: 60, left: 100};
        const cellSize = 15;
        const daysInWeek = 7;
        const weeksToShow = 52; // Show last 52 weeks
        const width = cellSize * weeksToShow;
        const height = cellSize * daysInWeek;

        const svg = d3.select('#heat-map')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Process submissionCalendar data
        const submissionData = {};
        Object.entries(data.submissionCalendar).forEach(([timestamp, count]) => {
            const date = new Date(parseInt(timestamp) * 1000);
            const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            submissionData[dateString] = count;
        });

        // Generate date range for the last year
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);

        const dateArray = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const submissions = submissionData[dateString] || 0;
            
            dateArray.push({
                date: new Date(currentDate),
                dateString: dateString,
                submissions: submissions,
                week: d3.timeWeek.count(d3.timeYear(currentDate), currentDate),
                day: currentDate.getDay()
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Color scale
        const maxSubmissions = d3.max(dateArray, d => d.submissions) || 1;
        const colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateGreens)
            .domain([0, maxSubmissions]);

        // Create heat map cells
        const cells = svg.selectAll('.cell')
            .data(dateArray)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('x', d => d.week * cellSize)
            .attr('y', d => d.day * cellSize)
            .attr('width', cellSize - 1)
            .attr('height', cellSize - 1)
            .attr('fill', d => d.submissions === 0 ? '#ebedf0' : colorScale(d.submissions))
            .attr('stroke', '#fff')
            .attr('stroke-width', 1);

        // Add day labels
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        svg.selectAll('.day-label')
            .data(dayLabels)
            .enter()
            .append('text')
            .attr('class', 'day-label')
            .attr('x', -10)
            .attr('y', (d, i) => i * cellSize + cellSize / 2)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '10px')
            .text(d => d);

        // Add month labels
        const months = d3.timeMonths(startDate, endDate);
        svg.selectAll('.month-label')
            .data(months)
            .enter()
            .append('text')
            .attr('class', 'month-label')
            .attr('x', d => d3.timeWeek.count(d3.timeYear(d), d) * cellSize)
            .attr('y', -10)
            .attr('font-size', '10px')
            .text(d => d3.timeFormat('%b')(d));

        // Add tooltip
        const tooltip = d3.select('#heat-map')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        cells.on('mouseover', function(event, d) {
            d3.select(this)
                .attr('stroke', '#000')
                .attr('stroke-width', 2);

            tooltip.transition()
                .duration(200)
                .style('opacity', .9);

            const formatDate = d3.timeFormat("%B %d, %Y");
            tooltip.html(`<strong>${formatDate(d.date)}</strong><br>` +
                        `Submissions: ${d.submissions}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1);

            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

        // Add legend
        const legendWidth = 200;
        const legendHeight = 10;
        const legend = svg.append('g')
            .attr('transform', `translate(${width - legendWidth}, ${height + 30})`);

        const legendScale = d3.scaleLinear()
            .domain([0, maxSubmissions])
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d3.format('d'));

        const defs = svg.append('defs');
        const linearGradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient');

        linearGradient.selectAll('stop')
            .data(d3.range(0, 1.1, 0.1))
            .enter()
            .append('stop')
            .attr('offset', d => `${d * 100}%`)
            .attr('stop-color', d => colorScale(d * maxSubmissions));

        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legend-gradient)');

        legend.append('g')
            .attr('transform', `translate(0, ${legendHeight})`)
            .call(legendAxis);

        legend.append('text')
            .attr('x', legendWidth / 2)
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('Submissions per day');
    }
});