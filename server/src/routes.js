
// to handle routes, first specify GET or POST
// params:
//  the route
//  callback has REQuest and RESponse
//  -> req holds the data in req.body
//  -> to send to the port use res.send
// set headers using 
//      res.set()
// send status code using
//      res.status(code).send(str)
module.exports = (app, conn) => {

	app.get('/teams', (req, res) => {

		// selects from db:
		// goals scored, received, points, rank of each team
		// res.send array of objects

		// !! dummy data for testing !!

		let dummy = [
			new Team(0, 'Team XXX', [], 0, 0, 0, 0),
			new Team(1, 'Team YYY', [], 0, 0, 0, 0),
			new Team(2, 'Team ZZZ', [], 0, 0, 0, 0)
		]
		res.send(dummy)

	})

	app.post('/teams', (req, res) => {
		
		// inserts into Goals table:
		// matchID, torID, playerID, time
		// data is in req.query
	})

	
	app.get('/matches', (req, res) => {
		
		// selects from Match table:
		// data, field, time, referee, teams of each match
		// res.send array of objects

	})

	app.post('/matches', (req, res) => {

		// inserts into Match table:
		// matchID, torID, date, time, teams, field, referee
		// data is in req.query
	})


	app.post('fields', (req, res) => {

		// inserts into Field table:
		// fieldID, name, status, desc
		// data is in req.query
	})


	app.get('players', (req, res) => {

		// selects from Goals and Player:
		// each player with more than 2 gaals
		// res.send array of objects
	})

	app.post('players', (req, res) => {
		
		// inserts into Cards table:
		// cardID, playerID, cardType, cardDesc
		// data is in req.query
	})

	app.get('player', (req, res) => {

		// selects a player from db:
		// given team and given match
		// data is in req.query
	})


	app.get('/referees', (req, res) => {

		// selects matches from db:
		// by a given referee
		// data is in req.query
	})


}



class Team {
  constructor(
    id, name, players=[], scored, recieved, points, rank
  ) {
    this.id = id
    this.name = name
    this.player = players
    this.scored = scored
    this.recieved = recieved
    this.points = points
    this.rank = rank
  }
}