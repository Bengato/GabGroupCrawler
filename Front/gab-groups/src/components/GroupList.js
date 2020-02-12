import React, { Component } from 'react';
import Group from './Group';
import GroupsHeader from './GroupsHeader';
import '../App.css';
// Class component holding out groups from db
// on mount we grab groups from our API then render them seperatly
// mapping each in to a 'Group' component
export default class GroupList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			groups: []
		};
	}
	componentDidMount = () => {
		this.getGroupsFromSql();
	};
	getGroupsFromSql = async () => {
		fetch('http://localhost:4000/getAllGroups')
			.then((response) => response.json())
			.then((res) => this.setState({ groups: res.data }))
			.catch((err) => console.log(err));
	};
	renderGroups = () => {
		if (this.state.groups.length < 1) {
			return <p>No groups in data...</p>;
		} else {
			let indexer = 1;
			this.state.groups.map((group) => {
				return <Group key={indexer++} group={group} />;
			});
		}
	};

	render() {
		return (
			<table>
				<GroupsHeader className="Header-border" />
				<tbody>
					{this.state.groups.map((group) => {
						return <Group group={group} />;
					})}
				</tbody>
			</table>
		);
	}
}
