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
            
        const outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);
            
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
    
    // Function to create line chart for submission history based on submissionCalendar data
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
        // The keys are Unix timestamps (seconds) and values are submission counts
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
            
        // Add tooltip for data points
        const tooltip = d3.select('#line-chart')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', '1px solid #ddd')
            .style('border-radius', '3px')
            .style('padding', '8px')
            .style('pointer-events', 'none');
            
        svg.selectAll('circle')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('r', 6)
                    .attr('stroke', '#333')
                    .attr('stroke-width', 2);
                    
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                    
                const formatDate = d3.timeFormat("%b %d, %Y");
                tooltip.html(`<strong>${formatDate(d.date)}</strong><br>` +
                            `Daily: ${d.count} submissions<br>` +
                            `Total: ${d.cumulative} submissions`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('r', 4)
                    .attr('stroke', 'none');
                    
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
            
        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -margin.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`Total Submissions: ${cumulativeCount}`);
    }
});