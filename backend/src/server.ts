import { EventType } from "./EventType";

const EVENT_REGEX = `(%ORG%\/%REPO%\/release\/)(j[0-9]{2}kw[0-9]{2}):\\s(%CONDICTIONS%)`
const EVENT_URL_REGEX = `(\\S+)(\/%REPO%\/pulls\/)([0-9]+)`

enum EventDescriptionCondictions {
	PR_NEEDED = 'pr_needed',
	MANUAL_PR_NEEDED = 'manual_pr_needed'					
}

function eventMatch(eventType: EventType){

	const indexPr = 6
	const regex = new RegExp(createEventRegex(eventType), 'gmi');
	const array = [...String(eventType.description).matchAll(regex)];
	console.log(regex)

	return array.filter(element => {return element[indexPr]}).map(element => element[indexPr]) 

}

function createEventRegex(eventType: EventType) {
	return String(EVENT_REGEX
	.replace('%ORG%', eventType.org)
	.replace('%REPO%', eventType.repo)
	.replace('%CONDICTIONS%', getEventCondictions().concat(EVENT_URL_REGEX.replace('%REPO%', eventType.repo))))
}

function getEventCondictions() {

	let condictionString = ''
	const condictions = Object.values(EventDescriptionCondictions)

	condictions.forEach((key, index) => {
		condictionString = condictionString.concat(key).concat('|')
	})

	return condictionString
}


const returnedPrs = eventMatch({ 
	org: 'com',
    repo: 'boardnet-testing-i3',
    pr: 1,
    description: `com/boardnet-testing-i3/release/j23kw43: pr_needed
	com/boardnet-testing-i3/release/j23kw33: https://com/boardnet-testing-i3/pulls/23
	com/boardnet-testing-i3/release/j23kw33: https://com/boardnet-testing-i3/pulls/23
	com/boardnet-testing-i3/release/j23kw51: manual_pr_needed`
})


console.log(returnedPrs)