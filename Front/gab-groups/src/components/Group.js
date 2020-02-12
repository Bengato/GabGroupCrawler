import React from 'react';
import '../App.css';

const Group = (props) => {
	// Deconstruction of props to get group
	// then displaying group correctly
	// 1st part of the image link is always the same so it's hard coded
	const { group } = props;
	return (
		<tr>
			<td style={{ width: '14%' }}>
				<a href="https://www.gab.com/groups/1">{group.groupURL}</a>
			</td>
			<td style={{ width: '10%' }}>{group.groupName}</td>
			<td style={{ width: '10%' }}>{group.groupDescription}</td>
			<td style={{ width: '10%' }}>
				<img src={'https://gab.com/media/user/group-' + group.groupImage} alt="" />
			</td>
			<td style={{ width: '60%' }}>
				<tr className="Inner-td">
					<td className="Inner-td data">{group.latestPostCreator}</td>
					<td className="Inner-td data"> {group.latestPostDate}</td>
				</tr>
				<tr>
					<td className="Inner-td">{group.latestPostContent}</td>
				</tr>
			</td>
		</tr>
	);
};
export default Group;
