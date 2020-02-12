import React from 'react';
import '../App.css';
// Functional component rendering out our table headers
export default function GroupsHeader() {
	return (
		<thead>
			<tr className="Groups-header">
				<th style={{ width: '14%' }}>GroupURL</th>
				<th style={{ width: '10%' }}>GroupName</th>
				<th style={{ width: '10%' }}>GroupDescription</th>
				<th style={{ width: '10%' }}>GroupImage</th>
				<th style={{ width: '60%' }}>LatestPost</th>
			</tr>
		</thead>
	);
}
